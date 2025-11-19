// Pure function to map an external API action to internal format
export interface Coin {
    amount: string;
    asset: string;
}

export interface InObj {
    address: string;
    coins: Coin[];
    txID: string;
}

export interface OutObj {
    address: string;
    coins: Coin[];
    txID?: string;
    affiliate?: boolean;
    height?: string;
}

export interface SwapMeta {
    memo?: string;
    inPriceUSD?: string;
    outPriceUSD?: string;
    streamingSwapMeta?: any;
    swapTarget?: string;
}

export interface Metadata {
    swap?: SwapMeta;
}

export interface ApiAction {
    status: string;
    in: InObj[];
    out?: OutObj[];
    pools?: string[];
    metadata?: Metadata;
    height?: string;
    [key: string]: any;
}

export interface MappedAction {
    status: string;
    inAsset: string;
    inAmount: number;
    inValue: number;
    outAsset: string;
    outAmount: number;
    outValue: number;
    maxValue: number;
    input: { address: string; txID: string };
}

function trimAsset(asset: string): string {
    if (!asset) return '';
    const [first, second] = asset.split(/[-.]/);
    return `${first}.${second}`;
}

function getOutputAssetInfo(
    apiAction: ApiAction,
): { outAmount: number; outAsset: string; outValue: number } {
    const { out: outArr = [], pools = [], metadata: { swap: swapMeta = {} } = {} } = apiAction;
    const { outPriceUSD: outPriceUSDStr = '0', streamingSwapMeta: { outEstimation = '0' } = {} } = swapMeta;

    const outAsset = trimAsset(pools[1] ?? '');
    const outPriceUSD = parseFloat(outPriceUSDStr);

    const { coins: outCoins = [] } = outArr.find((o: OutObj) => !o.affiliate) ?? {};
    const { amount: outAmountStr = '0' } = outCoins[0] ?? {};
    const outAmount = Math.max(...[outAmountStr, outEstimation].map(x => parseFloat(x))) / 1e8;
    // const outAmount = parseFloat(outAmountStr ?? outEstimation) / 1e8;

    const outValue = outAmount * outPriceUSD;
    return { outAmount, outAsset, outValue };
}

export function mapAction(apiAction: ApiAction): MappedAction {
    const { status, pools = [], metadata: { swap: swapMeta = {} } = {} } = apiAction;
    const { streamingSwapMeta: { depositedCoin: { amount: depositedAmount = '0' } = {} } = {} } = swapMeta;

    // Input asset (with destructuring)
    const { address = '', txID = '', coins = [] } = apiAction.in?.[0] ?? {};
    const { amount: inAmountStr = '0', asset: inAssetStr = '' } = coins[0] ?? {};
    const input = { address, txID };
    const inAmount = Math.max(...[inAmountStr, depositedAmount].map(x => parseFloat(x))) / 1e8;
    // const inAmount = inAmountRaw / 1e8;
    const inAsset = trimAsset(inAssetStr || (pools[0] || ''));
    const inPriceUSD = parseFloat(swapMeta.inPriceUSD || '0');
    const inValue = inAmount * inPriceUSD;

    // Output asset (moved to helper)
    const { outAmount, outAsset, outValue } = getOutputAssetInfo(
        apiAction,
    );

    // maxValue
    const maxValue = Math.max(inValue, outValue);
    // console.log('maxValue', maxValue);

    return {
        status,
        inAsset,
        inAmount,
        inValue,
        outAsset,
        outAmount,
        outValue,
        maxValue,
        input,
    };
} 