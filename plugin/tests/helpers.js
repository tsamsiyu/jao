export function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateArray(min, max, itemProvider) {
    const randomLength = getRandomInt(min, max);
    const res = [];
    for (let i = 0; i < randomLength; i++) {
        res.push(itemProvider.call());
    }
    return res;
}

export function exectime(cb) {
    const t0 = new Date().getTime();
    cb.call();
    const res = new Date().getTime() - t0;
    console.log("Time point: " + res + " milliseconds.")
    return res;
}