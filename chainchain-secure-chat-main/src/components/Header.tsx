import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { LogOut, Wallet, RefreshCw, Copy, Check, Menu, X, ArrowUpRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface HeaderProps {
  activeSection: "banking" | "payments" | "activity" | "chat";
  onSectionChange: (section: "banking" | "payments" | "activity" | "chat") => void;
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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast({ title: "Address Copied", description: "Wallet address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full chain-nav transition-all">
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
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#17131A] block leading-none">
                CHAIN CHAT
              </span>
              <span className="text-[10px] font-bold tracking-widest text-[#6F6874] uppercase block mt-1">
                Banking & Pay
              </span>
            </div>
          </button>

          {/* Clean Editorial Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSectionChange("banking")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSection === "banking"
                  ? "bg-[#17131A] text-white"
                  : "text-[#6F6874] hover:text-[#17131A] hover:bg-[#F2EFF2]"
              }`}
            >
              Banking
            </button>
            <button
              onClick={() => onSectionChange("payments")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSection === "payments"
                  ? "bg-[#17131A] text-white"
                  : "text-[#6F6874] hover:text-[#17131A] hover:bg-[#F2EFF2]"
              }`}
            >
              Payments
            </button>
            <button
              onClick={() => onSectionChange("activity")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSection === "activity"
                  ? "bg-[#17131A] text-white"
                  : "text-[#6F6874] hover:text-[#17131A] hover:bg-[#F2EFF2]"
              }`}
            >
              Activity
            </button>
            <button
              onClick={() => onSectionChange("chat")}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                activeSection === "chat"
                  ? "bg-[#17131A] text-white"
                  : "text-[#6F6874] hover:text-[#17131A] hover:bg-[#F2EFF2]"
              }`}
            >
              Encrypted Chat
            </button>
          </nav>
        </div>

        {/* Right Side: Network Badge & Wallet Controls */}
        <div className="flex items-center gap-3">
          {/* Tasteful Testnet Disclosure */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] border border-[#E9E4EA] text-xs font-medium text-[#6F6874]">
            <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? "bg-[#16845B]" : "bg-[#A46600]"}`} />
            <span>Polygon Amoy · Testnet</span>
          </div>

          {account ? (
            <div className="flex items-center gap-2">
              {!isCorrectNetwork && (
                <button
                  onClick={switchNetwork}
                  className="px-3 py-1.5 rounded-full bg-[#FCE7F3] text-[#E5007D] border border-[#E5007D]/30 text-xs font-bold hover:bg-[#E5007D] hover:text-white transition-colors cursor-pointer"
                >
                  Switch to Amoy
                </button>
              )}

              {/* POL Live Balance Chip */}
              <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E9E4EA] text-xs">
                <span className="font-heading font-extrabold text-[#17131A]">
                  {parseFloat(balance).toFixed(3)} POL
                </span>
                <button
                  onClick={() => refreshBalance()}
                  className="text-[#6F6874] hover:text-[#E5007D] transition-colors cursor-pointer"
                  title="Refresh Balance"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>

              {/* Account Address Badge */}
              <div className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-white border border-[#E9E4EA] text-xs">
                <span className="font-mono text-[#17131A] font-medium">{formatAddress(account)}</span>
                <button
                  onClick={copyAddress}
                  className="p-1 rounded-full text-[#6F6874] hover:text-[#17131A] transition-colors cursor-pointer"
                  title="Copy address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={disconnect}
                  className="p-1 rounded-full text-[#6F6874] hover:text-[#C62845] transition-colors cursor-pointer ml-0.5"
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
              className="chain-btn-pink text-xs sm:text-sm py-2.5 px-5 sm:px-6 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect wallet"}</span>
            </button>
          )}

          {/* Mobile Hamburger Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#17131A] hover:bg-[#F2EFF2] cursor-pointer"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FCFBF8] border-b border-[#E9E4EA] px-4 py-4 space-y-2 animate-in slide-in-from-top-2">
          <button
            onClick={() => { onSectionChange("banking"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeSection === "banking" ? "bg-[#17131A] text-white" : "text-[#17131A] hover:bg-[#F2EFF2]"
            }`}
          >
            Banking
          </button>
          <button
            onClick={() => { onSectionChange("payments"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeSection === "payments" ? "bg-[#17131A] text-white" : "text-[#17131A] hover:bg-[#F2EFF2]"
            }`}
          >
            Payments
          </button>
          <button
            onClick={() => { onSectionChange("activity"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeSection === "activity" ? "bg-[#17131A] text-white" : "text-[#17131A] hover:bg-[#F2EFF2]"
            }`}
          >
            Activity
          </button>
          <button
            onClick={() => { onSectionChange("chat"); setMobileMenuOpen(false); }}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              activeSection === "chat" ? "bg-[#17131A] text-white" : "text-[#17131A] hover:bg-[#F2EFF2]"
            }`}
          >
            Encrypted Chat
          </button>
          <div className="pt-2 border-t border-[#E9E4EA] text-[11px] text-[#6F6874] flex items-center justify-between px-2">
            <span>Polygon Amoy · Testnet</span>
            {account && <span className="font-mono">{formatAddress(account)}</span>}
          </div>
        </div>
      )}
    </header>
  );
}