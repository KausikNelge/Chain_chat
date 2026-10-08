import React, { useState, useRef, useCallback } from "react";
import { formatShortAddress } from "@/lib/avatar";
import { Radio, Copy, Check, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface DigitalDebitCardProps {
  account: string | null;
  balance: string | null;
  onCopyAddress?: () => void;
  onReceive?: () => void;
}

export function DigitalDebitCard({ account, balance, onCopyAddress, onReceive }: DigitalDebitCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [copied, setCopied] = useState(false);

  // 3D Tilt calculation based on mouse position
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-12deg to +12deg)
    const rotX = ((y - centerY) / centerY) * -12;
    const rotY = ((x - centerX) / centerX) * 12;

    setRotateX(rotX);
    setRotateY(rotY);

    // Calculate specular glare position
    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePos({ x: glareX, y: glareY, opacity: 0.6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setGlarePos({ x: 50, y: 50, opacity: 0 });
  }, []);

  const handleCardCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast({ title: "Card Address Copied", description: "Polygon Amoy address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
    if (onCopyAddress) onCopyAddress();
  };

  const formattedBalance = parseFloat(balance || "0").toFixed(3);
  const formattedAddress = account
    ? `${account.slice(0, 6)} •••• •••• ${account.slice(-4)}`
    : "0x•••• •••• •••• ••••";

  return (
    <div className="perspective-card w-full max-w-md mx-auto select-none">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: rotateX === 0 ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
        }}
        className="preserve-3d relative aspect-[1.586/1] w-full rounded-3xl bg-gradient-to-br from-[#1F1924] via-[#16121B] to-[#0D0A11] dark:from-[#211B27] dark:via-[#16121B] dark:to-[#08060A] p-6 sm:p-7 text-white shadow-2xl border border-white/15 overflow-hidden group cursor-pointer"
        onClick={onReceive}
      >
        {/* Dynamic Specular Holographic Glare */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-3xl"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.3) 0%, rgba(229,0,125,0.2) 30%, transparent 65%)`,
          }}
        />

        {/* Diagonal Subtle Prism Holographic Stripe */}
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-45 pointer-events-none group-hover:translate-x-full transition-transform duration-1000" />

        {/* TOP ROW: Brand Wordmark & Contactless Chip */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#E5007D] flex items-center justify-center font-extrabold text-[11px] shadow-[0_0_12px_#E5007D]">
              CC
            </div>
            <span className="font-heading font-extrabold text-sm sm:text-base tracking-wider text-white">
              CHAIN CHAT
            </span>
            <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-semibold ml-1">
              FINTECH
            </span>
          </div>

          <div className="flex items-center gap-2 text-white/70">
            <Radio className="w-5 h-5 text-[#E5007D] animate-pulse" />
          </div>
        </div>

        {/* MIDDLE ROW: EMV Smart Chip */}
        <div className="mt-5 sm:mt-6 flex items-center justify-between relative z-10">
          {/* Gold EMV Chip Graphic */}
          <div className="w-11 h-8 rounded-lg bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] p-0.5 shadow-md flex flex-col justify-between overflow-hidden relative">
            <div className="w-full h-[1px] bg-amber-900/40 my-auto" />
            <div className="w-full h-[1px] bg-amber-900/40 my-auto" />
            <div className="absolute inset-y-0 left-1/3 w-[1px] bg-amber-900/40" />
            <div className="absolute inset-y-0 right-1/3 w-[1px] bg-amber-900/40" />
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/50 block">
              Treasury Value
            </span>
            <span className="font-heading font-extrabold text-xl sm:text-2xl text-white tracking-tight odometer-num">
              {formattedBalance} <span className="text-[#E5007D] text-base">POL</span>
            </span>
          </div>
        </div>

        {/* BOTTOM ROW: Masked Address, Faucet Link, and Network */}
        <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between relative z-10 pt-2">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-widest text-white/50 block font-bold">
              Account Card Number
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs sm:text-sm text-white/90 font-semibold tracking-wider">
                {formattedAddress}
              </span>
              <button
                type="button"
                onClick={handleCardCopy}
                className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title="Copy Address"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-white/50 block font-bold">
              NETWORK
            </span>
            <span className="font-heading font-bold text-xs text-white/90">
              Polygon Amoy
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6F6874] dark:text-[#A8A1AF] mt-2.5 px-2">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
          Self-Custodial Debit Instrument
        </span>
        <span className="text-[10px] text-white/40">Hover/Tilt for 3D Sheen</span>
      </div>
    </div>
  );
}
