import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, ExternalLink, Copy, Share2, ChevronDown, ChevronUp, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export interface PaymentReceiptData {
  amount: string;
  recipient: string;
  txHash: string;
  timestamp: number;
  note?: string;
  method?: string;
  fee?: string;
}

interface PaymentConfirmationModalProps {
  receipt: PaymentReceiptData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PaymentConfirmationModal({
  receipt,
  isOpen,
  onClose,
}: PaymentConfirmationModalProps) {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  if (!receipt) return null;

  const copyToClipboard = async (text: string, type: "address" | "hash") => {
    await navigator.clipboard.writeText(text);
    if (type === "address") {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
      toast({ title: "Address Copied", description: "Recipient address copied to clipboard" });
    } else {
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
      toast({ title: "Hash Copied", description: "Transaction hash copied to clipboard" });
    }
  };

  const handleShare = async () => {
    const textToShare = `Payment Receipt — Chain Chat\nAmount: ${receipt.amount} POL\nTo: ${receipt.recipient}\nNetwork: Polygon Amoy (80002)\nTx: https://amoy.polygonscan.com/tx/${receipt.txHash}`;
    
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "Chain Chat Payment Receipt",
          text: textToShare,
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    await navigator.clipboard.writeText(textToShare);
    toast({ title: "Receipt Copied", description: "Formatted receipt summary copied to clipboard" });
  };

  const formattedDate = new Date(receipt.timestamp).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const fullDate = new Date(receipt.timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Derived avatar initials from recipient address
  const recipientInitials = receipt.recipient.slice(2, 4).toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-white border border-[#E9E4EA] max-w-md p-0 overflow-hidden text-[#17131A] shadow-xl sm:rounded-3xl">
        {/* Subtle Pink Wash Behind Success Mark */}
        <div className="pt-8 pb-5 px-6 text-center bg-gradient-to-b from-[#FDF2F8] to-white relative">
          {/* Subtle Success Checkmark */}
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FCE7F3] border border-[#E5007D]/20 flex items-center justify-center text-[#E5007D] mb-4">
            <Check className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h3 className="font-heading font-extrabold text-xl sm:text-2xl text-[#17131A] tracking-tight">
            Payment successful
          </h3>

          {/* Large Dominant Amount */}
          <div className="mt-3 flex items-baseline justify-center gap-1.5 font-number">
            <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#17131A] tracking-tight">
              {receipt.amount}
            </span>
            <span className="font-heading font-bold text-xl text-[#E5007D]">
              POL
            </span>
          </div>

          <p className="text-xs text-[#6F6874] mt-1 font-medium font-number">
            ≈ ${(parseFloat(receipt.amount || "0") * 0.42).toFixed(2)} USD
          </p>

          {/* Sent To Recipient */}
          <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E9E4EA]">
            <div className="w-5 h-5 rounded-full bg-[#E5007D]/10 text-[#E5007D] text-[10px] font-bold flex items-center justify-center">
              {recipientInitials}
            </div>
            <span className="text-xs text-[#17131A] font-medium">Sent to</span>
            <span className="text-xs font-mono text-[#6F6874]">
              {receipt.recipient.slice(0, 6)}...{receipt.recipient.slice(-4)}
            </span>
          </div>
        </div>

        {/* Clean Divider Separation */}
        <div className="h-[1px] bg-[#E9E4EA] mx-6" />

        {/* Financial Details Table */}
        <div className="px-6 py-4 space-y-3 text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-[#6F6874]">Status</span>
            <span className="inline-flex items-center gap-1.5 text-[#16845B] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
              Confirmed on-chain
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[#6F6874]">Network</span>
            <span className="text-[#17131A] font-semibold">Polygon Amoy (80002)</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[#6F6874]">Transaction ID</span>
            <div className="flex items-center gap-1.5 font-mono text-[#17131A]">
              <span>{receipt.txHash.slice(0, 8)}...{receipt.txHash.slice(-6)}</span>
              <button
                onClick={() => copyToClipboard(receipt.txHash, "hash")}
                className="p-1 rounded text-[#6F6874] hover:text-[#17131A] transition-colors cursor-pointer"
                title="Copy Transaction Hash"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[#6F6874]">Time</span>
            <span className="text-[#17131A] font-medium">{fullDate} at {formattedDate}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-[#6F6874]">Network fee</span>
            <span className="font-mono text-[#17131A] font-medium">
              {receipt.fee || "< 0.001 POL (~$0.0004)"}
            </span>
          </div>

          {receipt.note && (
            <div className="flex items-center justify-between py-1">
              <span className="text-[#6F6874]">Note</span>
              <span className="text-[#17131A] italic truncate max-w-[200px]">{receipt.note}</span>
            </div>
          )}

          {/* Collapsible Technical On-Chain Detail */}
          <div className="pt-2">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-[#6F6874] hover:text-[#17131A] py-1 cursor-pointer"
            >
              <span>On-chain details</span>
              {showTechnicalDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showTechnicalDetails && (
              <div className="mt-2 p-3 rounded-xl bg-[#FAF8F5] border border-[#E9E4EA] space-y-2 text-[11px] font-mono text-[#6F6874]">
                <div className="flex justify-between">
                  <span>Chain ID:</span>
                  <span className="text-[#17131A]">80002 (Amoy)</span>
                </div>
                <div className="flex justify-between">
                  <span>Settlement:</span>
                  <span className="text-[#17131A]">Native Transfer</span>
                </div>
                <div className="flex justify-between">
                  <span>Full Recipient:</span>
                  <span className="text-[#17131A] truncate max-w-[180px]">{receipt.recipient}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions Row: View on Explorer & Done */}
        <div className="p-6 pt-3 bg-[#FAF8F5] border-t border-[#E9E4EA] space-y-3">
          <div className="flex items-center gap-3">
            <a
              href={`https://amoy.polygonscan.com/tx/${receipt.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 chain-btn-outline text-xs py-3 text-center cursor-pointer"
            >
              <span>View on PolygonScan</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#6F6874]" />
            </a>

            <button
              onClick={onClose}
              className="flex-1 chain-btn-pink text-xs py-3 text-center cursor-pointer"
            >
              <span>Done</span>
            </button>
          </div>

          <button
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-[#6F6874] hover:text-[#E5007D] transition-colors py-1 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share receipt</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
