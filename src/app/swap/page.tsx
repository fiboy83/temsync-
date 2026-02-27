'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { TopNav } from '@/components/TopNav';
import { BottomNav } from '@/components/BottomNav';
import { useWallet } from '@/lib/wallet-context';
import {
  TOKENS,
  ERC20_ABI,
  FAROSWAP_ROUTER,
  FAROSWAP_ABI,
  PHAROS_ATLANTIC_TESTNET,
  Token,
} from '@/lib/pharos-config';
import { ethers } from 'ethers';
import { cn } from '@/lib/utils';
import {
  ArrowDownUp,
  Loader2,
  Wallet,
  ChevronDown,
  Search,
  ExternalLink,
  Check,
  AlertTriangle,
  X,
  Zap,
  RefreshCw,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import type { UserProfile } from '@/app/page';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const SLIPPAGE_DEFAULT = 0.5; // 0.5%
const DEADLINE_MINUTES = 20;
const WPHRS_TOKEN = TOKENS.find((t) => t.symbol === 'WPHRS')!;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatBalance(raw: bigint, decimals: number, maxDecimals = 6): string {
  const formatted = ethers.formatUnits(raw, decimals);
  const num = parseFloat(formatted);
  if (num === 0) return '0';
  if (num < 0.000001) return '<0.000001';
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxDecimals,
  });
}

function shortenAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function explorerTxUrl(hash: string): string {
  return `${PHAROS_ATLANTIC_TESTNET.explorerUrl}/tx/${hash}`;
}

// ---------------------------------------------------------------------------
// Token Selector Button
// ---------------------------------------------------------------------------
function TokenSelectorButton({
  token,
  onClick,
  hueColor,
}: {
  token: Token;
  onClick: () => void;
  hueColor: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl',
        'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
        'transition-all duration-200 active-scale shrink-0 group'
      )}
    >
      <span className="text-lg leading-none">{token.logo}</span>
      <span className="font-headline font-bold text-sm text-white/90 uppercase tracking-wide">
        {token.symbol}
      </span>
      <ChevronDown
        className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60 transition-colors"
      />
    </button>
  );
}

