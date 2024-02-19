const signChar = (x) => (x > 0 || Object.is(x, +0) ? "\x1B[34m+" : "\x1B[31m-");

module.exports = (delta, padding = 0) => {
	delta = Math.round(delta);
	const abs = Math.abs(delta);
	return `${signChar(delta)}${abs.toFixed(0).padStart(padding)}\x1B[0m`;
};