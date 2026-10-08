import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/context/WalletContext";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Inbox as InboxIcon, Unlock, ShieldCheck, Clock, User, Loader2, RefreshCw, Mail } from "lucide-react";
import { decryptBundle } from "@/lib/crypto";
import { fetchFromIPFS } from "@/lib/ipfs";

interface RawMessage {
  id: bigint;
  sender: string;
  recipient: string;
  timestamp: bigint;
  cid: string;
  signature: string;
}

interface Message {
  id: number;
  sender: string;
  recipient: string;
  timestamp: number;
  cid: string;
  signature: string;
  decryptedContent?: string;
  isVerified?: boolean;
}

export function Inbox() {
  const { account, isCorrectNetwork, contract } = useWallet();

  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [privateKey, setPrivateKey] = useState("");
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Fetch verified messages from Polygon Amoy smart contract
  const fetchMessages = useCallback(async () => {
    if (!account || !contract) return;

    setIsLoading(true);
    try {
      const data = (await contract.getMessagesForUser(account)) as RawMessage[];

      const formattedMessages = data.map((msg: RawMessage) => ({
        id: Number(msg.id),
        sender: msg.sender,
        recipient: msg.recipient,
        timestamp: Number(msg.timestamp),
        cid: msg.cid,
        signature: msg.signature,
        decryptedContent: undefined,
        isVerified: false
      }));

      setMessages(formattedMessages.reverse());
    } catch (error) {
      console.error("Fetch error:", error);
      toast({ title: "Fetch Failed", description: "Could not read messages from contract", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [account, contract]);

  useEffect(() => {
    if (account && isCorrectNetwork && contract) fetchMessages();
  }, [account, isCorrectNetwork, contract, fetchMessages]);

  // Decrypt logic: IPFS payload -> AES + RSA decryption
  const handleDecrypt = async () => {
    if (!selectedMessage || !privateKey) return;

    setIsDecrypting(true);
    try {
      const bundle = await fetchFromIPFS(selectedMessage.cid);
      const decryptedText = await decryptBundle(bundle, privateKey);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, decryptedContent: decryptedText, isVerified: true }
            : m
        )
      );

      setSelectedMessage(null);
      setPrivateKey("");
      toast({ title: "Decrypted!", description: "Message verified and unlocked successfully" });
    } catch (error) {
      console.error("Decrypt error:", error);
      toast({ title: "Decryption Failed", description: "Invalid private key or payload error", variant: "destructive" });
    } finally {
      setIsDecrypting(false);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatTime = (ts: number) => {
    const date = new Date(ts * 1000);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hrs < 24) return `${hrs}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  if (!account) {
    return (
      <div className="bg-white border border-[#E9E4EA] rounded-3xl p-12 text-center shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#FAF8F5] border border-[#E9E4EA] flex items-center justify-center mb-4">
          <InboxIcon className="w-6 h-6 text-[#6F6874]" />
        </div>
        <h4 className="font-heading font-extrabold text-lg text-[#17131A]">Wallet Not Connected</h4>
        <p className="text-[#6F6874] text-xs mt-1">Connect your account above to fetch your encrypted on-chain inbox.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E9E4EA] rounded-3xl p-7 sm:p-9 space-y-6 shadow-sm">
      <div className="flex justify-between items-center pb-4 border-b border-[#E9E4EA]">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-[#17131A]">Encrypted Inbox</h3>
          <p className="text-xs text-[#6F6874] mt-0.5">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'} stored on-chain
          </p>
        </div>
        <button
          onClick={fetchMessages}
          disabled={isLoading}
          className="w-9 h-9 rounded-full bg-[#FAF8F5] hover:bg-[#F2EFF2] text-[#6F6874] hover:text-[#17131A] flex items-center justify-center border border-[#E9E4EA] transition-colors cursor-pointer"
          title="Refresh Inbox"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-3">
        {messages.length === 0 && !isLoading && (
          <div className="py-14 text-center">
            <Mail className="w-10 h-10 mx-auto text-[#6F6874]/40 mb-3" />
            <h4 className="font-heading font-bold text-base text-[#17131A]">No Messages Yet</h4>
            <p className="text-xs text-[#6F6874] mt-1 max-w-xs mx-auto">
              Any encrypted messages sent to your address on Polygon Amoy will appear here.
            </p>
          </div>
        )}

        {isLoading && (
          <div className="py-12 text-center space-y-2">
            <Loader2 className="w-6 h-6 mx-auto text-[#E5007D] animate-spin" />
            <p className="text-xs text-[#6F6874]">Querying Polygon Amoy contract...</p>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E9E4EA] hover:border-[#D6D0D8] transition-all"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#FCE7F3] flex items-center justify-center flex-shrink-0">
                    <User className="w-3.5 h-3.5 text-[#E5007D]" />
                  </div>
                  <span className="text-xs font-mono text-[#17131A] font-semibold">{formatAddress(msg.sender)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#6F6874] pl-8">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(msg.timestamp)}</span>
                </div>
              </div>

              {!msg.decryptedContent ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      onClick={() => setSelectedMessage(msg)}
                      className="chain-btn-outline text-xs py-1.5 px-3.5 cursor-pointer flex-shrink-0 gap-1.5"
                    >
                      <Unlock className="w-3 h-3 text-[#E5007D]" />
                      <span>Unlock</span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border border-[#E9E4EA] text-[#17131A] sm:rounded-3xl p-6">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl font-bold text-[#17131A]">Unlock Message</DialogTitle>
                      <DialogDescription className="text-xs text-[#6F6874]">
                        Paste your RSA-2048 private key to decrypt this payload
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 pt-3">
                      <Input
                        type="password"
                        placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="bg-[#FAF8F5] border-[#E9E4EA] text-[#17131A] rounded-xl font-mono text-xs focus-visible:ring-[#E5007D]"
                      />
                      <button
                        onClick={handleDecrypt}
                        disabled={isDecrypting}
                        className="w-full chain-btn-pink justify-center text-xs py-3 cursor-pointer"
                      >
                        {isDecrypting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>Decrypting Payload...</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4 text-white" />
                            <span>Decrypt Message</span>
                          </>
                        )}
                      </button>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16845B]/10 border border-[#16845B]/20">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#16845B]" />
                  <span className="text-[11px] text-[#16845B] font-bold">Decrypted</span>
                </div>
              )}
            </div>

            {msg.decryptedContent && (
              <div className="mt-3.5 p-4 rounded-xl bg-white border border-[#E5007D]/30 text-xs text-[#17131A] leading-relaxed font-mono shadow-sm">
                {msg.decryptedContent}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}