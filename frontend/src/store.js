import { writable, derived } from "svelte/store";

export const port = writable(0);
export const running = writable(false);

const loc = document.location;
export const url = derived(
  port,
  $port => `${loc.protocol}//${loc.hostname}:${$port}`
);

export const id = writable(Math.ceil(Math.random() * 10000))