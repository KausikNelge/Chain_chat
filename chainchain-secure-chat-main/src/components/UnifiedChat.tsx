import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useWallet } from "@/context/WalletContext";
import { useAddressBook } from "@/hooks/useAddressBook";
import { toast } from "@/hooks/use-toast";
import { createEncryptedBundle, decryptBundle } from "@/lib/crypto";
import { uploadToIPFS, fetchFromIPFS } from "@/lib/ipfs";
import { EIP712_DOMAIN, EIP712_TYPES } from "@/lib/constants";
import { KeyGenerator } from "@/components/KeyGenerator";
import { AddressBookModal } from "@/components/AddressBookModal";
import {
  Lock,
  Unlock,
  Send,
  Key,
  Upload,
  FileCheck,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Search,
  Plus,
  User,
  Shield,
  ArrowUpRight,
  BookUser,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface RawMessage {
  id: bigint;
  sender: string;
  recipient: string;
  timestamp: bigint;
  cid: string;
  signature: string;
}

interface ChatMessage {
  id: number;
  sender: string;
  recipient: string;
  timestamp: number;
  cid: string;
  signature: string;
  decryptedContent?: string;
  isDecrypting?: boolean;
}

export function UnifiedChat() {
  const { account, signer, contract, isCorrectNetwork, connect, sendPol } = useWallet();
  const { contacts, getContactByAddress } = useAddressBook();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePeer, setActivePeer] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Message Sending State
  const [newMessageText, setNewMessageText] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  
  // Decryption Key Vault
  const [sessionPrivateKey, setSessionPrivateKey] = useState<string>(() => {
    try {
      return sessionStorage.getItem("chainchat_session_privkey") || "";
    } catch {
      return "";
    }
  });

  // Modal controls
  const [showKeyManager, setShowKeyManager] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [attachPayment, setAttachPayment] = useState<string>("");

  // Save private key in session storage
  const handleSavePrivateKey = (key: string) => {
    setSessionPrivateKey(key);
    try {
      sessionStorage.setItem("chainchat_session_privkey", key);
      toast({ title: "Session Key Stored", description: "Private key saved for this browser session" });
    } catch (e) {
      console.warn(e);
    }
  };

  // Fetch on-chain messages
  const fetchMessages = useCallback(async () => {
    if (!account || !contract) return;
    setIsLoading(true);
    try {
      const data = (await contract.getMessagesForUser(account)) as RawMessage[];
      const formatted: ChatMessage[] = data.map((msg: RawMessage) => ({
        id: Number(msg.id),
        sender: msg.sender,
        recipient: msg.recipient,
        timestamp: Number(msg.timestamp),
        cid: msg.cid,
        signature: msg.signature,
      }));
      setMessages(formatted.reverse());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [account, contract]);

  useEffect(() => {
    if (account && isCorrectNetwork && contract) {
      fetchMessages();
    }
  }, [account, isCorrectNetwork, contract, fetchMessages]);

  // Group messages into contact threads
  const peerThreads = useMemo(() => {
    const peersMap = new Map<string, { lastMessage: ChatMessage; count: number }>();
    
    messages.forEach((msg) => {
      const peer = msg.sender.toLowerCase() === account?.toLowerCase() ? msg.recipient : msg.sender;
      if (!peersMap.has(peer.toLowerCase())) {
        peersMap.set(peer.toLowerCase(), { lastMessage: msg, count: 1 });
      } else {
        const item = peersMap.get(peer.toLowerCase())!;
        item.count += 1;
      }
    });

    const list = Array.from(peersMap.entries()).map(([peerAddr, data]) => {
      const contact = getContactByAddress(peerAddr);
      return {
        address: peerAddr,
        displayName: contact ? contact.name : `${peerAddr.slice(0, 6)}...${peerAddr.slice(-4)}`,
        lastMessage: data.lastMessage,
        count: data.count,
      };
    });

    return list;
  }, [messages, account, getContactByAddress]);

  // Set default active peer if none selected
  useEffect(() => {
    if (!activePeer && peerThreads.length > 0) {
      setActivePeer(peerThreads[0].address);
    }
  }, [peerThreads, activePeer]);

  // Messages in active thread
  const activeThreadMessages = useMemo(() => {
    if (!activePeer) return [];
    return messages.filter(
      (m) =>
        m.sender.toLowerCase() === activePeer.toLowerCase() ||
        m.recipient.toLowerCase() === activePeer.toLowerCase()
    );
  }, [messages, activePeer]);

  // Decrypt single message
  const decryptMessage = async (msgId: number, cid: string) => {
    if (!sessionPrivateKey.trim()) {
      toast({
        title: "Private Key Required",
        description: "Please enter or paste your private key above to decrypt incoming messages.",
        variant: "destructive",
      });
      return;
    }

    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, isDecrypting: true } : m))
    );

    try {
      const encryptedBundle = await fetchFromIPFS(cid);
      const plaintext = await decryptBundle(encryptedBundle, sessionPrivateKey.trim());

      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, decryptedContent: plaintext, isDecrypting: false }
            : m
        )
      );
      toast({ title: "Decrypted", description: "Message payload unlocked" });
    } catch (err: unknown) {
      setMessages((prev) =>
        prev.map((m) => (m.id === msgId ? { ...m, isDecrypting: false } : m))
      );
      toast({
        title: "Decryption Failed",
        description: (err as Error).message || "Invalid private key for this message",
        variant: "destructive",
      });
    }
  };

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !signer || !contract) {
      toast({ title: "Connect Wallet", description: "Connect wallet to send encrypted message" });
      return;
    }
    if (!activePeer || !/^0x[a-fA-F0-9]{40}$/.test(activePeer)) {
      toast({ title: "Invalid Peer", description: "Please enter a valid recipient address", variant: "destructive" });
      return;
    }
    if (!recipientPublicKey.trim()) {
      toast({ title: "Public Key Required", description: "Recipient's RSA public key is needed to encrypt the payload", variant: "destructive" });
      return;
    }
    if (!newMessageText.trim()) return;

    setIsSending(true);

    try {
      // Step 1: Encrypt
      setCurrentStep("aes");
      const bundle = await createEncryptedBundle(newMessageText.trim(), recipientPublicKey.trim());

      // Step 2: IPFS
      setCurrentStep("ipfs");
      const cid = await uploadToIPFS(bundle);

      // Step 3: Sign
      setCurrentStep("sign");
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signer.signTypedData(
        EIP712_DOMAIN,
        EIP712_TYPES,
        {
          sender: account,
          recipient: activePeer,
          timestamp,
          cid,
        }
      );

      // Step 4: Dispatch On-Chain
      setCurrentStep("send");
      const tx = await contract.sendMessage(activePeer, cid, signature);
      await tx.wait();

      // Optional: Send attached POL
      if (attachPayment && parseFloat(attachPayment) > 0) {
        await sendPol(activePeer, attachPayment, `In-chat payment: ${cid.slice(0, 8)}`);
      }

      toast({
        title: "Message Delivered On-Chain",
        description: "Encrypted payload pinned to IPFS & verified on Polygon Amoy",
      });

      setNewMessageText("");
      setAttachPayment("");
      setCurrentStep(null);
      setIsSending(false);
      fetchMessages();
    } catch (err: unknown) {
      setCurrentStep(null);
      setIsSending(false);
      toast({
        title: "Delivery Failed",
        description: (err as Error).message || "Transaction rejected",
        variant: "destructive",
      });
    }
  };

  const activeContact = getContactByAddress(activePeer);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            04 — Signal-Grade Messaging
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            Encrypted Channels
          </h2>
          <p className="text-xs sm:text-sm text-[#6F6874] dark:text-[#A8A1AF] mt-1">
            End-to-end encrypted with RSA-2048 & AES-256-GCM. Metadata verified on Polygon Amoy, payloads hosted on IPFS.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowKeyManager(!showKeyManager)}
            className="chain-btn-outline py-2 px-3.5 text-xs font-semibold cursor-pointer"
          >
            <Key className="w-3.5 h-3.5 text-[#E5007D]" />
            <span>{showKeyManager ? "Hide Key Vault" : "Key Vault & Generator"}</span>
          </button>
          <button
            onClick={fetchMessages}
            disabled={isLoading}
            className="p-2 rounded-full border border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white transition-colors cursor-pointer"
            title="Refresh messages"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#E5007D]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Collapsible Key Generator / Vault */}
      {showKeyManager && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#16131A] border border-[#E9E4EA] dark:border-white/10 shadow-sm animate-in fade-in space-y-4">
          <KeyGenerator />
        </div>
      )}

      {/* Quick Session Decryption Key Entry Bar */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-[#17131A] dark:text-white shrink-0">
          <Unlock className="w-4 h-4 text-[#E5007D]" />
          <span className="font-bold">Session Decryption Key:</span>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
          <input
            type="password"
            placeholder="Paste your RSA Private Key to auto-decrypt..."
            value={sessionPrivateKey}
            onChange={(e) => handleSavePrivateKey(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none font-mono dark:text-white"
          />
        </div>
        <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF]">
          Stored in memory only
        </span>
      </div>

      {/* Unified Split-Pane Chat Interface */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 shadow-md overflow-hidden grid lg:grid-cols-12 min-h-[580px]">
        {/* Left Column: Contact Threads (4 cols) */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-[#E9E4EA] dark:border-white/10 flex flex-col bg-[#FCFBF8] dark:bg-[#120F16]">
          {/* Thread Search & New Chat */}
          <div className="p-3.5 border-b border-[#E9E4EA] dark:border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#6F6874] dark:text-[#A8A1AF]" />
                <input
                  type="text"
                  placeholder="Filter chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:outline-none dark:text-white"
                />
              </div>
              <button
                onClick={() => setShowAddressBook(true)}
                className="p-2 rounded-xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#E5007D] transition-colors cursor-pointer"
                title="Contacts"
              >
                <BookUser className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Threads List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E9E4EA] dark:divide-white/5">
            {peerThreads.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#6F6874] dark:text-[#A8A1AF] space-y-2">
                <p>No conversation threads yet.</p>
                <button
                  onClick={() => setShowAddressBook(true)}
                  className="text-[#E5007D] font-bold hover:underline cursor-pointer"
                >
                  Start a new chat from Address Book
                </button>
              </div>
            ) : (
              peerThreads
                .filter(
                  (t) =>
                    t.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.address.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((thread) => {
                  const isSelected = activePeer.toLowerCase() === thread.address.toLowerCase();
                  return (
                    <button
                      key={thread.address}
                      onClick={() => setActivePeer(thread.address)}
                      className={`w-full p-4 text-left transition-colors flex items-center gap-3 cursor-pointer ${
                        isSelected
                          ? "bg-[#FAF8F5] dark:bg-white/10 border-l-4 border-[#E5007D]"
                          : "hover:bg-[#FAF8F5]/60 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="w-9 h-9 rounded-full bg-[#E5007D]/10 text-[#E5007D] font-bold text-xs flex items-center justify-center shrink-0">
                        {thread.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-xs text-[#17131A] dark:text-white truncate">
                            {thread.displayName}
                          </span>
                          <span className="text-[10px] text-[#6F6874] dark:text-[#A8A1AF]">
                            {new Date(thread.lastMessage.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] truncate mt-0.5">
                          {thread.lastMessage.decryptedContent
                            ? thread.lastMessage.decryptedContent
                            : "🔒 Encrypted IPFS Payload"}
                        </p>
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* Right Column: Active Conversation Stream (8 cols) */}
        <div className="lg:col-span-8 flex flex-col bg-white dark:bg-[#16131A]">
          {/* Active Peer Header */}
          <div className="p-4 border-b border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] font-bold text-xs flex items-center justify-center">
                {activeContact ? activeContact.name.charAt(0).toUpperCase() : "P"}
              </div>
              <div className="min-w-0">
                <span className="font-heading font-extrabold text-sm text-[#17131A] dark:text-white block truncate">
                  {activeContact ? activeContact.name : activePeer ? `${activePeer.slice(0, 6)}...${activePeer.slice(-4)}` : "Select a Conversation"}
                </span>
                <span className="font-mono text-[10px] text-[#6F6874] dark:text-[#A8A1AF] block truncate">
                  {activePeer || "No peer chosen"}
                </span>
              </div>
            </div>

            {activePeer && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16845B]/10 text-[#16845B] text-[10px] font-bold">
                  <Shield className="w-3 h-3" />
                  <span>EIP-712 Active</span>
                </span>
              </div>
            )}
          </div>

          {/* Conversation Bubbles Stream */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[380px]">
            {!activePeer ? (
              <div className="py-24 text-center text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                Select a contact on the left or enter a Polygon address below to begin.
              </div>
            ) : activeThreadMessages.length === 0 ? (
              <div className="py-20 text-center space-y-2 text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                <Lock className="w-6 h-6 mx-auto text-[#E5007D]" />
                <p className="font-bold text-[#17131A] dark:text-white">Encrypted Channel Initialized</p>
                <p>Send your first end-to-end encrypted message below.</p>
              </div>
            ) : (
              activeThreadMessages.map((msg) => {
                const isSentByMe = msg.sender.toLowerCase() === account?.toLowerCase();
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isSentByMe ? "items-end" : "items-start"} space-y-1`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 shadow-sm ${
                        isSentByMe
                          ? "bg-[#E5007D] text-white rounded-br-none"
                          : "bg-[#FAF8F5] dark:bg-white/10 text-[#17131A] dark:text-white rounded-bl-none border border-[#E9E4EA] dark:border-white/10"
                      }`}
                    >
                      {msg.decryptedContent ? (
                        <p className="leading-relaxed font-sans select-text">{msg.decryptedContent}</p>
                      ) : (
                        <div className="space-y-2">
                          <p className="font-mono text-[11px] opacity-80 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            <span>Encrypted IPFS: {msg.cid.slice(0, 10)}...</span>
                          </p>
                          {!isSentByMe && (
                            <button
                              onClick={() => decryptMessage(msg.id, msg.cid)}
                              disabled={msg.isDecrypting}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-black/40 text-[#17131A] dark:text-white font-bold text-[10px] hover:bg-white/90 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              {msg.isDecrypting ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span>Decrypting...</span>
                                </>
                              ) : (
                                <>
                                  <Unlock className="w-3 h-3 text-[#E5007D]" />
                                  <span>Unlock Message</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}

                      <div
                        className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                          isSentByMe ? "border-white/20 text-white/70" : "border-[#E9E4EA] dark:border-white/10 text-[#6F6874] dark:text-[#A8A1AF]"
                        }`}
                      >
                        <span>{new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <a
                          href={`https://gateway.pinata.cloud/ipfs/${msg.cid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-0.5"
                        >
                          <span>IPFS</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Message Input & Attachment Bar */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-[#E9E4EA] dark:border-white/10 space-y-3 bg-[#FAF8F5]/50 dark:bg-white/5">
            {/* Recipient Address & Public Key Setup (When initiating) */}
            <div className="grid sm:grid-cols-2 gap-2 text-xs">
              <input
                type="text"
                placeholder="Recipient Address (0x...)"
                value={activePeer}
                onChange={(e) => setActivePeer(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none font-mono dark:text-white text-xs"
                required
              />
              <input
                type="text"
                placeholder="Recipient RSA Public Key..."
                value={recipientPublicKey}
                onChange={(e) => setRecipientPublicKey(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none font-mono dark:text-white text-xs"
                required
              />
            </div>

            {/* Input message row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type an encrypted message..."
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs rounded-2xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 focus:border-[#E5007D] focus:outline-none dark:text-white"
                required
              />

              {/* Optional Attached Payment Chip */}
              <div className="relative shrink-0">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="+POL"
                  value={attachPayment}
                  onChange={(e) => setAttachPayment(e.target.value)}
                  className="w-18 px-2 py-2.5 text-xs rounded-2xl bg-white dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 text-center font-mono dark:text-white"
                  title="Attach POL payment to message"
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="chain-btn-pink py-2.5 px-4 text-xs font-bold cursor-pointer shrink-0"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>

            {/* Sending status step indicator */}
            {isSending && (
              <div className="flex items-center gap-2 text-[11px] text-[#E5007D] font-medium animate-pulse">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>
                  {currentStep === "aes"
                    ? "Encrypting payload with AES-256..."
                    : currentStep === "ipfs"
                    ? "Pinning encrypted bundle to IPFS..."
                    : currentStep === "sign"
                    ? "Signing metadata with EIP-712..."
                    : "Confirming dispatch on Polygon Amoy..."}
                </span>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Address Book Modal */}
      <AddressBookModal
        isOpen={showAddressBook}
        onClose={() => setShowAddressBook(false)}
        onSelectContact={(addr) => {
          setActivePeer(addr);
        }}
      />
    </div>
  );
}
