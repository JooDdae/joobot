module.exports = (tier) => {
    return Math.max(5, tier) * 5 * 60 * 1000;
}