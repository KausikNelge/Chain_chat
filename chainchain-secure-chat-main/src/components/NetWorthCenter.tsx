import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { sound } from "@/lib/audio";
import {
  TrendingUp,
  ArrowUpRight,
  PieChart as PieIcon,
  ShieldCheck,
  Calendar,
  Lock,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export type CurrencyMode = "INR" | "USD" | "POL";

export function NetWorthCenter() {
  const { account, balance } = useWallet();
  const [currency, setCurrency] = useState<CurrencyMode>("INR");
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "1y">("30d");

  const rawBalance = parseFloat(balance || "0");

  // Conversion Rates (1 POL ≈ ₹42.50 INR ≈ $0.51 USD)
  const polToInr = 42.5;
  const polToUsd = 0.51;

  // Portfolio Segments
  const availablePol = rawBalance > 0 ? rawBalance : 12.84;
  const stakedPol = rawBalance > 0 ? rawBalance * 0.85 : 10.91;
  const pendingPol = rawBalance > 0 ? rawBalance * 0.15 : 1.92;
  const totalPol = availablePol + stakedPol + pendingPol;

  const formatValue = (polAmount: number) => {
    switch (currency) {
      case "INR":
        return `₹${Math.round(polAmount * polToInr).toLocaleString("en-IN")}`;
      case "USD":
        return `$${(polAmount * polToUsd).toFixed(2)}`;
      case "POL":
      default:
        return `${polAmount.toFixed(3)} POL`;
    }
  };

  const dayChangeInr = "+₹8,420";
  const dayChangeUsd = "+$101.40";
  const dayChangePol = "+2.45 POL";
  const dayPercent = "+4.79%";

  const dayChangeDisplay =
    currency === "INR" ? dayChangeInr : currency === "USD" ? dayChangeUsd : dayChangePol;

  // Chart data simulation points based on selected range
  const chartPoints =
    timeRange === "7d"
      ? [18, 22, 20, 26, 24, 29, 32]
      : timeRange === "30d"
      ? [14, 16, 15, 19, 21, 20, 24, 27, 26, 30, 29, 33]
      : [8, 11, 14, 18, 20, 25, 27, 31, 30, 34];

  // SVG Area Chart Path Calculation
  const width = 600;
  const height = 180;
  const max = Math.max(...chartPoints);
  const min = Math.min(...chartPoints) * 0.8;

  const points = chartPoints.map((pt, i) => {
    const x = (i / (chartPoints.length - 1)) * width;
    const y = height - ((pt - min) / (max - min)) * (height - 30) - 15;
    return `${x},${y}`;
  });

  const areaPath = `M 0,${height} L ${points.join(" L ")} L ${width},${height} Z`;
  const linePath = `M ${points.join(" L ")}`;

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none">
      {/* Header Statement */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            07 — Capital Intelligence
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            Net Worth Command Center
          </h2>
        </div>

        {/* Currency Switcher Chips */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-white/5 p-1 rounded-full border border-[#E9E4EA] dark:border-white/10 text-xs font-bold">
          {(["INR", "USD", "POL"] as CurrencyMode[]).map((c) => (
            <button
              key={c}
              onClick={() => {
                sound.playCardTap();
                setCurrency(c);
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                currency === c
                  ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] shadow-sm"
                  : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white"
              }`}
            >
              {c === "INR" ? "₹ INR" : c === "USD" ? "$ USD" : "POL"}
            </button>
          ))}
        </div>
      </div>

      {/* Main Net Worth Banner & Key Subtotals */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 sm:p-9 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block mb-1.5">
              TOTAL PORTFOLIO NET WORTH
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-heading font-extrabold text-4xl sm:text-6xl text-[#17131A] dark:text-white tracking-tight odometer-num">
                {formatValue(totalPol)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2 font-number">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#16845B]">
                <TrendingUp className="w-3.5 h-3.5" />
                {dayChangeDisplay} ({dayPercent}) today
              </span>
              <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                · vs previous month (+18.4%)
              </span>
            </div>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-white/5 p-1 rounded-full border border-[#E9E4EA] dark:border-white/10 text-xs font-bold">
            {(["7d", "30d", "1y"] as const).map((r) => (
              <button
                key={r}
                onClick={() => {
                  sound.playCardTap();
                  setTimeRange(r);
                }}
                className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                  timeRange === r
                    ? "bg-[#E5007D] text-white shadow-sm"
                    : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Pillars: Available, Staked, Pending */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#E9E4EA] dark:border-white/10">
          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
              AVAILABLE LIQUID
            </span>
            <span className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white odometer-num block">
              {formatValue(availablePol)}
            </span>
            <span className="text-[11px] text-[#16845B] font-semibold">Immediate Transfer Ready</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF]">
                STAKED / LOCKED
              </span>
              <Lock className="w-3.5 h-3.5 text-[#E5007D]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white odometer-num block">
              {formatValue(stakedPol)}
            </span>
            <span className="text-[11px] text-[#E5007D] font-semibold">Earning ~5.4% Amoy APY</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF]">
                PENDING SETTLEMENT
              </span>
              <Clock className="w-3.5 h-3.5 text-[#A46600]" />
            </div>
            <span className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white odometer-num block">
              {formatValue(pendingPol)}
            </span>
            <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">Mined in Next Block</span>
          </div>
        </div>

        {/* Interactive SVG Area Chart */}
        <div className="pt-2">
          <div className="flex items-center justify-between text-xs text-[#6F6874] dark:text-[#A8A1AF] mb-2">
            <span className="font-bold uppercase tracking-wider">Treasury Valuation Trend</span>
            <span className="font-mono text-[11px]">Polygon Amoy Chain ID 80002</span>
          </div>
          <div className="w-full h-44 rounded-2xl bg-[#FAF8F5]/50 dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 p-2 overflow-hidden relative">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-full preserve-3d overflow-visible"
            >
              <defs>
                <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E5007D" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#E5007D" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#netWorthGrad)" />
              <path d={linePath} fill="none" stroke="#E5007D" strokeWidth="3" strokeLinecap="round" />
              {points.map((pt, idx) => {
                const [cx, cy] = pt.split(",");
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="#17131A"
                    stroke="#E5007D"
                    strokeWidth="2.5"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Asset Allocation Donut / Breakdown */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-4">
        <span className="font-heading font-bold text-lg text-[#17131A] dark:text-white block">
          Asset Allocation Portfolio
        </span>

        {/* Visual Multi-Segment Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200 dark:bg-white/10">
          <div style={{ width: "50%" }} className="bg-[#E5007D]" title="POL Native 50%" />
          <div style={{ width: "35%" }} className="bg-[#17131A] dark:bg-white" title="Staked POL 35%" />
          <div style={{ width: "15%" }} className="bg-[#16845B]" title="Liquidity Pool 15%" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#E5007D]" />
            <div>
              <span className="font-bold text-[#17131A] dark:text-white block">POL Native Treasury</span>
              <span className="text-[#6F6874] dark:text-[#A8A1AF]">50% · Liquid Gas & Debit</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#17131A] dark:bg-white" />
            <div>
              <span className="font-bold text-[#17131A] dark:text-white block">Validator Staked POL</span>
              <span className="text-[#6F6874] dark:text-[#A8A1AF]">35% · Yield Compounding</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#16845B]" />
            <div>
              <span className="font-bold text-[#17131A] dark:text-white block">Fintech AMM Liquidity</span>
              <span className="text-[#6F6874] dark:text-[#A8A1AF]">15% · P2P Settlement Buffer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
