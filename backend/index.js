// @ts-check
const express = require("express");
const app = express();
const { dev, options } = require("./cert");
const { createServer } = require("https");
const http = require("http");

let create = createServer;
if (dev) {
  // @ts-ignore
  create = http.createServer;
}

const server = create(options, app);

const cors = require("cors");
app.use(cors());

const { Worker } = require("worker_threads");
const getPort = require("get-port");

let available = undefined;

app.use(express.static("./frontend/public"));

app.get("/newInstance", async function (req, res) {
  let port;
  if (!available || req.query.private === true) {
    const newPort = await getPort({ port: getPort.makeRange(8000, 9000) });
    if (!req.query.private) {
      available = { port: newPort, players: 1 };
    }

    //spawn new worker and return port
    const worker = new Worker("./backend/worker.js", { workerData: { port: newPort } });
    worker.on("exit", () => (available = undefined));

    port = newPort;
  } else {
    port = available.port; // return existing worker with only one player
    available.players += 1;
  }

  res.json({ port });
});

const defaultPort = dev ? 80 : 443;
server.listen(process.env.PORT || defaultPort, function () {
  console.log(`Memory app listening on port ${process.env.PORT || defaultPort}!`);
});
