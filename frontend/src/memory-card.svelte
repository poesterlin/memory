<script>
    import { createEventDispatcher } from "svelte";

    export let myTurn = false;
    export let item;

    const dispatch = createEventDispatcher();
</script>

<button
    class:hover={myTurn}
    class:hide={!item.flipped}
    on:click={() => dispatch("flip")}
>
    {item.img}
</button>

<style>
    button {
        width: 200px;
        height: 200px;
        padding: 0;
        margin: 0;
        border: 0;
        max-width: calc(22vmin - 5px);
        max-height: calc(22vmin - 5px);
        box-shadow: 5px 5px 10px #70adad, -5px -5px 10px #8cd7d7;
        background: linear-gradient(145deg, #71afaf, #87d0d0);
        border-radius: 12px;
        font-size: 40px;
        user-select: none;
        transition: transform 0.2s ease-in-out, color 0.1s linear 0.1s;
        transform: rotateY(0);
    }

    button.hover:hover {
        box-shadow: inset 5px 5px 10px #70adad55, inset -5px -5px 10px #8cd7d777 !important;
    }

    .hide {
        color: transparent;
        transform: rotateY(180deg);
    }
</style>
