const http = require("http");
const fs = require("fs");
let url = require("url");
const port = 3000;

const headers = {
  json: {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
  },
  sse: {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*",
    Connection: "keep-alive",
  },
};
  
  const sortRank = (data) => {
    data.ranking.sort((a,b) => b.victories-a.victories || b.victories / b.games - a.victories / a.games);
    data.ranking.length = 10;
  }

function conditionsErrors(dataParse) {
  if (dataParse.group === undefined) {
    response.writeHead(400, headers.json);
    response.end(JSON.stringify({ error: `${dataParse.group}` }));
    return;
  }

  if (!Number.isInteger(dataParse.group)) {
    response.writeHead(400, headers.json);
    response.end(
      JSON.stringify({ error: `Invalid group ${dataParse.group}` })
    );
    return;
  }

  if (
    dataParse.size === undefined ||
    typeof dataParse.size !== "object" ||
    Array.isArray(dataParse.size) ||
    dataParse.size === null
  ) {
    response.writeHead(400, headers.json);
    response.end(
      JSON.stringify({ error: `Undefined size '${dataParse.size}'` })
    );
    return;
  }

  if (
    dataParse.size.columns === undefined ||
    !Number.isInteger(dataParse.size.columns)
  ) {
    response.writeHead(400, headers.json);
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
    response.writeHead(400, headers.json);
    response.end(
      JSON.stringify({
        error: `size property rows with invalid value '${dataParse.size.rows}'`,
      })
    );
    return;
  }
}

const server = http.createServer(function (request, response) {
  const preq = url.parse(request.url, true);
  const pathname = preq.pathname;
  let path;
  

  switch (pathname) {
    case "/ranking":
      if (request.method === "POST") {
        data = "";
        request.on("data", (chunk) => {
          data += chunk;
        });
        request.on("end", () => {
          let dataParse;

          try {
            dataParse = JSON.parse(data);
          } catch (err) {
            response.writeHead(400, headers.json);
            response.end();
            return;
          }

          conditionsErrors(dataParse);

          path = `data/ranking/${dataParse.group}/${dataParse.size.rows}-${dataParse.size.columns}.json`

          if (fs.existsSync(path)) {
            response.writeHead(200, headers.json);
            const content = JSON.parse(fs.readFileSync(path, "utf-8"));

            sortRank(content);
            response.end(JSON.stringify(content));
          } else {
            console.log(data, headers.json);
            response.writeHead(200, headers.json);
            response.end(JSON.stringify({ ranking: [] }));
          }
        });

        return;
      }
  }

  response.writeHead(404, headers.json);
  response.end();
});

server.listen(port, (err) => {
  if (err) {
    console.log("Sorry I will server you better ", err);
  }
  console.log(`I'm server well on port number port${port}`);
});
