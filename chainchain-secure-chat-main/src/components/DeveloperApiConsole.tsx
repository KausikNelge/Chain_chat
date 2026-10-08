import React, { useState } from "react";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  Terminal,
  Key,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Shield,
  Code2,
  Cpu,
  Radio,
  FileCode,
  Zap,
} from "lucide-react";

export function DeveloperApiConsole() {
  const [apiKey, setApiKey] = useState("cc_live_9f8a7e32b84c104e76d9");
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedRpc, setCopiedRpc] = useState(false);
  const [apiRequests, setApiRequests] = useState(1842);
  const [isRotating, setIsRotating] = useState(false);

  const amoyRpc = "https://rpc-amoy.polygon.technology";
  const contractAddress = "0x87B3F73618485B8A88102B376288591B24850B39";

  const handleCopy = async (text: string, type: "key" | "rpc") => {
    sound.playCardTap();
    await navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
      toast({ title: "API Key Copied", description: "Bearer token copied to clipboard" });
    } else {
      setCopiedRpc(true);
      setTimeout(() => setCopiedRpc(false), 2000);
      toast({ title: "RPC URL Copied", description: "Polygon Amoy RPC endpoint copied" });
    }
  };

  const handleRotateKey = () => {
    setIsRotating(true);
    sound.playFreezeSound();
    setTimeout(() => {
      const newKey = `cc_live_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;
      setApiKey(newKey);
      setIsRotating(false);
      toast({
        title: "API Key Rotated",
        description: "Old key invalidated. Update your client SDK or webhook authorization header.",
      });
    }, 400);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            21 — Developer SDK & Integration
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            Developer / API Console
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#16845B]/15 text-[#16845B] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#16845B] animate-pulse" />
            API STATUS: ACTIVE
          </span>
        </div>
      </div>

      {/* API Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
            TOTAL REQUESTS (24H)
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#17131A] dark:text-white odometer-num block">
            {apiRequests.toLocaleString()}
          </span>
          <span className="text-[11px] text-[#16845B] font-semibold">99.98% Success Ratio</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
            RATE LIMIT ALLOCATION
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#17131A] dark:text-white odometer-num block">
            4,500 / hr
          </span>
          <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">Standard Developer Tier</span>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 shadow-sm space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
            CHAIN ENVIRONMENT
          </span>
          <span className="font-heading font-extrabold text-2xl text-[#E5007D] block">
            Amoy 80002
          </span>
          <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">Polygon Amoy Testnet</span>
        </div>
      </div>

      {/* API Keys & Secrets */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
          <div>
            <span className="font-heading font-bold text-lg text-[#17131A] dark:text-white block">
              Cryptographic API Credentials
            </span>
            <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
              Use this bearer key to authenticate programmatic transfers and listen to Webhooks.
            </span>
          </div>

          <button
            onClick={handleRotateKey}
            disabled={isRotating}
            className="chain-btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-[#E5007D]" : ""}`} />
            <span>{isRotating ? "Rotating..." : "Rotate Secret"}</span>
          </button>
        </div>

        {/* Key Display Field */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
            LIVE SECRET KEY
          </label>
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 font-mono text-xs">
            <span className="flex-1 truncate text-[#17131A] dark:text-white font-semibold">
              {apiKey}
            </span>
            <button
              onClick={() => handleCopy(apiKey, "key")}
              className="p-1.5 rounded-lg bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D] transition-colors cursor-pointer shrink-0"
              title="Copy API Key"
            >
              {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* RPC & Contract Endpoints */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
              JSON-RPC ENDPOINT
            </label>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 font-mono text-xs">
              <span className="flex-1 truncate text-[#17131A] dark:text-white">
                {amoyRpc}
              </span>
              <button
                onClick={() => handleCopy(amoyRpc, "rpc")}
                className="p-1.5 rounded-lg bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D] transition-colors cursor-pointer shrink-0"
                title="Copy RPC"
              >
                {copiedRpc ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
              SMART CONTRACT AUDIT TARGET
            </label>
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 font-mono text-xs">
              <span className="flex-1 truncate text-[#17131A] dark:text-white">
                {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
              </span>
              <a
                href={`https://amoy.polygonscan.com/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 hover:border-[#E5007D] transition-colors cursor-pointer shrink-0"
                title="View on Explorer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Code Sample */}
      <div className="bg-[#120F16] rounded-3xl border border-white/10 p-6 text-white space-y-3 font-mono text-xs overflow-x-auto shadow-xl">
        <div className="flex items-center justify-between text-white/50 text-[11px] pb-2 border-b border-white/10">
          <span className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#E5007D]" />
            cURL / EIP-712 Transfer Dispatch
          </span>
          <span>bash</span>
        </div>
        <pre className="text-white/80 leading-relaxed">
{`curl -X POST https://api.chainchat.tech/v1/payments \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "recipient": "0x73A4...92F1",
    "amount": "1.5",
    "currency": "POL",
    "network": "polygon_amoy"
  }'`}
        </pre>
      </div>
    </div>
  );
}
