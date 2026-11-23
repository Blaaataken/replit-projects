import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import {
  WalletState,
  initialWalletState,
  connectWallet as connectWalletFn,
  disconnectWallet as disconnectWalletFn,
  switchNetwork as switchNetworkFn,
  getNetworkByChainId,
  SUPPORTED_NETWORKS,
  NetworkConfig,
} from "@/lib/web3";

interface Web3ContextType {
  wallet: WalletState;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchNetwork: (chainId: number) => Promise<void>;
  supportedNetworks: Record<string, NetworkConfig>;
  currentNetwork: NetworkConfig | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(initialWalletState);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentNetwork = wallet.chainId ? getNetworkByChainId(wallet.chainId) || null : null;

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const state = await connectWalletFn();
      setWallet(state);
    } catch (err: any) {
      setError(err.message);
      setWallet(initialWalletState);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const state = await disconnectWalletFn();
    setWallet(state);
    setError(null);
  }, []);

  const switchNetwork = useCallback(async (chainId: number) => {
    setError(null);
    try {
      await switchNetworkFn(chainId);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.ethereum) return;

    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        setWallet(initialWalletState);
      } else if (wallet.isConnected) {
        try {
          const state = await connectWalletFn();
          setWallet(state);
        } catch (err) {
          console.error("Failed to update wallet state:", err);
        }
      }
    };

    const handleChainChanged = async () => {
      if (wallet.isConnected) {
        try {
          const state = await connectWalletFn();
          setWallet(state);
        } catch (err) {
          console.error("Failed to update wallet state:", err);
        }
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [wallet.isConnected]);

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window === "undefined" || !window.ethereum) return;

      try {
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          const state = await connectWalletFn();
          setWallet(state);
        }
      } catch (err) {
        console.error("Failed to check existing connection:", err);
      }
    };

    checkExistingConnection();
  }, []);

  return (
    <Web3Context.Provider
      value={{
        wallet,
        isConnecting,
        error,
        connect,
        disconnect,
        switchNetwork,
        supportedNetworks: SUPPORTED_NETWORKS,
        currentNetwork,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
