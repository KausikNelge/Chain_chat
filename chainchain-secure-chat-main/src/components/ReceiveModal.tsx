import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Copy, Check, Share2, Shield, ArrowDownLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: string | null;
}

export function ReceiveModal({ isOpen, onClose, account }: ReceiveModalProps) {
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState<string>("");

  if (!isOpen || !account) return null;

  // Generate payment link with optional amount parameter
  const paymentLink = amount && parseFloat(amount) > 0
    ? `https://chainchat.tech/pay?to=${account}&amount=${amount}`
    : `https://chainchat.tech/pay?to=${account}`;

  // EIP-681 standard QR code URI for crypto wallets
  const qrValue = amount && parseFloat(amount) > 0
    ? `ethereum:${account}@80002?value=${amount}e18`
    : `ethereum:${account}@80002`;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", description: account });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pay via Chain Chat",
          text: `Send POL to my Chain Chat address: ${account}`,
          url: paymentLink,
        });
      } catch {
        // User dismissed share dialog
      }
    } else {
      copyAddress();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 shadow-2xl p-6 sm:p-7 space-y-6 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E4EA] dark:border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-[#17131A] dark:text-white leading-tight">
                Receive POL
              </h3>
              <p className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                Polygon Amoy Testnet
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

        {/* Dynamic QR Code Display */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="p-4 rounded-3xl bg-white border border-[#E9E4EA] shadow-sm">
            <QRCodeSVG
              value={qrValue}
              size={180}
              level="H"
              includeMargin={false}
              fgColor="#17131A"
              imageSettings={{
                src: "/favicon.svg",
                x: undefined,
                y: undefined,
                height: 28,
                width: 28,
                excavate: true,
              }}
            />
          </div>
          <p className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] mt-3 font-medium">
            Scan with any Web3 mobile wallet
          </p>
        </div>

        {/* Optional Amount Specification */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[11px]">
            <span className="font-semibold text-[#17131A] dark:text-white">Request Specific Amount (Optional)</span>
            {amount && <span className="text-[#E5007D] font-mono">{amount} POL</span>}
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white font-mono"
            />
            <span className="absolute right-3.5 top-2 text-xs font-bold text-[#6F6874] dark:text-[#A8A1AF]">
              POL
            </span>
          </div>
        </div>

        {/* Address & Action Buttons */}
        <div className="space-y-2.5">
          <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
            <span className="font-mono text-xs text-[#17131A] dark:text-white font-medium truncate max-w-[200px]">
              {account}
            </span>
            <button
              onClick={copyAddress}
              className="p-1.5 rounded-lg text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              title="Copy Address"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={copyAddress}
              className="chain-btn-pink py-2.5 px-3 text-xs justify-center cursor-pointer font-bold"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy Address"}</span>
            </button>
            <button
              onClick={handleShare}
              className="chain-btn-outline py-2.5 px-3 text-xs justify-center cursor-pointer font-semibold"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>
          </div>
        </div>

        {/* Warning Badge */}
        <div className="flex items-center gap-2 pt-1 text-[10px] text-[#6F6874] dark:text-[#A8A1AF]">
          <Shield className="w-3.5 h-3.5 text-[#16845B] shrink-0" />
          <span>Only send Polygon Amoy testnet assets. Other networks will be lost.</span>
        </div>
      </div>
    </div>
  );
}
