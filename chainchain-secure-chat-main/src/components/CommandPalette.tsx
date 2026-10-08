import React, { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { sound } from "@/lib/audio";
import {
  Search,
  Send,
  ArrowDownLeft,
  Radio,
  QrCode,
  Shield,
  PieChart,
  Terminal,
  Snowflake,
  Sun,
  Moon,
  Copy,
  ExternalLink,
  Sparkles,
  Command,
} from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onToggleTheme?: () => void;
  onFreezeCard?: () => void;
  onCopyAddress?: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  onFreezeCard,
  onCopyAddress,
}: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const actions = [
    {
      id: "send",
      title: "Send POL Transfer",
      subtitle: "Dispatch instant self-custodial payment",
      icon: Send,
      action: () => onNavigate("payments"),
      category: "Payments",
    },
    {
      id: "nfc",
      title: "Tap-to-Pay (NFC)",
      subtitle: "Proximity hardware contactless transfer",
      icon: Radio,
      action: () => onNavigate("payments"),
      category: "Payments",
    },
    {
      id: "qr",
      title: "Scan QR Code",
      subtitle: "Optical camera barcode payment",
      icon: QrCode,
      action: () => onNavigate("payments"),
      category: "Payments",
    },
    {
      id: "receive",
      title: "Receive Funds / Show QR",
      subtitle: "Display Polygon Amoy address and payment QR",
      icon: ArrowDownLeft,
      action: () => onNavigate("banking"),
      category: "Banking",
    },
    {
      id: "networth",
      title: "Net Worth Command Center",
      subtitle: "Total portfolio, staked assets, and area chart",
      icon: PieChart,
      action: () => onNavigate("networth"),
      category: "Analytics",
    },
    {
      id: "security",
      title: "Open Security Center",
      subtitle: "Sessions, biometrics, and threat defense score",
      icon: Shield,
      action: () => onNavigate("security"),
      category: "Security",
    },
    {
      id: "virtual-card",
      title: "Manage Virtual Cards",
      subtitle: "Mint burner disposable cards & spending limits",
      icon: Sparkles,
      action: () => onNavigate("cards"),
      category: "Banking",
    },
    {
      id: "spending",
      title: "Spending Velocity Limits",
      subtitle: "Daily, transaction, and monthly throttles",
      icon: Sparkles,
      action: () => onNavigate("spending"),
      category: "Banking",
    },
    {
      id: "developer",
      title: "Developer / API Console",
      subtitle: "API keys, webhooks, RPC endpoints & smart contract",
      icon: Terminal,
      action: () => onNavigate("developer"),
      category: "Developer",
    },
    {
      id: "copy",
      title: "Copy Wallet Address",
      subtitle: "Copy Amoy address to clipboard",
      icon: Copy,
      action: () => {
        if (onCopyAddress) onCopyAddress();
      },
      category: "Actions",
    },
    {
      id: "theme",
      title: "Toggle Dark / Light Theme",
      subtitle: "Switch between Obsidian Dark and Warm White",
      icon: Moon,
      action: () => {
        if (onToggleTheme) onToggleTheme();
      },
      category: "Preferences",
    },
  ];

  const filtered = actions.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  const executeAction = useCallback(
    (item: (typeof actions)[0]) => {
      sound.playCardTap();
      item.action();
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        executeAction(filtered[selectedIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, executeAction]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 max-w-xl p-0 overflow-hidden text-[#17131A] dark:text-white shadow-2xl sm:rounded-3xl select-none">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E9E4EA] dark:border-white/10">
          <Search className="w-5 h-5 text-[#E5007D] shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, screen, or action..."
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-sm text-[#17131A] dark:text-white placeholder-[#6F6874] dark:placeholder-[#A8A1AF] font-medium"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-[#FAF8F5] dark:bg-white/10 text-[10px] font-mono text-[#6F6874] dark:text-[#A8A1AF]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#6F6874] dark:text-[#A8A1AF]">
              No matching fintech commands found.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => executeAction(item)}
                  className={`p-3 rounded-2xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-[#FAF8F5] dark:bg-white/10 text-[#17131A] dark:text-white"
                      : "hover:bg-[#FAF8F5] dark:hover:bg-white/5 text-[#6F6874] dark:text-[#A8A1AF]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#E5007D] text-white shadow-sm"
                          : "bg-[#FAF8F5] dark:bg-white/5 text-[#17131A] dark:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-heading font-bold text-xs text-[#17131A] dark:text-white block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[#6F6874] dark:text-[#A8A1AF]">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Legend */}
        <div className="px-5 py-3 border-t border-[#E9E4EA] dark:border-white/10 flex items-center justify-between text-[11px] text-[#6F6874] dark:text-[#A8A1AF] bg-[#FAF8F5]/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Chain Chat ⌘K Hub</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
