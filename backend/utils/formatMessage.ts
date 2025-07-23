import type { MappedAction } from './mapAction.js';

function formatAmount(amount: number, decimals = 4): string {
    if (!amount || isNaN(amount)) return '0';
    return `<code>${parseFloat(amount.toString()).toLocaleString(undefined, { maximumFractionDigits: decimals })}</code>`;
}
function formatUSD(value: number): string {
    return `<b>$${parseFloat(value.toString()).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>`;
}
function formatMaxUSD(value: number): string {
    return `<b>$${parseFloat(value.toString()).toLocaleString(undefined, { maximumFractionDigits: 2 })}</b>`;
}

/**
 * Formats a swap notification message for Telegram.
 */
export function formatSwapMessage({ inAmount, inAsset, inValue, outAmount, outAsset, outValue, maxValue, status, input }: MappedAction): string {
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
        msg += `\n\n⏳ <i>pending...</i>`;
    }
    return msg;
} 