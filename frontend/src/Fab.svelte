<script>
  import { createEventDispatcher } from "svelte";

  const reactions = ["😂", "🙄", "😴", "🤬", "🥺", "🤓"];
  const dispatch = createEventDispatcher();
  let extended = false;
  function forward(message) {
    dispatch("message", message);
    extended = false;
  }

  function toggle() {
    extended = !extended;
  }
</script>

<style>
  .fab {
    width: 70px;
    height: 70px;
    background-color: #0097a7;
    border-radius: 50%;
    box-shadow: 0 6px 10px 0 #66666660;
    transition: all 0.1s ease-in-out;
    font-size: 50px;
    color: white;
    text-align: center;
    line-height: 61px;
    position: fixed;
    right: 50px;
    bottom: 50px;
    user-select: none;
  }

  .fab:hover {
    box-shadow: 0 6px 14px 0 #666;
    transform: scale(1.05);
  }

  .fab.extended {
    transform: rotate(45deg);
  }

  .container {
    display: flex;
    flex-flow: column;
    position: fixed;
    right: 58px;
    bottom: 125px;
    font-size: 40px;
    align-content: center;
    width: 53px;
  }
  button {
    background: transparent;
    border-radius: 50%;
    margin: 3px 0px;
    padding: 0;
    padding-bottom: 2px;
    line-height: 50px;
    border: 0;
    cursor: pointer;
  }
  img {
    transform: scale(1.5) translate(1px, -3px);
  }
  button:hover {
    box-shadow: 1px 2px 3px #0000004f;
  }

  @media (max-width: 730px) {
    .container {
      right: 20px;
      bottom: 106px;
      font-size: 33px;
      flex-flow: row-reverse;
    }
    .fab {
      right: 10px;
      bottom: 29px;
    }
    button {
      margin: 3px 3px;
      background: #0000004f;
      height: 40px;
      line-height: 38px;
      font-size: 31px;
      padding: 0px 0px 3px 0px;
    }
  }
</style>

<div class="fab" class:extended on:click={toggle}>
  {#if extended}
    +
  {:else}
    <img src="./chat.svg" alt="chat" />
  {/if}
</div>
{#if extended}
  <div class="container">
    {#each reactions as emoji}
      <button on:click={() => forward(emoji)}>{emoji}</button>
    {/each}
  </div>
{/if}
