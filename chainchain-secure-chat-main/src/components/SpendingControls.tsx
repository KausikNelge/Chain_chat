import React, { useState } from "react";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  PieChart,
  Target,
  AlertCircle,
  Sliders,
  CheckCircle2,
  TrendingDown,
  ShieldCheck,
  Zap,
} from "lucide-react";

export function SpendingControls() {
  const [dailyLimit, setDailyLimit] = useState(50000);
  const [perTxLimit, setPerTxLimit] = useState(20000);
  const [monthlyLimit, setMonthlyLimit] = useState(200000);
  const [currentSpent] = useState(74280);

  const percentage = Math.min(100, Math.round((currentSpent / monthlyLimit) * 100));

  // Circular Meter SVG calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const handleUpdate = () => {
    sound.playCardTap();
    toast({
      title: "Spending Limits Synced",
      description: "On-chain transaction velocity throttles updated successfully.",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            19 — Financial Governance
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            Spending Controls & Velocity Limits
          </h2>
        </div>

        <button
          onClick={handleUpdate}
          className="chain-btn-pink text-xs py-2.5 px-5 cursor-pointer shadow-md"
        >
          Save Limits
        </button>
      </div>

      {/* Main Grid: Circular Progress Ring (Left) + Sliders (Right) */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        {/* Circular Progress Ring */}
        <div className="md:col-span-5 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF]">
            MONTHLY SPEND PROGRESS
          </span>

          {/* SVG Circular Ring */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="72"
                cy="72"
                r={radius}
                className="stroke-gray-100 dark:stroke-white/10"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#E5007D"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading font-extrabold text-3xl text-[#17131A] dark:text-white odometer-num">
                {percentage}%
              </span>
              <span className="text-[10px] font-bold text-[#6F6874] dark:text-[#A8A1AF] uppercase">
                Utilized
              </span>
            </div>
          </div>

          <div>
            <div className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white font-mono">
              ₹{currentSpent.toLocaleString("en-IN")}{" "}
              <span className="text-sm font-normal text-[#6F6874] dark:text-[#A8A1AF]">
                / ₹{monthlyLimit.toLocaleString("en-IN")}
              </span>
            </div>
            <p className="text-xs text-[#16845B] font-semibold mt-1">
              ✓ 63% Monthly Allowance Preserved
            </p>
          </div>
        </div>

        {/* Sliders Configuration Panel */}
        <div className="md:col-span-7 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-5">
            {/* Daily Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17131A] dark:text-white uppercase tracking-wider">
                  DAILY LIMIT
                </span>
                <span className="font-heading font-extrabold text-sm text-[#E5007D] font-mono">
                  ₹{dailyLimit.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={200000}
                step={5000}
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                className="w-full accent-[#E5007D] cursor-pointer"
              />
              <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] block">
                Maximum aggregate outflow permitted per 24 rolling hours.
              </span>
            </div>

            {/* Per Transaction Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17131A] dark:text-white uppercase tracking-wider">
                  PER TRANSACTION LIMIT
                </span>
                <span className="font-heading font-extrabold text-sm text-[#E5007D] font-mono">
                  ₹{perTxLimit.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={perTxLimit}
                onChange={(e) => setPerTxLimit(Number(e.target.value))}
                className="w-full accent-[#E5007D] cursor-pointer"
              />
              <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] block">
                Single payments above this limit trigger biometric or secondary challenge.
              </span>
            </div>

            {/* Monthly Limit */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#17131A] dark:text-white uppercase tracking-wider">
                  MONTHLY CAP
                </span>
                <span className="font-heading font-extrabold text-sm text-[#E5007D] font-mono">
                  ₹{monthlyLimit.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={50000}
                max={1000000}
                step={25000}
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                className="w-full accent-[#E5007D] cursor-pointer"
              />
              <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] block">
                Calendar month total spend quota.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6F6874] dark:text-[#A8A1AF] pt-2 border-t border-[#E9E4EA] dark:border-white/10">
            <ShieldCheck className="w-4 h-4 text-[#16845B]" />
            <span>Enforced by cryptographic smart contract guardrails.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
