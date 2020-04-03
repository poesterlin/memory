<script>
  import { players, running, url, id } from "./store.js";
  import { derived, get } from "svelte/store";

  const team1 = derived(players, ps => ps.filter(p => p.team === 1));
  const team2 = derived(players, ps => ps.filter(p => p.team === 2));

  let server = "";
  url.subscribe(u => (server = u));

  let clientId = 0;
  id.subscribe(u => (clientId = u));

  async function start() {
    const req = await fetch(server + "/start");
    running.set(true);
  }

  async function makeMaster({ id }) {
    const req = await fetch(server + "/elevate", {
      method: "POST",
      body: JSON.stringify({ id }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const res = await req.json();
    players.set(res.players);
  }

  const int = setInterval(async () => {
    const url = server + `/players`;
    const req = await fetch(url);
    const res = await req.json();
    players.set(res.players);
    running.set(res.started);
  }, 1000);
  running.subscribe(r => r && clearInterval(int));
</script>

<style>
  #main {
    display: flex;
    justify-content: space-evenly;
    flex-direction: row;
    flex-wrap: wrap;
    margin-right: 10px;
  }

  .item,
  h3 {
    flex: 1 1 95%;
    max-width: 95%;
    margin: 10px;
    align-items: center;
    display: flex;
    justify-content: center;
    position: relative;
  }

  i {
    position: absolute;
    right: 10px;
  }

  .item {
    cursor: pointer;
    border-radius: 5px;
    padding: 7px 0;
    border: 1px solid gray;
  }

  .item:hover {
    background: #7fa5a5;
  }

  h3 {
    color: white;
  }

  .col {
    flex: 1 1 50%;
    max-width: 50%;
    min-width: 300px;
    margin: 20px 0;
  }

  button {
    margin: auto;
    display: block;
    border-radius: 15px;
    background: #7ec2c2;
    box-shadow: 7px 7px 15px #6ba5a5, -7px -7px 15px #91dfdf;
    border: 0;
    padding: 40px;
    color: white;
    font-weight: bold;
    margin-top: 70px;
  }
</style>

<h2>Pick Host</h2>

<div id="main">
  <div class="col">
    <h3>Red Team</h3>
    {#each $team1 as p}
      <div class="item" on:click={() => makeMaster(p)}>
        {p.name}
        {#if p.master}
          <i class="material-icons">face</i>
        {/if}
      </div>
    {/each}
  </div>
  <div class="col">
    <h3>Blue Team</h3>
    {#each $team2 as p}
      <div class="item" on:click={() => makeMaster(p)}>
        {p.name}
        {#if p.master}
          <i class="material-icons">face</i>
        {/if}
      </div>
    {/each}
  </div>
</div>

<button on:click={start}>START</button>
