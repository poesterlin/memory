<script>
  import {
    url,
    id as playerId,
    running,
    port,
    myTeam,
    isMaster,
    mates,
    registered,
    me,
    players as all
  } from "./store.js";

  import io from "socket.io-client";
  import { get } from "svelte/store";

  const server = get(url);
  const socket = io(server);
  const id = get(playerId);

  let matrix = [];
  let master = false;
  isMaster.subscribe(v => (master = v));

  socket.on("matrix", mat => {
    matrix = mat;
  });
  socket.on("disconnect", () => {
    running.set(false);
    registered.set(false);
    alert("server disconnected");
  });

  socket.on("reregister", () => {
    socket.emit("register", get(me));
  });

  let done = false;
  let hasWon = false;
  socket.on("results", res => {
    debugger
    hasWon = get(myTeam) === res;
    done = true;
  });

  let myTurn = false;
  socket.on("turn", ({ turn, players }) => {
    myTurn = get(myTeam) === turn;
    all.set(players);
  });

  function flip(row, column) {
    if (!myTurn || matrix[row][column].done || master) {
      return;
    }
    socket.emit("flip", { row, column, team: get(myTeam) });
  }

  function replay() {
    done = false;
    running.set(false);
    socket.emit("replay");
  }

  function endRound() {
    if (!myTurn) {
      return;
    }
    socket.emit("next");
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

  .card0,
  .card1,
  .card2 {
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

  .done {
    opacity: 0.4;
    filter: blur(2px) opacity(0.5);
  }

  button#next {
    margin: 120px auto 40vh;
    display: block;
    height: 60px;
    font-size: 20px;
    border-radius: 50px;
    background: #7ec2c2;
    box-shadow: 20px 20px 60px #6ba5a5, -20px -20px 60px #91dfdf;
    color: white;
  }
</style>

<div class="header">
  <span id="text">
    {myTurn ? 'Your teams turn!' : 'Wait for your opponents to draw...'}
  </span>
  <span>{$myTeam === 1 ? 'You`re Red' : 'You`re Blue'}</span>
  <span>
    (
    {#each $mates as p, index}
      {p.name + (index + 1 < $mates.length ? ', ' : '')}
    {/each}
    )
  </span>
</div>
<table>
  {#each matrix as row, rowIdx}
    <tr>
      {#each row as item, colIdx}
        <td>
          {#if master}
            <button class={'card' + item.team} class:done={item.done}>
              {item.word}
            </button>
          {:else}
            <button
              class={item.done ? 'card' + item.team : ''}
              on:click={() => flip(rowIdx, colIdx)}>
              {item.word}
            </button>
          {/if}

        </td>
      {/each}
    </tr>
  {/each}
</table>

{#if !master && myTurn}
  <button on:click={endRound} id="next">Next Round</button>
{/if}

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
