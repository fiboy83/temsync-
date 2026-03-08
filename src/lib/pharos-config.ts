// Pharos Atlantic Testnet -- Chain & Token Configuration

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logo: string;
}

export const PHAROS_ATLANTIC_TESTNET = {
  chainId: 688689,
  chainIdHex: "0xa8231",
  name: "Pharos Atlantic Testnet",
  rpcUrl: "https://atlantic.dplabs-internal.com",
  explorerUrl: "https://atlantic.pharosscan.xyz",
  currency: { name: "PHRS", symbol: "PHRS", decimals: 18 },
} as const;

export const TOKENS: Token[] = [
  { symbol: "PHRS",  name: "Pharos",      address: "native",                                      decimals: 18, logo: "\u26a1" },
  { symbol: "WPHRS", name: "Wrapped PHRS", address: "0x838800b758277CC111B2d48Ab01e5E164f8E9471", decimals: 18, logo: "\u26a1" },
  { symbol: "USDC",  name: "USD Coin",     address: "0xE0BE08c77f415F577A1B3A9aD7a1Df1479564ec8", decimals: 6,  logo: "\ud83d\udfe2" },
  { symbol: "USDT",  name: "Tether USD",   address: "0xE7E84B8B4f39C507499c40B4ac199B050e2882d5", decimals: 6,  logo: "\ud83d\udfe2" },
  { symbol: "WBTC",  name: "Wrapped BTC",  address: "0x0c64F03EEa5c30946D5c55B4b532D08ad74638a4", decimals: 18, logo: "\ud83d\udfe0" },
  { symbol: "WETH",  name: "Wrapped ETH",  address: "0x7d211F77525ea39A0592794f793cC1036eEaccD5", decimals: 18, logo: "\ud83d\udd35" },
];

// FaroSwap Router = DODOFeeRouteProxy on Pharos
export const FAROSWAP_ROUTER = "0x3541423f25A1Ca5C98fdBCf478405d3f0aaD1164";

// DODO Route API for generating swap calldata & quotes
export const DODO_ROUTE_API = "https://api.dodoex.io/route-service/v2/widget/getdodoroute";
export const PHAROS_CHAIN_ID = 688689;

// Native token placeholder used by DODO API
export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

/** Minimal ERC-20 ABI (ethers v6 human-readable fragments) */
export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function transfer(address to, uint256 amount) returns (bool)",
] as const;

/**
 * NOTE: We no longer call mixSwap directly via ABI.
 * The DODO Route API returns pre-encoded calldata (`data` field)
 * which we send via `signer.sendTransaction({ to, data, value })`.
 *
 * The old incorrect ABI (5 params, Uniswap-style) has been removed.
 * The actual DODOFeeRouteProxy.mixSwap has 12 parameters -- the
 * Route API handles encoding them correctly.
 */
export const FAROSWAP_ABI = [] as const;

/** Route data shape returned by DODO Route API */
export interface DODORouteData {
  resAmount: string;           // estimated output amount (human-readable)
  to: string;                  // target contract to call
  data: string;                // encoded calldata
  targetApproveAddr: string;   // spender address for ERC20 approval
  estimatedGas?: string;       // optional gas estimate
}
