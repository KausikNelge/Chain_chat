import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@/context/WalletContext";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { PaymentConfirmationModal, PaymentReceiptData } from "@/components/PaymentConfirmationModal";
import {
  Loader2,
  Smartphone,
  ArrowRight,
  AlertCircle,
  Radio,
  Volume2,
  VolumeX,
  Tag,
  Send,
  Zap,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  ExternalLink
} from "lucide-react";

type FlowStep = "input" | "review" | "processing" | "error";

interface PaymentPayload {
  recipientAddress: string;
  amount: string;
  label?: string;
}

export function NfcPayment() {
  const { account, isCorrectNetwork, sendPol, balance, switchNetwork, connect } = useWallet();
  const [flowStep, setFlowStep] = useState<FlowStep>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHashInProgress, setTxHashInProgress] = useState<string | null>(null);

  // Form State
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.05");
  const [note, setNote] = useState("");

  // NFC Hardware State
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [nfcWriterOpen, setNfcWriterOpen] = useState(false);
  const [isWritingNfc, setIsWritingNfc] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Receipt Modal State
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize acoustic POS contactless payment chime
  const playPaymentChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc2.type = "sine";

      osc1.frequency.setValueAtTime(1320, now); // E6
      osc1.frequency.setValueAtTime(1760, now + 0.08); // A6
      osc2.frequency.setValueAtTime(660, now);
      osc2.frequency.setValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);

      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([40, 60, 60]);
      }
    } catch (e) {
      console.warn("Audio chime unavailable:", e);
    }
  }, [soundEnabled]);

  // Detect Hardware Web NFC API
  useEffect(() => {
    const hasNfc = typeof window !== "undefined" && "NDEFReader" in window;
    setNfcSupported(hasNfc);
  }, []);

  // Parse NFC NDEF payload from hardware reader
  const parseNfcPayload = (records: NDEFRecord[]): PaymentPayload | null => {
    for (const record of records) {
      if (record.recordType === "text" || record.recordType === "url") {
        const decoder = new TextDecoder();
        let text = "";

        if (record.recordType === "text" && record.data) {
          const data = new Uint8Array(record.data.buffer);
          const langCodeLength = data[0];
          text = decoder.decode(data.slice(1 + langCodeLength));
        } else if (record.recordType === "url" && record.data) {
          text = decoder.decode(record.data);
        }

        try {
          const parsed = JSON.parse(text);
          if (parsed.address && parsed.amount) {
            return {
              recipientAddress: parsed.address,
              amount: parsed.amount.toString(),
              label: parsed.label || "NFC Contactless Terminal",
            };
          }
        } catch {
          // Check for standard EIP-681 or raw 0x address
          const addrMatch = text.match(/0x[a-fA-F0-9]{40}/);
          if (addrMatch) {
            const amountMatch = text.match(/[?&]value=([0-9.]+)/);
            return {
              recipientAddress: addrMatch[0],
              amount: amountMatch ? amountMatch[1] : "0.05",
              label: "Scanned NFC Card",
            };
          }
        }
      }
    }
    return null;
  };

  // Hardware Web NFC scan trigger
  const handleStartNfcScan = async () => {
    if (!("NDEFReader" in window)) {
      toast({
        title: "Web NFC Unsupported",
        description: "Your browser does not support the Web NFC API. Use Chrome on Android with NFC enabled.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsScanningNfc(true);
      const ndef = new (window as unknown as { NDEFReader: new () => NDEFReaderInstance }).NDEFReader();
      await ndef.scan();

      toast({
        title: "Ready to Tap",
        description: "Hold your NFC card or terminal near the back of your device.",
      });

      ndef.addEventListener("reading", ({ message }: { message: NDEFMessage }) => {
        const payload = parseNfcPayload(message.records);
        if (payload) {
          playPaymentChime();
          setRecipient(payload.recipientAddress);
          setAmount(payload.amount);
          if (payload.label) setNote(payload.label);
          setIsScanningNfc(false);
          setFlowStep("review");
          toast({
            title: "NFC Tag Detected",
            description: `Payment request loaded: ${payload.amount} POL`,
          });
        } else {
          toast({
            title: "Unrecognized NFC Tag",
            description: "No compatible payment address found on this NFC tag.",
            variant: "destructive",
          });
        }
      });
    } catch (err: unknown) {
      setIsScanningNfc(false);
      const error = err as Error;
      toast({
        title: "NFC Scanner Error",
        description: error.message || "Failed to start NFC scan.",
        variant: "destructive",
      });
    }
  };

  // Write payment details to an NFC tag
  const handleWriteNfc = async () => {
    if (!("NDEFReader" in window)) {
      toast({
        title: "Web NFC Unavailable",
        description: "Web NFC is only available on compatible Android Chrome browsers.",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({ title: "Connect Wallet", description: "Connect your wallet first to write payment tags.", variant: "destructive" });
      return;
    }

    try {
      setIsWritingNfc(true);
      const ndef = new (window as unknown as { NDEFReader: new () => NDEFReaderInstance }).NDEFReader();
      const payloadString = JSON.stringify({
        address: account,
        amount: amount || "0.05",
        label: note || "Chain Chat Contactless",
      });

      await ndef.write({
        records: [{ recordType: "text", data: payloadString }],
      });

      playPaymentChime();
      setIsWritingNfc(false);
      toast({
        title: "NFC Tag Written Successfully",
        description: "This tag is now programmed to request payments to your address.",
      });
    } catch (err: unknown) {
      setIsWritingNfc(false);
      const error = err as Error;
      toast({
        title: "Write Failed",
        description: error.message || "Could not write to NFC tag.",
        variant: "destructive",
      });
    }
  };

  // Step 1: Proceed to Review
  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      connect();
      return;
    }
    if (!isCorrectNetwork) {
      switchNetwork();
      return;
    }
    if (!recipient.trim() || !recipient.startsWith("0x") || recipient.length !== 42) {
      toast({
        title: "Invalid Recipient",
        description: "Please enter a valid 42-character Polygon address starting with 0x.",
        variant: "destructive",
      });
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please specify a positive POL payment amount.",
        variant: "destructive",
      });
      return;
    }
    if (numAmount > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You have ${parseFloat(balance).toFixed(4)} POL. Add funds before proceeding.`,
        variant: "destructive",
      });
      return;
    }

    setFlowStep("review");
  };

  // Step 2 -> 3: Execute Real Transaction On-Chain
  const handleExecutePayment = async () => {
    setFlowStep("processing");
    setErrorMessage("");
    setTxHashInProgress(null);

    try {
      const tx = await sendPol(recipient, amount);
      if (tx && tx.hash) {
        setTxHashInProgress(tx.hash);
        playPaymentChime();

        // Create genuine receipt
        const newReceipt: PaymentReceiptData = {
          amount,
          recipient,
          txHash: tx.hash,
          timestamp: Date.now(),
          note: note.trim() || undefined,
          method: "Polygon Amoy Native Transfer",
          fee: "< 0.001 POL",
        };

        setReceipt(newReceipt);
        setShowReceiptModal(true);
        setFlowStep("input");
        setRecipient("");
        setNote("");
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMessage(error.message || "Transaction was rejected or failed on-chain.");
      setFlowStep("error");
    }
  };

  const quickAmounts = ["0.05", "0.1", "0.5", "1.0"];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Editorial Section Header */}
      <div className="pb-4 border-b border-[#E9E4EA] flex items-end justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E5007D] mb-1.5">
            <Send className="w-3.5 h-3.5" />
            <span>Instant Settlements</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] tracking-tight">
            Send money
          </h2>
          <p className="text-[#6F6874] text-xs sm:text-sm mt-1">
            Direct peer-to-peer transfers or contactless NFC tap on Polygon Amoy.
          </p>
        </div>

        {/* Audio feedback toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full border border-[#E9E4EA] text-[#6F6874] hover:text-[#17131A] transition-colors cursor-pointer"
          title={soundEnabled ? "Mute Chime" : "Enable Chime"}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E5007D]" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* FLOW STEP 1: INPUT FORM */}
      {flowStep === "input" && (
        <form onSubmit={handleProceedToReview} className="space-y-8 animate-in fade-in">
          {/* Dominant Amount Input Area */}
          <div className="text-center py-6 sm:py-8 bg-[#FAF8F5] rounded-3xl border border-[#E9E4EA] relative">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] block mb-2">
              Amount to Transfer
            </span>
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <input
                type="number"
                step="0.001"
                min="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="font-heading font-extrabold text-5xl sm:text-6xl text-[#17131A] text-center bg-transparent border-none focus:outline-none w-full font-number tracking-tight"
                required
              />
              <span className="font-heading font-bold text-2xl text-[#E5007D]">
                POL
              </span>
            </div>
            <p className="text-xs text-[#6F6874] mt-2 font-number font-medium">
              ≈ ${(parseFloat(amount || "0") * 0.42).toFixed(2)} USD
            </p>

            {/* Quick Amount Pills */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmount(amt)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    amount === amt
                      ? "bg-[#17131A] text-white"
                      : "bg-white border border-[#E9E4EA] text-[#17131A] hover:border-[#17131A]"
                  }`}
                >
                  {amt} POL
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#17131A]">
                Recipient Address
              </label>
              {account && (
                <span className="text-[11px] text-[#6F6874]">
                  Available: <strong className="text-[#17131A]">{parseFloat(balance).toFixed(3)} POL</strong>
                </span>
              )}
            </div>
            <Input
              type="text"
              placeholder="0x..."
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="font-mono text-sm h-12 bg-white border-[#E9E4EA] rounded-xl focus-visible:ring-[#E5007D]"
              required
            />
          </div>

          {/* Note Input (Optional) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#6F6874]">
              Note / Reference (Optional)
            </label>
            <Input
              type="text"
              placeholder="e.g. Dinner split, Coffee, Freelance invoice"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-sm h-11 bg-white border-[#E9E4EA] rounded-xl focus-visible:ring-[#E5007D]"
            />
          </div>

          {/* Web NFC Contactless Tap Option */}
          <div className="p-4 rounded-2xl bg-white border border-[#E9E4EA] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#E5007D]">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#17131A] block">
                  Hardware Web NFC Tap-to-Pay
                </span>
                <span className="text-[11px] text-[#6F6874] block">
                  {nfcSupported === false
                    ? "Requires Chrome on Android with NFC"
                    : "Hold physical card or phone to scan recipient"}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStartNfcScan}
              disabled={isScanningNfc}
              className="chain-btn-outline text-xs py-2 px-4 cursor-pointer"
            >
              {isScanningNfc ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E5007D]" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5 text-[#E5007D]" />
                  <span>Tap to Scan</span>
                </>
              )}
            </button>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            {!account ? (
              <button
                type="button"
                onClick={connect}
                className="w-full chain-btn-pink py-3.5 text-sm justify-center cursor-pointer"
              >
                Connect Wallet to Send
              </button>
            ) : !isCorrectNetwork ? (
              <button
                type="button"
                onClick={switchNetwork}
                className="w-full chain-btn-dark py-3.5 text-sm justify-center cursor-pointer"
              >
                Switch to Polygon Amoy Network
              </button>
            ) : (
              <button
                type="submit"
                className="w-full chain-btn-pink py-3.5 text-sm justify-center cursor-pointer"
              >
                <span>Continue to Review</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            )}
          </div>
        </form>
      )}

      {/* FLOW STEP 2: REVIEW PAYMENT */}
      {flowStep === "review" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="p-7 sm:p-9 bg-white border border-[#E9E4EA] rounded-3xl space-y-6 shadow-sm">
            <div className="text-center pb-6 border-b border-[#E9E4EA]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] block mb-1">
                Review Payment
              </span>
              <div className="flex items-baseline justify-center gap-1.5 font-number">
                <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#17131A]">
                  {amount}
                </span>
                <span className="font-heading font-bold text-xl text-[#E5007D]">
                  POL
                </span>
              </div>
              <p className="text-xs text-[#6F6874] mt-1 font-number">
                ≈ ${(parseFloat(amount || "0") * 0.42).toFixed(2)} USD
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[#6F6874]">To</span>
                <span className="font-mono text-[#17131A] font-semibold">
                  {recipient.slice(0, 8)}...{recipient.slice(-6)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#6F6874]">Network</span>
                <span className="text-[#17131A] font-medium">Polygon Amoy (80002)</span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-[#6F6874]">Estimated Gas Fee</span>
                <span className="font-mono text-[#17131A]">&lt; 0.001 POL</span>
              </div>

              {note && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-[#6F6874]">Note</span>
                  <span className="text-[#17131A] italic">{note}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-[#E9E4EA] font-semibold text-sm">
                <span className="text-[#17131A]">Total Debit</span>
                <span className="font-number text-[#17131A]">~{amount} POL</span>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setFlowStep("input")}
                className="flex-1 chain-btn-outline py-3 text-xs justify-center cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleExecutePayment}
                className="flex-1 chain-btn-pink py-3 text-xs justify-center cursor-pointer"
              >
                <span>Confirm Payment</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOW STEP 3: PROCESSING STATE */}
      {flowStep === "processing" && (
        <div className="p-12 text-center bg-white border border-[#E9E4EA] rounded-3xl space-y-4 animate-in fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FCE7F3] flex items-center justify-center text-[#E5007D] animate-pulse">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h3 className="font-heading font-extrabold text-2xl text-[#17131A]">
            Sending payment...
          </h3>
          <div className="font-number font-extrabold text-3xl text-[#17131A]">
            {amount} <span className="text-[#E5007D]">POL</span>
          </div>
          <p className="text-xs text-[#6F6874] max-w-sm mx-auto">
            Please approve the transaction in your wallet. Confirming on Polygon Amoy blockchain.
          </p>
          {txHashInProgress && (
            <p className="text-xs font-mono text-[#6F6874] pt-2">
              Broadcasted Tx: {txHashInProgress.slice(0, 10)}...{txHashInProgress.slice(-8)}
            </p>
          )}
        </div>
      )}

      {/* FLOW STEP 4: ERROR STATE */}
      {flowStep === "error" && (
        <div className="p-10 text-center bg-white border border-[#C62845]/20 rounded-3xl space-y-4 animate-in fade-in">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#C62845]/10 flex items-center justify-center text-[#C62845]">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-extrabold text-xl text-[#17131A]">
            Payment could not be completed
          </h3>
          <p className="text-xs text-[#6F6874] max-w-md mx-auto">
            {errorMessage || "The transaction was rejected or encountered a network error."}
          </p>
          <div className="pt-2">
            <button
              onClick={() => setFlowStep("input")}
              className="chain-btn-dark text-xs py-2.5 px-6 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}

      {/* Optional: NFC Tag Writer Dialog */}
      <div className="pt-4 text-center">
        <button
          onClick={() => setNfcWriterOpen(!nfcWriterOpen)}
          className="text-xs font-semibold text-[#6F6874] hover:text-[#E5007D] transition-colors cursor-pointer inline-flex items-center gap-1.5"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>{nfcWriterOpen ? "Hide NFC Tag Programmer" : "Program an NFC Payment Tag"}</span>
        </button>

        {nfcWriterOpen && (
          <div className="mt-4 p-5 rounded-2xl bg-[#FAF8F5] border border-[#E9E4EA] text-left space-y-3 animate-in fade-in">
            <span className="text-xs font-bold text-[#17131A] block">
              Write Receive Request to Tag
            </span>
            <p className="text-[11px] text-[#6F6874]">
              Encodes your wallet address and default amount into an NTAG213/215/216 physical card or sticker.
            </p>
            <button
              onClick={handleWriteNfc}
              disabled={isWritingNfc}
              className="chain-btn-pink text-xs py-2 px-4 cursor-pointer"
            >
              {isWritingNfc ? "Hold NFC tag to device..." : "Write to NFC Card"}
            </button>
          </div>
        )}
      </div>

      {/* Real Post-Payment Financial Confirmation Modal */}
      <PaymentConfirmationModal
        receipt={receipt}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
}
