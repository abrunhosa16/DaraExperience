import http from "http";
import fs from "fs";
import url from "url";
import GamePairing from "./game_pairing.js";

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
};

function processRequest(request, url_parsed, game_pairing) {
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
        } else {
          resolve({
            type: RESPONSE_TYPE.OK_JSON,
            data: {},
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

            const result = game_pairing.join(
              parsed.nick,
              parsed.size.columns,
              parsed.size.rows
            );
            console.log("joined", result);

            resolve({
              type: RESPONSE_TYPE.OK_JSON,
              data: { game: result.id },
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

            game_pairing.leave(parsed.game);

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

      default:
        resolve({
          type: RESPONSE_TYPE.UNKNOWN,
        });
    }
  });
}

function createServer() {
  const game_pairing = new GamePairing();

  return http.createServer(async (request, response) => {
    const url_parsed = url.parse(request.url, true);

    // update is a special case
    if (url_parsed.pathname === "/update") {
      if (request.method === "OPTIONS") {
        response.writeHead(204, {
          ...HEADERS.OPTIONS,
          "Access-Control-Allow-Methods": "OPTIONS, GET",
        });
        response.end();
      }
      if (request.method === "GET") {
        console.log(url_parsed.query);
        response.writeHead(200, HEADERS.SSE);

        // keep the connection alive
        const alive = setInterval(() => {
          response.write("");
        }, 450);

        const timeout = setTimeout(() => {
          // send that no match was found and there is no winner (timeout reached)
          const data = JSON.stringify({ winner: null });
          response.write(`data: ${data}\n\n`);
        }, 15000);

        request.on("close", () => {
          clearInterval(alive);
          clearTimeout(timeout);
          response.end();
        });
      } else {
        response.writeHead(405, HEADERS.NO_BODY);
        response.end();
      }
      return;
    }

    try {
      const result = await processRequest(request, url_parsed, game_pairing);
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
        case RESPONSE_TYPE.SERVER_ERROR:
          response.writeHead(500, HEADERS.NO_BODY);
          response.end();
          break;
        default:
          throw new Error(`Invalid processed result: ${result}`);
      }
    } catch (err) {
      console.error(err);
      response.writeHead(500, HEADERS.NO_BODY);
      response.end();
    }
  });
}

function main() {
  const server = createServer();
  server.listen(PORT, (err) => {
    if (err) {
      console.log("Sorry I will server you better ", err);
    }
    console.log(
      `The server started successfully and is listening for requests at http://localhost:${PORT}`
    );
  });
}

main();
