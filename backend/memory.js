// @ts-check
const crypto = require("crypto");
const { emoji } = require("./emoji");

function resetAll(matrix) {
    matrix.forEach((row) =>
        row.forEach((card) => {
            card.flipped = card.complete;
        })
    );
}

function foundPair(matrix) {
    let flipped = [];
    matrix.forEach((row) =>
        row.forEach((card) => {
            if (card.flipped && !card.complete) {
                flipped.push(card);
            }
        })
    );
    if (flipped.length < 2) {
        return false;
    }
    flipped.forEach((card) => {
        card.emojiCode =
            card.emojiCode ||
            card.img
                .split("")
                .map((e) => e.charCodeAt(0))
                .join("");
    });
    const res = flipped[0].emojiCode === flipped[1].emojiCode;
    if (res) {
        flipped[0].complete = true;
        flipped[1].complete = true;
    }
    return res;
}

/**
 *
 * @param {number} size only even values
 */
function initMatrix(size, pairs) {
    const available = new Array(size ** 2).fill(null).map((_, i) => i);
    for (let idx = 0; idx < Math.ceil(size ** 2 / 2); idx++) {
        let position1, position2, value1, value2;
        do {
            position1 = Math.floor(Math.random() * available.length);
            position2 = Math.floor(Math.random() * available.length);
            value1 = available[position1];
            value2 = available[position2];
        } while (position1 === position2);

        pairs.set(value1, value2).set(value2, value1);

        // remove larger idx first
        const idx1 = Math.max(position1, position2);
        const idx2 = Math.min(position1, position2);
        available.splice(idx1, 1);
        available.splice(idx2, 1);
    }

    const base = Math.floor(Math.random() * emoji.length);
    const vals = Array.from(pairs.values());
    return new Array(size).fill(null).map((_, row) =>
        new Array(size).fill(null).map((_, col) => {
            const nr = row * size + col;
            const id = Math.floor(vals.findIndex((i) => i === nr) / 2);
            return { flipped: false, img: emoji[toBytes(base + id)], complete: false };
        })
    );
}

function toBytes(input) {
    const a1 = crypto.createHmac("sha256", input + "").update("i".repeat(15)).digest("hex").slice(0, 4);
    return parseInt(a1, 16) % emoji.length;
}

module.exports = {
    initMatrix,
    foundPair,
    resetAll,
}