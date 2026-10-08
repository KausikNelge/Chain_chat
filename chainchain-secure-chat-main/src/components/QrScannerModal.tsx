import { useState, useRef, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X, Camera, RefreshCw, Upload, AlertCircle, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (data: { recipientAddress: string; amount?: string; label?: string }) => void;
}

export function QrScannerModal({ isOpen, onClose, onScanSuccess }: QrScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCameraError, setHasCameraError] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualInput, setManualInput] = useState("");
  const scanIntervalRef = useRef<number | null>(null);

  // Trigger vibration haptic
  const triggerHaptic = useCallback((pattern: number | number[] = 50) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Haptic unsupported
      }
    }
  }, []);

  // Parse payment string
  const parsePaymentString = useCallback((raw: string) => {
    const trimmed = raw.trim();

    // 1. JSON Payload from Chain Chat
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.address && (parsed.address.startsWith("0x") || parsed.recipientAddress)) {
        return {
          recipientAddress: parsed.address || parsed.recipientAddress,
          amount: parsed.amount ? String(parsed.amount) : undefined,
          label: parsed.label || "Scanned QR",
        };
      }
    } catch {
      // Not JSON
    }

    // 2. URL format (e.g. https://chainchat.tech/?pay=0x...&amount=5.0)
    try {
      if (trimmed.includes("pay=") || trimmed.includes("recipient=")) {
        const url = new URL(trimmed);
        const address = url.searchParams.get("pay") || url.searchParams.get("recipient") || url.searchParams.get("address");
        const amount = url.searchParams.get("amount") || undefined;
        const label = url.searchParams.get("note") || url.searchParams.get("label") || "Payment Link";
        if (address && address.startsWith("0x") && address.length === 42) {
          return { recipientAddress: address, amount, label };
        }
      }
    } catch {
      // Not valid URL
    }

    // 3. EIP-681 / ethereum: format
    if (trimmed.startsWith("ethereum:")) {
      const match = trimmed.match(/ethereum:(0x[a-fA-F0-9]{40})/);
      if (match) {
        const valMatch = trimmed.match(/[?&]value=([0-9.]+)/);
        let amount: string | undefined = undefined;
        if (valMatch) {
          const rawVal = parseFloat(valMatch[1]);
          // Check if value is in Wei (>= 1e15) or formatted
          amount = rawVal >= 1e15 ? (rawVal / 1e18).toString() : rawVal.toString();
        }
        return {
          recipientAddress: match[1],
          amount,
          label: "Ethereum Contactless QR",
        };
      }
    }

    // 4. Raw Ethereum / Polygon address
    const hexMatch = trimmed.match(/0x[a-fA-F0-9]{40}/);
    if (hexMatch) {
      return {
        recipientAddress: hexMatch[0],
        label: "Scanned Wallet Address",
      };
    }

    return null;
  }, []);

  const handleValidResult = useCallback((decoded: string) => {
    const result = parsePaymentString(decoded);
    if (result) {
      triggerHaptic([40, 30, 60]);
      onScanSuccess(result);
      onClose();
      toast({
        title: "Payment Code Recognized",
        description: `Recipient: ${result.recipientAddress.slice(0, 6)}...${result.recipientAddress.slice(-4)}${
          result.amount ? ` · ${result.amount} POL` : ""
        }`,
      });
    } else {
      toast({
        title: "Invalid QR Code",
        description: "No compatible payment address found in scanned code.",
        variant: "destructive",
      });
    }
  }, [parsePaymentString, triggerHaptic, onScanSuccess, onClose]);

  // Start Camera
  const startCamera = useCallback(async () => {
    setHasCameraError(false);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasCameraError(true);
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setHasCameraError(true);
      setCameraActive(false);
    }
  }, [facingMode, stream]);

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setCameraActive(false);
  }, [stream]);

  // QR detection loop via native BarcodeDetector
  useEffect(() => {
    if (!isOpen || !cameraActive || !videoRef.current) return;

    // Check if browser has native BarcodeDetector (Android Chrome & desktop Chrome)
    const hasBarcodeDetector = "BarcodeDetector" in window;
    if (!hasBarcodeDetector) return;

    try {
      const barcodeDetector = new (window as unknown as {
        BarcodeDetector: new (opts: { formats: string[] }) => {
          detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
        };
      }).BarcodeDetector({ formats: ["qr_code"] });

      scanIntervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;
        try {
          const barcodes = await barcodeDetector.detect(videoRef.current);
          if (barcodes.length > 0 && barcodes[0].rawValue) {
            handleValidResult(barcodes[0].rawValue);
          }
        } catch {
          // Frame analysis error
        }
      }, 400);
    } catch (e) {
      console.warn("BarcodeDetector error:", e);
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isOpen, cameraActive, handleValidResult]);

  // Lifecycle
  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  // Flip camera
  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Handle Manual Input Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleValidResult(manualInput.trim());
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-[#17131A] text-white border border-white/10 rounded-3xl">
        {/* Header */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[#E5007D]" />
            <h3 className="font-heading font-extrabold text-base tracking-tight">
              Scan Payment QR Code
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder View */}
        <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              cameraActive ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Camera Scanning Reticle Overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
            <div className="relative w-64 h-64 border-2 border-[#E5007D]/80 rounded-3xl shadow-2xl flex items-center justify-center overflow-hidden">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />

              {/* Animated Laser Scanning Line */}
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#E5007D] to-transparent shadow-[0_0_15px_#E5007D] animate-laserScan" />
            </div>

            <p className="mt-4 text-xs font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              Align Merchant QR within the frame
            </p>
          </div>

          {/* Fallback if camera error / blocked */}
          {hasCameraError && (
            <div className="absolute inset-0 bg-[#17131A] p-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#C62845]/20 flex items-center justify-center text-[#C62845]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-bold text-sm text-white">Camera Permission Needed</h4>
                <p className="text-xs text-white/60 max-w-xs">
                  Enable camera access in your browser or paste the payment address / URL manually below.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls & Manual Paste Option */}
        <div className="p-5 space-y-4 bg-[#1F1A24]">
          <div className="flex items-center justify-between text-xs text-white/70">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Flip Camera ({facingMode === "environment" ? "Rear" : "Front"})</span>
            </button>

            <span className="text-[11px] text-white/50">Auto-Detecting QR</span>
          </div>

          {/* Manual Address or Link Input */}
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder="Paste 0x address or payment URL..."
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#E5007D] font-mono"
            />
            <button
              type="submit"
              disabled={!manualInput.trim()}
              className="px-4 py-2 rounded-xl bg-[#E5007D] text-white text-xs font-bold hover:bg-[#F50085] transition-colors disabled:opacity-40 cursor-pointer"
            >
              Load
            </button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
