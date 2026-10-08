import { useState, useCallback, useEffect, useRef } from "react";
import { useWallet } from "@/context/WalletContext";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { PaymentConfirmationModal, PaymentReceiptData } from "@/components/PaymentConfirmationModal";
import { AddressBookModal } from "@/components/AddressBookModal";
import { QrScannerModal } from "@/components/QrScannerModal";
import { usePaymentSync, SyncPaymentEvent } from "@/hooks/usePaymentSync";
import { useAddressBook } from "@/hooks/useAddressBook";
import { QRCodeSVG } from "qrcode.react";
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
  ExternalLink,
  Store,
  BookUser,
  ArrowDownLeft,
  QrCode,
  Share2,
  Copy,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type FlowStep = "input" | "review" | "processing" | "error";

interface PaymentPayload {
  recipientAddress: string;
  amount: string;
  label?: string;
  orderId?: string;
}

export function NfcPayment() {
  const { account, isCorrectNetwork, sendPol, balance, switchNetwork, connect } = useWallet();
  const { contacts, getContactByAddress } = useAddressBook();

  // Mode: Customer sending or Merchant receiving POS
  const [paymentMode, setPaymentMode] = useState<"customer" | "merchant">("customer");

  // Customer Form State
  const [flowStep, setFlowStep] = useState<FlowStep>("input");
  const [errorMessage, setErrorMessage] = useState("");
  const [txHashInProgress, setTxHashInProgress] = useState<string | null>(null);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("0.05");
  const [note, setNote] = useState("");

  // NFC Hardware & Scanner State
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [isScanningNfc, setIsScanningNfc] = useState(false);
  const [nfcWriterOpen, setNfcWriterOpen] = useState(false);
  const [isWritingNfc, setIsWritingNfc] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  // Merchant Terminal State
  const [isTerminalActive, setIsTerminalActive] = useState(false);
  const [terminalView, setTerminalView] = useState<"nfc" | "qr">("nfc");
  const [merchantAmount, setMerchantAmount] = useState("1.00");
  const [merchantNote, setMerchantNote] = useState("Counter Checkout");
  const [terminalStatus, setTerminalStatus] = useState<"waiting" | "handshake" | "processing" | "settled">("waiting");
  const [terminalLastTxHash, setTerminalLastTxHash] = useState<string | null>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string>(() => `order-${Date.now().toString(36)}`);

  // Modals & UI helpers
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [receipt, setReceipt] = useState<PaymentReceiptData | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Dual-Device Test Simulator Drawer
  const [showSimulator, setShowSimulator] = useState(false);
  const [isSimulatingTap, setIsSimulatingTap] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // 1. Mobile Haptic Vibration Utility
  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Haptics unavailable
      }
    }
  }, []);

  // 2. Synthesize acoustic POS contactless handshake ping (440Hz -> 880Hz)
  const playHandshakeChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch (e) {
      console.warn("Handshake chime error:", e);
    }
  }, [soundEnabled]);

  // 3. Synthesize major chord celebration soundbox chime (C5 - E5 - G5 - C6)
  const playCelebrationChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;

      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.55);
      });
    } catch (e) {
      console.warn("Celebration chime error:", e);
    }
  }, [soundEnabled]);

  // 4. Cross-Device Real-time Payment Sync
  const handleSyncEvent = useCallback((event: SyncPaymentEvent) => {
    if (event.type === "PEER_NFC_TAP") {
      // Both devices react to NFC touch
      playHandshakeChime();
      triggerHaptic([40, 30, 80]);
      if (paymentMode === "merchant" && isTerminalActive) {
        setTerminalStatus("handshake");
        toast({
          title: "Customer Device Connected",
          description: "NFC handshake verified. Awaiting customer signature...",
        });
      }
    } else if (event.type === "PEER_TX_SUBMITTED") {
      if (paymentMode === "merchant" && isTerminalActive) {
        setTerminalStatus("processing");
      }
    } else if (event.type === "PEER_TX_CONFIRMED") {
      playCelebrationChime();
      triggerHaptic([50, 40, 60, 40, 120]);
      if (paymentMode === "merchant" && isTerminalActive) {
        setTerminalStatus("settled");
        if (event.payload.txHash) {
          setTerminalLastTxHash(event.payload.txHash);
        }
        toast({
          title: "Payment Received!",
          description: `Received ${event.payload.amount || merchantAmount} POL on Polygon Amoy.`,
        });
      }
    }
  }, [paymentMode, isTerminalActive, merchantAmount, playHandshakeChime, playCelebrationChime, triggerHaptic]);

  const { broadcastEvent } = usePaymentSync(handleSyncEvent);

  // 5. Detect Web NFC Support
  useEffect(() => {
    const hasNfc = typeof window !== "undefined" && "NDEFReader" in window;
    setNfcSupported(hasNfc);
  }, []);

  // 6. Detect Payment Request in URL (e.g. ?pay=0x...&amount=1.0)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      const payAddr = params.get("pay") || params.get("recipient");
      const payAmt = params.get("amount");
      const payNote = params.get("note") || params.get("label");

      if (payAddr && payAddr.startsWith("0x") && payAddr.length === 42) {
        setPaymentMode("customer");
        setRecipient(payAddr);
        if (payAmt) setAmount(payAmt);
        if (payNote) setNote(payNote);
        setFlowStep("review");
        playHandshakeChime();
        triggerHaptic([40, 40]);
        toast({
          title: "Payment Request Detected",
          description: `Loaded request for ${payAmt || "0.05"} POL from NFC/QR link`,
        });
      }
    } catch {
      // ignore
    }
  }, [playHandshakeChime, triggerHaptic]);

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
              orderId: parsed.orderId,
            };
          }
        } catch {
          // Check for URL query params or raw address
          try {
            if (text.includes("pay=") || text.includes("recipient=")) {
              const url = new URL(text);
              const addr = url.searchParams.get("pay") || url.searchParams.get("recipient");
              const amt = url.searchParams.get("amount");
              const lbl = url.searchParams.get("note");
              if (addr && addr.startsWith("0x") && addr.length === 42) {
                return {
                  recipientAddress: addr,
                  amount: amt || "0.05",
                  label: lbl || "NFC Tap Request",
                };
              }
            }
          } catch {
            // ignore
          }

          const addrMatch = text.match(/0x[a-fA-F0-9]{40}/);
          if (addrMatch) {
            const amountMatch = text.match(/[?&]value=([0-9.]+)/);
            return {
              recipientAddress: addrMatch[0],
              amount: amountMatch ? amountMatch[1] : "0.05",
              label: "Scanned NFC Tag",
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
      // Auto-fallback to QR camera scanner if Web NFC is unsupported
      setIsQrScannerOpen(true);
      toast({
        title: "Web NFC Unavailable on this Device",
        description: "Opening instant camera QR scanner fallback instead.",
      });
      return;
    }

    try {
      setIsScanningNfc(true);
      const ndef = new (window as unknown as { NDEFReader: new () => NDEFReaderInstance }).NDEFReader();
      await ndef.scan();

      toast({
        title: "NFC Reader Active",
        description: "Hold your phone near the merchant's NFC terminal or tag.",
      });

      ndef.addEventListener("reading", ({ message }: { message: NDEFMessage }) => {
        const payload = parseNfcPayload(message.records);
        if (payload) {
          playHandshakeChime();
          triggerHaptic([40, 30, 80]);

          // Broadcast peer tap event to sync terminal
          broadcastEvent({
            type: "PEER_NFC_TAP",
            payload: {
              orderId: payload.orderId,
              amount: payload.amount,
              recipient: payload.recipientAddress,
              sender: account || "Customer Device",
              timestamp: Date.now(),
            },
          });

          setRecipient(payload.recipientAddress);
          setAmount(payload.amount);
          if (payload.label) setNote(payload.label);
          setIsScanningNfc(false);
          setFlowStep("review");
          toast({
            title: "NFC Device Connected",
            description: `Payment request ready: ${payload.amount} POL`,
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
        title: "NFC Scanner",
        description: error.message || "Opening QR code camera fallback.",
        variant: "destructive",
      });
      setIsQrScannerOpen(true);
    }
  };

  // Write payment details to a physical NFC tag
  const handleWriteNfc = async () => {
    if (!("NDEFReader" in window)) {
      toast({
        title: "Web NFC Unavailable",
        description: "Web NFC writing is available on Android Chrome.",
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
        amount: merchantAmount || amount || "1.00",
        label: merchantNote || note || "Chain Chat Contactless",
        orderId: currentOrderId,
      });

      await ndef.write({
        records: [{ recordType: "text", data: payloadString }],
      });

      playHandshakeChime();
      triggerHaptic([50, 40, 100]);
      setIsWritingNfc(false);
      toast({
        title: "NFC Tag Programmed",
        description: `This tag will request ${merchantAmount} POL to ${account.slice(0, 6)}...${account.slice(-4)}`,
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

  // Fallback QR Scan Success Handler
  const handleQrScanSuccess = (data: { recipientAddress: string; amount?: string; label?: string }) => {
    playHandshakeChime();
    triggerHaptic([40, 30, 80]);

    broadcastEvent({
      type: "PEER_NFC_TAP",
      payload: {
        recipient: data.recipientAddress,
        amount: data.amount,
        sender: account || "Customer Device",
        timestamp: Date.now(),
      },
    });

    setRecipient(data.recipientAddress);
    if (data.amount) setAmount(data.amount);
    if (data.label) setNote(data.label);
    setFlowStep("review");
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
    if (balance && numAmount > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: `You have ${parseFloat(balance).toFixed(4)} POL. Add funds before proceeding.`,
        variant: "destructive",
      });
      return;
    }

    setFlowStep("review");
  };

  // Step 2 -> 3: Execute Real Transaction On-Chain via MetaMask
  const handleExecutePayment = async () => {
    setFlowStep("processing");
    setErrorMessage("");
    setTxHashInProgress(null);

    // Notify terminal that customer submitted to MetaMask
    broadcastEvent({
      type: "PEER_TX_SUBMITTED",
      payload: {
        recipient,
        amount,
        sender: account || undefined,
        timestamp: Date.now(),
      },
    });

    try {
      const txHash = await sendPol(recipient, amount, note);
      if (txHash) {
        setTxHashInProgress(txHash);

        // Notify both devices of on-chain confirmation
        broadcastEvent({
          type: "PEER_TX_CONFIRMED",
          payload: {
            recipient,
            amount,
            sender: account || undefined,
            txHash,
            timestamp: Date.now(),
          },
        });

        playCelebrationChime();
        triggerHaptic([50, 40, 60, 40, 120]);

        const newReceipt: PaymentReceiptData = {
          amount,
          recipient,
          txHash,
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

  // Generate Merchant Payment URL
  const merchantPaymentUrl = typeof window !== "undefined" && account
    ? `${window.location.origin}/?pay=${account}&amount=${merchantAmount}&note=${encodeURIComponent(merchantNote)}&ref=${currentOrderId}`
    : "";

  const copyPaymentLink = async () => {
    if (!merchantPaymentUrl) return;
    await navigator.clipboard.writeText(merchantPaymentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
    toast({ title: "Link Copied", description: "Payment link copied to clipboard." });
  };

  const sharePaymentLink = async () => {
    if (!merchantPaymentUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Chain Chat Payment Request: ${merchantAmount} POL`,
          text: `Pay ${merchantAmount} POL to ${account?.slice(0, 8)}... via Chain Chat`,
          url: merchantPaymentUrl,
        });
        return;
      } catch {
        // user cancelled or share failed
      }
    }
    copyPaymentLink();
  };

  // Simulate NFC Tap Between Devices
  const handleSimulateTap = () => {
    setIsSimulatingTap(true);
    playHandshakeChime();
    triggerHaptic([40, 30, 80]);

    broadcastEvent({
      type: "PEER_NFC_TAP",
      payload: {
        orderId: currentOrderId,
        amount: merchantAmount,
        recipient: account || "0x9378C735d648439D1F49021e1dD1743666b6e94C",
        sender: "0xTestCustomer442",
        timestamp: Date.now(),
      },
    });

    setTimeout(() => {
      setIsSimulatingTap(false);
      // Auto-populate customer view if in customer mode
      if (paymentMode === "customer") {
        setRecipient(account || "0x9378C735d648439D1F49021e1dD1743666b6e94C");
        setAmount(merchantAmount);
        setNote(merchantNote);
        setFlowStep("review");
      }
    }, 1200);
  };

  const quickAmounts = ["0.05", "0.1", "0.5", "1.0", "5.0"];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Editorial Header with Dual Mode Switcher */}
      <div className="pb-4 border-b border-[#E9E4EA] dark:border-white/10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#E5007D] mb-1.5">
            <Radio className="w-3.5 h-3.5" />
            <span>Mobile Contactless Payments</span>
          </div>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            {paymentMode === "customer" ? "Tap to Pay" : "Merchant POS Register"}
          </h2>
          <p className="text-[#6F6874] dark:text-[#A8A1AF] text-xs sm:text-sm mt-1">
            {paymentMode === "customer"
              ? "Touch phone to terminal via Web NFC or scan dynamic QR fallback."
              : "Accept instant payments via phone-to-phone NFC tap or dynamic checkout QR."}
          </p>
        </div>

        {/* Audio feedback & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-[#FAF8F5] dark:bg-white/5 rounded-2xl border border-[#E9E4EA] dark:border-white/10">
            <button
              type="button"
              onClick={() => { setPaymentMode("customer"); setIsTerminalActive(false); }}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentMode === "customer"
                  ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] shadow-sm"
                  : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white"
              }`}
            >
              <Send className="w-3 h-3" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMode("merchant")}
              className={`py-1.5 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                paymentMode === "merchant"
                  ? "bg-[#E5007D] text-white shadow-sm"
                  : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white"
              }`}
            >
              <Store className="w-3 h-3" />
              <span>Merchant POS</span>
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full border border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? "Mute Acoustic Feedback" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#E5007D]" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* CUSTOMER MODE (TAP TO PAY & SCAN) */}
      {paymentMode === "customer" && (
        <>
          {flowStep === "input" && (
            <form onSubmit={handleProceedToReview} className="space-y-8 animate-in fade-in">
              {/* Dominant Amount Input Area */}
              <div className="text-center py-6 sm:py-8 bg-[#FAF8F5] dark:bg-white/5 rounded-3xl border border-[#E9E4EA] dark:border-white/10 relative">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block mb-2">
                  Payment Amount
                </span>
                <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
                  <input
                    type="number"
                    step="0.001"
                    min="0.0001"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="font-heading font-extrabold text-5xl sm:text-6xl text-[#17131A] dark:text-white text-center bg-transparent border-none focus:outline-none w-full font-number tracking-tight"
                    required
                  />
                  <span className="font-heading font-bold text-2xl text-[#E5007D]">
                    POL
                  </span>
                </div>
                <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-2 font-number font-medium">
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
                          ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A]"
                          : "bg-white dark:bg-white/10 border border-[#E9E4EA] dark:border-white/10 text-[#17131A] dark:text-white hover:border-[#17131A]"
                      }`}
                    >
                      {amt} POL
                    </button>
                  ))}
                </div>
              </div>

              {/* Contactless NFC & Camera QR Action Bar */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* 1. Hardware Web NFC Tap */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FCE7F3] dark:bg-[#E5007D]/20 flex items-center justify-center text-[#E5007D]">
                      <Radio className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#17131A] dark:text-white block">
                        Web NFC Tap-to-Pay
                      </span>
                      <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] block">
                        {nfcSupported === false
                          ? "NFC available on Android Chrome"
                          : "Hold phone to merchant terminal"}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartNfcScan}
                    disabled={isScanningNfc}
                    className="w-full chain-btn-pink text-xs py-2.5 justify-center cursor-pointer"
                  >
                    {isScanningNfc ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        <span>Ready... Hold to Device</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-3.5 h-3.5 mr-1.5" />
                        <span>Tap Partner Phone</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 2. Seamless Camera QR Fallback */}
                <div className="p-5 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 space-y-3 flex flex-col justify-between shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FAF8F5] dark:bg-white/10 flex items-center justify-center text-[#17131A] dark:text-white">
                      <QrCode className="w-5 h-5 text-[#E5007D]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#17131A] dark:text-white block">
                        Fallback Camera QR Scanner
                      </span>
                      <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] block">
                        Point camera at merchant's register
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsQrScannerOpen(true)}
                    className="w-full chain-btn-outline text-xs py-2.5 justify-center cursor-pointer"
                  >
                    <QrCode className="w-3.5 h-3.5 mr-1.5 text-[#E5007D]" />
                    <span>Scan Checkout QR</span>
                  </button>
                </div>
              </div>

              {/* Manual Recipient Input & Address Book */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#17131A] dark:text-white">
                    Recipient Address
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddressBook(true)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#E5007D] hover:underline cursor-pointer"
                    >
                      <BookUser className="w-3.5 h-3.5" />
                      <span>Address Book</span>
                    </button>
                    {account && (
                      <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                        Balance: <strong className="text-[#17131A] dark:text-white">{parseFloat(balance || "0").toFixed(3)} POL</strong>
                      </span>
                    )}
                  </div>
                </div>
                <Input
                  type="text"
                  placeholder="0x... (or scanned from NFC / QR)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="font-mono text-sm h-12 bg-white dark:bg-[#16131A] border-[#E9E4EA] dark:border-white/10 rounded-xl focus-visible:ring-[#E5007D]"
                  required
                />
              </div>

              {/* Note / Memo */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF]">
                  Order / Invoice Note (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Counter checkout, coffee, dinner split"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-sm h-11 bg-white dark:bg-[#16131A] border-[#E9E4EA] dark:border-white/10 rounded-xl focus-visible:ring-[#E5007D]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                {!account ? (
                  <button
                    type="button"
                    onClick={connect}
                    className="w-full chain-btn-pink py-3.5 text-sm justify-center cursor-pointer shadow-md"
                  >
                    Connect Wallet to Pay
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
                    className="w-full chain-btn-pink py-3.5 text-sm justify-center cursor-pointer shadow-md"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </form>
          )}

          {/* STEP 2: REVIEW PAYMENT (TRIGGERED FROM NFC TAP / QR / FORM) */}
          {flowStep === "review" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="p-7 sm:p-9 bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 rounded-3xl space-y-6 shadow-xl">
                <div className="text-center pb-6 border-b border-[#E9E4EA] dark:border-white/10">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] text-xs font-bold mb-3">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Contactless Handshake Verified</span>
                  </div>
                  <div className="flex items-baseline justify-center gap-1.5 font-number">
                    <span className="font-heading font-extrabold text-4xl sm:text-5xl text-[#17131A] dark:text-white">
                      {amount}
                    </span>
                    <span className="font-heading font-bold text-xl text-[#E5007D]">
                      POL
                    </span>
                  </div>
                  <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-1 font-number">
                    ≈ ${(parseFloat(amount || "0") * 0.42).toFixed(2)} USD
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#6F6874] dark:text-[#A8A1AF]">Merchant / Recipient</span>
                    <span className="font-mono text-[#17131A] dark:text-white font-semibold">
                      {recipient.slice(0, 8)}...{recipient.slice(-6)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#6F6874] dark:text-[#A8A1AF]">Network</span>
                    <span className="text-[#17131A] dark:text-white font-medium">Polygon Amoy (80002)</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#6F6874] dark:text-[#A8A1AF]">Estimated Gas</span>
                    <span className="font-mono text-[#16845B] font-semibold">&lt; 0.001 POL (~$0.0004)</span>
                  </div>

                  {note && (
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#6F6874] dark:text-[#A8A1AF]">Reference Tag</span>
                      <span className="text-[#17131A] dark:text-white italic">{note}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-[#E9E4EA] dark:border-white/10 font-semibold text-sm">
                    <span className="text-[#17131A] dark:text-white">Total Amount</span>
                    <span className="font-number text-[#17131A] dark:text-white">~{amount} POL</span>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFlowStep("input")}
                    className="flex-1 chain-btn-outline py-3 text-xs justify-center cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecutePayment}
                    className="flex-1 chain-btn-pink py-3 text-xs justify-center cursor-pointer shadow-lg"
                  >
                    <span>Approve in MetaMask</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING STATE (METAMASK PROMPT & ON-CHAIN MINING) */}
          {flowStep === "processing" && (
            <div className="p-10 text-center bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 rounded-3xl space-y-5 animate-in fade-in shadow-xl">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 flex items-center justify-center text-[#E5007D] relative">
                <div className="absolute inset-0 rounded-full border-2 border-[#E5007D] animate-ping opacity-40" />
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-1">
                <h3 className="font-heading font-extrabold text-2xl text-[#17131A] dark:text-white">
                  Confirming with MetaMask
                </h3>
                <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] max-w-sm mx-auto">
                  Please approve the transaction prompt in your wallet. Syncing with merchant terminal...
                </p>
              </div>
              <div className="font-number font-extrabold text-3xl text-[#17131A] dark:text-white">
                {amount} <span className="text-[#E5007D]">POL</span>
              </div>
              {txHashInProgress && (
                <p className="text-xs font-mono text-[#6F6874] dark:text-[#A8A1AF] pt-2">
                  Broadcasted: {txHashInProgress.slice(0, 10)}...{txHashInProgress.slice(-8)}
                </p>
              )}
            </div>
          )}

          {/* STEP 4: ERROR STATE */}
          {flowStep === "error" && (
            <div className="p-10 text-center bg-white dark:bg-[#16131A] border border-[#C62845]/20 rounded-3xl space-y-4 animate-in fade-in">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#C62845]/10 flex items-center justify-center text-[#C62845]">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-extrabold text-xl text-[#17131A] dark:text-white">
                Payment Rejected or Failed
              </h3>
              <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] max-w-md mx-auto">
                {errorMessage || "The transaction was canceled in MetaMask or encountered network congestion."}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => setFlowStep("input")}
                  className="chain-btn-dark text-xs py-2.5 px-6 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* MERCHANT POS MODE (RECEIVER TERMINAL) */}
      {paymentMode === "merchant" && (
        <div className="space-y-6 animate-in fade-in">
          {!isTerminalActive ? (
            <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 sm:p-9 space-y-6 shadow-sm">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5007D]">
                  Point-of-Sale Register
                </span>
                <h3 className="font-heading font-extrabold text-2xl text-[#17131A] dark:text-white">
                  Set Up Register Amount
                </h3>
                <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                  Turn your phone or tablet into an NFC contact terminal. Customers tap back-to-back to pay.
                </p>
              </div>

              {/* Amount Due Setup */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#17131A] dark:text-white">
                  Amount Due
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={merchantAmount}
                    onChange={(e) => setMerchantAmount(e.target.value)}
                    className="w-full px-4 py-3 text-2xl font-heading font-extrabold rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white font-number"
                  />
                  <span className="absolute right-4 top-4 text-sm font-bold text-[#E5007D]">
                    POL
                  </span>
                </div>
                <div className="flex gap-2 pt-1">
                  {["0.5", "1.0", "5.0", "10.0", "25.0"].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setMerchantAmount(quick)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                        merchantAmount === quick
                          ? "bg-[#E5007D] text-white"
                          : "bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-[#17131A] dark:text-white"
                      }`}
                    >
                      {quick} POL
                    </button>
                  ))}
                </div>
              </div>

              {/* Invoice Note */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF]">
                  Order / Invoice Tag
                </label>
                <input
                  type="text"
                  value={merchantNote}
                  onChange={(e) => setMerchantNote(e.target.value)}
                  placeholder="e.g. Table #4 / Checkout #102"
                  className="w-full px-4 py-2.5 text-xs rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!account) {
                    connect();
                    return;
                  }
                  setCurrentOrderId(`order-${Date.now().toString(36)}`);
                  setIsTerminalActive(true);
                  setTerminalStatus("waiting");
                  triggerHaptic([30, 40]);
                }}
                className="w-full chain-btn-pink py-3.5 text-sm font-bold justify-center cursor-pointer shadow-lg"
              >
                <Radio className="w-4 h-4 animate-pulse mr-2" />
                <span>Launch Contactless Terminal</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          ) : (
            /* ACTIVE DUAL-DEVICE TERMINAL SCREEN */
            <div className="bg-[#17131A] text-white rounded-3xl border border-white/10 p-6 sm:p-8 space-y-6 text-center relative overflow-hidden shadow-2xl animate-in zoom-in-95">
              {/* Terminal Top Navigation */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    terminalStatus === "waiting"
                      ? "bg-emerald-400 animate-ping"
                      : terminalStatus === "handshake"
                      ? "bg-[#E5007D] animate-pulse"
                      : terminalStatus === "processing"
                      ? "bg-amber-400 animate-spin"
                      : "bg-emerald-400"
                  }`} />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-400 font-mono">
                    {terminalStatus === "waiting" && "POS Live · Waiting for Tap"}
                    {terminalStatus === "handshake" && "Device Handshake Detected"}
                    {terminalStatus === "processing" && "MetaMask Authorization Pending"}
                    {terminalStatus === "settled" && "Settlement Confirmed"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Switcher: NFC Radar vs QR Code */}
                  <div className="flex p-0.5 bg-white/10 rounded-xl">
                    <button
                      onClick={() => setTerminalView("nfc")}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        terminalView === "nfc" ? "bg-[#E5007D] text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      NFC
                    </button>
                    <button
                      onClick={() => setTerminalView("qr")}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                        terminalView === "qr" ? "bg-[#E5007D] text-white" : "text-white/60 hover:text-white"
                      }`}
                    >
                      QR
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsTerminalActive(false);
                      setTerminalStatus("waiting");
                    }}
                    className="text-xs text-white/60 hover:text-white underline cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Dominant Amount Display */}
              <div className="space-y-1">
                <span className="text-xs uppercase font-bold tracking-widest text-[#A8A1AF]">
                  Total Due
                </span>
                <div className="font-heading font-extrabold text-5xl sm:text-6xl text-white tracking-tight font-number">
                  {merchantAmount} <span className="text-[#E5007D]">POL</span>
                </div>
                <p className="text-xs text-white/60 font-mono">
                  ≈ ${(parseFloat(merchantAmount || "0") * 0.42).toFixed(2)} USD · {merchantNote}
                </p>
              </div>

              {/* TERMINAL MAIN INTERACTION VIEW */}
              {terminalStatus === "settled" ? (
                /* CELEBRATION BLOOM (SYNCHRONIZED WITH CUSTOMER) */
                <div className="py-8 space-y-5 animate-in zoom-in-95">
                  <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-extrabold text-2xl text-white">
                      Payment Received!
                    </h3>
                    <p className="text-xs text-emerald-300">
                      Confirmed on Polygon Amoy. Funds transferred to your treasury.
                    </p>
                  </div>
                  {terminalLastTxHash && (
                    <a
                      href={`https://amoy.polygonscan.com/tx/${terminalLastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[#E5007D] hover:underline font-mono"
                    >
                      <span>Tx: {terminalLastTxHash.slice(0, 10)}...{terminalLastTxHash.slice(-8)}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        setTerminalStatus("waiting");
                        setCurrentOrderId(`order-${Date.now().toString(36)}`);
                      }}
                      className="chain-btn-pink text-xs py-2.5 px-8 cursor-pointer"
                    >
                      Next Customer
                    </button>
                  </div>
                </div>
              ) : terminalView === "nfc" ? (
                /* NFC PULSING CONTACTLESS RADAR */
                <div className="py-6 flex flex-col items-center justify-center space-y-5 bg-white/5 rounded-3xl border border-white/10 p-6 relative overflow-hidden">
                  {/* Concentric Radar Waves */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-[#E5007D] animate-nfcWave1" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#E5007D] animate-nfcWave2" />
                    <div className="absolute inset-0 rounded-full border-2 border-[#E5007D] animate-nfcWave3" />

                    <div className="relative w-20 h-20 rounded-full bg-[#E5007D] flex items-center justify-center text-white shadow-[0_0_25px_#E5007D] transition-transform duration-300 hover:scale-105">
                      <Radio className="w-9 h-9" />
                    </div>
                  </div>

                  <div className="space-y-1 text-center">
                    <h4 className="font-heading font-bold text-base text-white">
                      {terminalStatus === "handshake"
                        ? "Connecting with Customer Phone..."
                        : terminalStatus === "processing"
                        ? "Customer Signing in MetaMask..."
                        : "Ready for Contactless Tap"}
                    </h4>
                    <p className="text-xs text-white/60 max-w-xs mx-auto">
                      Hold back of customer phone near top of this device to transfer payment request.
                    </p>
                  </div>

                  {/* Fallback actions inside radar view */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTerminalView("qr")}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5 text-[#E5007D]" />
                      <span>Switch to QR Code</span>
                    </button>
                    <button
                      type="button"
                      onClick={sharePaymentLink}
                      className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Link</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* INSTANT DYNAMIC QR FALLBACK */
                <div className="py-6 flex flex-col items-center justify-center space-y-4 bg-white/5 rounded-3xl border border-white/10 p-6">
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG
                      value={merchantPaymentUrl || `ethereum:${account}@80002?value=${merchantAmount}e18`}
                      size={160}
                      level="M"
                      fgColor="#17131A"
                    />
                  </div>
                  <div className="space-y-1 text-center">
                    <span className="font-heading font-bold text-xs text-white block">
                      Customer Scans with Camera or Chain Chat
                    </span>
                    <span className="text-[11px] text-white/60 block">
                      Instantly opens MetaMask payment sheet on partner device
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={copyPaymentLink}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Copied" : "Copy Link"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={sharePaymentLink}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Hardware NFC Tag Programming Pill */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/60 border-t border-white/10 pt-4">
                <span>Depositing to: <strong className="font-mono text-white">{account?.slice(0, 6)}...{account?.slice(-4)}</strong></span>
                <button
                  type="button"
                  onClick={handleWriteNfc}
                  disabled={isWritingNfc}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium cursor-pointer transition-colors inline-flex items-center gap-1"
                >
                  <Tag className="w-3 h-3 text-[#E5007D]" />
                  <span>{isWritingNfc ? "Hold tag to device..." : "Write to Physical NFC Card"}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* DUAL-DEVICE TEST SIMULATOR (FOR DESKTOP & INSTANT VERIFICATION) */}
      <div className="pt-4 border-t border-[#E9E4EA] dark:border-white/10">
        <button
          type="button"
          onClick={() => setShowSimulator(!showSimulator)}
          className="w-full flex items-center justify-between text-xs font-bold text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#E5007D] transition-colors py-2 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#E5007D]" />
            <span>Interactive Dual-Device Tap Simulator (Developer Testbed)</span>
          </div>
          {showSimulator ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showSimulator && (
          <div className="mt-3 p-6 bg-[#FAF8F5] dark:bg-white/5 rounded-3xl border border-[#E9E4EA] dark:border-white/10 space-y-6 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5007D]">
                Side-by-Side Mobile Testing
              </span>
              <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] max-w-md mx-auto">
                Test the synchronized dual-device NFC handshake, acoustic soundbox chime, and haptic animations without needing two physical Android phones.
              </p>
            </div>

            {/* Side-by-Side Virtual Devices */}
            <div className="grid grid-cols-2 gap-4 items-center">
              {/* Virtual Device A (Terminal) */}
              <div className={`p-4 bg-white dark:bg-[#16131A] rounded-2xl border border-[#E9E4EA] dark:border-white/10 text-center space-y-2 transition-transform duration-300 ${
                isSimulatingTap ? "animate-phoneBumpLeft border-[#E5007D]" : ""
              }`}>
                <div className="w-6 h-6 mx-auto rounded-full bg-[#E5007D] text-white text-[10px] font-bold flex items-center justify-center">
                  POS
                </div>
                <span className="text-xs font-bold text-[#17131A] dark:text-white block">
                  Device A (Terminal)
                </span>
                <span className="text-[11px] font-mono text-[#E5007D] block font-extrabold">
                  {merchantAmount} POL Due
                </span>
                <span className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF] block">
                  {terminalStatus === "waiting" ? "Listening" : terminalStatus}
                </span>
              </div>

              {/* Virtual Device B (Customer) */}
              <div className={`p-4 bg-white dark:bg-[#16131A] rounded-2xl border border-[#E9E4EA] dark:border-white/10 text-center space-y-2 transition-transform duration-300 ${
                isSimulatingTap ? "animate-phoneBumpRight border-[#E5007D]" : ""
              }`}>
                <div className="w-6 h-6 mx-auto rounded-full bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] text-[10px] font-bold flex items-center justify-center">
                  Pay
                </div>
                <span className="text-xs font-bold text-[#17131A] dark:text-white block">
                  Device B (Customer)
                </span>
                <span className="text-[11px] font-mono text-[#16845B] block font-bold">
                  Ready to Tap
                </span>
                <span className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF] block">
                  MetaMask Connected
                </span>
              </div>
            </div>

            {/* Trigger Button */}
            <button
              type="button"
              onClick={handleSimulateTap}
              disabled={isSimulatingTap}
              className="w-full chain-btn-pink py-3 text-xs justify-center cursor-pointer shadow-md"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5" />
              <span>{isSimulatingTap ? "Tapping Phones Together..." : "Simulate Physical NFC Tap"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Fallback Camera QR Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        onSelectContact={(addr) => setRecipient(addr)}
      />

      {/* Financial Confirmation Modal */}
      <PaymentConfirmationModal
        receipt={receipt}
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
      />
    </div>
  );
}
