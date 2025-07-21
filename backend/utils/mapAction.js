// Pure function to map an external API action to internal format
function trimAsset(asset) {
    if (!asset) return '';
    const [first, second] = asset.split(/[-.]/);
    return `${first}.${second}`;
}

function mapAction(apiAction) {
    const status = apiAction.status;
    const pools = apiAction.pools || [];
    const metadata = apiAction.metadata || {};
    const swapMeta = metadata.swap || {};
    const streamingMeta = swapMeta.streamingSwapMeta || {};

    // Input asset
    const inObj = (apiAction.in && apiAction.in[0]) || {};
    const inCoin = (inObj.coins && inObj.coins[0]) || {};
    const input = {
        address: inObj.address || '',
        txID: inObj.txID || ''
    };
    const inAmountRaw = parseFloat(inCoin.amount || '0');
    const inAmount = inAmountRaw / 1e8;
    const inAsset = trimAsset(inCoin.asset || (pools[0] || ''));
    const inPriceUSD = parseFloat(swapMeta.inPriceUSD || '0');
    const inValue = inAmount * inPriceUSD;

    // Output asset (success: from out array, pending: from metadata)
    let outAmount = 0;
    let outAsset = trimAsset(pools[1] || '');
    let outPriceUSD = parseFloat(swapMeta.outPriceUSD || '0');
    let outValue = 0;

    if (status === 'success' && Array.isArray(apiAction.out)) {
        // Find first out that is not affiliate
        const outObj = apiAction.out.find(o => !o.affiliate) || apiAction.out[0] || {};
        const outCoin = (outObj.coins && outObj.coins[0]) || {};
        const outAmountRaw = parseFloat(outCoin.amount || '0');
        outAmount = outAmountRaw / 1e8;
        outAsset = trimAsset(outCoin.asset || outAsset);
        // If outPriceUSD is not available, fallback to inPriceUSD
        outValue = outAmount * (outPriceUSD || inPriceUSD);
    } else {
        // Pending: try streamingSwapMeta.outEstimation, else swapTarget
        let outAmountRaw = parseFloat(
            (streamingMeta && streamingMeta.outEstimation) || swapMeta.swapTarget || '0'
        );
        if (outAmountRaw > 1e8) outAmountRaw = outAmountRaw / 1e8;
        else outAmountRaw = outAmountRaw / 1e8;
        outAmount = outAmountRaw;
        outValue = outAmount * (outPriceUSD || inPriceUSD);
    }

    // maxValue
    const maxValue = Math.max(inValue, outValue);

    // Parse duration from memo for streaming swaps
    let durationSec = 0;
    if (swapMeta.memo) {
        // Example memo: =:b:...:0/15/216:...
        const memoParts = swapMeta.memo.split(':');
        // Find the part with the pattern 0/15/216
        const swapParams = memoParts.find(part => /\d+\/\d+\/\d+/.test(part));
        if (swapParams) {
            const [, intervalStr, numSwapsStr] = swapParams.match(/(\d+)\/(\d+)\/(\d+)/) || [];
            if (intervalStr && numSwapsStr) {
                durationSec = parseInt(intervalStr) * parseInt(numSwapsStr) * 6;
            }
        }
    }

    return {
        status,
        inAsset,
        inAmount,
        inValue,
        outAsset,
        outAmount,
        outValue,
        maxValue,
        durationSec,
        input,
    };
}

module.exports = mapAction; 