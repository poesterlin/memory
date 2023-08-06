<script>
  import { url, id, running } from "./store.js";
  import io from "socket.io-client";
  import { get } from "svelte/store";
  import Fab from "./Fab.svelte";

  const server = get(url);
  const socket = io(server);

  let matrix = [];
  let messageRecieved = "";
  let showMessage = false;

  socket.on("matrix", (mat) => {
    matrix = mat;
    checkIfWon();
    isDone();
  });
  socket.on("disconnect", () => {
    running.set(false);
  });
  socket.on("reconnect", () => {
    running.set(false);
  });
  socket.on("message", (data) => {
    if ($id !== data.id) {
      messageRecieved = data.emoji;
      setTimeout(() => {
        messageRecieved = "";
        showMessage = false;
      }, 2000);
      setTimeout(() => {
        showMessage = true;
      }, 20);
    }
  });

  let myTurn = false;
  let flips = 0;
  let ownPoints = 0;
  let opponentPoints = 0;
  let lastFlip = {};

  socket.on("turn", ({ player, toFlip, players }) => {
    myTurn = player === $id;
    flips = toFlip;
    ownPoints = players.find((p) => p.id === $id).points;
    opponentPoints = players.find((p) => p.id !== $id).points;
    if (!myTurn) {
      lastFlip = {};
    }
  });

  function flip(row, column) {
    if (
      !myTurn ||
      flips === 0 ||
      (lastFlip.row === row && lastFlip.column === column)
    ) {
      return;
    }
    lastFlip = { row, column };
    flips--;
    socket.emit("flip", { row, column, id: $id });
    checkIfWon();
    isDone();
  }

  let hasWon = 0;
  function checkIfWon() {
    hasWon = Math.sign(ownPoints - opponentPoints);
  }

  let done = false;
  function isDone() {
    done =
      matrix.flat().filter((tile) => tile.flipped).length ===
      matrix.flat().length;
  }

  function replay() {
    done = false;
    socket.emit("replay");
  }

  function chat(event) {
    const message = event.detail;
    socket.emit("message", { emoji: message, id: $id });
  }
</script>

<div class="header">
  <span id="text">
    {myTurn
      ? "It`s my turn. Flip some cards!"
      : "Wait for your oponent to draw..."}
  </span>
  <span id="points">
    Points:
    <span>{ownPoints}</span>
    vs
    <span>{opponentPoints}</span>
  </span>

  <span id="flips" class:hide={!myTurn}>Flips left: {flips}</span>
</div>
<table>
  {#each matrix as row, rowIdx}
    <tr>
      {#each row as item, colIdx}
        <td>
          <button
            class:noHover={!myTurn}
            class:hide={!item.flipped}
            on:click={() => flip(rowIdx, colIdx)}
          >
            {item.img}
          </button>
        </td>
      {/each}
    </tr>
  {/each}
</table>

{#if done}
  <div class="background">
    <div class="center">
      {#if hasWon === 1}
        <span>🥳🥳🥳 You have won!!</span>
      {:else if hasWon === 0}
        <span>Its a draw 🤷‍♀️</span>
      {:else if hasWon === -1}
        <span>You lost... 😞</span>
      {/if}
      <button id="replay" on:click={replay}>replay</button>
    </div>
  </div>
{/if}

<Fab on:message={chat} />
<div class:show={showMessage} class="message">{messageRecieved}</div>

<style>
  button:not(#replay) {
    width: 200px;
    height: 200px;
    padding: 0;
    margin: 0;
    border: 0;
    max-width: calc(22vmin - 5px);
    max-height: calc(22vmin - 5px);
    box-shadow: 5px 5px 10px #70adad, -5px -5px 10px #8cd7d7;
    background: linear-gradient(145deg, #71afaf, #87d0d0);
    border-radius: 12px;
    font-size: 40px;
    user-select: none;
  }

  button:hover:not(.noHover) {
    box-shadow: inset 5px 5px 10px #70adad55, inset -5px -5px 10px #8cd7d777 !important;
  }

  button {
    transition: transform 0.2s ease-in-out, color 0.1s linear 0.1s;
  }

  td {
    padding: 5px;
  }

  table {
    margin: 5vmin auto;
    background: transparent;
  }

  .header {
    display: flex;
    flex-wrap: wrap-reverse;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    max-width: 800px;
    margin: auto;
    color: white;
    text-shadow: 3px 4px 8px #00000012;
  }

  .hide {
    color: transparent;
    transform: rotateY(180deg);
  }

  button:not(.hide) {
    transform: rotateY(0);
  }

  #flips {
    color: #f0f0f0;
    font-size: 14px;
    flex: 1 3 10%;
    width: 230px;
    text-align: right;
    min-width: max-content;
  }

  #text {
    min-width: 230px;
    max-width: 90vw;
  }
  #points {
    flex: 1 1 calc(100% - 460px);
    min-width: max-content;
  }
  #text {
    flex: 1 1 35%;
    min-width: 230px;
  }
  #points > span {
    margin: 0 10px;
    font-weight: bold;
  }

  .background {
    background: rgba(0, 0, 0, 0.534);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .center {
    margin: auto;
    background: #7ec2c2;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 400px;
    max-width: 70vw;
    height: 30vh;
    border-radius: 5px;
    box-shadow: 5px 6px 10px 1px dimgrey;
    padding: 10px;
    height: min-content;
  }

  .center > span {
    display: block;
    text-align: center;
    margin-top: 20px;
    color: white;
  }

  #replay {
    margin: 20px auto;
    display: block;
    border-radius: 20px;
    background: #7ec2c2;
    box-shadow: 20px 20px 60px #6ba5a5, -20px -20px 60px #91dfdf;
    height: 70px;
    width: 110px;
    color: white;
    text-transform: uppercase;
    font-weight: 500;
  }

  #replay:hover {
    background: #97d8d8;
  }

  .message {
    position: fixed;
    top: 20px;
    right: -100px;
    font-size: 50px;
    background: white;
    padding: 10px;
    border-radius: 30px;
    border-bottom-right-radius: 0px;
    line-height: 60px;
    transition: all 300ms cubic-bezier(0.02, 0.87, 0.66, 1.06);
  }
  .message.show {
    display: block;
    right: 30px;
  }
</style>