// ---------------------------------------------------------------------------
// Token Selector Modal
// ---------------------------------------------------------------------------
function TokenSelectorModal({
  open,
  onOpenChange,
  tokens,
  selectedToken,
  disabledToken,
  onSelect,
  hueColor,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tokens: Token[];
  selectedToken: Token;
  disabledToken: Token;
  onSelect: (t: Token) => void;
  hueColor: string;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearchQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filtered = tokens.filter(
    (t) =>
      t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass holographic-glow rounded-2xl border-white/10 max-w-sm mx-auto p-0 overflow-hidden">
        <DialogHeader className="px-5 pt-5 pb-0">
          <DialogTitle className="font-headline text-base font-bold lowercase tracking-wider text-white/90">
            select token
          </DialogTitle>
          <DialogDescription className="text-[10px] text-white/30 lowercase tracking-widest">
            choose from available tokens
          </DialogDescription>
        </DialogHeader>

        {/* search */}
        <div className="px-5 pt-3">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
            <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search by name or symbol..."
              className="bg-transparent border-none outline-none text-xs w-full text-white placeholder:text-white/20 lowercase font-body"
            />
          </div>
        </div>

        <Separator className="bg-white/5 my-2" />

        {/* token list */}
        <div className="px-3 pb-4 max-h-72 overflow-y-auto custom-scrollbar space-y-0.5">
          {filtered.length === 0 && (
            <p className="text-center text-xs text-white/30 py-8 lowercase">
              no tokens found
            </p>
          )}
          {filtered.map((token) => {
            const isSelected = token.symbol === selectedToken.symbol;
            const isDisabled = token.symbol === disabledToken.symbol;

            return (
              <button
                key={token.symbol}
                disabled={isDisabled}
                onClick={() => {
                  onSelect(token);
                  onOpenChange(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150',
                  isDisabled
                    ? 'opacity-30 cursor-not-allowed'
                    : isSelected
                    ? 'bg-white/10 border border-white/10'
                    : 'hover:bg-white/5 active:scale-[0.98]'
                )}
              >
                <span className="text-2xl leading-none">{token.logo}</span>
                <div className="flex flex-col items-start text-left flex-1 min-w-0">
                  <span className="font-headline font-bold text-sm text-white/90 uppercase tracking-wide">
                    {token.symbol}
                  </span>
                  <span className="text-[10px] text-white/40 lowercase truncate w-full">
                    {token.name}
                  </span>
                </div>
                {isSelected && (
                  <Check className="w-4 h-4 shrink-0" style={{ color: hueColor }} />
                )}
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Success toast overlay
// ---------------------------------------------------------------------------
function SwapSuccessOverlay({
  txHash,
  onClose,
  hueColor,
}: {
  txHash: string;
  onClose: () => void;
  hueColor: string;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass holographic-glow rounded-2xl border border-white/10 p-6 max-w-xs w-full mx-4 text-center space-y-4">
        <div
          className="mx-auto w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${hueColor}33, ${hueColor}11)`,
            boxShadow: `0 0 30px -5px ${hueColor}44`,
          }}
        >
          <Check className="w-7 h-7" style={{ color: hueColor }} />
        </div>
        <div>
          <h3 className="font-headline font-bold text-white/90 lowercase tracking-wide text-sm">
            swap successful
          </h3>
          <p className="text-[10px] text-white/40 lowercase tracking-wider mt-1">
            transaction confirmed on pharos atlantic
          </p>
        </div>
        <a
          href={explorerTxUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold lowercase tracking-widest transition-all active-scale',
            'bg-white/5 border border-white/10 hover:bg-white/10 text-white/80'
          )}
        >
          view on explorer
          <ExternalLink className="w-3 h-3" />
        </a>
        <button
          onClick={onClose}
          className="text-[10px] text-white/30 lowercase tracking-widest hover:text-white/50 transition-colors"
        >
          dismiss
        </button>
      </div>
    </div>
  );
}

// ===========================================================================
// Main Swap Page Component
// ===========================================================================
export default function SwapPage() {
  const router = useRouter();
  const {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    switchToPharos,
  } = useWallet();

  // ---- User profile (matches home page pattern) ----
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'neontraveler',
    avatar: 'https://picsum.photos/seed/me/100/100',
    themeHue: 266,
  });
  const [navVisible, setNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  // ---- Swap state ----
  const [fromToken, setFromToken] = useState<Token>(TOKENS[0]); // PHRS
  const [toToken, setToToken] = useState<Token>(TOKENS[2]); // USDC
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromBalance, setFromBalance] = useState<bigint | null>(null);
  const [toBalance, setToBalance] = useState<bigint | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  const [slippage, setSlippage] = useState(SLIPPAGE_DEFAULT);

  // ---- Token selector modals ----
  const [fromSelectorOpen, setFromSelectorOpen] = useState(false);
  const [toSelectorOpen, setToSelectorOpen] = useState(false);

  // Debounce ref for quote fetching
  const quoteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- Theme ----
  const updateGlobalTheme = (hue: number) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', `${hue} 100% 64%`);
    root.style.setProperty('--secondary', `${(hue + 180) % 360} 100% 50%`);
    root.style.setProperty('--accent', `${hue} 100% 64%`);
    root.style.setProperty('--ring', `${hue} 100% 64%`);
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('temsync_user_profile');
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile);
      setUserProfile(parsed);
      updateGlobalTheme(parsed.themeHue);
    } else {
      updateGlobalTheme(userProfile.themeHue);
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setNavVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hueColor = `hsl(${userProfile.themeHue}, 100%, 64%)`;
  const isPharos = chainId === PHAROS_ATLANTIC_TESTNET.chainId;
  const isConnected = !!account;

  // ---------------------------------------------------------------------------
  // Fetch balances
  // ---------------------------------------------------------------------------
  const fetchBalance = useCallback(
    async (token: Token): Promise<bigint | null> => {
      if (!provider || !account) return null;
      try {
        if (token.address === 'native') {
          return await provider.getBalance(account);
        }
        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        return await contract.balanceOf(account);
      } catch {
        return null;
      }
    },
    [provider, account]
  );

  const refreshBalances = useCallback(async () => {
    const [fb, tb] = await Promise.all([
      fetchBalance(fromToken),
      fetchBalance(toToken),
    ]);
    setFromBalance(fb);
    setToBalance(tb);
  }, [fetchBalance, fromToken, toToken]);

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  // ---------------------------------------------------------------------------
  // Get swap path: for native PHRS we route through WPHRS
  // ---------------------------------------------------------------------------
  function getSwapPath(from: Token, to: Token): string[] {
    const fromAddr =
      from.address === 'native' ? WPHRS_TOKEN.address : from.address;
    const toAddr =
      to.address === 'native' ? WPHRS_TOKEN.address : to.address;
    return [fromAddr, toAddr];
  }

  // ---------------------------------------------------------------------------
  // Estimate output (getAmountsOut)
  // ---------------------------------------------------------------------------
  const fetchQuote = useCallback(
    async (amount: string, from: Token, to: Token) => {
      if (!provider || !amount || parseFloat(amount) <= 0) {
        setToAmount('');
        return;
      }
      setIsEstimating(true);
      setErrorMsg(null);
      try {
        const router = new ethers.Contract(FAROSWAP_ROUTER, FAROSWAP_ABI, provider);
        const amountIn = ethers.parseUnits(amount, from.decimals);
        const path = getSwapPath(from, to);
        const amounts: bigint[] = await router.getAmountsOut(amountIn, path);
        const amountOut = amounts[amounts.length - 1];
        setToAmount(ethers.formatUnits(amountOut, to.decimals));
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        if (errMsg.includes('INSUFFICIENT_LIQUIDITY') || errMsg.includes('revert')) {
          setErrorMsg('insufficient liquidity for this trade');
        }
        setToAmount('');
      } finally {
        setIsEstimating(false);
      }
    },
    [provider]
  );

  // Debounced quote
  useEffect(() => {
    if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      return;
    }
    quoteTimerRef.current = setTimeout(() => {
      fetchQuote(fromAmount, fromToken, toToken);
    }, 400);
    return () => {
      if (quoteTimerRef.current) clearTimeout(quoteTimerRef.current);
    };
  }, [fromAmount, fromToken, toToken, fetchQuote]);

  // ---------------------------------------------------------------------------
  // Check allowance for ERC20 tokens
  // ---------------------------------------------------------------------------
  const checkAllowance = useCallback(async () => {
    if (!provider || !account || fromToken.address === 'native') {
      setNeedsApproval(false);
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setNeedsApproval(false);
      return;
    }
    try {
      const contract = new ethers.Contract(fromToken.address, ERC20_ABI, provider);
      const allowance: bigint = await contract.allowance(account, FAROSWAP_ROUTER);
      const required = ethers.parseUnits(fromAmount, fromToken.decimals);
      setNeedsApproval(allowance < required);
    } catch {
      setNeedsApproval(false);
    }
  }, [provider, account, fromToken, fromAmount]);

  useEffect(() => {
    checkAllowance();
  }, [checkAllowance]);

  // ---------------------------------------------------------------------------
  // Approve ERC20
  // ---------------------------------------------------------------------------
  async function handleApprove() {
    if (!signer) return;
    setIsApproving(true);
    setErrorMsg(null);
    try {
      const contract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
      const tx = await contract.approve(FAROSWAP_ROUTER, ethers.MaxUint256);
      await tx.wait();
      setNeedsApproval(false);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('user rejected') || errMsg.includes('ACTION_REJECTED')) {
        setErrorMsg('transaction rejected by user');
      } else {
        setErrorMsg('approval failed — please try again');
      }
    } finally {
      setIsApproving(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Execute swap
  // ---------------------------------------------------------------------------
  async function handleSwap() {
    if (!signer || !account) return;
    setIsSwapping(true);
    setErrorMsg(null);
    try {
      const routerContract = new ethers.Contract(FAROSWAP_ROUTER, FAROSWAP_ABI, signer);
      const amountIn = ethers.parseUnits(fromAmount, fromToken.decimals);
      const path = getSwapPath(fromToken, toToken);
      const deadline = Math.floor(Date.now() / 1000) + DEADLINE_MINUTES * 60;

      // Minimum output with slippage
      const estimatedOut = ethers.parseUnits(toAmount || '0', toToken.decimals);
      const slippageBps = BigInt(Math.floor(slippage * 100));
      const amountOutMin = estimatedOut - (estimatedOut * slippageBps) / 10000n;

      // If fromToken is native PHRS, send value with the tx
      const txOverrides =
        fromToken.address === 'native' ? { value: amountIn } : {};

      const tx = await routerContract.mixSwap(
        path,
        amountIn,
        amountOutMin,
        account,
        deadline,
        txOverrides
      );
      await tx.wait();

      setSuccessTxHash(tx.hash);
      setFromAmount('');
      setToAmount('');
      refreshBalances();
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes('user rejected') || errMsg.includes('ACTION_REJECTED')) {
        setErrorMsg('transaction rejected by user');
      } else if (errMsg.includes('INSUFFICIENT_OUTPUT_AMOUNT')) {
        setErrorMsg('price moved beyond slippage tolerance');
      } else if (errMsg.includes('INSUFFICIENT_LIQUIDITY')) {
        setErrorMsg('insufficient liquidity for this trade');
      } else if (errMsg.includes('TRANSFER_FROM_FAILED')) {
        setErrorMsg('insufficient balance or allowance');
      } else {
        setErrorMsg('swap failed — please try again');
      }
    } finally {
      setIsSwapping(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Flip tokens
  // ---------------------------------------------------------------------------
  function handleFlip() {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setFromBalance(toBalance);
    setToBalance(fromBalance);
    setNeedsApproval(false);
    setErrorMsg(null);
  }

  // ---------------------------------------------------------------------------
  // Max button handler
  // ---------------------------------------------------------------------------
  function handleMax() {
    if (fromBalance === null) return;
    let maxAmount = fromBalance;
    // Leave a small amount for gas if native
    if (fromToken.address === 'native' && fromBalance > 0n) {
      const gasBuffer = ethers.parseUnits('0.01', 18);
      maxAmount = fromBalance > gasBuffer ? fromBalance - gasBuffer : 0n;
    }
    setFromAmount(ethers.formatUnits(maxAmount, fromToken.decimals));
  }

  // ---------------------------------------------------------------------------
  // Button state logic
  // ---------------------------------------------------------------------------
  function getActionButton(): {
    label: string;
    disabled: boolean;
    onClick: () => void;
    variant: 'connect' | 'switch' | 'approve' | 'swap' | 'error';
    loading?: boolean;
  } {
    if (!isConnected) {
      return {
        label: 'connect wallet',
        disabled: isConnecting,
        onClick: connectWallet,
        variant: 'connect',
        loading: isConnecting,
      };
    }
    if (!isPharos) {
      return {
        label: 'switch to pharos',
        disabled: false,
        onClick: switchToPharos,
        variant: 'switch',
      };
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      return {
        label: 'enter an amount',
        disabled: true,
        onClick: () => {},
        variant: 'swap',
      };
    }
    if (fromBalance !== null) {
      const inputBig = ethers.parseUnits(fromAmount || '0', fromToken.decimals);
      if (inputBig > fromBalance) {
        return {
          label: `insufficient ${fromToken.symbol} balance`,
          disabled: true,
          onClick: () => {},
          variant: 'error',
        };
      }
    }
    if (errorMsg && errorMsg.includes('insufficient liquidity')) {
      return {
        label: 'insufficient liquidity',
        disabled: true,
        onClick: () => {},
        variant: 'error',
      };
    }
    if (needsApproval) {
      return {
        label: isApproving ? 'approving...' : `approve ${fromToken.symbol}`,
        disabled: isApproving,
        onClick: handleApprove,
        variant: 'approve',
        loading: isApproving,
      };
    }
    return {
      label: isSwapping ? 'swapping...' : 'swap',
      disabled: isSwapping || isEstimating || !toAmount,
      onClick: handleSwap,
      variant: 'swap',
      loading: isSwapping,
    };
  }

  const action = getActionButton();

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  return (
    <main className="min-h-screen pt-20 pb-24 bg-background overflow-hidden relative">
      {/* Background aura effects */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[150px] pointer-events-none"
        style={{ backgroundColor: hueColor }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full opacity-[0.04] blur-[120px] pointer-events-none"
        style={{ backgroundColor: `hsl(${(userProfile.themeHue + 180) % 360}, 100%, 50%)` }}
      />

      <TopNav
        visible={navVisible}
        userProfile={userProfile}
        onProfileClick={() =>
          router.push(`/profile/${userProfile.username.toLowerCase()}`)
        }
      />

      <div className="max-w-md mx-auto px-4 w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-2xl font-headline font-bold holographic-text italic lowercase tracking-tight">
            swap
          </h1>
          <p className="text-[10px] text-white/30 lowercase tracking-[0.3em] font-bold mt-1.5">
            trade tokens on pharos atlantic
          </p>
        </div>

        {/* Swap Card */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
          <div
            className="glass rounded-2xl p-4 holographic-glow relative overflow-hidden"
          >
            {/* Subtle inner glow */}
            <div
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-[0.05] blur-[60px] pointer-events-none"
              style={{ backgroundColor: hueColor }}
            />

            {/* --- FROM Section --- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
                  from
                </span>
                {isConnected && fromBalance !== null && (
                  <button
                    onClick={handleMax}
                    className="text-[10px] text-white/40 hover:text-white/60 transition-colors lowercase tracking-wider flex items-center gap-1"
                  >
                    balance:{' '}
                    <span style={{ color: `${hueColor}cc` }}>
                      {formatBalance(fromBalance, fromToken.decimals, 4)}
                    </span>
                  </button>
                )}
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3 focus-within:border-white/15 transition-colors">
                <TokenSelectorButton
                  token={fromToken}
                  onClick={() => setFromSelectorOpen(true)}
                  hueColor={hueColor}
                />
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow only valid decimal input
                    if (val === '' || /^\d*\.?\d*$/.test(val)) {
                      setFromAmount(val);
                      setErrorMsg(null);
                    }
                  }}
                  className="bg-transparent border-none outline-none text-right text-xl font-headline font-bold text-white/90 w-full placeholder:text-white/15 min-w-0"
                />
              </div>
            </div>

            {/* --- Flip Button --- */}
            <div className="flex justify-center -my-1 relative z-10">
              <button
                onClick={handleFlip}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  'bg-white/[0.06] border border-white/10 hover:border-white/20',
                  'hover:bg-white/10 transition-all duration-200',
                  'active:scale-90 hover:rotate-180 transform-gpu'
                )}
                style={{
                  boxShadow: `0 0 15px -5px ${hueColor}22`,
                }}
              >
                <ArrowDownUp className="w-4 h-4 text-white/50" />
              </button>
            </div>

            {/* --- TO Section --- */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">
                  to
                </span>
                {isConnected && toBalance !== null && (
                  <span className="text-[10px] text-white/40 lowercase tracking-wider">
                    balance:{' '}
                    <span className="text-white/50">
                      {formatBalance(toBalance, toToken.decimals, 4)}
                    </span>
                  </span>
                )}
              </div>

              <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 flex items-center gap-3">
                <TokenSelectorButton
                  token={toToken}
                  onClick={() => setToSelectorOpen(true)}
                  hueColor={hueColor}
                />
                <div className="flex-1 text-right min-w-0">
                  {isEstimating ? (
                    <div className="flex items-center justify-end gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-white/30" />
                      <span className="text-sm text-white/20 font-headline">
                        estimating...
                      </span>
                    </div>
                  ) : (
                    <span
                      className={cn(
                        'text-xl font-headline font-bold block truncate',
                        toAmount ? 'text-white/80' : 'text-white/15'
                      )}
                    >
                      {toAmount
                        ? parseFloat(toAmount).toLocaleString('en-US', {
                            maximumFractionDigits: 6,
                          })
                        : '0.0'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* --- Price info --- */}
            {fromAmount &&
              toAmount &&
              parseFloat(fromAmount) > 0 &&
              parseFloat(toAmount) > 0 && (
                <div className="mt-3 px-1 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                    <Zap className="w-3 h-3" />
                    <span className="lowercase tracking-wider">
                      1 {fromToken.symbol} ={' '}
                      {(parseFloat(toAmount) / parseFloat(fromAmount)).toLocaleString(
                        'en-US',
                        { maximumFractionDigits: 6 }
                      )}{' '}
                      {toToken.symbol}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/20 lowercase tracking-wider">
                    slippage: {slippage}%
                  </span>
                </div>
              )}

            {/* --- Error message --- */}
            {errorMsg && (
              <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400/80 shrink-0" />
                <span className="text-[11px] text-red-400/80 lowercase tracking-wider">
                  {errorMsg}
                </span>
              </div>
            )}

            {/* --- Action Button --- */}
            <button
              disabled={action.disabled}
              onClick={action.onClick}
              className={cn(
                'w-full mt-4 py-3.5 rounded-xl font-headline font-bold text-sm lowercase tracking-widest',
                'transition-all duration-200 active-scale relative overflow-hidden',
                'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
                action.variant === 'connect' &&
                  'bg-white/10 border border-white/15 text-white/80 hover:bg-white/15',
                action.variant === 'switch' &&
                  'bg-amber-500/20 border border-amber-500/30 text-amber-300/90 hover:bg-amber-500/30',
                action.variant === 'approve' &&
                  'border text-white/90 hover:opacity-90',
                action.variant === 'swap' &&
                  'text-white border-0',
                action.variant === 'error' &&
                  'bg-red-500/10 border border-red-500/20 text-red-400/70'
              )}
              style={
                action.variant === 'swap' && !action.disabled
                  ? {
                      background: `linear-gradient(135deg, ${hueColor}, hsl(${(userProfile.themeHue + 40) % 360}, 100%, 50%))`,
                      boxShadow: `0 8px 30px -5px ${hueColor}55`,
                    }
                  : action.variant === 'approve'
                  ? {
                      borderColor: `${hueColor}55`,
                      background: `linear-gradient(135deg, ${hueColor}22, ${hueColor}11)`,
                    }
                  : action.variant === 'swap' && action.disabled
                  ? {
                      background: `linear-gradient(135deg, ${hueColor}33, ${hueColor}22)`,
                    }
                  : undefined
              }
            >
              {/* Animated gradient overlay on primary swap button */}
              {action.variant === 'swap' && !action.disabled && (
                <div
                  className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-300"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                    backgroundSize: '200% 100%',
                  }}
                />
              )}

              <span className="relative flex items-center justify-center gap-2">
                {action.loading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {action.variant === 'connect' && !action.loading && (
                  <Wallet className="w-4 h-4" />
                )}
                {action.label}
              </span>
            </button>
          </div>
        </div>

        {/* --- Settings row below card --- */}
        <div className="mt-4 flex items-center justify-between px-1 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex items-center gap-3">
            {[0.1, 0.5, 1.0].map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={cn(
                  'text-[10px] font-bold lowercase tracking-widest px-2.5 py-1 rounded-lg transition-all duration-150',
                  slippage === s
                    ? 'bg-white/10 border border-white/15 text-white/80'
                    : 'text-white/25 hover:text-white/40'
                )}
              >
                {s}%
              </button>
            ))}
          </div>
          {isConnected && (
            <button
              onClick={refreshBalances}
              className="p-1.5 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-all active:scale-90"
              title="Refresh balances"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* --- Connected wallet info --- */}
        {isConnected && (
          <div className="mt-3 text-center animate-in fade-in duration-500 delay-300">
            <div className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-xl px-3 py-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ backgroundColor: isPharos ? '#34d399' : '#fbbf24' }}
              />
              <span className="text-[10px] text-white/30 font-mono lowercase">
                {shortenAddress(account!)}
              </span>
              {isPharos && (
                <span className="text-[9px] text-emerald-400/60 lowercase tracking-widest">
                  pharos
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Token Selector Modals */}
      <TokenSelectorModal
        open={fromSelectorOpen}
        onOpenChange={setFromSelectorOpen}
        tokens={TOKENS}
        selectedToken={fromToken}
        disabledToken={toToken}
        onSelect={(t) => {
          setFromToken(t);
          setFromBalance(null);
          setErrorMsg(null);
        }}
        hueColor={hueColor}
      />
      <TokenSelectorModal
        open={toSelectorOpen}
        onOpenChange={setToSelectorOpen}
        tokens={TOKENS}
        selectedToken={toToken}
        disabledToken={fromToken}
        onSelect={(t) => {
          setToToken(t);
          setToBalance(null);
          setErrorMsg(null);
        }}
        hueColor={hueColor}
      />

      {/* Success overlay */}
      {successTxHash && (
        <SwapSuccessOverlay
          txHash={successTxHash}
          onClose={() => setSuccessTxHash(null)}
          hueColor={hueColor}
        />
      )}

      <BottomNav
        visible={navVisible}
        onPostClick={() => {}}
        userProfile={userProfile}
      />
    </main>
  );
}
