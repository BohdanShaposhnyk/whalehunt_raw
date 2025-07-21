function formatAmount(amount, decimals = 4) {
    if (!amount || isNaN(amount)) return '0';
    return `<code>${parseFloat(amount).toLocaleString(undefined, { maximumFractionDigits: decimals })}</code>`;
}
function formatUSD(value) {
    return `<b>$${parseFloat(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>`;
}
function formatMaxUSD(value) {
    return `<b>$${parseFloat(value).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>`;
}

/**
 * Formats a swap notification message for Telegram.
 * @param {Object} action - The normalized action object (from mapAction) or test values.
 * @param {string} [inAsset] - Optional override for inAsset (for test).
 * @param {string} [outAsset] - Optional override for outAsset (for test).
 * @returns {string}
 */
function formatSwapMessage({ inAmount, inAsset, inValue, outAmount, outAsset, outValue, maxValue, status, durationSec, input }) {
    const isApe = inAsset !== 'THOR.RUJI';
    const prefix = isApe
        ? `<b>🐒 Ape Detected!</b>`
        : `<b>👹 Jeet Detected!</b>`;
    const label = isApe ? 'Swooped 🚀' : 'Dumped 🚨';
    let msg =
        `${prefix}\n\n` +
        `${isApe ? '🟢 +' : '🔴 -'}${formatMaxUSD(maxValue)} ${label} \n\n` +
        `${formatAmount(inAmount)} <b>${inAsset}</b> (${formatUSD(inValue)})\n⬇\n` +
        `${formatAmount(outAmount)} <b>${outAsset}</b> (${formatUSD(outValue)})\n`;
    // Add tx and address links
    if (input && input.txID && input.address) {
        msg += `\n<a href="https://thorchain.net/tx/${input.txID}">tx</a> | <a href="https://thorchain.net/address/${input.address}">addy</a>\n`;
    }
    if (status === 'pending') {
        // Use durationSec if available
        if (durationSec && durationSec > 0) {
            const h = Math.floor(durationSec / 3600).toString().padStart(2, '0');
            const m = Math.floor((durationSec % 3600) / 60).toString().padStart(2, '0');
            const s = (durationSec % 60).toString().padStart(2, '0');
            const durationStr = `${h}:${m}:${s}`;
            msg += `\n<i>est. duration: ${durationStr}</i>`;
        }
        msg += `\n\n⏳ <i>pending...</i>`;
    }
    return msg;
}

module.exports = { formatSwapMessage }; 