import React, { useState } from "react";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  Sparkles,
  Send,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Zap,
} from "lucide-react";

interface AiBankingAssistantProps {
  onExecuteSend?: (recipient: string, amount: string) => void;
  onOpenExplorer?: () => void;
}

interface BankingInsight {
  query: string;
  type: "spending" | "action" | "debug" | "education";
  title: string;
  metric?: string;
  description: string;
  actionLabel?: string;
  actionPayload?: { recipient?: string; amount?: string };
}

export function AiBankingAssistant({
  onExecuteSend,
  onOpenExplorer,
}: AiBankingAssistantProps) {
  const [input, setInput] = useState("");
  const [activeInsight, setActiveInsight] = useState<BankingInsight>({
    query: "How much did I spend this month?",
    type: "spending",
    title: "Monthly Outflow Analysis",
    metric: "₹74,280 (37% of Cap)",
    description:
      "You have executed 14 peer-to-peer transfers and 6 contactless NFC taps this calendar month. Your highest spending category is P2P Transfers (₹52,100).",
    actionLabel: "View Passbook Activity",
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleQueries = [
    "How much did I spend this month?",
    "Send ₹500 to Rahul",
    "Why did this transaction fail?",
    "Show my largest payment this month",
    "Explain gas fees on Polygon Amoy",
  ];

  const handleQuery = (q: string) => {
    sound.playCardTap();
    setInput(q);
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);

      if (q.toLowerCase().includes("spend") || q.toLowerCase().includes("how much")) {
        setActiveInsight({
          query: q,
          type: "spending",
          title: "Monthly Outflow Intelligence",
          metric: "₹74,280 (37% of Monthly Limit)",
          description:
            "Your total burn this month across 18 on-chain transactions is ₹74,280. You remain 63% below your self-imposed monthly ceiling of ₹2,00,000.",
          actionLabel: "Adjust Spending Limits",
        });
      } else if (q.toLowerCase().includes("rahul") || q.toLowerCase().includes("send")) {
        setActiveInsight({
          query: q,
          type: "action",
          title: "Payment Intent Parsed",
          metric: "11.76 POL (≈ ₹500 INR)",
          description:
            "Recipient identified as Rahul (0x73A4...92F1). Gas estimate: ~0.0004 POL. Ready to populate payment confirmation slider.",
          actionLabel: "Confirm & Launch Payment",
          actionPayload: { recipient: "0x73A4f31c2D9C5874288B11239561b3690B8292F1", amount: "11.76" },
        });
      } else if (q.toLowerCase().includes("fail") || q.toLowerCase().includes("why")) {
        setActiveInsight({
          query: q,
          type: "debug",
          title: "Transaction Diagnostic Audit",
          metric: "Err: Code 4001 / Rejected",
          description:
            "The previous attempt failed because the MetaMask signature request was cancelled by the user. Polygon Amoy mempool was not charged any gas.",
          actionLabel: "Retry Transaction",
        });
      } else if (q.toLowerCase().includes("largest")) {
        setActiveInsight({
          query: q,
          type: "spending",
          title: "Largest Outflow Record",
          metric: "₹35,000 (08 Oct, 11:42 AM)",
          description:
            "Sent to Treasury Vault (0x4981...19F2). Transaction was confirmed in 2.1s with 0.0006 POL gas fee on Polygon Amoy.",
          actionLabel: "Inspect on AmoyScan",
        });
      } else {
        setActiveInsight({
          query: q,
          type: "education",
          title: "Polygon Amoy Gas Protocol",
          metric: "31 Gwei (Avg ~$0.0002)",
          description:
            "Polygon Amoy is a Proof-of-Stake testnet with 2.1s block times. EIP-1559 dynamic base fees ensure zero transaction front-running.",
          actionLabel: "View Live Network Health",
        });
      }
    }, 350);
  };

  const handleActionClick = () => {
    sound.playCardTap();
    if (activeInsight.actionPayload && onExecuteSend) {
      onExecuteSend(
        activeInsight.actionPayload.recipient || "",
        activeInsight.actionPayload.amount || "0.1"
      );
      toast({ title: "Payment Dispatched", description: "Prefilled payment modal opened." });
    } else if (onOpenExplorer) {
      onOpenExplorer();
    } else {
      toast({ title: "Insight Action Triggered", description: activeInsight.actionLabel });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            23 — Contextual Ledger AI
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            AI Banking Assistant
          </h2>
        </div>
        <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
          Powered by On-Chain Semantic Telemetry
        </span>
      </div>

      {/* AI Command Input Bar */}
      <div className="p-2.5 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 shadow-lg flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              handleQuery(input.trim());
            }
          }}
          placeholder="Ask anything: “How much did I spend this month?”, “Send ₹500 to Rahul”..."
          className="flex-1 bg-transparent border-none outline-none text-sm text-[#17131A] dark:text-white placeholder-[#6F6874] dark:placeholder-[#A8A1AF] font-medium"
        />
        <button
          onClick={() => {
            if (input.trim()) handleQuery(input.trim());
          }}
          className="chain-btn-pink text-xs py-2.5 px-5 flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
        >
          <span>Ask AI</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] shrink-0">
          SUGGESTED:
        </span>
        {sampleQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleQuery(q)}
            className="px-3.5 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 text-[#17131A] dark:text-white font-medium transition-colors cursor-pointer shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Structured Banking Response Card (NOT a plain chat bubble) */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E4EA] dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E5007D]">
              QUERY PARSED:
            </span>
            <span className="text-xs font-semibold text-[#17131A] dark:text-white italic">
              “{activeInsight.query}”
            </span>
          </div>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16845B]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Ledger Record
          </span>
        </div>

        <div>
          <span className="font-heading font-extrabold text-xl sm:text-2xl text-[#17131A] dark:text-white block">
            {activeInsight.title}
          </span>
          {activeInsight.metric && (
            <span className="font-heading font-extrabold text-3xl text-[#E5007D] font-mono mt-1 block">
              {activeInsight.metric}
            </span>
          )}
          <p className="text-sm text-[#6F6874] dark:text-[#A8A1AF] mt-2 leading-relaxed">
            {activeInsight.description}
          </p>
        </div>

        {activeInsight.actionLabel && (
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleActionClick}
              className="chain-btn-pink text-xs py-3 px-6 flex items-center gap-2 cursor-pointer shadow-md"
            >
              <span>{activeInsight.actionLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
