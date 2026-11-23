import { ethers, BrowserProvider, Contract, formatEther, parseEther } from "ethers";

export interface NetworkConfig {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  isTestnet: boolean;
}

export const SUPPORTED_NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
    isTestnet: false,
  },
  bsc: {
    chainId: 56,
    name: "Binance Smart Chain",
    symbol: "BNB",
    rpcUrl: "https://bsc-dataseed.binance.org",
    explorerUrl: "https://bscscan.com",
    isTestnet: false,
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com",
    explorerUrl: "https://polygonscan.com",
    isTestnet: false,
  },
  arbitrum: {
    chainId: 42161,
    name: "Arbitrum One",
    symbol: "ETH",
    rpcUrl: "https://arb1.arbitrum.io/rpc",
    explorerUrl: "https://arbiscan.io",
    isTestnet: false,
  },
  optimism: {
    chainId: 10,
    name: "Optimism",
    symbol: "ETH",
    rpcUrl: "https://mainnet.optimism.io",
    explorerUrl: "https://optimistic.etherscan.io",
    isTestnet: false,
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    symbol: "ETH",
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorerUrl: "https://sepolia.etherscan.io",
    isTestnet: true,
  },
  mumbai: {
    chainId: 80001,
    name: "Mumbai Testnet",
    symbol: "MATIC",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    explorerUrl: "https://mumbai.polygonscan.com",
    isTestnet: true,
  },
  bscTestnet: {
    chainId: 97,
    name: "BSC Testnet",
    symbol: "BNB",
    rpcUrl: "https://data-seed-prebsc-1-s1.binance.org:8545",
    explorerUrl: "https://testnet.bscscan.com",
    isTestnet: true,
  },
};

export const SWC_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function approve(address, uint256) returns (bool)",
  "function allowance(address, address) view returns (uint256)",
  "function stake(uint256)",
  "function unstake(uint256)",
  "function claimRewards()",
  "function getStakingInfo(address) view returns (uint256, uint256, uint256, uint256)",
  "function bridgeTo(uint256, uint256, address) returns (bytes32)",
  "function getTokenInfo() view returns (string, string, uint8, uint256, uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event TokensStaked(address indexed user, uint256 amount)",
  "event TokensUnstaked(address indexed user, uint256 amount, uint256 rewards)",
];

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  chainId: number | null;
  balance: string | null;
  networkName: string | null;
  provider: BrowserProvider | null;
}

export const initialWalletState: WalletState = {
  isConnected: false,
  address: null,
  chainId: null,
  balance: null,
  networkName: null,
  provider: null,
};

export function getNetworkByChainId(chainId: number): NetworkConfig | undefined {
  return Object.values(SUPPORTED_NETWORKS).find((n) => n.chainId === chainId);
}

export function isNetworkSupported(chainId: number): boolean {
  return getNetworkByChainId(chainId) !== undefined;
}

export async function connectWallet(): Promise<WalletState> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Please install MetaMask or another Web3 wallet");
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const address = accounts[0];
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const balance = await provider.getBalance(address);
    const networkConfig = getNetworkByChainId(chainId);

    return {
      isConnected: true,
      address,
      chainId,
      balance: formatEther(balance),
      networkName: networkConfig?.name || `Chain ${chainId}`,
      provider,
    };
  } catch (error: any) {
    throw new Error(error.message || "Failed to connect wallet");
  }
}

export async function disconnectWallet(): Promise<WalletState> {
  return initialWalletState;
}

export async function switchNetwork(chainId: number): Promise<void> {
  if (!window.ethereum) {
    throw new Error("No wallet detected");
  }

  const networkConfig = getNetworkByChainId(chainId);
  if (!networkConfig) {
    throw new Error("Network not supported");
  }

  const chainIdHex = `0x${chainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    });
  } catch (error: any) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: networkConfig.name,
            nativeCurrency: {
              name: networkConfig.symbol,
              symbol: networkConfig.symbol,
              decimals: 18,
            },
            rpcUrls: [networkConfig.rpcUrl],
            blockExplorerUrls: [networkConfig.explorerUrl],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

export async function getTokenBalance(
  provider: BrowserProvider,
  tokenAddress: string,
  walletAddress: string
): Promise<string> {
  const contract = new Contract(tokenAddress, SWC_TOKEN_ABI, provider);
  const balance = await contract.balanceOf(walletAddress);
  return formatEther(balance);
}

export async function getStakingInfo(
  provider: BrowserProvider,
  tokenAddress: string,
  walletAddress: string
): Promise<{
  stakedAmount: string;
  pendingRewards: string;
  stakingStartTime: number;
  apy: number;
}> {
  const contract = new Contract(tokenAddress, SWC_TOKEN_ABI, provider);
  const [staked, rewards, startTime, apy] = await contract.getStakingInfo(walletAddress);
  
  return {
    stakedAmount: formatEther(staked),
    pendingRewards: formatEther(rewards),
    stakingStartTime: Number(startTime),
    apy: Number(apy) / 100,
  };
}

export async function stakeTokens(
  provider: BrowserProvider,
  tokenAddress: string,
  amount: string
): Promise<string> {
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, SWC_TOKEN_ABI, signer);
  const tx = await contract.stake(parseEther(amount));
  await tx.wait();
  return tx.hash;
}

export async function unstakeTokens(
  provider: BrowserProvider,
  tokenAddress: string,
  amount: string
): Promise<string> {
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, SWC_TOKEN_ABI, signer);
  const tx = await contract.unstake(parseEther(amount));
  await tx.wait();
  return tx.hash;
}

export async function claimRewards(
  provider: BrowserProvider,
  tokenAddress: string
): Promise<string> {
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, SWC_TOKEN_ABI, signer);
  const tx = await contract.claimRewards();
  await tx.wait();
  return tx.hash;
}

export async function bridgeTokens(
  provider: BrowserProvider,
  tokenAddress: string,
  amount: string,
  targetChainId: number,
  recipientAddress: string
): Promise<string> {
  const signer = await provider.getSigner();
  const contract = new Contract(tokenAddress, SWC_TOKEN_ABI, signer);
  const tx = await contract.bridgeTo(
    parseEther(amount),
    targetChainId,
    recipientAddress
  );
  await tx.wait();
  return tx.hash;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}
