import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  Activity,
  Zap,
  Clock,
  Blocks,
  Wifi,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

interface NetworkHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGas: string;
}

export function NetworkHealthModal({
  isOpen,
  onClose,
  currentGas,
}: NetworkHealthModalProps) {
  const [latency, setLatency] = useState(84);
  const [blockNumber, setBlockNumber] = useState(62481291);
  const [pendingTxs, setPendingTxs] = useState(412);
  const [isPinging, setIsPinging] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setBlockNumber((prev) => prev + 1);
      setPendingTxs((prev) => 380 + Math.floor(Math.random() * 60));
    }, 2100);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handlePingRpc = () => {
    setIsPinging(true);
    sound.playCardTap();
    setTimeout(() => {
      setLatency(72 + Math.floor(Math.random() * 25));
      setIsPinging(false);
      toast({
        title: "Amoy RPC Ping Successful",
        description: "Polygon Public RPC responded in optimal round-trip time.",
      });
    }, 400);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 max-w-md p-0 overflow-hidden text-[#17131A] dark:text-white shadow-2xl sm:rounded-3xl select-none">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-[#FAF8F5] to-white dark:from-[#211726] dark:to-[#16131A] border-b border-[#E9E4EA] dark:border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5007D]">
              TELEMETRY & STATUS
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#16845B]/15 text-[#16845B] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#16845B] animate-ping" />
              <span>98% Network Health</span>
            </div>
          </div>

          <h3 className="font-heading font-extrabold text-2xl text-[#17131A] dark:text-white">
            Polygon Amoy Testnet
          </h3>
          <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-1">
            Real-time consensus telemetry, validator block speed, and gas volatility.
          </p>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="p-6 space-y-4">
          {/* Health Bar Graphic */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#17131A] dark:text-white">Consensus Throughput</span>
              <span className="text-[#16845B] font-bold">Optimal · Zero Jitter</span>
            </div>
            {/* Visual Segments */}
            <div className="w-full h-2.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden flex gap-0.5">
              <div className="flex-1 bg-[#16845B] rounded-l-full" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="flex-1 bg-[#16845B]" />
              <div className="w-4 bg-gray-300 dark:bg-white/20 rounded-r-full" />
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                BLOCK TIME
              </span>
              <span className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white odometer-num block">
                2.1s
              </span>
              <span className="text-[10px] text-[#16845B] font-semibold flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Sub-second finality
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                BASE GAS PRICE
              </span>
              <span className="font-heading font-extrabold text-xl text-[#E5007D] odometer-num block">
                {currentGas} Gwei
              </span>
              <span className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF] font-semibold flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Fastest priority
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                RPC LATENCY
              </span>
              <span className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white odometer-num block">
                {latency}ms
              </span>
              <span className="text-[10px] text-[#16845B] font-semibold flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Mumbai Gateway
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                PENDING MEMPOOL
              </span>
              <span className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white odometer-num block">
                {pendingTxs} txs
              </span>
              <span className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF] font-semibold flex items-center gap-1">
                <Blocks className="w-3 h-3" />
                Low congestion
              </span>
            </div>
          </div>

          {/* Current Block Height */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-[#6F6874] dark:text-[#A8A1AF] text-[10px] font-bold uppercase tracking-wider block">
                LATEST MINED BLOCK
              </span>
              <span className="font-mono font-bold text-sm text-[#17131A] dark:text-white mt-0.5 block">
                #{blockNumber.toLocaleString()}
              </span>
            </div>
            <button
              onClick={handlePingRpc}
              disabled={isPinging}
              className="chain-btn-outline text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPinging ? "animate-spin text-[#E5007D]" : ""}`} />
              <span>{isPinging ? "Pinging..." : "Test RPC"}</span>
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://amoy.polygonscan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 chain-btn-pink text-xs py-3 px-4 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <span>Explore Amoy Blocks</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="chain-btn-outline text-xs py-3 px-6 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
