import { writable, derived } from "svelte/store";

export const port = writable(0);
export const running = writable(false);
export const registered = writable(false);

const loc = document.location;
export const url = derived(port, ($port) => `${loc.protocol}//${loc.hostname}:${$port}`);

export const id = writable(Math.ceil(Math.random() * 10000));

export const myTeam = writable(1);
export const players = writable([]);
export const isMaster = derived([players, id], ([pl, myId]) => pl.find((p) => p.id === myId).master);
export const mates = derived([players, myTeam], ([pl, team]) => pl.filter((p) => p.team === team));
export const me = derived([players, id], ([pl, id]) => pl.find((p) => p.id === id));
