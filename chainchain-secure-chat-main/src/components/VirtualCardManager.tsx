import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  CreditCard,
  RefreshCw,
  Plus,
  Flame,
  Globe,
  Radio,
  ShoppingBag,
  Sliders,
  ShieldCheck,
  Check,
  Lock,
  Layers,
} from "lucide-react";

interface VirtualCardItem {
  id: string;
  name: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  isDisposable: boolean;
  dailyLimit: number;
  onlineEnabled: boolean;
  contactlessEnabled: boolean;
  internationalEnabled: boolean;
  atmEnabled: boolean;
}

export function VirtualCardManager() {
  const { account } = useWallet();
  const [cards, setCards] = useState<VirtualCardItem[]>([
    {
      id: "vcard-1",
      name: "Primary Web3 Titanium",
      cardNumber: "5424 •••• •••• 9812",
      expiry: "09/29",
      cvv: "831",
      isDisposable: false,
      dailyLimit: 25000,
      onlineEnabled: true,
      contactlessEnabled: true,
      internationalEnabled: false,
      atmEnabled: false,
    },
    {
      id: "vcard-2",
      name: "SaaS Subscriptions Burner",
      cardNumber: "4111 •••• •••• 3491",
      expiry: "11/27",
      cvv: "294",
      isDisposable: true,
      dailyLimit: 5000,
      onlineEnabled: true,
      contactlessEnabled: false,
      internationalEnabled: true,
      atmEnabled: false,
    },
  ]);

  const [activeCardId, setActiveCardId] = useState("vcard-1");
  const [isRegenerating, setIsRegenerating] = useState(false);

  const activeCard = cards.find((c) => c.id === activeCardId) || cards[0];

  const handleToggleSetting = (
    key: "onlineEnabled" | "contactlessEnabled" | "internationalEnabled" | "atmEnabled"
  ) => {
    sound.playCardTap();
    setCards((prev) =>
      prev.map((c) => {
        if (c.id === activeCardId) {
          const updated = { ...c, [key]: !c[key] };
          toast({
            title: "Card Permission Updated",
            description: `${key.replace("Enabled", "")} is now ${updated[key] ? "ENABLED" : "DISABLED"}`,
          });
          return updated;
        }
        return c;
      })
    );
  };

  const handleRegenerate = () => {
    setIsRegenerating(true);
    sound.playFreezeSound();
    setTimeout(() => {
      const randomLast4 = Math.floor(1000 + Math.random() * 9000);
      const randomCvv = Math.floor(100 + Math.random() * 900);
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeCardId
            ? {
                ...c,
                cardNumber: `${c.cardNumber.slice(0, 4)} •••• •••• ${randomLast4}`,
                cvv: randomCvv.toString(),
              }
            : c
        )
      );
      setIsRegenerating(false);
      toast({
        title: "Card Credentials Regenerated",
        description: "New on-chain tokenized virtual account number and CVV active.",
      });
    }, 500);
  };

  const handleCreateCard = () => {
    sound.playCardTap();
    const newCard: VirtualCardItem = {
      id: `vcard-${Date.now()}`,
      name: `Disposable Card #${cards.length + 1}`,
      cardNumber: `4242 •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
      expiry: "12/28",
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      isDisposable: true,
      dailyLimit: 10000,
      onlineEnabled: true,
      contactlessEnabled: true,
      internationalEnabled: false,
      atmEnabled: false,
    };
    setCards((prev) => [...prev, newCard]);
    setActiveCardId(newCard.id);
    toast({
      title: "New Virtual Card Minted",
      description: "Disposable burner instrument ready for single-use transactions.",
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            18 — Virtual Debit Instruments
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            Virtual Card Management
          </h2>
        </div>

        <button
          onClick={handleCreateCard}
          className="chain-btn-pink text-xs py-2.5 px-4 flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Mint Virtual Card</span>
        </button>
      </div>

      {/* Card Carousel Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              sound.playCardTap();
              setActiveCardId(c.id);
            }}
            className={`p-4 rounded-2xl border text-left min-w-[220px] transition-all cursor-pointer ${
              c.id === activeCardId
                ? "bg-white dark:bg-[#16131A] border-[#E5007D] shadow-md ring-1 ring-[#E5007D]"
                : "bg-[#FAF8F5] dark:bg-white/5 border-[#E9E4EA] dark:border-white/10 hover:border-[#6F6874]"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-4 h-4 text-[#E5007D]" />
              {c.isDisposable && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[9px] font-extrabold uppercase">
                  Disposable
                </span>
              )}
            </div>
            <span className="font-heading font-bold text-xs text-[#17131A] dark:text-white block truncate">
              {c.name}
            </span>
            <span className="font-mono text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-1 block">
              {c.cardNumber}
            </span>
          </button>
        ))}
      </div>

      {/* Active Card Configuration Panel */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E9E4EA] dark:border-white/10">
          <div>
            <span className="font-heading font-bold text-xl text-[#17131A] dark:text-white block">
              {activeCard.name}
            </span>
            <div className="flex items-center gap-3 font-mono text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-1">
              <span>{activeCard.cardNumber}</span>
              <span>EXP: {activeCard.expiry}</span>
              <span>CVV: {activeCard.cvv}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="chain-btn-outline text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin text-[#E5007D]" : ""}`} />
              <span>{isRegenerating ? "Rotating..." : "Regenerate Number"}</span>
            </button>
          </div>
        </div>

        {/* Permission Controls Grid */}
        <div className="space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block">
            CARD TRANSACTION SWITCHES
          </span>

          <div className="grid sm:grid-cols-2 gap-3.5">
            {/* Online Payments */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-[#E5007D]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">
                    Online Payments
                  </span>
                  <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                    E-Commerce & Subscriptions
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting("onlineEnabled")}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  activeCard.onlineEnabled ? "bg-[#16845B]" : "bg-gray-300 dark:bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    activeCard.onlineEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Contactless NFC */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-[#E5007D]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">
                    Contactless POS Tap
                  </span>
                  <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                    Physical NFC terminals
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting("contactlessEnabled")}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  activeCard.contactlessEnabled ? "bg-[#16845B]" : "bg-gray-300 dark:bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    activeCard.contactlessEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* International */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-[#6F6874]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">
                    International Usage
                  </span>
                  <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                    Cross-border currency conversions
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting("internationalEnabled")}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  activeCard.internationalEnabled ? "bg-[#16845B]" : "bg-gray-300 dark:bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    activeCard.internationalEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* ATM Withdrawals */}
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-[#6F6874]" />
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">
                    ATM Cash Withdrawals
                  </span>
                  <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                    Cash off-ramps (Default Disabled)
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleToggleSetting("atmEnabled")}
                className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                  activeCard.atmEnabled ? "bg-[#16845B]" : "bg-gray-300 dark:bg-white/20"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    activeCard.atmEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Daily Spending Limit Slider */}
        <div className="pt-2 border-t border-[#E9E4EA] dark:border-white/10 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#17131A] dark:text-white uppercase tracking-wider">
              DAILY LIMIT
            </span>
            <span className="font-heading font-extrabold text-base text-[#E5007D] font-mono">
              ₹{activeCard.dailyLimit.toLocaleString("en-IN")}
            </span>
          </div>
          <input
            type="range"
            min={1000}
            max={100000}
            step={1000}
            value={activeCard.dailyLimit}
            onChange={(e) => {
              const val = Number(e.target.value);
              setCards((prev) =>
                prev.map((c) => (c.id === activeCardId ? { ...c, dailyLimit: val } : c))
              );
            }}
            className="w-full accent-[#E5007D] cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
