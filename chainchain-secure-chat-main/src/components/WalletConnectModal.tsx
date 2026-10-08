import React, { useState } from "react";
import { X, ExternalLink, Copy, Check, Smartphone, Monitor, Shield, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectInjected: () => Promise<void>;
  isConnecting: boolean;
}

export function WalletConnectModal({
  isOpen,
  onClose,
  onConnectInjected,
  isConnecting,
}: WalletConnectModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isMobile = typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);
  const hasInjected = typeof window !== "undefined" && !!window.ethereum;
  const currentUrl = typeof window !== "undefined" ? window.location.href : "https://chainchat.tech";
  const dappHost = typeof window !== "undefined" ? window.location.host : "chainchat.tech";

  // MetaMask Universal Deep Link (opens directly in MetaMask in-app browser)
  const metamaskDeepLink = `https://metamask.app.link/dapp/${dappHost}`;
  const coinbaseDeepLink = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(currentUrl)}`;
  const trustDeepLink = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast({
        title: "Link Copied!",
        description: "Open MetaMask on your phone, go to the Browser tab, and paste the URL.",
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast({ title: "Failed to copy", description: currentUrl });
    }
  };

  const handleDirectConnect = async () => {
    try {
      await onConnectInjected();
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E9E4EA] dark:border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E5007D] text-white flex items-center justify-center font-extrabold text-xs">
              CC
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-lg text-[#17131A] dark:text-white leading-tight">
                Connect Wallet
              </h3>
              <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                {isMobile ? "Mobile Web3 Gateway" : "Desktop Browser Gateway"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white hover:bg-[#F2EFF2] dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* If user is inside MetaMask or has extension */}
        {hasInjected && (
          <div className="space-y-3">
            <button
              onClick={handleDirectConnect}
              disabled={isConnecting}
              className="w-full chain-btn-pink py-3.5 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer font-bold shadow-md"
            >
              <span>{isConnecting ? "Connecting to Browser Wallet..." : "Connect Detected Wallet (MetaMask)"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-xs text-[#6F6874] dark:text-[#A8A1AF]">
              Detected Web3 provider in your current browser
            </p>
          </div>
        )}

        {/* Mobile Chrome Guidance & Deep Links */}
        {isMobile && !hasInjected && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FCE7F3]/50 dark:bg-[#E5007D]/10 border border-[#FCE7F3] dark:border-[#E5007D]/20 text-xs text-[#17131A] dark:text-[#F5F3F7] leading-relaxed">
              <span className="font-bold text-[#E5007D] block mb-1">📱 Mobile Chrome Notice</span>
              Mobile Chrome does not support extensions. Tap below to launch directly in your wallet app's Web3 browser:
            </div>

            {/* Option 1: 1-Tap Open in MetaMask App */}
            <a
              href={metamaskDeepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 px-5 rounded-2xl bg-[#E5007D] text-white flex items-center justify-between font-bold text-sm hover:bg-[#B80063] transition-all shadow-md group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">🦊</span>
                <div className="text-left">
                  <span className="block leading-none">Open in MetaMask App</span>
                  <span className="text-[10px] font-normal text-white/80 mt-0.5 block">1-tap auto connect</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* Option 2: Copy Link for Manual Paste */}
            <button
              onClick={handleCopyLink}
              className="w-full py-3 px-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 hover:border-[#D6D0D8] dark:hover:border-white/20 flex items-center justify-between text-xs font-semibold text-[#17131A] dark:text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Copy className="w-4 h-4 text-[#6F6874] dark:text-[#A8A1AF]" />
                <span>Copy URL for MetaMask In-App Browser</span>
              </div>
              {copied ? <Check className="w-4 h-4 text-[#16845B]" /> : <span className="text-[11px] text-[#E5007D]">Copy</span>}
            </button>

            {/* Other Mobile Wallets */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <a
                href={coinbaseDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[#E9E4EA] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-center text-xs font-medium text-[#17131A] dark:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🔵 Coinbase</span>
              </a>
              <a
                href={trustDeepLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-xl border border-[#E9E4EA] dark:border-white/10 hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-center text-xs font-medium text-[#17131A] dark:text-white transition-colors flex items-center justify-center gap-1.5"
              >
                <span>🛡️ Trust Wallet</span>
              </a>
            </div>

            {/* Quick 3-Step Instruction */}
            <div className="pt-2 border-t border-[#E9E4EA] dark:border-white/10 space-y-1.5 text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
              <p className="font-semibold text-[#17131A] dark:text-white">How to connect in 5 seconds:</p>
              <p>1. Tap <strong className="text-[#E5007D]">"Open in MetaMask App"</strong> above.</p>
              <p>2. Or open MetaMask → tap <strong>Browser</strong> icon at bottom → paste URL.</p>
            </div>
          </div>
        )}

        {/* Desktop Browser with no extension */}
        {!isMobile && !hasInjected && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-xs text-[#6F6874] dark:text-[#A8A1AF] space-y-1">
              <span className="font-bold text-[#17131A] dark:text-white block">No Web3 Extension Detected</span>
              To interact on Polygon Amoy, please install a browser extension:
            </div>

            <div className="space-y-2.5">
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D] flex items-center justify-between text-xs font-bold text-[#17131A] dark:text-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🦊</span>
                  <div className="text-left">
                    <span>Install MetaMask</span>
                    <span className="text-[10px] font-normal text-[#6F6874] dark:text-[#A8A1AF] block">Chrome, Brave, Edge & Firefox</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#6F6874] dark:text-[#A8A1AF] group-hover:text-[#E5007D]" />
              </a>

              <a
                href="https://www.coinbase.com/wallet"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-2xl border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D] flex items-center justify-between text-xs font-bold text-[#17131A] dark:text-white transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔵</span>
                  <div className="text-left">
                    <span>Install Coinbase Wallet</span>
                    <span className="text-[10px] font-normal text-[#6F6874] dark:text-[#A8A1AF] block">Chrome Extension</span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-[#6F6874] dark:text-[#A8A1AF] group-hover:text-[#E5007D]" />
              </a>
            </div>
          </div>
        )}

        {/* Security Footer */}
        <div className="pt-2 flex items-center justify-between text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
          <span className="flex items-center gap-1 font-medium">
            <Shield className="w-3.5 h-3.5 text-[#16845B]" />
            Self-Custodial & Verified
          </span>
          <span>Polygon Amoy (80002)</span>
        </div>
      </div>
    </div>
  );
}
