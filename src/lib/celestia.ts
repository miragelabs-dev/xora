export interface CelestiaTransfer {
    action: string;
    from: {
        name: string | null;
        address: string;
    };
    to: {
        name: string | null;
        address: string | null;
    };
    amount: string;
    asset: {
        symbol: string;
        name: string;
        decimals: number;
        address: string;
        icon: string | null;
    };
}

export interface CelestiaTransaction {
    txTypeVersion: number;
    chain: string;
    accountAddress: string | null;
    classificationData: {
        type: string;
        description: string;
    };
    transfers: CelestiaTransfer[];
    values: any[];
    rawTransactionData: {
        height: number;
        txhash: string;
        gas_used: number;
        gas_wanted: number;
        transactionFee: number;
        timestamp: number;
    };
}

export interface CelestiaResponse {
    account: string;
    items: CelestiaTransaction[];
}

export async function fetchCelestiaTransactions(address: string): Promise<CelestiaResponse> {
    const response = await fetch(
        `https://translate.noves.fi/cosmos/celestia/txs/${address}?pageSize=100`,
        {
            headers: {
                'accept': 'application/json',
                'apiKey': process.env.NOVES_API_KEY || '',
            },
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch Celestia transactions: ${response.statusText}`);
    }

    return response.json();
}

export async function getCelestiaTransactionCount(address: string): Promise<number> {
    const response = await fetchCelestiaTransactions(address);
    return response.items.length;
} 