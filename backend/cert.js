const { readFileSync } = require("fs");

const { NODE_ENV } = process.env;
const dev = true || NODE_ENV === "development";
console.log(dev ? "dev mode" : "prod mode");

const options = {};

const path = "/etc/letsencrypt/live/memory.oesterlin.dev/";

if (!dev) {
  options.key = readFileSync(path + "privkey.pem");
  options.cert = readFileSync(path + "cert.pem");
  options.ca = readFileSync(path + "chain.pem");
}

exports.options = options;
exports.dev = dev;
