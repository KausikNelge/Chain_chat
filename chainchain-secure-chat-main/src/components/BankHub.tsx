import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Droplets,
  QrCode,
  ShieldCheck,
  Send,
  Plus,
  ArrowDown,
  Info
} from "lucide-react";

interface BankHubProps {
  onNavigateToPayments?: () => void;
}

export function BankHub({ onNavigateToPayments }: BankHubProps) {
  const {
    account,
    balance,
    isCorrectNetwork,
    transactions,
    refreshBalance,
    connect
  } = useWallet();

  const [copied, setCopied] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showAddFundsDialog, setShowAddFundsDialog] = useState(false);
  const [selectedTx, setSelectedTx] = useState<{
    id: string;
    hash: string;
    type: string;
    amount: string;
    timestamp: number;
    to?: string;
  } | null>(null);

  const copyAddress = async () => {
    if (!account) return;
    await navigator.clipboard.writeText(account);
    setCopied(true);
    toast({ title: "Address Copied", description: "Polygon Amoy address copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedBalance = parseFloat(balance || "0").toFixed(4);
  const usdValuation = (parseFloat(balance || "0") * 0.42).toFixed(2);

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Editorial Heading Statement */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#E9E4EA]">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-2">
            01 — Account Treasury
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#17131A] tracking-tight leading-tight">
            Your money, <br />
            <span className="text-[#6F6874]">with direct wallet control.</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshBalance()}
            className="chain-btn-outline text-xs py-2.5 px-4 cursor-pointer"
            title="Refresh on-chain balance"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6F6874]" />
            <span>Sync Balance</span>
          </button>
          {!account && (
            <button onClick={connect} className="chain-btn-pink text-xs py-2.5 px-5 cursor-pointer">
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Asymmetric Product Composition: Balance Left + Details Right */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Large Balance Panel & Quick Actions (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E9E4EA] p-7 sm:p-10 space-y-8 shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] block mb-2">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2 font-number">
              <span className="font-heading font-extrabold text-5xl sm:text-6xl text-[#17131A] tracking-tight">
                {account ? formattedBalance : "0.000"}
              </span>
              <span className="font-heading font-bold text-2xl text-[#E5007D]">
                POL
              </span>
            </div>
            <p className="text-sm text-[#6F6874] font-number mt-2 font-medium">
              ≈ ${account ? usdValuation : "0.00"} USD
            </p>
          </div>

          {/* Quick High-Frequency Actions: [Send] [Receive] [Add Funds] */}
          <div className="pt-2 border-t border-[#E9E4EA] grid grid-cols-3 gap-3">
            <button
              onClick={onNavigateToPayments}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFF2] border border-[#E9E4EA] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#17131A] text-white flex items-center justify-center group-hover:bg-[#E5007D] transition-colors">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17131A]">Send</span>
            </button>

            <button
              onClick={() => setShowReceiveDialog(true)}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFF2] border border-[#E9E4EA] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-white text-[#17131A] border border-[#E9E4EA] flex items-center justify-center group-hover:border-[#E5007D] group-hover:text-[#E5007D] transition-colors">
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17131A]">Receive</span>
            </button>

            <button
              onClick={() => setShowAddFundsDialog(true)}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFF2] border border-[#E9E4EA] transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#FCE7F3] text-[#E5007D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-[#17131A]">Add Funds</span>
            </button>
          </div>
        </div>

        {/* Right Column: Account Credentials & Metadata (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FAF8F5] rounded-3xl border border-[#E9E4EA] p-7 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874]">
              Account Details
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FCE7F3] text-[#E5007D]">
              Polygon Amoy 80002
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[11px] font-bold text-[#6F6874] uppercase tracking-wider block mb-1">
                Connected Address
              </span>
              <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#E9E4EA] font-mono">
                <span className="text-[#17131A] truncate pr-2 font-medium">
                  {account || "Wallet Not Connected"}
                </span>
                {account && (
                  <button
                    onClick={copyAddress}
                    className="p-1 rounded text-[#6F6874] hover:text-[#17131A] transition-colors cursor-pointer flex-shrink-0"
                    title="Copy address"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#16845B]" /> : <Copy className="w-3.5 h-3.5 text-[#6F6874]" />}
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white border border-[#E9E4EA]">
                <span className="text-[10px] uppercase font-bold text-[#6F6874] block">Network</span>
                <span className="font-semibold text-[#17131A] mt-0.5 block">Amoy Testnet</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-[#E9E4EA]">
                <span className="text-[10px] uppercase font-bold text-[#6F6874] block">Custody</span>
                <span className="font-semibold text-[#16845B] mt-0.5 block flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Self-Custodial
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 03: Activity Passbook Timeline (Whitespace & Dividers) */}
      <div className="pt-4 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E4EA]">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
              03 — Activity
            </span>
            <h3 className="font-heading font-extrabold text-2xl text-[#17131A]">
              Recent activity
            </h3>
          </div>
          <span className="text-xs text-[#6F6874]">
            {transactions.length} {transactions.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* Timeline Entries with Dividers — No nested cards */}
        {transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#E9E4EA] p-8">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] flex items-center justify-center text-[#6F6874]">
              <Info className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#17131A]">
              No activity yet
            </h4>
            <p className="text-xs text-[#6F6874] max-w-sm mx-auto">
              Your confirmed payments and transfers will appear here.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToPayments}
                className="chain-btn-pink text-xs py-2.5 px-5 cursor-pointer"
              >
                Send your first payment
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E9E4EA] divide-y divide-[#E9E4EA] overflow-hidden">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-5 sm:p-6 flex items-center justify-between hover:bg-[#FAF8F5] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "send" || tx.type === "nfc_pay"
                      ? "bg-[#17131A] text-white"
                      : "bg-[#FCE7F3] text-[#E5007D]"
                  }`}>
                    {tx.type === "send" || tx.type === "nfc_pay" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-heading font-bold text-sm text-[#17131A] truncate">
                      {tx.type === "send" ? "Sent Transfer" : tx.type === "nfc_pay" ? "NFC Contactless Pay" : "Received Funds"}
                    </p>
                    <p className="text-xs text-[#6F6874] font-mono mt-0.5 truncate">
                      {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : `${tx.hash.slice(0, 8)}...`}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-4 font-number">
                  <span className={`font-heading font-extrabold text-sm sm:text-base ${
                    tx.type === "send" || tx.type === "nfc_pay" ? "text-[#17131A]" : "text-[#16845B]"
                  }`}>
                    {tx.type === "send" || tx.type === "nfc_pay" ? "-" : "+"}{tx.amount} POL
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
                    <span className="text-[11px] text-[#6F6874]">Confirmed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Receive / Deposit Modal Dialog */}
      <Dialog open={showReceiveDialog} onOpenChange={setShowReceiveDialog}>
        <DialogContent className="bg-white border border-[#E9E4EA] text-[#17131A] max-w-sm sm:rounded-3xl p-6">
          <DialogHeader className="text-center">
            <DialogTitle className="font-heading font-bold text-xl text-[#17131A]">Receive POL</DialogTitle>
            <DialogDescription className="text-xs text-[#6F6874]">
              Share your Polygon Amoy address or scan QR code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-center">
            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-[#E9E4EA] flex items-center justify-center">
              {account ? (
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${account}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode className="w-16 h-16 text-[#6F6874]" />
              )}
            </div>

            <p className="font-mono text-xs text-[#17131A] break-all p-3 rounded-xl bg-[#FAF8F5] border border-[#E9E4EA]">
              {account || "Connect wallet to generate QR"}
            </p>

            <button
              onClick={copyAddress}
              disabled={!account}
              className="w-full chain-btn-pink text-xs py-3 justify-center cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 mr-1 text-white" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
              <span>{copied ? "Address Copied" : "Copy Address"}</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Funds / Faucet Modal Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent className="bg-white border border-[#E9E4EA] text-[#17131A] max-w-md sm:rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-[#17131A]">Add Funds to Account</DialogTitle>
            <DialogDescription className="text-xs text-[#6F6874]">
              This treasury operates on the Polygon Amoy testnet. Claim free testnet POL from official faucets below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <a
              href="https://faucet.polygon.technology/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFF2] border border-[#E9E4EA] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FCE7F3] text-[#E5007D] flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] block">Official Polygon Faucet</span>
                  <span className="text-xs text-[#6F6874]">faucet.polygon.technology</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6F6874] group-hover:text-[#E5007D]" />
            </a>

            <a
              href="https://faucets.chain.link/polygon-amoy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#F2EFF2] border border-[#E9E4EA] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white text-[#17131A] border border-[#E9E4EA] flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-[#17131A]" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] block">Chainlink Amoy Faucet</span>
                  <span className="text-xs text-[#6F6874]">faucets.chain.link</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6F6874] group-hover:text-[#E5007D]" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
