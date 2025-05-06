'use client';

import { Keplr } from "@keplr-wallet/provider-extension";
import React, { createContext, PropsWithChildren, useEffect, useState } from "react";

interface KeplrWalletContextInterface {
    keplrWalletAddress: string;
    isKeplrWalletInstalled: boolean;
    connectKeplrWallet: () => Promise<string>;
    disconnectKeplrWallet: () => void;
}

export const KeplrWalletContext = createContext<KeplrWalletContextInterface>({
    keplrWalletAddress: "",
    isKeplrWalletInstalled: false,
    connectKeplrWallet: async () => "",
    disconnectKeplrWallet: () => { },
});

const getKeplrFromProvider = async (): Promise<Keplr | undefined> => {
    try {
        return await Keplr.getKeplr();
    } catch (error) {
        console.error("Error getting Keplr provider:", error);
        return undefined;
    }
};

export const KeplrWalletProvider = ({ children }: PropsWithChildren<object>) => {
    const [keplrWalletAddress, setKeplrWalletAddress] = useState<string>("");
    const [isKeplrWalletInstalled, setIsKeplrWalletInstalled] = useState<boolean>(false);

    useEffect(() => {
        const checkKeplrInstalled = async () => {
            const keplr = await getKeplrFromProvider();
            setIsKeplrWalletInstalled(!!keplr);
        };

        checkKeplrInstalled();
    }, []);

    const connectKeplrWallet = async (): Promise<string> => {
        try {
            const keplr = await getKeplrFromProvider();

            if (!keplr) {
                throw new Error("Keplr extension is not installed");
            }

            const chainId = 'celestia';

            await keplr.enable(chainId);

            const offlineSigner = keplr.getOfflineSigner(chainId);
            const accounts = await offlineSigner.getAccounts();

            if (accounts.length === 0) {
                throw new Error("No accounts found in Keplr");
            }

            const address = accounts[0].address;

            function generateNonce(length = 16) {
                const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                let nonce = '';
                for (let i = 0; i < length; i++) {
                    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
                }
                return nonce;
            }

            const nonce = generateNonce();

            await keplr.signArbitrary(
                chainId,
                address,
                nonce
            );

            setKeplrWalletAddress(address);

            return address;
        } catch (error) {
            console.error("Error connecting to Keplr wallet:", error);
            return "";
        }
    };

    const disconnectKeplrWallet = () => {
        setKeplrWalletAddress("");
    };

    return (
        <KeplrWalletContext.Provider
            value={{
                keplrWalletAddress,
                isKeplrWalletInstalled,
                connectKeplrWallet,
                disconnectKeplrWallet,
            }}
        >
            {children}
        </KeplrWalletContext.Provider>
    );
};

export const useKeplrWallet = () => React.useContext(KeplrWalletContext);