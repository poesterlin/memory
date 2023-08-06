// @ts-check
const express = require("express");
const { options } = require("./cert");
const { emoji } = require("./emoji");
const crypto = require("crypto");

const app = express();
const http = require("http");
const server = http.createServer(options, app);

const cors = require("cors");
const bodyParser = require("body-parser");
app.use(cors());
app.use(express.static("./frontend/public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, }));

const { Server } = require("socket.io")
const io = new Server(server, { allowEIO3: true });

const room = crypto.randomBytes(5).toString("hex");
const players = [];
const pairs = new Map();
let matrix = initMatrix(4);
console.log(pairs);
let turn = 0;
let flips = 0;

app.get("/close", (req, res) => {
  res.send("done");
  process.exit();
});

app.get("/players", (req, res) => {
  res.json({ nr: players.length });
});

app.post("/register", (req, res) => {
  players.push({ id: req.body.id, points: 0 });
  console.log("register", req.body.id);
  console.log("players", players);
  res.json({ nr: players.length });
});

// app.get("/:id", (req, res) => {
//   res.setHeader("content-type", "image/svg+xml");
//   res.status(200).send(buildSvg(req.params.id));
// });

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
      if (foundPair()) {
        players[turn].points += 10;
        updateTurns();
        updateMatrix();
      } else {
        turn = (turn + 1) % 2;
        resetAll();
        setTimeout(() => {
          updateTurns();
          updateMatrix();
        }, 2000);
      }
    }
  });

  socket.on("replay", () => {
    matrix = initMatrix(4);
    updateMatrix();
    turn = (turn + 1) % 2;
    flips = 0;
    players.forEach((p) => (p.points = 0));
    updateTurns();
  });

  socket.on("disconnect", () => {
    console.log("disconnected");
    process.exit();
  });

  socket.on("message", ({ emoji, id }) => {
    io.in(room).emit("message", { emoji, id });
    console.log("message", { emoji, id });
  });
});

io.on("disconnect", () => {
  console.log("disconnected");
  process.exit();
});

function updateTurns() {
  io.in(room).emit("turn", {
    player: (players[turn] || { id: 0 }).id,
    toFlip: 2 - flips,
    players,
  });
}

function updateMatrix() {
  io.to(room).emit("matrix", matrix);
}

function resetAll() {
  matrix.forEach((row) =>
    row.forEach((card) => {
      card.flipped = card.complete;
    })
  );
}

function foundPair() {
  let flipped = [];
  matrix.forEach((row) =>
    row.forEach((card) => {
      if (card.flipped && !card.complete) {
        flipped.push(card);
      }
    })
  );
  if (flipped.length < 2) {
    return false;
  }
  flipped.forEach((card) => {
    card.emojiCode =
      card.emojiCode ||
      card.img
        .split("")
        .map((e) => e.charCodeAt(0))
        .join("");
  });
  const res = flipped[0].emojiCode === flipped[1].emojiCode;
  if (res) {
    flipped[0].complete = true;
    flipped[1].complete = true;
  }
  return res;
}

/**
 *
 * @param {number} size only even values
 */
function initMatrix(size) {
  const available = new Array(size ** 2).fill(null).map((_, i) => i);
  for (let idx = 0; idx < Math.ceil(size ** 2 / 2); idx++) {
    let position1, position2, value1, value2;
    do {
      position1 = ~~(Math.random() * available.length);
      position2 = ~~(Math.random() * available.length);
      value1 = available[position1];
      value2 = available[position2];
    } while (position1 === position2);

    pairs.set(value1, value2).set(value2, value1);

    // remove larger idx first
    const idx1 = Math.max(position1, position2);
    const idx2 = Math.min(position1, position2);
    available.splice(idx1, 1);
    available.splice(idx2, 1);
  }

  const base = ~~(Math.random() * emoji.length);
  const vals = Array.from(pairs.values());
  return new Array(size).fill(null).map((_, row) =>
    new Array(size).fill(null).map((_, col) => {
      const nr = row * size + col;
      const id = Math.floor(vals.findIndex((i) => i === nr) / 2);
      return { flipped: false, img: emoji[toBytes(base + id)], complete: false };
    })
  );
}

setTimeout(() => {
  console.log("exit due to timeout");
  process.exit();
}, 1000 * 60 * 60);

// /**
//  *
//  * @param {string} id
//  */
// function buildSvg(id) {
//   const c = toBytes(id);
//   const header = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" height="200" width="200">';
//   const footer = "Sorry, your browser does not support inline SVG. </svg>";
//   const chart = [
//     `<circle cx="${c[0]}" cy="${c[4]}" r="${c[0] / 2}" stroke="black" stroke-width="3" fill="#${toHex(c[2], c[1], c[7], c[2])}" />`,
//     `<circle cx="${c[2]}" cy="${c[4]}" r="${c[0] / 5}" stroke="black" stroke-width="3" fill="#${toHex(c[7], c[1], c[5], c[5])}" />`,
//     `<circle cx="${c[2]}" cy="${c[6]}" r="${c[2] / 3}" stroke="black" stroke-width="3" fill="#${toHex(c[3], c[1], c[4], c[2])}" />`,
//   ];

//   return header + chart.join("") + footer;
// }

// function toHex(...args) {
//   return args.map((a) => a.toString(16)).join("");
// }

function toBytes(input) {
  const a1 = crypto
    .createHmac("sha256", input + "")
    .update("i".repeat(15))
    .digest("hex")
    .slice(0, 4);
  return parseInt(a1, 16) % emoji.length;
}

const defaultPort = 8000;
server.listen(process.env.PORT || defaultPort, function () {
  console.log(`Memory app listening on port ${process.env.PORT || defaultPort}!`);
});


