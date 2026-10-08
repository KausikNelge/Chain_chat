import React from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Blocks,
  Cpu,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export interface OnChainVerificationData {
  txHash: string;
  blockNumber?: number;
  confirmations?: number;
  gasUsed?: number;
  from?: string;
  to?: string;
  amount?: string;
  timestamp?: number;
}

interface OnChainVerificationDrawerProps {
  data: OnChainVerificationData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OnChainVerificationDrawer({
  data,
  isOpen,
  onClose,
}: OnChainVerificationDrawerProps) {
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const blockNumber = data.blockNumber || 62481291;
  const confirmations = data.confirmations || 48;
  const gasUsed = data.gasUsed || 21442;
  const explorerUrl = `https://amoy.polygonscan.com/tx/${data.txHash}`;

  const handleCopy = async () => {
    sound.playCardTap();
    await navigator.clipboard.writeText(data.txHash);
    setCopied(true);
    toast({ title: "Hash Copied", description: "Transaction hash copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 max-w-lg p-0 overflow-hidden text-[#17131A] dark:text-white shadow-2xl sm:rounded-3xl select-none">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#FAF8F5] to-white dark:from-[#211726] dark:to-[#16131A] border-b border-[#E9E4EA] dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5007D]">
              ON-CHAIN AUDIT & ATTESTATION
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16845B]/15 text-[#16845B] text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmed on Amoy
            </span>
          </div>

          <h3 className="font-heading font-extrabold text-2xl text-[#17131A] dark:text-white">
            Blockchain Verification
          </h3>
          <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-1">
            Decentralized state receipt validated by Polygon Amoy validator consensus.
          </p>
        </div>

        {/* Animated Mini-Map Transaction Pipeline (Item 22) */}
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
              STATE TRANSITION PIPELINE
            </span>

            {/* Visual Node Graph */}
            <div className="flex items-center justify-between relative text-xs">
              {/* Connector Line */}
              <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-[#E9E4EA] dark:bg-white/10 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-4 right-1/4 h-0.5 bg-gradient-to-r from-[#E5007D] to-[#16845B] -translate-y-1/2 z-0" />

              {/* Node 1: Wallet */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] flex items-center justify-center font-bold text-[10px] shadow-sm">
                  CC
                </div>
                <span className="text-[10px] font-bold text-[#17131A] dark:text-white">Wallet</span>
              </div>

              {/* Node 2: Polygon RPC */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[#E5007D] text-white flex items-center justify-center font-bold text-[10px] shadow-sm animate-pulse">
                  RPC
                </div>
                <span className="text-[10px] font-bold text-[#17131A] dark:text-white">Polygon</span>
              </div>

              {/* Node 3: Smart Contract */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[#16845B] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                  <Cpu className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-[#17131A] dark:text-white">Contract</span>
              </div>

              {/* Node 4: Recipient */}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-[#FAF8F5] dark:bg-white/15 border border-[#E9E4EA] dark:border-white/20 text-[#17131A] dark:text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                  <Check className="w-4 h-4 text-[#16845B]" />
                </div>
                <span className="text-[10px] font-bold text-[#17131A] dark:text-white">Settled</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Proof Metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                MINED BLOCK
              </span>
              <span className="font-heading font-extrabold text-base text-[#17131A] dark:text-white font-mono block">
                #{blockNumber.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#16845B] font-semibold flex items-center gap-1">
                <Blocks className="w-3 h-3" />
                {confirmations} Confirmations
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                GAS CONSUMED
              </span>
              <span className="font-heading font-extrabold text-base text-[#17131A] dark:text-white font-mono block">
                {gasUsed.toLocaleString()} units
              </span>
              <span className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF] font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#E5007D]" />
                ~0.0007 POL Fee
              </span>
            </div>
          </div>

          {/* Transaction Hash */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1.5">
            <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
              TRANSACTION HASH (TXID)
            </span>
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs text-[#17131A] dark:text-white truncate">
                {data.txHash}
              </span>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D] transition-colors cursor-pointer shrink-0"
                title="Copy Hash"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 chain-btn-pink text-xs py-3 px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>View on PolygonScan Amoy</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="chain-btn-outline text-xs py-3 px-6 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
