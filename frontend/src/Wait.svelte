<script>
  export let isPrivate = false;
  import { fly } from "svelte/transition";
  import { running, url, id } from "./store.js";
  import { get } from "svelte/store";

  let server = "";
  url.subscribe(u => (server = u));
  async function register() {
    await new Promise(res => setTimeout(res, 400));
    const req = await fetch(server + "/register", {
      method: "POST",
      body: JSON.stringify({ id: get(id) }),
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  register();
  const int = setInterval(async () => {
    const url = server + `/players`;
    const req = await fetch(url);
    const res = await req.json();
    if (res.nr === 2) {
      running.set(true);
      clearInterval(int);
    }
  }, 1000);
</script>

<style>
  .lds-grid {
    width: 80px;
    grid-area: load;
    position: absolute;
    margin: 0 0 0 calc(50% - 40px);
  }
  .lds-grid div {
    position: absolute;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #2a565b;
    animation: lds-grid 1.2s linear infinite;
  }
  .lds-grid div:nth-child(1) {
    top: 8px;
    left: 8px;
    animation-delay: 0s;
  }
  .lds-grid div:nth-child(2) {
    top: 8px;
    left: 32px;
    animation-delay: -0.4s;
  }
  .lds-grid div:nth-child(3) {
    top: 8px;
    left: 56px;
    animation-delay: -0.8s;
  }
  .lds-grid div:nth-child(4) {
    top: 32px;
    left: 8px;
    animation-delay: -0.4s;
  }
  .lds-grid div:nth-child(5) {
    top: 32px;
    left: 32px;
    animation-delay: -0.8s;
  }
  .lds-grid div:nth-child(6) {
    top: 32px;
    left: 56px;
    animation-delay: -1.2s;
  }
  .lds-grid div:nth-child(7) {
    top: 56px;
    left: 8px;
    animation-delay: -0.8s;
  }
  .lds-grid div:nth-child(8) {
    top: 56px;
    left: 32px;
    animation-delay: -1.2s;
  }
  .lds-grid div:nth-child(9) {
    top: 56px;
    left: 56px;
    animation-delay: -1.6s;
  }
  @keyframes lds-grid {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
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
    background: white;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 40vw;
    height: 30vh;
    border-radius: 5px;
    box-shadow: 5px 6px 10px 1px dimgrey;
    padding: 10px;
    display: grid;
    grid-template-areas:
      "header"
      "load"
      "copy";
    grid-template-rows: 100px 80px 130px;
    height: min-content;
  }

  p {
    grid-area: copy;
    text-align: center;
    margin-top: 45px;
  }

  span {
    text-align: center;
    grid-area: header;
    margin-top: 3%;
  }
</style>

<div class="background">
  <div class="center">
    <span>Waiting for other player to join...</span>
    <div class="lds-grid">
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>

    {#if isPrivate}
      <p transition:fly={{ y: 100, duration: 600 }}>
        Invite code was coppied to clipboard
      </p>
    {/if}

  </div>
</div>
