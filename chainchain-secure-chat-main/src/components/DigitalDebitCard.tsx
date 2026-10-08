import React, { useState, useRef, useCallback } from "react";
import { formatShortAddress } from "@/lib/avatar";
import { sound } from "@/lib/audio";
import {
  Radio,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  RotateCw,
  Eye,
  EyeOff,
  Snowflake,
  Lock,
  Unlock,
  Palette,
  CreditCard,
  QrCode,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export type CardMaterial = "obsidian" | "ceramic" | "prism";

interface DigitalDebitCardProps {
  account: string | null;
  balance: string | null;
  onCopyAddress?: () => void;
  onReceive?: () => void;
  material?: CardMaterial;
  onMaterialChange?: (material: CardMaterial) => void;
}

export function DigitalDebitCard({
  account,
  balance,
  onCopyAddress,
  onReceive,
  material: controlledMaterial,
  onMaterialChange,
}: DigitalDebitCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [copied, setCopied] = useState(false);

  // Card Interactive States
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);
  const [internalMaterial, setInternalMaterial] = useState<CardMaterial>("obsidian");

  const currentMaterial = controlledMaterial || internalMaterial;

  const setMaterial = (mat: CardMaterial) => {
    sound.playCardTap();
    if (onMaterialChange) {
      onMaterialChange(mat);
    } else {
      setInternalMaterial(mat);
    }
  };

  // 3D Tilt calculation based on mouse cursor position
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current || isFrozen) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Calculate dynamic rotation (-10deg to +10deg)
      const rotX = ((y - centerY) / centerY) * -10;
      const rotY = ((x - centerX) / centerX) * 10;

      setRotateX(rotX);
      setRotateY(rotY);

      // Specular glare reflection
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      setGlarePos({ x: glareX, y: glareY, opacity: 0.65 });
    },
    [isFrozen]
  );

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  }, []);

  const handleFlipCard = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playCardFlip();
    setIsFlipped((prev) => !prev);
  };

  const handleToggleFreeze = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playFreezeSound();
    setIsFrozen((prev) => !prev);
    toast({
      title: !isFrozen ? "Card Frozen ❄️" : "Card Unfrozen 🔓",
      description: !isFrozen
        ? "Contactless and on-chain debit transactions are temporarily paused."
        : "Card is active and ready for tap-to-pay and transactions.",
    });
  };

  const handleToggleSensitive = (e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playCardTap();
    setShowSensitive((prev) => !prev);
  };

  const handleCardCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) return;
    sound.playCardTap();
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast({ title: "Card Address Copied", description: "Polygon Amoy address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
    if (onCopyAddress) onCopyAddress();
  };

  const formattedBalance = parseFloat(balance || "0").toFixed(3);
  const formattedAddress = account
    ? showSensitive
      ? account
      : `${account.slice(0, 6)} •••• •••• ${account.slice(-4)}`
    : "0x•••• •••• •••• ••••";

  // Deterministic 3-digit CVV from address hash
  const syntheticCvv = account
    ? String(parseInt(account.slice(-4), 16) % 900 + 100)
    : "942";

  // Material Theme Class Mapping
  const getMaterialClasses = () => {
    switch (currentMaterial) {
      case "ceramic":
        return {
          container:
            "bg-gradient-to-br from-[#FAF8F5] via-[#F3EFE9] to-[#EAE4DC] text-[#17131A] border-white/60 shadow-[0_20px_50px_rgba(23,19,26,0.12)]",
          wordmark: "text-[#17131A]",
          pill: "bg-[#17131A]/10 text-[#17131A] border-[#17131A]/10",
          subtext: "text-[#6F6874]",
          emvGradient: "from-[#D4AF37] via-[#F3E5AB] to-[#AA771C]",
          glare: "radial-gradient(circle at {x}% {y}%, rgba(255,255,255,0.7) 0%, rgba(229,0,125,0.15) 35%, transparent 65%)",
          accentColor: "#E5007D",
        };
      case "prism":
        return {
          container:
            "bg-gradient-to-br from-[#1c1825] via-[#241c30] to-[#120f18] text-white border-pink-400/30 shadow-[0_25px_60px_rgba(229,0,125,0.25)]",
          wordmark: "text-white",
          pill: "bg-white/20 text-white border-white/25",
          subtext: "text-white/70",
          emvGradient: "from-[#FAD02C] via-[#FFEBB0] to-[#E9B100]",
          glare: "radial-gradient(circle at {x}% {y}%, rgba(0,255,255,0.4) 0%, rgba(229,0,125,0.4) 30%, rgba(255,215,0,0.3) 60%, transparent 75%)",
          accentColor: "#E5007D",
        };
      case "obsidian":
      default:
        return {
          container:
            "bg-gradient-to-br from-[#1F1924] via-[#16121B] to-[#0D0A11] text-white border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.5)]",
          wordmark: "text-white",
          pill: "bg-white/10 text-white/80 border-white/15",
          subtext: "text-white/60",
          emvGradient: "from-[#D4AF37] via-[#F3E5AB] to-[#AA771C]",
          glare: "radial-gradient(circle at {x}% {y}%, rgba(255,255,255,0.35) 0%, rgba(229,0,125,0.25) 30%, transparent 65%)",
          accentColor: "#E5007D",
        };
    }
  };

  const matConfig = getMaterialClasses();

  return (
    <div className="w-full max-w-md mx-auto select-none space-y-4">
      {/* 3D Perspective Card Container */}
      <div
        className="perspective-card w-full"
        style={{ perspective: "1400px" }}
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: `rotateX(${rotateX}deg) rotateY(${rotateY + (isFlipped ? 180 : 0)}deg)`,
            transformStyle: "preserve-3d",
            transition:
              rotateX === 0 && rotateY === 0
                ? "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
                : "none",
          }}
          className={`relative aspect-[1.586/1] w-full rounded-3xl p-6 sm:p-7 border overflow-hidden cursor-pointer group transition-shadow duration-300 ${matConfig.container}`}
          onClick={() => {
            sound.playCardTap();
            if (onReceive && !isFrozen) onReceive();
          }}
        >
          {/* Dynamic Specular Holographic Glare */}
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl z-20"
            style={{
              opacity: glarePos.opacity,
              background: matConfig.glare
                .replace("{x}", glarePos.x.toString())
                .replace("{y}", glarePos.y.toString()),
            }}
          />

          {/* Prismatic Shimmer Sheen Sweep */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000 z-10" />

          {/* Frosted Ice Crystallization Layer (When Frozen) */}
          {isFrozen && (
            <div className="absolute inset-0 z-50 bg-[#061826]/75 backdrop-blur-md flex flex-col items-center justify-center text-cyan-200 border-2 border-cyan-400/50 rounded-3xl animate-fadeIn p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center mb-2 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                <Snowflake className="w-6 h-6 text-cyan-300 animate-spin" style={{ animationDuration: "12s" }} />
              </div>
              <span className="font-heading font-extrabold text-base tracking-wider text-cyan-100">
                CARD FROZEN
              </span>
              <p className="text-[11px] text-cyan-300/80 mt-1 max-w-xs">
                Contactless tap & on-chain debit permissions paused
              </p>
              <button
                type="button"
                onClick={handleToggleFreeze}
                className="mt-3 px-4 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#061826] text-xs font-extrabold transition-all cursor-pointer shadow-md"
              >
                Unfreeze Now
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* FRONT FACE (backface-visibility hidden) */}
          {/* ========================================================================= */}
          <div
            style={{ backfaceVisibility: "hidden" }}
            className={`absolute inset-0 p-6 sm:p-7 flex flex-col justify-between ${
              isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* TOP ROW: Brand Wordmark & Contactless Chip */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#E5007D] flex items-center justify-center font-extrabold text-[11px] text-white shadow-[0_0_12px_#E5007D]">
                  CC
                </div>
                <span className={`font-heading font-extrabold text-sm sm:text-base tracking-wider ${matConfig.wordmark}`}>
                  CHAIN CHAT
                </span>
                <span className={`text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-semibold border ${matConfig.pill}`}>
                  {currentMaterial.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#E5007D] animate-pulse" />
              </div>
            </div>

            {/* MIDDLE ROW: EMV Smart Chip & Balance */}
            <div className="flex items-center justify-between relative z-10">
              {/* Authentic EMV Chip with Circuit Traces */}
              <div
                className={`w-11 h-8 rounded-lg bg-gradient-to-tr ${matConfig.emvGradient} p-0.5 shadow-md flex flex-col justify-between overflow-hidden relative`}
              >
                <div className="w-full h-[1px] bg-amber-950/40 my-auto" />
                <div className="w-full h-[1px] bg-amber-950/40 my-auto" />
                <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-950/40" />
                <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-950/40" />
              </div>

              <div className="text-right">
                <span className={`text-[10px] uppercase font-bold tracking-widest ${matConfig.subtext} block`}>
                  Treasury Balance
                </span>
                <span className={`font-heading font-extrabold text-xl sm:text-2xl tracking-tight odometer-num ${matConfig.wordmark}`}>
                  {formattedBalance} <span className="text-[#E5007D] text-base">POL</span>
                </span>
              </div>
            </div>

            {/* BOTTOM ROW: Masked Address, Copy button, Network */}
            <div className="flex items-end justify-between relative z-10 pt-2">
              <div className="space-y-1">
                <span className={`text-[9px] uppercase tracking-widest ${matConfig.subtext} block font-bold`}>
                  Account Number / ID
                </span>
                <div className="flex items-center gap-2">
                  <span className={`font-mono text-xs sm:text-sm font-semibold tracking-wider ${matConfig.wordmark}`}>
                    {formattedAddress}
                  </span>
                  <button
                    type="button"
                    onClick={handleCardCopy}
                    className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 opacity-70" />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-[9px] uppercase tracking-widest ${matConfig.subtext} block font-bold`}>
                  NETWORK
                </span>
                <span className={`font-heading font-bold text-xs ${matConfig.wordmark}`}>
                  Polygon Amoy
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* BACK FACE (backface-visibility hidden, rotated 180deg) */}
          {/* ========================================================================= */}
          <div
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
            className={`absolute inset-0 flex flex-col justify-between ${
              !isFlipped ? "pointer-events-none" : ""
            }`}
          >
            {/* Magnetic Stripe */}
            <div className="w-full h-11 bg-[#09080A] dark:bg-black mt-4 shadow-inner relative">
              <div className="w-full h-[1px] bg-white/10 top-2 absolute" />
              <div className="w-full h-[1px] bg-white/10 bottom-2 absolute" />
            </div>

            {/* Signature Panel & Holographic CVV Security Box */}
            <div className="px-6 space-y-3">
              <div className="flex items-center gap-3">
                {/* White Signature Panel with Guilloche Micro-lines */}
                <div className="flex-1 h-8 bg-white/90 rounded border border-gray-300 dark:border-white/20 flex items-center px-3 overflow-hidden">
                  <span className="font-mono text-[10px] text-gray-700 tracking-wider font-bold italic truncate">
                    {account ? `AUTH: ${account.slice(0, 16)}...` : "NOT CONNECTED"}
                  </span>
                </div>

                {/* CVV Security Box */}
                <div className="w-16 h-8 bg-white rounded border border-gray-300 flex items-center justify-center font-mono font-extrabold text-xs text-[#17131A] shadow-inner">
                  {showSensitive ? syntheticCvv : "•••"}
                </div>
              </div>

              {/* Hologram Security Seal & Smart Contract Identifier */}
              <div className="flex items-center justify-between text-[10px]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-5 rounded bg-gradient-to-tr from-rose-400 via-amber-300 to-teal-300 p-0.5 flex items-center justify-center text-[8px] font-extrabold text-black shadow-sm">
                    HOLOGRAM
                  </div>
                  <span className={`font-mono text-[9px] ${matConfig.subtext}`}>
                    EIP-712 AUTH SECURE
                  </span>
                </div>

                <span className={`font-mono text-[9px] ${matConfig.subtext}`}>
                  AMOY ID: 80002
                </span>
              </div>
            </div>

            {/* Legal / Smart Contract Disclosure Footnote */}
            <div className="px-6 pb-5 text-[8px] leading-tight opacity-60 font-sans">
              Self-custodial Web3 debit credential. Protected by ECDSA elliptic curve cryptography. Tap or scan to execute peer-to-peer transfers.
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TACTILE CARD CONTROLS STRIP */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs px-1">
        {/* Flip & Reveal Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleFlipCard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 font-bold text-[#17131A] dark:text-white transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-[#E5007D]" />
            <span>{isFlipped ? "Front" : "Flip Back"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFreeze}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-bold transition-all cursor-pointer ${
              isFrozen
                ? "bg-cyan-500 text-[#061826] border-cyan-400 shadow-sm"
                : "bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border-[#E9E4EA] dark:border-white/10 text-[#17131A] dark:text-white"
            }`}
          >
            <Snowflake className="w-3.5 h-3.5 text-cyan-500" />
            <span>{isFrozen ? "Frozen" : "Freeze"}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSensitive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 font-bold text-[#17131A] dark:text-white transition-all cursor-pointer"
            title={showSensitive ? "Hide Numbers" : "Reveal Numbers"}
          >
            {showSensitive ? <EyeOff className="w-3.5 h-3.5 text-[#6F6874]" /> : <Eye className="w-3.5 h-3.5 text-[#6F6874]" />}
            <span>{showSensitive ? "Hide" : "Reveal"}</span>
          </button>
        </div>

        {/* Material Finish Palette Picker */}
        <div className="flex items-center gap-1 bg-[#FAF8F5] dark:bg-white/5 p-1 rounded-full border border-[#E9E4EA] dark:border-white/10">
          <button
            type="button"
            onClick={() => setMaterial("obsidian")}
            className={`w-6 h-6 rounded-full border transition-all ${
              currentMaterial === "obsidian"
                ? "border-[#E5007D] scale-110 shadow-sm"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            style={{ background: "#1F1924" }}
            title="Rose Obsidian"
          />
          <button
            type="button"
            onClick={() => setMaterial("ceramic")}
            className={`w-6 h-6 rounded-full border transition-all ${
              currentMaterial === "ceramic"
                ? "border-[#E5007D] scale-110 shadow-sm"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            style={{ background: "#FAF8F5" }}
            title="Editorial Ceramic"
          />
          <button
            type="button"
            onClick={() => setMaterial("prism")}
            className={`w-6 h-6 rounded-full border transition-all ${
              currentMaterial === "prism"
                ? "border-[#E5007D] scale-110 shadow-sm"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
            style={{ background: "linear-gradient(135deg, #FF0080, #7928CA, #00DFD8)" }}
            title="Amoy Prism Hologram"
          />
        </div>
      </div>
    </div>
  );
}
