import http from "http";
import fs from "fs";
import url from "url";
import { hashPass, register, validAuthentication } from "./users.js";
import GameUpdateManager from "./game/update_manager.js";

const PORT = 3000;
const HEADERS = {
  NO_BODY: {
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  },
  JSON: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  },
  SSE: {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-cache",
  },
  OPTIONS: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": 2592000, // 30 days
  },
};

const sortRank = (data) => {
  data.ranking.sort(
    (a, b) =>
      b.victories - a.victories || b.victories / b.games - a.victories / a.games
  );
  data.ranking.length = 10;
};

const parseData = (data) => {
  try {
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
};

const RESPONSE_TYPE = {
  OK_NO_BODY: 0,
  OK_JSON: 1,
  UNKNOWN: 2,
  INVALID_JSON_IN_REQUEST_BODY: 3,
  CUSTOM_ERROR: 4,
  SERVER_ERROR: 5,
  NOT_ALLOWED: 6,
  OPTIONS: 7,
  NONE: 8,
  UNAUTHORIZED: 9,
};

function processRequest(request, response, update_manager) {
  const url_parsed = url.parse(request.url, true);
  return new Promise((resolve, reject) => {
    switch (url_parsed.pathname) {
      case "/ranking":
        if (request.method === "OPTIONS") {
          resolve({
            type: RESPONSE_TYPE.OPTIONS,
            methods: "OPTIONS, POST",
          });
        } else if (request.method === "POST") {
          let data = "";
          request.on("data", (chunk) => {
            data += chunk;
          });
          request.on("end", () => {
            const parsed = parseData(data);
            if (parsed === null) {
              return resolve({
                type: RESPONSE_TYPE.INVALID_JSON_IN_REQUEST_BODY,
              });
            }

            if (parsed.group === undefined) {
              return resolve({
                type: RESPONSE_TYPE.CUSTOM_ERROR,
                err_msg: "Undefined group",
              });
            }
            if (!Number.isInteger(parsed.group)) {
              return resolve({
                type: RESPONSE_TYPE.CUSTOM_ERROR,
                err_msg: `Invalid group '${parsed.group}'`,
              });
            }
            if (
              parsed.size === undefined ||
              parsed.size === null ||
              typeof parsed.size !== "object" ||
              Array.isArray(parsed.size)
            ) {
              return resolve({
                type: RESPONSE_TYPE.CUSTOM_ERROR,
                err_msg: `Undefined size '${parsed.size}'`,
              });
            }
            if (
              parsed.size.columns === undefined ||
              !Number.isInteger(parsed.size.columns)
            ) {
              return resolve({
                type: RESPONSE_TYPE.CUSTOM_ERROR,
                err_msg: `size property columns with invalid value '${parsed.size.columns}'`,
              });
            }
            if (
              parsed.size.rows === undefined ||
              !Number.isInteger(parsed.size.rows)
            ) {
              return resolve({
                type: RESPONSE_TYPE.CUSTOM_ERROR,
                err_msg: `size property rows with invalid value '${parsed.size.rows}'`,
              });
            }

            const path = `data/ranking/${parsed.group}/${parsed.size.rows}-${parsed.size.columns}.json`;
            fs.readFile(path, "utf-8", (err, data) => {
              if (err !== null) {
                // file not exists error
                if (err.code === "ENOENT") {
                  return resolve({
                    type: RESPONSE_TYPE.OK_JSON,
                    data: { ranking: [] },
                  });
                }
                throw err;
              }

              const content = JSON.parse(data);
              sortRank(content);

              resolve({
                type: RESPONSE_TYPE.OK_JSON,
                data: content,
              });
            });
          });
        } else {
          resolve({
            type: RESPONSE_TYPE.NOT_ALLOWED,
          });
        }
        break;

      case "/register":
        if (request.method === "OPTIONS") {
          resolve({
            type: RESPONSE_TYPE.OPTIONS,
            methods: "OPTIONS, POST",
          });
        } else if (request.method === "POST") {
          let data = "";
          request.on("data", (chunk) => {
            data += chunk;
          });
          request.on("end", () => {
            const parsed = parseData(data);
            if (parsed === null) {
              return resolve({
                type: RESPONSE_TYPE.INVALID_JSON_IN_REQUEST_BODY,
              });
            }

            const hash = hashPass(parsed.password);

            register(parsed.nick, hash).then((result) => {
              if (result) {
                resolve({
                  type: RESPONSE_TYPE.OK_JSON,
                  data: {},
                });
              } else {
                resolve({
                  type: RESPONSE_TYPE.CUSTOM_ERROR,
                  err_msg: "User Registered with a different password",
                });
              }
            });
          });
        } else {
          resolve({
            type: RESPONSE_TYPE.NOT_ALLOWED,
          });
        }
        break;

      case "/join":
        if (request.method === "OPTIONS") {
          resolve({
            type: RESPONSE_TYPE.OPTIONS,
            methods: "OPTIONS, POST",
          });
        } else if (request.method === "POST") {
          let data = "";
          request.on("data", (chunk) => {
            data += chunk;
          });
          request.on("end", () => {
            const parsed = parseData(data);
            if (parsed === null) {
              return {
                type: RESPONSE_TYPE.INVALID_JSON_IN_REQUEST_BODY,
              };
            }

            const hash = hashPass(parsed.password);
            if (!validAuthentication(parsed.nick, hash)) {
              return resolve({
                type: RESPONSE_TYPE.UNAUTHORIZED,
              });
            }

            const result = update_manager.join(
              parsed.nick,
              parsed.size.columns,
              parsed.size.rows
            );

            resolve({
              type: RESPONSE_TYPE.OK_JSON,
              data: { game: result },
            });
          });
        } else {
          resolve({
            type: RESPONSE_TYPE.NOT_ALLOWED,
          });
        }
        break;

      case "/leave":
        if (request.method === "OPTIONS") {
          resolve({
            type: RESPONSE_TYPE.OPTIONS,
            methods: "OPTIONS, POST",
          });
        } else if (request.method === "POST") {
          let data = "";
          request.on("data", (chunk) => {
            data += chunk;
          });
          request.on("end", () => {
            const parsed = parseData(data);
            if (parsed === null) {
              return {
                type: RESPONSE_TYPE.INVALID_JSON_IN_REQUEST_BODY,
              };
            }

            const hash = hashPass(parsed.password);
            if (!validAuthentication(parsed.nick, hash)) {
              return resolve({
                type: RESPONSE_TYPE.UNAUTHORIZED,
              });
            }

            try {
              update_manager.leave(parsed.game, parsed.nick);
            } catch (err) {

              return resolve({
                type: RESPONSE_TYPE.CUSTOM_ERROR,
                err_msg: "Invalid game id",
              });
            }

            resolve({
              type: RESPONSE_TYPE.OK_JSON,
              data: {},
            });
            
          });
        } else {
          resolve({
            type: RESPONSE_TYPE.NOT_ALLOWED,
          });
        }
        break;

      case "/notify":
        if (request.method === "OPTIONS") {
          resolve({
            type: RESPONSE_TYPE.OPTIONS,
            methods: "OPTIONS, POST",
          });
        } else if (request.method === "POST") {
          let data = "";
          request.on("data", (chunk) => {
            data += chunk;
          });
          request.on("end", () => {
            const parsed = parseData(data);
            if (parsed === null) {
              return {
                type: RESPONSE_TYPE.INVALID_JSON_IN_REQUEST_BODY,
              };
            }

            const hash = hashPass(parsed.password);
            if (!validAuthentication(parsed.nick, hash)) {
              return resolve({
                type: RESPONSE_TYPE.UNAUTHORIZED,
              });
            }

            update_manager.notify(
              parsed.game,
              parsed.nick,
              parsed.move.column,
              parsed.move.row
            );

            resolve({
              type: RESPONSE_TYPE.OK_JSON,
              data: {},
            });
          });
        } else {
          resolve({
            type: RESPONSE_TYPE.NOT_ALLOWED,
          });
        }
        break;

      case "/update":
        if (request.method === "OPTIONS") {
          resolve({
            type: RESPONSE_TYPE.OPTIONS,
            methods: "OPTIONS, GET",
          });
        }
        if (request.method === "GET") {
          response.writeHead(200, HEADERS.SSE);

          const id = url_parsed.query.game;
          const username = url_parsed.query.nick;

          update_manager.add(id, username, response);

          request.on("close", () => {
            update_manager.disconnect(id, username);
          });

          resolve({
            type: RESPONSE_TYPE.NONE,
          });
        } else {
          resolve({
            type: RESPONSE_TYPE.NOT_ALLOWED,
          });
        }

        break;

      default:
        resolve({
          type: RESPONSE_TYPE.UNKNOWN,
        });
    }
  });
}

function createServer() {
  const update_manager = new GameUpdateManager();

  return http.createServer(async (request, response) => {
    try {
      const result = await processRequest(request, response, update_manager);
      switch (result.type) {
        case RESPONSE_TYPE.OPTIONS:
          response.writeHead(204, {
            ...HEADERS.OPTIONS,
            "Access-Control-Allow-Methods": result.methods,
          });
          response.end();
          break;
        case RESPONSE_TYPE.OK_NO_BODY:
          response.writeHead(204, HEADERS.NO_BODY);
          response.end();
          break;
        case RESPONSE_TYPE.OK_JSON:
          response.writeHead(200, HEADERS.JSON);
          response.end(JSON.stringify(result.data));
          break;
        case RESPONSE_TYPE.UNKNOWN:
          console.log("unknown");
          response.writeHead(404, HEADERS.NO_BODY);
          response.end();
          break;
        case RESPONSE_TYPE.NOT_ALLOWED:
          response.writeHead(405, HEADERS.NO_BODY);
          response.end();
          break;
        case RESPONSE_TYPE.INVALID_JSON_IN_REQUEST_BODY:
          response.writeHead(400, HEADERS.JSON);
          response.end(
            JSON.stringify({ error: `Invalid JSON in request body` })
          );
          break;
        case RESPONSE_TYPE.CUSTOM_ERROR:
          response.writeHead(400, HEADERS.JSON);
          response.end(JSON.stringify({ error: result.err_msg }));
          break;
        case RESPONSE_TYPE.UNAUTHORIZED:
          response.writeHead(401, HEADERS.JSON);
          response.end(
            JSON.stringify({ error: "Invalid username or password" })
          );
        case RESPONSE_TYPE.SERVER_ERROR:
          response.writeHead(500, HEADERS.NO_BODY);
          response.end();
          break;
        case RESPONSE_TYPE.NONE:
          break;
        default:
          throw new Error(`Invalid processed result: ${result}`);
      }
    } catch (err) {
      console.log(err);
      response.writeHead(500, HEADERS.NO_BODY);
      response.end();
    }
  });
}

function main() {
  const server = createServer();
  server.listen(PORT, (err) => {
    if (err) {
      console.err("The server failed to start with the error", err);
    } else {
      console.log(
        `The server started successfully and is listening for requests at http://localhost:${PORT}`
      );
    }
  });
}

main();
