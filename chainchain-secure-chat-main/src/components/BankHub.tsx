import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAddressBook } from "@/hooks/useAddressBook";
import { getAddressGradient } from "@/lib/avatar";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReceiveModal } from "@/components/ReceiveModal";
import { AddressBookModal } from "@/components/AddressBookModal";
import { DigitalDebitCard } from "@/components/DigitalDebitCard";
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
  Info,
  BookUser,
  Zap,
  Radio,
  X,
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
  const { contacts } = useAddressBook();

  const [copied, setCopied] = useState(false);
  const [showReceiveDialog, setShowReceiveDialog] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
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
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-2">
            01 — Account Treasury
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-5xl text-[#17131A] dark:text-white tracking-tight leading-tight">
            Your money, <br />
            <span className="text-[#6F6874] dark:text-[#A8A1AF]">with direct wallet control.</span>
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refreshBalance()}
            className="chain-btn-outline text-xs py-2.5 px-4 cursor-pointer"
            title="Refresh on-chain balance"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#6F6874] dark:text-[#A8A1AF] mr-1.5" />
            <span>Sync Balance</span>
          </button>
          {!account && (
            <button onClick={connect} className="chain-btn-pink text-xs py-2.5 px-5 cursor-pointer shadow-md">
              <Wallet className="w-4 h-4 mr-1.5" />
              <span>Connect Wallet</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Treasury Section: Interactive 3D Card (Left) + Balance & Actions (Right) */}
      <div className="grid lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: 3D Holographic Debit Card (5 Cols) */}
        <div className="lg:col-span-5 flex justify-center">
          <DigitalDebitCard
            account={account}
            balance={balance}
            onCopyAddress={copyAddress}
            onReceive={() => setShowReceiveDialog(true)}
          />
        </div>

        {/* Right Column: Balance Readout & Quick Operations (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-7 sm:p-9 space-y-6 shadow-xl transition-colors">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF]">
                Available Balance
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#16845B]/10 text-[#16845B]">
                <ShieldCheck className="w-3 h-3" />
                Polygon Amoy (80002)
              </span>
            </div>

            <div className="flex items-baseline gap-2 font-number">
              <span className="font-heading font-extrabold text-5xl sm:text-6xl text-[#17131A] dark:text-white tracking-tight odometer-num">
                {account ? formattedBalance : "0.000"}
              </span>
              <span className="font-heading font-bold text-2xl text-[#E5007D]">
                POL
              </span>
            </div>
            <p className="text-sm text-[#6F6874] dark:text-[#A8A1AF] font-number mt-2 font-medium">
              ≈ ${account ? usdValuation : "0.00"} USD · Zero Custody Fees
            </p>
          </div>

          {/* Quick High-Frequency Actions: [Send] [Receive] [Contacts] [Add Funds] */}
          <div className="pt-2 border-t border-[#E9E4EA] dark:border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={onNavigateToPayments}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] flex items-center justify-center group-hover:bg-[#E5007D] dark:group-hover:bg-[#E5007D] dark:group-hover:text-white transition-colors">
                <Send className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17131A] dark:text-white">Send</span>
            </button>

            <button
              onClick={() => setShowReceiveDialog(true)}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#16131A] text-[#17131A] dark:text-white border border-[#E9E4EA] dark:border-white/10 flex items-center justify-center group-hover:border-[#E5007D] group-hover:text-[#E5007D] transition-colors">
                <ArrowDown className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17131A] dark:text-white">Receive</span>
            </button>

            <button
              onClick={() => setShowAddressBook(true)}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-white dark:bg-[#16131A] text-[#17131A] dark:text-white border border-[#E9E4EA] dark:border-white/10 flex items-center justify-center group-hover:border-[#E5007D] group-hover:text-[#E5007D] transition-colors">
                <BookUser className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-[#17131A] dark:text-white">Contacts</span>
            </button>

            <button
              onClick={() => setShowAddFundsDialog(true)}
              className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-all cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-xs font-bold text-[#17131A] dark:text-white">Add Funds</span>
            </button>
          </div>

          {/* Quick-Send Recent Contacts Strip */}
          {contacts.length > 0 && (
            <div className="pt-2 border-t border-[#E9E4EA] dark:border-white/10">
              <span className="text-[11px] font-bold text-[#6F6874] dark:text-[#A8A1AF] uppercase tracking-wider block mb-2.5">
                Quick Send to Contacts
              </span>
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {contacts.slice(0, 5).map((contact) => {
                  const gradient = getAddressGradient(contact.address);
                  return (
                    <button
                      key={contact.id}
                      onClick={onNavigateToPayments}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-colors cursor-pointer shrink-0"
                    >
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-inner"
                        style={{ background: gradient.background }}
                      >
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-[#17131A] dark:text-white">
                        {contact.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 03: Activity Passbook Timeline (Whitespace & Dividers) */}
      <div className="pt-4 space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E4EA] dark:border-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
              03 — Activity Passbook
            </span>
            <h3 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#17131A] dark:text-white">
              Recent activity
            </h3>
          </div>
          <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
            {transactions.length} {transactions.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* Timeline Entries with Dividers */}
        {transactions.length === 0 ? (
          <div className="py-16 text-center space-y-3 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-8 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#FAF8F5] dark:bg-white/5 flex items-center justify-center text-[#6F6874] dark:text-[#A8A1AF]">
              <Info className="w-5 h-5" />
            </div>
            <h4 className="font-heading font-bold text-lg text-[#17131A] dark:text-white">
              No activity yet
            </h4>
            <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] max-w-sm mx-auto">
              Your confirmed payments, contactless taps, and faucet claims will appear here.
            </p>
            <div className="pt-2">
              <button
                onClick={onNavigateToPayments}
                className="chain-btn-pink text-xs py-2.5 px-6 cursor-pointer shadow-md"
              >
                Send your first payment
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 divide-y divide-[#E9E4EA] dark:divide-white/10 overflow-hidden shadow-sm">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => setSelectedTx(tx)}
                className="p-5 sm:p-6 flex items-center justify-between hover:bg-[#FAF8F5] dark:hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    tx.type === "send" || tx.type === "nfc_pay"
                      ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A]"
                      : "bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D]"
                  }`}>
                    {tx.type === "send" || tx.type === "nfc_pay" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-heading font-bold text-sm text-[#17131A] dark:text-white truncate">
                      {tx.type === "send" ? "Sent Transfer" : tx.type === "nfc_pay" ? "NFC Contactless Pay" : "Received Funds"}
                    </p>
                    <p className="text-xs text-[#6F6874] dark:text-[#A8A1AF] font-mono mt-0.5 truncate">
                      {tx.to ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : `${tx.hash.slice(0, 8)}...`}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 pl-4 font-number">
                  <span className={`font-heading font-extrabold text-sm sm:text-base odometer-num ${
                    tx.type === "send" || tx.type === "nfc_pay" ? "text-[#17131A] dark:text-white" : "text-[#16845B]"
                  }`}>
                    {tx.type === "send" || tx.type === "nfc_pay" ? "-" : "+"}{tx.amount} POL
                  </span>
                  <div className="flex items-center justify-end gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#16845B]" />
                    <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">Confirmed</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTx && (
        <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
          <DialogContent className="bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 text-[#17131A] dark:text-white max-w-sm sm:rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="font-heading font-bold text-lg text-[#17131A] dark:text-white">
                Transaction Receipt
              </DialogTitle>
              <DialogDescription className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                Verified on Polygon Amoy blockchain
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2 text-xs">
              <div className="text-center py-4 bg-[#FAF8F5] dark:bg-white/5 rounded-2xl border border-[#E9E4EA] dark:border-white/10">
                <span className="text-[11px] font-bold text-[#6F6874] dark:text-[#A8A1AF] block">Amount</span>
                <span className="font-heading font-extrabold text-3xl text-[#17131A] dark:text-white">
                  {selectedTx.amount} POL
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#6F6874] dark:text-[#A8A1AF]">Status</span>
                  <span className="font-semibold text-[#16845B]">Confirmed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6874] dark:text-[#A8A1AF]">Network</span>
                  <span>Polygon Amoy (80002)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6F6874] dark:text-[#A8A1AF]">Tx Hash</span>
                  <a
                    href={`https://amoy.polygonscan.com/tx/${selectedTx.hash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[#E5007D] hover:underline flex items-center gap-1"
                  >
                    <span>{selectedTx.hash.slice(0, 10)}...</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Interactive Receive QR Modal */}
      <ReceiveModal
        isOpen={showReceiveDialog}
        onClose={() => setShowReceiveDialog(false)}
        account={account}
      />

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        onSelectContact={() => {
          if (onNavigateToPayments) {
            onNavigateToPayments();
          }
        }}
      />

      {/* Add Funds / Faucet Modal Dialog */}
      <Dialog open={showAddFundsDialog} onOpenChange={setShowAddFundsDialog}>
        <DialogContent className="bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 text-[#17131A] dark:text-white max-w-md sm:rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="font-heading font-bold text-xl text-[#17131A] dark:text-white">
              Add Funds to Treasury
            </DialogTitle>
            <DialogDescription className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
              Chain Chat operates on the Polygon Amoy testnet. Claim free testnet POL from official faucets below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <a
              href="https://faucet.polygon.technology/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] flex items-center justify-center">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">Official Polygon Faucet</span>
                  <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">faucet.polygon.technology</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6F6874] dark:text-[#A8A1AF] group-hover:text-[#E5007D]" />
            </a>

            <a
              href="https://faucets.chain.link/polygon-amoy"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 hover:bg-[#F2EFF2] dark:hover:bg-white/10 border border-[#E9E4EA] dark:border-white/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white dark:bg-[#16131A] text-[#17131A] dark:text-white border border-[#E9E4EA] dark:border-white/10 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-[#17131A] dark:text-white" />
                </div>
                <div>
                  <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">Chainlink Amoy Faucet</span>
                  <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">faucets.chain.link</span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-[#6F6874] dark:text-[#A8A1AF] group-hover:text-[#E5007D]" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
