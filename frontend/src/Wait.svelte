<script>
  export let isPrivate = false;
  import { fly } from "svelte/transition";
  import {
    running,
    url,
    id,
    myTeam,
    players,
    isMaster,
    registered
  } from "./store.js";
  import { get } from "svelte/store";

  let server = "";
  url.subscribe(u => (server = u));

  async function register() {
    await new Promise(res => setTimeout(res, 400));
    const req = await fetch(server + "/register", {
      method: "POST",
      body: JSON.stringify({ id: get(id), name }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const res = await req.json();
    myTeam.set(res.team);
    players.set(res.players);
    registered.set(true);
  }
  let name = "";
</script>

<style>
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
    background: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 40vw;
    border-radius: 5px;
    box-shadow: 5px 6px 10px 1px dimgrey;
    padding: 10px;
    display: grid;
    grid-template-areas:
      "name"
      "copy";
    grid-template-rows: 160px 30px;
    height: min-content;
    max-width: 520px;
  }

  p {
    grid-area: copy;
    text-align: center;
    margin-top: -5px;
  }

  #name,
  #name > div {
    display: flex;
    align-items: baseline;
    justify-content: center;
    padding-top: 10px;
    flex-wrap: wrap;
  }

  #name {
    grid-area: name;
    box-shadow: none;
    background: transparent;
    border: 1px solid white;
    margin-top: 45px;
  }

  #name > div {
    align-items: center;
    flex-wrap: nowrap;
    max-width: 90%;
    border-radius: 12px;
    height: 60px;
    padding-top: 0;
    border: 1px solid #ffffff24;
  }

  input {
    height: 60px;
    background: #ffffff;
    margin: 0;
    min-width: 0;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  button {
    height: 60px;
    margin-top: 8px;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }
  span {
    margin: 0 40px;
  }
</style>

<div class="background">
  <div class="center">
    {#if isPrivate}
      <p transition:fly={{ y: 100, duration: 600 }}>
        Invite code was coppied to clipboard
      </p>
    {/if}

    <div id="name">
      <span>Enter Nickname:</span>
      <div>
        <input bind:value={name} type="text" on:enter={register} />
        <button on:click={register}>
          <i class="material-icons">done</i>
        </button>
      </div>
    </div>

  </div>
</div>
