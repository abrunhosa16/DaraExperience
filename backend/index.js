import http from "http";
import fs from "fs";
import url from "url";

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
    "Access-Control-Allow-Methods": "OPTIONS, POST, GET",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": 2592000, // 30 days
  },
};
const EMPTY_JSON = "{}";

const sortRank = (data) => {
  data.ranking.sort(
    (a, b) =>
      b.victories - a.victories || b.victories / b.games - a.victories / a.games
  );
  data.ranking.length = 10;
};

function conditionsErrors(dataParse) {
  if (dataParse.group === undefined) {
    response.writeHead(400, HEADERS.JSON);
    response.end(JSON.stringify({ error: `${dataParse.group}` }));
    return;
  }

  if (!Number.isInteger(dataParse.group)) {
    response.writeHead(400, HEADERS.JSON);
    response.end(JSON.stringify({ error: `Invalid group ${dataParse.group}` }));
    return;
  }

  if (
    dataParse.size === undefined ||
    typeof dataParse.size !== "object" ||
    Array.isArray(dataParse.size) ||
    dataParse.size === null
  ) {
    response.writeHead(400, HEADERS.JSON);
    response.end(
      JSON.stringify({ error: `Undefined size '${dataParse.size}'` })
    );
    return;
  }

  if (
    dataParse.size.columns === undefined ||
    !Number.isInteger(dataParse.size.columns)
  ) {
    response.writeHead(400, HEADERS.JSON);
    response.end(
      JSON.stringify({
        error: `size property columns with invalid value '${dataParse.size.columns}'`,
      })
    );
    return;
  }

  if (
    dataParse.size.rows === undefined ||
    !Number.isInteger(dataParse.size.rows)
  ) {
    response.writeHead(400, HEADERS.JSON);
    response.end(
      JSON.stringify({
        error: `size property rows with invalid value '${dataParse.size.rows}'`,
      })
    );
    return;
  }
}

const server = http.createServer((request, response) => {
  const preq = url.parse(request.url, true);
  const pathname = preq.pathname;
  let path;

  if (request.method === "OPTIONS") {
    response.writeHead(204, HEADERS.OPTIONS);
    response.end();
    return;
  }

  switch (pathname) {
    case "/ranking":
      if (request.method === "POST") {
        let data = "";
        request.on("data", (chunk) => {
          data += chunk;
        });
        request.on("end", () => {
          let dataParse;

          try {
            dataParse = JSON.parse(data);
          } catch (err) {
            response.writeHead(400, HEADERS.JSON);
            response.end(JSON.stringify({ error: `Invalid JSON in request body` }));
            return;
          }

          conditionsErrors(dataParse);

          path = `data/ranking/${dataParse.group}/${dataParse.size.rows}-${dataParse.size.columns}.json`;

          if (fs.existsSync(path)) {
            response.writeHead(200, HEADERS.JSON);
            const content = JSON.parse(fs.readFileSync(path, "utf-8"));

            sortRank(content);
            response.end(JSON.stringify(content));
          } else {
            response.writeHead(200, HEADERS.JSON);
            response.end(EMPTY_JSON);
          }
        });

        return;
      }
      break;

    case "/register":
      response.writeHead(200, HEADERS.NO_BODY);
      response.end(JSON.stringify({}));
      return;
  }

  response.writeHead(404, HEADERS.JSON);
  response.end();
});

server.listen(PORT, (err) => {
  if (err) {
    console.log("Sorry I will server you better ", err);
  }
  console.log(
    `The server started successfully and is listening for requests at http://localhost:${PORT}`
  );
});
