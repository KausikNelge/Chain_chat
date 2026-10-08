import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { getAddressGradient, formatShortAddress } from "@/lib/avatar";
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
  ExternalLink,
  Shield,
  Zap,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function Header({ activeSection, onSectionChange }: HeaderProps) {
  const {
    account,
    balance,
    isConnecting,
    isCorrectNetwork,
    connect,
    disconnect,
    switchNetwork,
    refreshBalance
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [gasGwei, setGasGwei] = useState("32");

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

  const toggleTheme = () => setIsDark(prev => !prev);

  // Periodic simulated gas check
  useEffect(() => {
    const interval = setInterval(() => {
      const base = 28 + Math.floor(Math.random() * 8);
      setGasGwei(base.toString());
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast({ title: "Address Copied", description: "Wallet address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const avatarGradient = account ? getAddressGradient(account) : null;

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FCFBF8]/95 dark:bg-[#0B090C]/95 backdrop-blur-md border-b border-[#E9E4EA] dark:border-white/10 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between max-w-6xl">
        {/* Brand Lock: CHAIN CHAT with pink visual mark */}
        <div className="flex items-center gap-8 lg:gap-12">
          <button
            onClick={() => onSectionChange("banking")}
            className="flex items-center gap-3 group cursor-pointer text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-[#E5007D] flex items-center justify-center text-white font-extrabold text-sm shadow-sm group-hover:scale-105 transition-transform">
              <span className="tracking-tighter">CC</span>
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#17131A] dark:text-white block leading-none">
                CHAIN CHAT
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#6F6874] dark:text-[#A8A1AF] uppercase block mt-1">
                Fintech Web3 Suite
              </span>
            </div>
          </button>

          {/* Clean Editorial Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            {[
              { id: "banking", label: "Banking" },
              { id: "payments", label: "Payments" },
              { id: "activity", label: "Activity" },
              { id: "chat", label: "Encrypted Chat" },
            ].map((nav) => (
              <button
                key={nav.id}
                onClick={() => onSectionChange(nav.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeSection === nav.id
                    ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] shadow-sm"
                    : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white hover:bg-[#F2EFF2] dark:hover:bg-white/5"
                }`}
              >
                {nav.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Side: Network Badge, Telemetry & Wallet Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live Gas Telemetry Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-xs font-medium text-[#6F6874] dark:text-[#A8A1AF]">
            <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? "bg-[#16845B]" : "bg-[#A46600]"}`} />
            <span>Polygon Amoy</span>
            <span className="text-[#E5007D] font-mono text-[11px] font-bold flex items-center gap-0.5">
              <Zap className="w-3 h-3" />
              {gasGwei} Gwei
            </span>
          </div>

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

              {/* Account Address Badge with Deterministic Avatar */}
              <div className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded-full bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 text-xs shadow-sm">
                <div
                  className="w-5 h-5 rounded-full shadow-inner flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                  style={{ background: avatarGradient?.background }}
                >
                  {account.slice(2, 4).toUpperCase()}
                </div>
                <span className="font-mono text-[#17131A] dark:text-white font-medium text-xs">
                  {formatShortAddress(account)}
                </span>
                <button
                  onClick={copyAddress}
                  className="p-1 rounded-full text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={disconnect}
                  className="p-1 rounded-full text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#C62845] transition-colors cursor-pointer ml-0.5"
                  title="Disconnect wallet"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={connect}
              disabled={isConnecting}
              className="chain-btn-pink text-xs sm:text-sm py-2.5 px-5 sm:px-6 cursor-pointer shadow-md"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect wallet"}</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#E5007D] dark:hover:text-[#E5007D] bg-white dark:bg-[#16131A] transition-colors cursor-pointer shadow-sm"
            title={isDark ? "Switch to Warm White Mode" : "Switch to Obsidian Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#17131A]" />}
          </button>

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#17131A] dark:text-white hover:bg-[#F2EFF2] dark:hover:bg-white/10 cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FCFBF8] dark:bg-[#0B090C] border-b border-[#E9E4EA] dark:border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          {[
            { id: "banking", label: "Banking" },
            { id: "payments", label: "Payments" },
            { id: "activity", label: "Activity" },
            { id: "chat", label: "Encrypted Chat" },
          ].map((nav) => (
            <button
              key={nav.id}
              onClick={() => { onSectionChange(nav.id); setMobileMenuOpen(false); }}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                activeSection === nav.id
                  ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A]"
                  : "text-[#17131A] dark:text-white hover:bg-[#F2EFF2] dark:hover:bg-white/5"
              }`}
            >
              {nav.label}
            </button>
          ))}
          <div className="pt-2 border-t border-[#E9E4EA] dark:border-white/10 text-[11px] text-[#6F6874] dark:text-[#A8A1AF] flex items-center justify-between px-2">
            <span>Polygon Amoy · {gasGwei} Gwei</span>
            {account && <span className="font-mono text-[#17131A] dark:text-white">{formatShortAddress(account)}</span>}
          </div>
        </div>
      )}
    </header>
  );
}