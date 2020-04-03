<script>
  import { port, running, registered } from "./store.js";
  import Wait from "./Wait.svelte";

  let started = false;
  let loading = false;
  async function createNewGameInstace(isPrivate) {
    let url = "/newInstance";
    if (isPrivate) {
      url += "?private=true";
    }

    const req = await fetch(url);
    const res = await req.json();
    if (isPrivate) {
      copy(res.port);
    }
    port.set(res.port);
    loading = true;
  }

  let coppied = false;
  function copy(port) {
    coppied = true;
    const el = document.createElement("textarea");
    el.value = port;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  let code = "";
  async function join() {
    if (!code) {
      return;
    }
    port.set(parseInt(code));
    loading = true;
  }
</script>

<style>
  .card {
    border: 1px solid #8080803b;
    margin: 50px auto;
    padding: 18px;
    width: 60vw;
    min-width: 210px;
    max-width: 500px;
    border-radius: 18px;
    background: linear-gradient(145deg, #87d0d0, #71afaf);
    box-shadow: 23px 23px 45px #659b9b, -23px -23px 45px #97e9e9;
    display: block;
    font-weight: 500;
    transition: background 0.3s;
    box-sizing: border-box;
  }

  button.card:hover {
    cursor: pointer;
    background: #7ec2c25e;
  }

  span {
    display: block;
    text-align: center;
    text-shadow: 3px 4px 5px #00000036;
    font-size: 20px;
    font-weight: 300;
  }

  button {
    background: transparent;
    color: white;
    margin: 0;
    border: 0;
  }

  #join,
  #join > div {
    display: flex;
    align-items: baseline;
    justify-content: space-around;
    padding-top: 10px;
    flex-wrap: wrap;
  }

  #join {
    box-shadow: none;
    background: transparent;
    border: 1px solid white;
    color: white;
  }

  #join > div {
    align-items: center;
    flex-wrap: nowrap;
    max-width: 90%;
    border-radius: 12px;
    background: linear-gradient(145deg, #87d0d0, #71afaf);
    box-shadow: 23px 23px 45px #659b9b, -23px -23px 45px #97e9e9;
    height: 60px;
    padding-top: 0;
    margin-top: 40px;
    border: 1px solid #ffffff24;
  }

  span {
    width: 100%;
  }

  input {
    height: 60px;
    background: #ffffff;
    border: 0;
    margin: 0;
    min-width: 0;
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }

  h3 {
    text-align: center;
    color: white;
  }
</style>

<h3>Online Emoji Memory!!</h3>

<button class="card" on:click={() => createNewGameInstace(false)}>
  Start Game
</button>

<button class="card" on:click={() => createNewGameInstace(true)}>
  Start private Game
</button>

<div class="card" id="join">
  <span>Join existing Game:</span>
  <div>
    <input bind:value={code} type="text" on:enter={join} />
    <button on:click={join}>
      <i class="material-icons">done</i>
    </button>
  </div>
</div>

{#if loading && !$registered}
  <Wait bind:isPrivate={coppied} />
{/if}
