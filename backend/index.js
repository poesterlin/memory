// @ts-check
const express = require("express");
const app = express();
const { dev, options } = require("./cert");
const { createServer } = require("https");
const http = require("http");
const { exec } = require("child_process");

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

app.get("/reset", async function (req, res) {
  setTimeout(() => {
    process.exit(0);
  }, 20);
  console.log("reset server");
  res.send('<div style="text-align:center">Server was reset 🤷‍♀️ <br>  <a href="../">Back</a></div>');
});

app.get("/logs", async function (req, res) {
  exec("pm2 logs 1 --lines 1000 --nostream", (_error, stdout) => {
    res.send(`<pre>${stdout}</pre>`);
  });
});

new Worker("./backend/worker.js", { workerData: { port: 8000 } });
console.log("new game");

app.get("/newInstance", async function (req, res) {
  res.json({ port: 8000 });
});

const defaultPort = dev ? 80 : 443;
server.listen(process.env.PORT || defaultPort, function () {
  console.log(`Memory app listening on port ${process.env.PORT || defaultPort}!`);
});
