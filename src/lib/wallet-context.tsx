'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ethers } from 'ethers';

// ---------------------------------------------------------------------------
// Pharos Atlantic Testnet configuration
// ---------------------------------------------------------------------------
const PHAROS_CHAIN_ID = 688689;
const PHAROS_CHAIN_ID_HEX = '0xa8231';

const PHAROS_NETWORK_PARAMS = {
  chainId: PHAROS_CHAIN_ID_HEX,
  chainName: 'Pharos Atlantic Testnet',
  nativeCurrency: {
    name: 'PHRS',
    symbol: 'PHRS',
    decimals: 18,
  },
  rpcUrls: ['https://atlantic.dplabs-internal.com'],
  blockExplorerUrls: ['https://atlantic.pharosscan.xyz/'],
} as const;

// ---------------------------------------------------------------------------
// Ethereum provider type augmentation
// ---------------------------------------------------------------------------
interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// ---------------------------------------------------------------------------
// Context value type
// ---------------------------------------------------------------------------
interface WalletContextValue {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchToPharos: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Track mounted state to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // -------------------------------------------------------------------
  // Helper: hydrate provider / signer / chainId from an already-
  // connected account list (shared by connect + auto-detect paths).
  // -------------------------------------------------------------------
  const hydrate = useCallback(async (ethereum: EthereumProvider, accounts: string[]) => {
    if (accounts.length === 0) return;

    const browserProvider = new ethers.BrowserProvider(ethereum as ethers.Eip1193Provider);
    const jsonRpcSigner = await browserProvider.getSigner();
    const network = await browserProvider.getNetwork();

    if (!mountedRef.current) return;

    setAccount(accounts[0]);
    setProvider(browserProvider);
    setSigner(jsonRpcSigner);
    setChainId(Number(network.chainId));
  }, []);

  // -------------------------------------------------------------------
  // connectWallet – request accounts via MetaMask
  // -------------------------------------------------------------------
  const connectWallet = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error(
        'MetaMask is not installed. Please install the MetaMask browser extension.',
      );
    }

    setIsConnecting(true);
    try {
      const accounts = (await ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      await hydrate(ethereum, accounts);
    } finally {
      if (mountedRef.current) {
        setIsConnecting(false);
      }
    }
  }, [hydrate]);

  // -------------------------------------------------------------------
  // disconnectWallet – clear local state (MetaMask doesn't expose a
  // true "disconnect" RPC; we just reset our own context).
  // -------------------------------------------------------------------
  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
  }, []);

  // -------------------------------------------------------------------
  // switchToPharos – switch chain or add it if not yet known
  // -------------------------------------------------------------------
  const switchToPharos = useCallback(async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('MetaMask is not installed.');
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: PHAROS_CHAIN_ID_HEX }],
      });
    } catch (err: unknown) {
      // Error code 4902 means the chain hasn't been added yet.
      const switchError = err as { code?: number };
      if (switchError.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [PHAROS_NETWORK_PARAMS],
        });
      } else {
        throw err;
      }
    }
  }, []);

  // -------------------------------------------------------------------
  // Auto-detect on mount: check if MetaMask is already connected
  // -------------------------------------------------------------------
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    let cancelled = false;

    (async () => {
      try {
        // eth_accounts doesn't trigger the connect popup – it only
        // returns accounts if the user already granted permission.
        const accounts = (await ethereum.request({
          method: 'eth_accounts',
        })) as string[];

        if (cancelled || accounts.length === 0) return;

        await hydrate(ethereum, accounts);
      } catch {
        // Silently ignore – wallet simply isn't available / connected.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [hydrate]);

  // -------------------------------------------------------------------
  // Listen for account & chain changes
  // -------------------------------------------------------------------
  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = async (...args: unknown[]) => {
      const accounts = args[0] as string[];
      if (accounts.length === 0) {
        // User disconnected all accounts from MetaMask.
        disconnectWallet();
      } else {
        await hydrate(ethereum, accounts);
      }
    };

    const handleChainChanged = (...args: unknown[]) => {
      const newChainIdHex = args[0] as string;
      setChainId(Number(newChainIdHex));

      // Re-create provider / signer for the new chain if connected.
      if (account) {
        const browserProvider = new ethers.BrowserProvider(
          ethereum as ethers.Eip1193Provider,
        );
        setProvider(browserProvider);
        browserProvider.getSigner().then((s) => {
          if (mountedRef.current) setSigner(s);
        });
      }
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [account, disconnectWallet, hydrate]);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <WalletContext.Provider
      value={{
        account,
        provider,
        signer,
        chainId,
        isConnecting,
        connectWallet,
        disconnectWallet,
        switchToPharos,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Re-export the chain id constant for convenience
export { PHAROS_CHAIN_ID };
