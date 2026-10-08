import { useEffect, useCallback } from "react";

export interface SyncPaymentEvent {
  type: "PEER_NFC_TAP" | "PEER_TX_SUBMITTED" | "PEER_TX_CONFIRMED" | "RESET";
  payload: {
    orderId?: string;
    amount?: string;
    sender?: string;
    recipient?: string;
    txHash?: string;
    timestamp: number;
  };
}

export function usePaymentSync(onEventReceived: (event: SyncPaymentEvent) => void) {
  const broadcastChannelName = "chainchat_pos_nfc_channel";

  const broadcastEvent = useCallback((event: SyncPaymentEvent) => {
    // 1. BroadcastChannel for same browser / multiple windows / tabs
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel(broadcastChannelName);
        channel.postMessage(event);
        channel.close();
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }

    // 2. LocalStorage Event fallback for wider browser compatibility
    try {
      localStorage.setItem("chainchat_last_pos_event", JSON.stringify({
        ...event,
        _nonce: Math.random(),
      }));
    } catch {
      // Storage unavailable
    }
  }, []);

  useEffect(() => {
    // Listen via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel(broadcastChannelName);
      channel.onmessage = (msg: MessageEvent<SyncPaymentEvent>) => {
        if (msg.data && msg.data.type) {
          onEventReceived(msg.data);
        }
      };
    }

    // Listen via storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "chainchat_last_pos_event" && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as SyncPaymentEvent;
          if (parsed && parsed.type) {
            onEventReceived(parsed);
          }
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (channel) channel.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, [onEventReceived]);

  return { broadcastEvent };
}
