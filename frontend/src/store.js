import { writable, readable } from "svelte/store";

export const port = writable(0);
export const url = readable('/');
export const id = writable(Math.ceil(Math.random() * 10000))
export const running = writable(false);