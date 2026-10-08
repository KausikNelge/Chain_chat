import { useState } from "react";
import { Header } from "@/components/Header";
import { BankHub } from "@/components/BankHub";
import { NfcPayment } from "@/components/NfcPayment";
import { UnifiedChat } from "@/components/UnifiedChat";
import { ReceiveModal } from "@/components/ReceiveModal";
import { useWallet } from "@/context/WalletContext";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Radio,
  Lock,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  Shield,
  Layers,
  ChevronRight
} from "lucide-react";

export default function Index() {
  const { account, connect, isConnecting, balance, transactions } = useWallet();
  const [activeSection, setActiveSection] = useState<"banking" | "payments" | "activity" | "chat">("banking");
  const [showHeroReceive, setShowHeroReceive] = useState(false);

  const formattedBalance = account ? parseFloat(balance || "0").toFixed(3) : "0.000";
  const usdValuation = account ? (parseFloat(balance || "0") * 0.42).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#FCFBF8] dark:bg-[#0B090C] text-[#17131A] dark:text-[#F5F3F7] flex flex-col selection:bg-[#FCE7F3] selection:text-[#E5007D]">
      {/* Editorial Navigation Header */}
      <Header activeSection={activeSection} onSectionChange={setActiveSection} />

      {/* PRODUCT HERO — Asymmetric Composition with Real Product Visual */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-[#E9E4EA] dark:border-white/10 chain-hero-glow">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Bold Editorial Typography & Mission Statement */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-xs font-bold text-[#17131A] dark:text-white">
                <span className="w-2 h-2 rounded-full bg-[#16845B]" />
                <span className="uppercase tracking-wider">POLYGON AMOY · TESTNET</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-6xl md:text-7xl text-[#17131A] dark:text-white tracking-tight leading-[0.98]">
                Money, <br />
                <span className="text-[#6F6874] dark:text-[#A8A1AF]">without the middleman.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#6F6874] dark:text-[#A8A1AF] max-w-xl leading-relaxed">
                Self-custodial treasury, instant peer-to-peer contactless NFC settlements, and end-to-end encrypted messaging. Direct wallet control on Polygon.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                {!account ? (
                  <button
                    onClick={connect}
                    disabled={isConnecting}
                    className="chain-btn-pink text-sm py-3.5 px-8 cursor-pointer shadow-lg"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>{isConnecting ? "Connecting..." : "Connect wallet"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveSection(activeSection === "banking" ? "payments" : "banking")}
                    className="chain-btn-pink text-sm py-3.5 px-8 cursor-pointer shadow-lg"
                  >
                    <span>{activeSection === "banking" ? "Send Payment" : "Open Banking Hub"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <button
                  onClick={() => setActiveSection("chat")}
                  className="chain-btn-outline text-sm py-3 px-6 cursor-pointer"
                >
                  <Lock className="w-4 h-4 text-[#E5007D]" />
                  <span>Encrypted Messaging</span>
                </button>
              </div>

              {/* High-Trust Value Indicators */}
              <div className="flex items-center gap-6 pt-3 text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                <span className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#16845B]" />
                  Self-Custodial
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Zap className="w-4 h-4 text-[#E5007D]" />
                  &lt;3s Finality
                </span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Radio className="w-4 h-4 text-[#17131A] dark:text-white" />
                  Hardware Web NFC
                </span>
              </div>
            </div>

            {/* Right Column: Real Living Chain Chat Product Interface Component */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-6 sm:p-8 space-y-6 shadow-xl transition-all relative">
                {/* Product Card Top Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-[#E9E4EA] dark:border-white/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#E5007D] text-white font-extrabold text-xs flex items-center justify-center">
                      CC
                    </div>
                    <span className="font-heading font-extrabold text-sm text-[#17131A] dark:text-white">
                      Chain Chat Treasury
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 text-[#6F6874] dark:text-[#A8A1AF] border border-[#E9E4EA] dark:border-white/10">
                    Polygon Amoy
                  </span>
                </div>

                {/* Available Balance Display */}
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block mb-1">
                    Available Balance
                  </span>
                  <div className="flex items-baseline gap-2 font-number">
                    <span className="font-heading font-extrabold text-4xl text-[#17131A] dark:text-white">
                      {formattedBalance}
                    </span>
                    <span className="font-heading font-bold text-lg text-[#E5007D]">
                      POL
                    </span>
                  </div>
                  <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] mt-0.5 font-number font-medium">
                    ≈ ${usdValuation} USD
                  </p>
                </div>

                {/* Action Row */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setActiveSection("payments")}
                    className="chain-btn-pink text-xs py-2.5 justify-center cursor-pointer shadow-sm"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Send POL</span>
                  </button>
                  <button
                    onClick={() => {
                      if (!account) {
                        connect();
                      } else {
                        setShowHeroReceive(true);
                      }
                    }}
                    className="chain-btn-outline text-xs py-2.5 justify-center cursor-pointer"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5 text-[#6F6874] dark:text-[#A8A1AF]" />
                    <span>Receive</span>
                  </button>
                </div>

                {/* Micro Activity Snapshot */}
                <div className="pt-2 border-t border-[#E9E4EA] dark:border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-[#6F6874] dark:text-[#A8A1AF]">
                    <span className="font-semibold text-[11px] uppercase tracking-wider">Recent Activity</span>
                    <button
                      onClick={() => setActiveSection("activity")}
                      className="text-[#E5007D] hover:underline cursor-pointer text-[11px] font-semibold"
                    >
                      View all
                    </button>
                  </div>

                  {transactions.length > 0 ? (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between font-number">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] flex items-center justify-center text-[10px]">
                          ↑
                        </div>
                        <span className="font-medium text-[#17131A] dark:text-white">
                          {transactions[0].type === "nfc_pay" ? "NFC Payment" : "Transfer"}
                        </span>
                      </div>
                      <span className="font-bold text-[#17131A] dark:text-white">
                        -{transactions[0].amount} POL
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-center text-[#6F6874] dark:text-[#A8A1AF] text-[11px]">
                      No transactions yet. Confirmed activity will appear here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Interactive Product Section */}
      <main className="container mx-auto px-4 sm:px-6 py-12 md:py-16 max-w-6xl flex-1">
        {/* TAB 01: BANKING HUB */}
        {activeSection === "banking" && (
          <div className="animate-in fade-in duration-300">
            <BankHub onNavigateToPayments={() => setActiveSection("payments")} />
          </div>
        )}

        {/* TAB 02: PAYMENTS (FIRST-CLASS DEDICATED EXPERIENCE) */}
        {activeSection === "payments" && (
          <div className="animate-in fade-in duration-300">
            <NfcPayment />
          </div>
        )}

        {/* TAB 03: PASSBOOK ACTIVITY TIMELINE */}
        {activeSection === "activity" && (
          <div className="animate-in fade-in duration-300 max-w-3xl mx-auto space-y-6">
            <div className="pb-4 border-b border-[#E9E4EA] dark:border-white/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
                03 — On-Chain Passbook
              </span>
              <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white">
                Activity & History
              </h2>
              <p className="text-[#6F6874] dark:text-[#A8A1AF] text-xs sm:text-sm mt-1">
                Verifiable transactions submitted on the Polygon Amoy blockchain.
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="py-16 text-center space-y-3 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-8 shadow-sm">
                <h4 className="font-heading font-bold text-lg text-[#17131A] dark:text-white">
                  No activity yet
                </h4>
                <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] max-w-sm mx-auto">
                  Your confirmed payments, transfers, and faucet claims will appear here.
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => setActiveSection("payments")}
                    className="chain-btn-pink text-xs py-2.5 px-6 cursor-pointer"
                  >
                    Send your first payment
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 divide-y divide-[#E9E4EA] dark:divide-white/10 overflow-hidden shadow-sm">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-5 sm:p-6 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "send" || tx.type === "nfc_pay"
                          ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A]"
                          : "bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D]"
                      }`}>
                        {tx.type === "send" || tx.type === "nfc_pay" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-heading font-bold text-sm text-[#17131A] dark:text-white">
                          {tx.type === "send" ? "Sent Transfer" : tx.type === "nfc_pay" ? "NFC Contactless Pay" : "Received Funds"}
                        </p>
                        <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] font-mono mt-0.5">
                          {tx.to ? `${tx.to.slice(0, 8)}...${tx.to.slice(-6)}` : tx.hash.slice(0, 12)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right font-number">
                      <span className={`font-heading font-extrabold text-sm sm:text-base ${
                        tx.type === "send" || tx.type === "nfc_pay" ? "text-[#17131A] dark:text-white" : "text-[#16845B]"
                      }`}>
                        {tx.type === "send" || tx.type === "nfc_pay" ? "-" : "+"}{tx.amount} POL
                      </span>
                      <p className="text-[11px] text-[#16845B] font-medium mt-0.5">Confirmed</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 04: ENCRYPTED MESSAGING (UNIFIED THREADED CHANNELS) */}
        {activeSection === "chat" && (
          <div className="animate-in fade-in duration-300">
            <UnifiedChat />
          </div>
        )}

        {/* Section 05: On-Chain Transparency Panel */}
        <section className="mt-20 pt-10 border-t border-[#E9E4EA] dark:border-white/10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 bg-[#FAF8F5] dark:bg-white/5 rounded-3xl border border-[#E9E4EA] dark:border-white/10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#E5007D]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#17131A] dark:text-white">
                  05 — On-Chain Transparency
                </span>
              </div>
              <h3 className="font-heading font-bold text-lg text-[#17131A] dark:text-white">
                Polygon Amoy Testnet Infrastructure
              </h3>
              <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                Smart contract: <span className="font-mono text-[#17131A] dark:text-white">0x9378C735d648439D1F49021e1dD1743666b6e94C</span> · Chain ID: 80002
              </p>
            </div>

            <a
              href="https://amoy.polygonscan.com/address/0x9378C735d648439D1F49021e1dD1743666b6e94C"
              target="_blank"
              rel="noreferrer"
              className="chain-btn-outline text-xs py-2.5 px-4 cursor-pointer"
            >
              <span>View Contract on PolygonScan</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#6F6874] dark:text-[#A8A1AF]" />
            </a>
          </div>
        </section>
      </main>

      {/* Editorial Consumer Fintech Footer */}
      <footer className="border-t border-[#E9E4EA] dark:border-white/10 mt-24 py-12 bg-white dark:bg-[#16131A]">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-8 border-b border-[#E9E4EA] dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E5007D] flex items-center justify-center text-white font-extrabold text-sm">
                CC
              </div>
              <div>
                <span className="font-heading font-extrabold text-lg text-[#17131A] dark:text-white block leading-none">
                  CHAIN CHAT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#6F6874] dark:text-[#A8A1AF] block mt-1">
                  Banking & Payments
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-semibold text-[#6F6874] dark:text-[#A8A1AF]">
              <button onClick={() => setActiveSection("banking")} className="hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer">
                Banking
              </button>
              <button onClick={() => setActiveSection("payments")} className="hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer">
                Payments
              </button>
              <button onClick={() => setActiveSection("activity")} className="hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer">
                Activity
              </button>
              <button onClick={() => setActiveSection("chat")} className="hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer">
                Encrypted Chat
              </button>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6874] dark:text-[#A8A1AF]">
            <p>© {new Date().getFullYear()} Chain Chat. Direct on-chain treasury & contactless settlements.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-[11px] font-medium text-[#17131A] dark:text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
                Polygon Amoy · Testnet
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Hero Receive QR Modal */}
      <ReceiveModal
        isOpen={showHeroReceive}
        onClose={() => setShowHeroReceive(false)}
        account={account}
      />
    </div>
  );
}
