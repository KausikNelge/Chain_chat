import React, { useState, useRef, useEffect, useCallback } from "react";
import { ArrowRight, Check, Loader2, ShieldCheck, ChevronRight } from "lucide-react";
import { sound } from "@/lib/audio";

interface SlideToPayProps {
  onConfirm: () => void;
  amount: string;
  symbol?: string;
  disabled?: boolean;
  isLoading?: boolean;
  label?: string;
}

export function SlideToPay({
  onConfirm,
  amount,
  symbol = "POL",
  disabled = false,
  isLoading = false,
  label = "Slide to confirm payment",
}: SlideToPayProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragProgress, setDragProgress] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const lastHapticStep = useRef(0);

  const triggerHaptic = useCallback((pattern: number = 30) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }, []);

  const handleStart = (clientX: number) => {
    if (disabled || isLoading || isConfirmed) return;
    setIsDragging(true);
    sound.playCardTap();
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || !containerRef.current || isConfirmed) return;
      const rect = containerRef.current.getBoundingClientRect();
      const thumbWidth = 56;
      const maxDrag = rect.width - thumbWidth;
      const currentX = Math.max(0, Math.min(clientX - rect.left - thumbWidth / 2, maxDrag));
      const progress = currentX / maxDrag;

      setDragProgress(progress);

      // Micro-haptic steps
      const currentStep = Math.floor(progress * 4);
      if (currentStep !== lastHapticStep.current) {
        lastHapticStep.current = currentStep;
        triggerHaptic(20);
      }

      if (progress >= 0.92) {
        setIsDragging(false);
        setDragProgress(1);
        setIsConfirmed(true);
        triggerHaptic(60);
        sound.playSliderSnap();
        onConfirm();
      }
    },
    [isDragging, isConfirmed, onConfirm, triggerHaptic]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging || isConfirmed) return;
    setIsDragging(false);
    if (dragProgress < 0.92) {
      // Spring back to start
      setDragProgress(0);
      lastHapticStep.current = 0;
    }
  }, [isDragging, isConfirmed, dragProgress]);

  // Mouse event listeners on window
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  // Reset state if loading completes
  useEffect(() => {
    if (!isLoading && !disabled) {
      setIsConfirmed(false);
      setDragProgress(0);
    }
  }, [isLoading, disabled]);

  const thumbOffset = containerRef.current
    ? dragProgress * ((containerRef.current.offsetWidth || 340) - 56)
    : 0;

  return (
    <div className="w-full select-none">
      <div
        ref={containerRef}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
        onMouseDown={(e) => handleStart(e.clientX)}
        className={`relative h-15 rounded-full overflow-hidden border p-1 transition-all ${
          disabled
            ? "opacity-50 pointer-events-none bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10"
            : isConfirmed || isLoading
            ? "bg-[#16845B]/15 border-[#16845B]/40"
            : "bg-[#17131A] dark:bg-white/10 border-white/10 shadow-lg cursor-pointer"
        }`}
      >
        {/* Dynamic Progress Fill */}
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#E5007D] to-[#B80063] rounded-full transition-all"
          style={{
            width: `${Math.max(56, dragProgress * 100)}%`,
            transition: isDragging ? "none" : "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />

        {/* Center Prompt Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-14">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Loader2 className="w-4 h-4 animate-spin text-[#E5007D]" />
              <span>Broadcasting to Amoy...</span>
            </div>
          ) : isConfirmed ? (
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <Check className="w-4 h-4" />
              <span>Payment Authorized</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-white/80 transition-opacity"
              style={{ opacity: Math.max(0, 1 - dragProgress * 2) }}
            >
              <span>{label}</span>
              <span className="text-[#E5007D] font-extrabold font-mono">
                {amount} {symbol}
              </span>
              <div className="flex items-center -space-x-1 ml-1 text-white/40">
                <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
                <ChevronRight className="w-3.5 h-3.5 animate-pulse" style={{ animationDelay: "150ms" }} />
              </div>
            </div>
          )}
        </div>

        {/* Draggable Circle Thumb */}
        <div
          className={`absolute top-1 bottom-1 w-13 rounded-full flex items-center justify-center shadow-xl transition-transform ${
            isConfirmed || isLoading
              ? "bg-[#16845B] text-white"
              : "bg-white text-[#17131A] hover:scale-105 active:scale-95"
          }`}
          style={{
            transform: `translateX(${thumbOffset}px)`,
            transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isConfirmed ? (
            <Check className="w-5 h-5 stroke-[3]" />
          ) : (
            <ArrowRight className="w-5 h-5 text-[#E5007D] stroke-[2.5]" />
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-[#6F6874] dark:text-[#A8A1AF] mt-2 px-2">
        <span className="flex items-center gap-1 font-medium">
          <ShieldCheck className="w-3 h-3 text-[#16845B]" />
          Zero-gas slippage guaranteed
        </span>
        <span className="text-[10px] text-white/40">Release to cancel</span>
      </div>
    </div>
  );
}
