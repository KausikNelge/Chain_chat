import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Key, Copy, RefreshCw, Eye, EyeOff, Shield, Download, Sparkles, Check } from "lucide-react";
import { generateRSAKeyPair, exportPublicKey, exportPrivateKey } from "@/lib/crypto";

export function KeyGenerator() {
  const [publicKey, setPublicKey] = useState("");
  const [privateKey, setPrivateKey] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [copiedPub, setCopiedPub] = useState(false);
  const [copiedPriv, setCopiedPriv] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const keyPair = await generateRSAKeyPair();
      const pubKey = await exportPublicKey(keyPair.publicKey);
      const privKey = await exportPrivateKey(keyPair.privateKey);

      setPublicKey(pubKey);
      setPrivateKey(privKey);

      toast({ title: "RSA Keypair Ready", description: "RSA-2048 keys generated in client memory" });
    } catch (error) {
      console.error("Key generation error:", error);
      toast({ title: "Generation Failed", description: "Could not generate keypair", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, isPriv: boolean) => {
    await navigator.clipboard.writeText(text);
    if (isPriv) {
      setCopiedPriv(true);
      setTimeout(() => setCopiedPriv(false), 2000);
    } else {
      setCopiedPub(true);
      setTimeout(() => setCopiedPub(false), 2000);
    }
    toast({ title: "Copied!", description: "Key copied to clipboard" });
  };

  const downloadKey = (key: string, filename: string) => {
    const blob = new Blob([key], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white border border-[#E9E4EA] rounded-3xl p-7 sm:p-9 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-[#E9E4EA]">
        <div>
          <h3 className="font-heading font-extrabold text-xl text-[#17131A]">Cryptographic Key Management</h3>
          <p className="text-xs text-[#6F6874] mt-0.5">Generate RSA-2048 key pairs for end-to-end messaging</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#FCE7F3] border border-[#E5007D]/20 flex items-center justify-center text-[#E5007D]">
          <Key className="w-4 h-4" />
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full chain-btn-pink justify-center h-12 text-sm cursor-pointer disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-white" />
            <span>Computing RSA-2048 Prime Factors...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate New RSA-2048 Key Pair</span>
          </>
        )}
      </button>

      {publicKey && (
        <div className="space-y-6 pt-2">
          {/* Public Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#17131A] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#E5007D]" />
                <span>Public Key</span>
                <span className="text-[#6F6874] normal-case font-normal">(Share with sender)</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => copyToClipboard(publicKey, false)}
                  className="chain-btn-outline text-xs py-1 px-3 cursor-pointer"
                >
                  {copiedPub ? <Check className="w-3 h-3 text-[#16845B]" /> : <Copy className="w-3 h-3 text-[#6F6874]" />}
                  <span>{copiedPub ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => downloadKey(publicKey, "chainchat-public-key.pem")}
                  className="chain-btn-outline text-xs py-1 px-3 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-[#6F6874]" />
                  <span>Save</span>
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E4EA] font-mono text-xs text-[#17131A] break-all max-h-28 overflow-y-auto leading-relaxed">
              {publicKey}
            </div>
          </div>

          {/* Private Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[#C62845] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-[#C62845]" />
                <span>Private Key</span>
                <span className="text-[#6F6874] normal-case font-normal">(Keep confidential)</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="chain-btn-outline text-xs py-1 px-3 cursor-pointer"
                >
                  {showPrivateKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  <span>{showPrivateKey ? "Hide" : "Reveal"}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(privateKey, true)}
                  className="chain-btn-outline text-xs py-1 px-3 cursor-pointer"
                >
                  {copiedPriv ? <Check className="w-3 h-3 text-[#16845B]" /> : <Copy className="w-3 h-3 text-[#6F6874]" />}
                  <span>{copiedPriv ? "Copied" : "Copy"}</span>
                </button>
                <button
                  onClick={() => downloadKey(privateKey, "chainchat-private-key.pem")}
                  className="chain-btn-outline text-xs py-1 px-3 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-[#6F6874]" />
                  <span>Save</span>
                </button>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E9E4EA] font-mono text-xs text-[#17131A] break-all max-h-28 overflow-y-auto leading-relaxed">
              {showPrivateKey ? privateKey : "•".repeat(64)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
