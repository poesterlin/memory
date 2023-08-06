<script>
  import { running } from "./store.js";
  import Wait from "./Wait.svelte";
  import Memory from "./Memory.svelte";

  let game = { running: false };
  running.subscribe((val) => (game.running = val));
</script>

{#if game.running}
  <Memory />
{:else}
  <Wait />
{/if}

<style>
  :global(body) {
    background: #7ec2c2;
  }
</style>
