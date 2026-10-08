import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Send, Key, Upload, FileCheck, Loader2, CheckCircle2, Lock } from "lucide-react";
import { createEncryptedBundle } from "@/lib/crypto";
import { uploadToIPFS } from "@/lib/ipfs";
import { EIP712_DOMAIN, EIP712_TYPES } from "@/lib/constants";

interface EncryptionStep {
  id: string;
  label: string;
  icon: React.ElementType;
  status: "pending" | "active" | "complete";
}

export function SendMessage() {
  const { account, signer, contract, isCorrectNetwork } = useWallet();
  const [recipient, setRecipient] = useState("");
  const [recipientPublicKey, setRecipientPublicKey] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);

  const steps: EncryptionStep[] = [
    { id: "aes", label: "Encrypting with AES-256-GCM & RSA-2048", icon: Key, status: currentStep === "aes" ? "active" : currentStep ? "complete" : "pending" },
    { id: "ipfs", label: "Uploading payload to IPFS (Pinata)", icon: Upload, status: currentStep === "ipfs" ? "active" : ["sign", "send"].includes(currentStep || "") ? "complete" : "pending" },
    { id: "sign", label: "Cryptographic Metadata Signature (EIP-712)", icon: FileCheck, status: currentStep === "sign" ? "active" : currentStep === "send" ? "complete" : "pending" },
    { id: "send", label: "On-Chain Dispatch (Polygon Amoy)", icon: Send, status: currentStep === "send" ? "active" : "pending" },
  ];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !signer || !contract) {
      toast({ title: "Wallet Required", description: "Connect your wallet first", variant: "destructive" });
      return;
    }
    if (!isCorrectNetwork) {
      toast({ title: "Wrong Network", description: "Switch to Polygon Amoy Testnet", variant: "destructive" });
      return;
    }
    if (!recipient || !recipientPublicKey || !message) {
      toast({ title: "Missing Fields", description: "Please complete recipient, public key, and message", variant: "destructive" });
      return;
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(recipient)) {
      toast({ title: "Invalid Address", description: "Please enter a valid 40-character Ethereum address", variant: "destructive" });
      return;
    }

    setIsSending(true);

    try {
      // 1. Encrypt with AES-256-GCM + RSA-OAEP
      setCurrentStep("aes");
      const bundle = await createEncryptedBundle(message, recipientPublicKey);

      // 2. Upload to IPFS
      setCurrentStep("ipfs");
      const cid = await uploadToIPFS(bundle);

      // 3. Sign Metadata with EIP-712
      setCurrentStep("sign");
      const timestamp = Math.floor(Date.now() / 1000);
      const signature = await signer.signTypedData(
        EIP712_DOMAIN,
        EIP712_TYPES,
        { recipient, cid, timestamp }
      );

      // 4. Send Transaction on Chain
      setCurrentStep("send");
      const tx = await contract.sendMessage(recipient, cid, signature);
      await tx.wait();

      toast({
        title: "Encrypted Message Dispatched!",
        description: `Tx: ${tx.hash.slice(0, 10)}... | IPFS: ${cid.slice(0, 10)}...`,
      });

      setMessage("");
    } catch (error) {
      console.error("Send error:", error);
      const errorMessage = error instanceof Error ? error.message : "Encryption or transaction failed";
      toast({ title: "Failed to Dispatch", description: errorMessage, variant: "destructive" });
    } finally {
      setIsSending(false);
      setCurrentStep(null);
    }
  };

  return (
    <div className="bg-white border border-[#E9E4EA] rounded-3xl p-7 sm:p-9 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E9E4EA]">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-[#17131A]">Send Encrypted Message</h3>
          <p className="text-xs text-[#6F6874] mt-0.5">
            Client-side E2EE payload stored on IPFS · On-chain verification on Polygon Amoy
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FCE7F3] border border-[#E5007D]/20 flex items-center justify-center text-[#E5007D]">
          <Lock className="w-4 h-4" />
        </div>
      </div>

      {/* Progress Steps when dispatching */}
      {isSending && (
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E9E4EA] space-y-3">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-3">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step.status === 'complete'
                  ? 'bg-[#16845B]/15 text-[#16845B] border border-[#16845B]/30'
                  : step.status === 'active'
                  ? 'bg-[#FCE7F3] text-[#E5007D] border border-[#E5007D]/30'
                  : 'bg-white text-[#6F6874] border border-[#E9E4EA]'
              }`}>
                {step.status === 'active' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : step.status === 'complete' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#16845B]" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span className={`text-xs ${
                step.status === 'active' ? 'text-[#E5007D] font-bold' : step.status === 'complete' ? 'text-[#16845B]' : 'text-[#6F6874]'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#17131A] mb-1.5">
            Recipient Polygon Address
          </label>
          <Input
            placeholder="0x... (Recipient 40-character address)"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            disabled={isSending}
            className="bg-[#FAF8F5] border-[#E9E4EA] text-[#17131A] rounded-xl h-11 font-mono text-sm focus-visible:ring-[#E5007D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#17131A] mb-1.5">
            Recipient RSA-2048 Public Key
          </label>
          <Input
            placeholder="-----BEGIN PUBLIC KEY-----..."
            value={recipientPublicKey}
            onChange={(e) => setRecipientPublicKey(e.target.value)}
            disabled={isSending}
            className="bg-[#FAF8F5] border-[#E9E4EA] text-[#17131A] rounded-xl h-11 font-mono text-xs focus-visible:ring-[#E5007D]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#17131A] mb-1.5">
            Confidential Message
          </label>
          <Textarea
            rows={4}
            placeholder="Write your secret message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="bg-[#FAF8F5] border-[#E9E4EA] text-[#17131A] rounded-xl focus-visible:ring-[#E5007D]"
          />
        </div>

        <button
          type="submit"
          disabled={isSending || !account}
          className="w-full chain-btn-pink justify-center h-12 text-sm mt-2 cursor-pointer disabled:opacity-40"
        >
          {isSending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Encrypting & Broadcasting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>Encrypt & Dispatch Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}