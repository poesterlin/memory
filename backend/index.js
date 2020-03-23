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

const available = [];

app.use(express.static("./frontend/public"));

app.get("/newInstance", async function(req, res) {
  let port;
  if (available.length === 0 || req.query.private === true) {
    const newPort = await getPort({ port: getPort.makeRange(8000, 9000) });
    if (!req.query.private) {
      available.push(newPort);
    }

    //spawn new worker and return port
    const worker = new Worker("./backend/worker.js", {
      workerData: { port: newPort },
      // TODO: set limits
      resourceLimits: {}
    });
    worker.on("exit", s => console.log("exit", s));

    port = newPort;
  } else {
    port = available.pop(); // return existing worker with only one player
  }

  res.json({ port });
});

const defaultPort = dev ? 80 : 443;
server.listen(process.env.PORT || defaultPort, function() {
  console.log(`Memory app listening on port ${process.env.PORT || defaultPort}!`);
});
