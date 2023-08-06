// @ts-check
const crypto = require("crypto");
const { initMatrix, foundPair, resetAll } = require("./memory");

const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer({}, app);

const cors = require("cors");
app.use(cors());
app.use(express.json());
app.use(express.static("./frontend/public"));

const { Server } = require("socket.io");
const io = new Server(server, { allowEIO3: true });

const room = crypto.randomBytes(5).toString("hex");
const pairs = new Map();
let players = [];
let matrix = [];
let turn = 0;
let flips = 0;
let gameStarted = false;

function initGame() {
  if (!gameStarted) {
    matrix = initMatrix(4, pairs);
    gameStarted = true;
  }
  console.log(pairs);
  turn = 0;
  flips = 0;
  players.forEach((p) => (p.points = 0));
  updateTurns();
  updateMatrix();
}

app.get("/close", (_req, res) => {
  res.send("done");
  process.exit();
});

app.get("/players", (_req, res) => {
  res.json({ nr: players.length });
});

app.post("/register", (req, res) => {
  players.push({ id: req.body.id, points: 0 });
  res.json({ nr: players.length });
  if (players.length >= 2) {
    initGame();
  }
});

io.on("connect", function (socket) {
  socket.join(room);
  updateMatrix();
  updateTurns();

  socket.on("flip", function ({ row, column, id }) {
    if (players.length < 2) {
      return;
    }
    if (players[turn].id !== id) {
      return;
    }

    matrix[row][column].flipped = true;
    updateMatrix();

    flips++;
    updateTurns();

    if (flips === 2) {
      flips = 0;
      if (foundPair(matrix)) {
        players[turn].points += 10;
        updateTurns();
        updateMatrix();
      } else {
        turn = (turn + 1) % 2;
        resetAll(matrix);
        setTimeout(() => {
          updateTurns();
          updateMatrix();
        }, 2000);
      }
    }
  });

  socket.on("replay", () => {
    gameStarted = false;
    initGame();
  });

  socket.on("disconnect", () => {
    players = [];
    io.in(room).emit("reconnect");
  });

  socket.on("message", ({ emoji, id }) => {
    io.in(room).emit("message", { emoji, id });
    console.log("message", { emoji, id });
  });
});

io.on("disconnect", (e) => {
  console.log("disconnected", e);
});

function updateTurns() {
  io.in(room).emit("turn", {
    player: (players[turn] || { id: 0 }).id,
    toFlip: 2 - flips,
    players,
  });
}

setTimeout(() => {
  console.log("exit due to timeout");
  process.exit();
}, 1000 * 60 * 60);

function updateMatrix() {
  io.to(room).emit("matrix", matrix);
}

const defaultPort = 8000;
server.listen(process.env.PORT || defaultPort, function () {
  console.log(`Memory app listening on port ${process.env.PORT || defaultPort}!`);
});


