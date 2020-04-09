// @ts-check

let { workerData } = require("worker_threads");
const { dev, options } = require("./cert");
const { createServer } = require("https");
const { readFileSync } = require("fs");
const { join } = require("path");
const http = require("http");

if (!workerData) {
  workerData = { port: 3000, size: 5 };
}

let create = createServer;
if (dev) {
  // @ts-ignore
  create = http.createServer;
}

const app = require("express")();
const server = create(options, app);

const cors = require("cors");
app.use(cors());

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

const io = require("socket.io")(server);
const crypto = require("crypto");
const room = crypto.randomBytes(5).toString("hex");

const words = readFileSync(join(__dirname, "words.txt"), "utf8").toString().split("\r\n");

app.get("/close", (_req, res) => {
  res.send("done");
  process.exit();
});

app.get("/players", (_req, res) => {
  started = started && players.filter((p) => p.master === true).length === 2;
  res.json({ players, started });
});

app.get("/start", (_req, res) => {
  started = true;
  res.json({ players, started });
});

app.post("/register", (req, res) => {
  if (players.some((p) => p.id === req.body.id)) {
    res.json({ players, team: players.find((p) => p.id === req.body.id).team });
    return;
  }
  const t1 = players.reduce((s, c) => (c.team === 1 ? c.team + s : s), 0);
  const t2 = players.length - t1;
  const team = t1 > t2 ? 2 : 1;
  players.push({ id: req.body.id, name: req.body.name, master: false, team });
  res.json({ players, team });
});

app.post("/elevate", (req, res) => {
  const newP = players.find((p) => p.id === req.body.id);
  players.filter((p) => p.team === newP.team).forEach((p) => (p.master = false));
  newP.master = true;
  res.json({ players });
  try {
    updateTurns();
  } catch {}
});

server.listen(workerData.port, function () {
  console.log("worker started", workerData);
});

let players = [];
let started = false;
let turn = 1;
let matrix = initMatrix(workerData.size || 5);

io.on("connect", function (socket) {
  socket.join(room);
  updateMatrix();
  updateTurns();

  socket.on("next", function () {
    turn = turn === 1 ? 2 : 1;
    updateTurns();
  });
  socket.on("flip", function ({ row, column, team }) {
    if (players.length < 1) {
      return;
    }
    if (turn !== team) {
      return;
    }

    const cell = matrix[row][column];
    cell.done = true;
    if (cell.team === 3) {
      replay(team === 1 ? 2 : 1);
      return;
    }
    if (cell.team !== team) {
      turn = turn === 1 ? 2 : 1;
    }

    let done = matrix
      .reduce((acc, val) => acc.concat(val), [])
      .reduce(
        (s, c) => {
          if (!c.done) {
            s[c.team] += 1;
          }
          return s;
        },
        [0, 0, 0, 0]
      );
    if (done[1] === 0) {
      replay(1);
      return;
    }
    if (done[2] === 0) {
      replay(2);
      return;
    }

    updateMatrix();
    updateTurns();
  });

  socket.on("replay", () => {
    matrix = initMatrix(workerData.size || 5);
    updateMatrix();
    updateTurns();
  });

  socket.on("disconnect", () => {
    reRegister();
    players = [];
  });

  socket.on("register", async (player) => {
    players.push(player);
    await new Promise((r) => setTimeout(r, 1000));
    updateTurns();
  });
});

function updateTurns() {
  io.in(room).emit("turn", { turn, players });
}

function replay(team) {
  io.to(room).emit("results", team);
  matrix.forEach((row) => row.forEach((cell) => (cell.done = true)));
  updateMatrix();
  started = false;
}

function updateMatrix() {
  io.to(room).emit("matrix", matrix);
}

function reRegister() {
  io.to(room).emit("reregister");
}

/**
 *
 * @param {number} size
 */
function initMatrix(size) {
  const vals = [];
  for (let idx = 0; idx < Math.ceil(size ** 2); idx++) {
    const position = ~~(Math.random() * words.length);
    const value = words[position];
    vals.push(value);
    words.splice(position, 1);
  }

  const starter = Math.round(Math.random()) === 1;
  turn = starter ? 1 : 2;

  const teams = shuffle(new Array(size ** 2).fill(undefined).map((_, i) => i));

  // @ts-ignore
  const team1 = teams.slice(0, 7 + starter);
  // @ts-ignore
  const team2 = teams.splice(7 + starter, 7 + !starter);
  const forbidden = teams[teams.length - 1];

  return new Array(size).fill(null).map((_, row) =>
    new Array(size).fill(null).map((_, col) => {
      const nr = row * size + col;
      const team = team1.includes(nr) ? 1 : team2.includes(nr) ? 2 : forbidden === nr ? 3 : 0;
      return { word: vals[nr], team, done: false };
    })
  );
}

setTimeout(() => {
  console.log("exit due to timeout");
  process.exit();
}, 1000 * 60 * 60 * 3);

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
