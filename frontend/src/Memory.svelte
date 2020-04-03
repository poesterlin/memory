<script>
  import {
    url,
    id as playerId,
    running,
    port,
    myTeam,
    isMaster
  } from "./store.js";

  import io from "socket.io-client";
  import { get } from "svelte/store";

  const server = get(url);
  const socket = io(server);
  const id = get(playerId);

  // console.log([url, playerId, running, port, myTeam, isMaster].map(get))

  let matrix = [];
  const master = get(isMaster);

  socket.on("matrix", mat => {
    matrix = mat;
  });
  socket.on("disconnect", () => {
    running.set(false);
    port.set(0);
    alert("player disconnected");
  });

  let done = false;
  let hasWon = 0;
  socket.on("results", res => {
    done = true;
    hasWon = myTeam === res;
  });

  let myTurn = false;
  socket.on("turn", ({ turn }) => {
    myTurn = get(myTeam) === turn;
  });

  function flip(row, column) {
    if (!myTurn || matrix[row][column].done || master) {
      return;
    }
    socket.emit("flip", { row, column, team: get(myTeam) });
  }

  function replay() {
    done = false;
    socket.emit("replay");
    running.set(false);
    port.set(0);
  }
</script>

<style>
  button:not(#replay) {
    width: 200px;
    height: 200px;
    padding: 0;
    margin: 0;
    border: 0;
    max-width: calc(18vw - 5px);
    max-height: calc(18vw - 5px);
    border-radius: 12px;
    font-size: 30px;
    user-select: none;
    color: black;
  }

  button:hover {
    box-shadow: 4px 4px 7px #00000045 !important;
  }

  td {
    padding: 5px;
  }

  table {
    margin: 50px auto;
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

  #text {
    min-width: 230px;
    max-width: 90vw;
  }
  #text {
    flex: 1 1 35%;
    min-width: 230px;
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

  .card0, .card1, .card2{
    color: white !important;
  }

  .card0 {
    background: gray !important;
  }
  .card1 {
    background: darkred !important;
  }
  .card2 {
    background: blue !important;
  }
  .card3 {
    background: black !important;
    color: red !important;
  }
</style>

<div class="header">
  <span id="text">
    {myTurn ? 'Your teams turn. Flip some cards!' : 'Wait for your oponents to draw...'}
  </span>
  <span>{$myTeam === 1 ? 'You`re Red' : 'You`re Blue'}</span>
</div>
<table>
  {#each matrix as row, rowIdx}
    <tr>
      {#each row as item, colIdx}
        <td>
          <button
            class={item.done || master ? 'card' + item.team : ''}
            on:click={() => flip(rowIdx, colIdx)}>
            {item.word}
          </button>
        </td>
      {/each}
    </tr>
  {/each}
</table>

{#if done}
  <div class="background">
    <div class="center">
      {#if hasWon}
        <span>🥳🥳🥳 You have won!!</span>
      {:else}
        <span>You lost... 😞</span>
      {/if}
      <button id="replay" on:click={replay}>replay</button>
    </div>
  </div>
{/if}
