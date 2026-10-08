import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { getAddressGradient, formatShortAddress } from "@/lib/avatar";
import { sound } from "@/lib/audio";
import { NetworkHealthModal } from "@/components/NetworkHealthModal";
import { CommandPalette } from "@/components/CommandPalette";
import {
  Wallet,
  LogOut,
  RefreshCw,
  Sun,
  Moon,
  Copy,
  Check,
  Menu,
  X,
  Zap,
  Volume2,
  VolumeX,
  Search,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onFreezeCard?: () => void;
}

export function Header({ activeSection, onSectionChange, onFreezeCard }: HeaderProps) {
  const {
    account,
    balance,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance,
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gasGwei, setGasGwei] = useState("31");
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [soundActive, setSoundActive] = useState(() => sound.enabled);

  // Obsidian & Pink Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chainchat_theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("chainchat_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("chainchat_theme", "light");
    }
  }, [isDark]);

  const toggleTheme = () => {
    sound.playCardTap();
    setIsDark((prev) => !prev);
  };

  const toggleSound = () => {
    const next = !soundActive;
    sound.setSoundEnabled(next);
    setSoundActive(next);
    if (next) sound.playCardTap();
    toast({
      title: next ? "Fintech Audio Active 🔊" : "Fintech Audio Muted 🔇",
      description: next ? "Haptic soundbox chimes enabled" : "Audio synthesizer silenced",
    });
  };

  // Keyboard shortcut listener for ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        sound.playCardTap();
        setShowCommandPalette((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Periodic gas jitter simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const base = 29 + Math.floor(Math.random() * 6);
      setGasGwei(base.toString());
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const copyAddress = async () => {
    if (!account) return;
    sound.playCardTap();
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast({ title: "Address Copied", description: "Wallet address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarGradient = account ? getAddressGradient(account) : null;

  // STRICT 4 PRIMARY NAV DESTINATIONS
  const mainNavItems = [
    { id: "banking", label: "Banking" },
    { id: "payments", label: "Payments" },
    { id: "cards", label: "Cards" },
    { id: "chat", label: "Encrypted Chat" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#FCFBF8]/95 dark:bg-[#0B090C]/95 backdrop-blur-md border-b border-[#E9E4EA] dark:border-white/10 transition-colors select-none">
        <div className="container mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between max-w-7xl">
          {/* Left: Brand Lock (CHAIN CHAT with pink mark) + 4-item Nav */}
          <div className="flex items-center gap-6 md:gap-10">
            <button
              onClick={() => onSectionChange("banking")}
              className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-[#E5007D] flex items-center justify-center text-white font-extrabold text-sm shadow-[0_0_14px_rgba(229,0,125,0.4)] group-hover:scale-105 transition-transform">
                <span className="tracking-tighter">CC</span>
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#17131A] dark:text-white block leading-none">
                  CHAIN CHAT
                </span>
                <span className="text-[10px] font-bold tracking-widest text-[#6F6874] dark:text-[#A8A1AF] uppercase block mt-1">
                  Fintech Suite
                </span>
              </div>
            </button>

            {/* Clean Top Navigation Bar — Strictly 4 Primary Items */}
            <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10">
              {mainNavItems.map((nav) => {
                const isActive = activeSection === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => {
                      sound.playCardTap();
                      onSectionChange(nav.id);
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] shadow-sm"
                        : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    {nav.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Controls: ⌘K, Live Gas Pill, Theme, Audio & Wallet */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* ⌘K Command Palette Button */}
            <button
              onClick={() => {
                sound.playCardTap();
                setShowCommandPalette(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 text-xs font-semibold text-[#6F6874] dark:text-[#A8A1AF] cursor-pointer"
              title="Global Command Palette (⌘K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-[#E5007D]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 font-mono">
                ⌘K
              </kbd>
            </button>

            {/* Live Gas Telemetry Pill — Clickable to open Network Health Dashboard */}
            <button
              onClick={() => {
                sound.playCardTap();
                setShowHealthModal(true);
              }}
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 text-xs font-medium text-[#6F6874] dark:text-[#A8A1AF] cursor-pointer transition-colors"
              title="Click to view Polygon Amoy Network Health"
            >
              <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? "bg-[#16845B]" : "bg-[#A46600]"}`} />
              <span className="hidden xl:inline">Polygon Amoy</span>
              <span className="text-[#E5007D] font-mono text-[11px] font-bold flex items-center gap-0.5">
                <Zap className="w-3 h-3" />
                {gasGwei} Gwei
              </span>
            </button>

            {/* Sound Mute/Unmute */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-full border border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer"
              title={soundActive ? "Mute Acoustic Feedback" : "Enable Sound"}
            >
              {soundActive ? <Volume2 className="w-4 h-4 text-[#E5007D]" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer"
              title={isDark ? "Switch to Warm White Light Mode" : "Switch to Obsidian Dark Mode"}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#17131A]" />}
            </button>

            {/* Wallet Connect & Account Info */}
            {account ? (
              <div className="flex items-center gap-2">
                {!isCorrectNetwork && (
                  <button
                    onClick={switchNetwork}
                    className="px-3 py-1.5 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] border border-[#E5007D]/30 text-xs font-bold hover:bg-[#E5007D] hover:text-white transition-colors cursor-pointer"
                  >
                    Switch to Amoy
                  </button>
                )}

                {/* POL Live Balance Chip */}
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 text-xs shadow-sm">
                  <span className="font-heading font-extrabold text-[#17131A] dark:text-white odometer-num">
                    {parseFloat(balance || "0").toFixed(3)} POL
                  </span>
                  <button
                    onClick={() => refreshBalance()}
                    className="text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#E5007D] transition-colors cursor-pointer"
                    title="Refresh Balance"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                {/* Account Address Badge with Avatar */}
                <div className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 text-xs shadow-sm">
                  <div
                    className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                    style={{ background: avatarGradient?.background }}
                  >
                    {account.slice(2, 4).toUpperCase()}
                  </div>
                  <span className="font-mono text-[#17131A] dark:text-white font-semibold">
                    {formatShortAddress(account)}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="p-1 rounded-full text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy Address"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={disconnect}
                    className="p-1 rounded-full text-[#6F6874] dark:text-[#A8A1AF] hover:text-rose-500 transition-colors cursor-pointer"
                    title="Disconnect"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="chain-btn-pink text-xs py-2 px-4 cursor-pointer shadow-md"
              >
                <Wallet className="w-3.5 h-3.5 mr-1" />
                <span>{isConnecting ? "Connecting..." : "Connect"}</span>
              </button>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#17131A] dark:text-white border border-[#E9E4EA] dark:border-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 py-4 bg-white dark:bg-[#16131A] border-b border-[#E9E4EA] dark:border-white/10 space-y-2 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-2">
              {mainNavItems.map((nav) => (
                <button
                  key={nav.id}
                  onClick={() => {
                    sound.playCardTap();
                    onSectionChange(nav.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-left text-xs font-bold cursor-pointer transition-colors ${
                    activeSection === nav.id
                      ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A]"
                      : "bg-[#FAF8F5] dark:bg-white/5 text-[#6F6874] dark:text-[#A8A1AF]"
                  }`}
                >
                  {nav.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Network Health Modal */}
      <NetworkHealthModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        currentGas={gasGwei}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={onSectionChange}
        onToggleTheme={toggleTheme}
        onFreezeCard={onFreezeCard}
        onCopyAddress={copyAddress}
      />
    </>
  );
}