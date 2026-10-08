import React, { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { sound } from "@/lib/audio";
import { toast } from "@/hooks/use-toast";
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Globe,
  Fingerprint,
  Key,
  Clock,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Lock,
  UserCheck,
  Check,
} from "lucide-react";

interface DeviceSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SecurityCenter() {
  const { account } = useWallet();
  const [securityScore, setSecurityScore] = useState(92);
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);
  const [pinEnabled, setPinEnabled] = useState(true);
  const [lastVerified] = useState("Today, 4:12 PM · Polygon Amoy RPC");
  const [sessions, setSessions] = useState<DeviceSession[]>([
    {
      id: "sess-1",
      device: "Windows Desktop PC",
      browser: "Chrome 131.0",
      location: "Bengaluru, Karnataka, IN",
      ip: "103.21.244.18",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-2",
      device: "Google Pixel 8 Pro",
      browser: "Chrome Mobile 131",
      location: "Mumbai, Maharashtra, IN",
      ip: "49.37.112.94",
      lastActive: "2 hours ago",
      isCurrent: false,
    },
    {
      id: "sess-3",
      device: "Apple MacBook Air",
      browser: "Safari 17.4",
      location: "Bengaluru, Karnataka, IN",
      ip: "103.21.244.18",
      lastActive: "Yesterday, 9:45 PM",
      isCurrent: false,
    },
  ]);

  const [securityEvents, setSecurityEvents] = useState([
    {
      id: "ev-1",
      title: "Contract Signature Verified",
      detail: "EIP-712 session key signed on Polygon Amoy",
      time: "10 mins ago",
      status: "success",
    },
    {
      id: "ev-2",
      title: "Biometric Approval Successful",
      detail: "WebAuthn TouchID/Passkey verification passed",
      time: "2 hours ago",
      status: "success",
    },
    {
      id: "ev-3",
      title: "New Device Login Approved",
      detail: "Google Pixel 8 authorized via wallet signature",
      time: "5 hours ago",
      status: "info",
    },
  ]);

  const handleRevokeAll = () => {
    sound.playFreezeSound();
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setSecurityScore(95);
    toast({
      title: "All Other Sessions Revoked",
      description: "Signed out of 2 remote devices. Active cryptographic session maintained.",
    });
  };

  const handleToggleBiometrics = () => {
    sound.playCardTap();
    setBiometricsEnabled((prev) => {
      const next = !prev;
      toast({
        title: next ? "Biometrics Enabled" : "Biometrics Disabled",
        description: next
          ? "Hardware WebAuthn Passkey active for signing."
          : "Biometric prompt bypassed.",
      });
      return next;
    });
  };

  const handleTogglePin = () => {
    sound.playCardTap();
    setPinEnabled((prev) => {
      const next = !prev;
      toast({
        title: next ? "Transaction PIN Enforced" : "Transaction PIN Disabled",
        description: next ? "6-digit PIN required above 5 POL." : "Direct signing active.",
      });
      return next;
    });
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto select-none">
      {/* Header Statement */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#E9E4EA] dark:border-white/10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#E5007D] block mb-1">
            06 — Defense Architecture
          </span>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-[#17131A] dark:text-white tracking-tight">
            Security Center
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6F6874] dark:text-[#A8A1AF]">
          <Clock className="w-3.5 h-3.5 text-[#16845B]" />
          <span>Last verified: {lastVerified}</span>
        </div>
      </div>

      {/* Suspicious Activity Banner: Clean, Authoritative */}
      <div className="p-4 rounded-2xl bg-[#16845B]/10 border border-[#16845B]/25 flex items-center justify-between text-xs text-[#16845B]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#16845B] text-white flex items-center justify-center font-bold">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm block text-[#17131A] dark:text-white">
              All Security Systems Nominal
            </span>
            <span className="text-[#6F6874] dark:text-[#A8A1AF]">
              Zero unauthorized signing requests or replay vectors detected in the past 30 days.
            </span>
          </div>
        </div>
        <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-[#16845B] text-white font-extrabold text-[10px] uppercase tracking-wider">
          Audited
        </span>
      </div>

      {/* Grid: Security Score Meter (Left) + Credential Controls (Right) */}
      <div className="grid md:grid-cols-12 gap-6 items-stretch">
        {/* Security Score Widget */}
        <div className="md:col-span-5 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block mb-3">
              Trust & Hygiene Index
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-heading font-extrabold text-6xl text-[#17131A] dark:text-white odometer-num">
                {securityScore}
              </span>
              <span className="text-xl font-bold text-[#6F6874] dark:text-[#A8A1AF]">/100</span>
              <span className="ml-auto px-3 py-1 rounded-full bg-[#16845B]/15 text-[#16845B] text-xs font-extrabold uppercase tracking-wider">
                Excellent
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="w-full h-2.5 bg-[#FAF8F5] dark:bg-white/10 rounded-full mt-4 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#16845B] via-[#E5007D] to-[#E5007D] transition-all duration-1000"
                style={{ width: `${securityScore}%` }}
              />
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-[#E9E4EA] dark:border-white/10 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-[#6F6874] dark:text-[#A8A1AF]">ECDSA Key Strength</span>
              <span className="font-bold text-[#17131A] dark:text-white">secp256k1 (256-bit)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6F6874] dark:text-[#A8A1AF]">Custodial Vulnerability</span>
              <span className="font-bold text-[#16845B]">0% (Self-Custodial)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6F6874] dark:text-[#A8A1AF]">Replay Protection</span>
              <span className="font-bold text-[#17131A] dark:text-white">EIP-155 Active (Amoy)</span>
            </div>
          </div>
        </div>

        {/* Security Controls: PIN & Biometrics */}
        <div className="md:col-span-7 bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-5 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6F6874] dark:text-[#A8A1AF] block mb-4">
              Cryptographic Access Guards
            </span>

            <div className="space-y-3.5">
              {/* Biometrics Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">
                      Biometric Passkey / WebAuthn
                    </span>
                    <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                      Authorize contactless & high-value transfers with fingerprint or FaceID.
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleToggleBiometrics}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                    biometricsEnabled ? "bg-[#E5007D]" : "bg-gray-300 dark:bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      biometricsEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Transaction PIN Toggle */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white block">
                      Transaction PIN Challenge
                    </span>
                    <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
                      Requires secure secondary 6-digit confirmation above 5 POL.
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleTogglePin}
                  className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer ${
                    pinEnabled ? "bg-[#E5007D]" : "bg-gray-300 dark:bg-white/20"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      pinEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#6F6874] dark:text-[#A8A1AF] pt-2">
            <ShieldCheck className="w-4 h-4 text-[#16845B]" />
            <span>Encrypted local storage with Argon2 key derivation.</span>
          </div>
        </div>
      </div>

      {/* Active Device Sessions List with "Revoke All Sessions" */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E9E4EA] dark:border-white/10">
          <div>
            <span className="font-heading font-bold text-lg text-[#17131A] dark:text-white block">
              Active Authorized Sessions
            </span>
            <span className="text-xs text-[#6F6874] dark:text-[#A8A1AF]">
              {sessions.length} devices connected to your Chain Chat account
            </span>
          </div>

          {sessions.length > 1 && (
            <button
              onClick={handleRevokeAll}
              className="px-3.5 py-1.5 rounded-full bg-[#FCE7F3] dark:bg-[#E5007D]/20 text-[#E5007D] border border-[#E5007D]/30 text-xs font-bold hover:bg-[#E5007D] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Revoke All Other Sessions</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-[#E9E4EA] dark:divide-white/10">
          {sessions.map((sess) => (
            <div key={sess.id} className="py-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-center text-[#17131A] dark:text-white">
                  {sess.device.includes("PC") ? (
                    <Laptop className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-[#17131A] dark:text-white">
                      {sess.device}
                    </span>
                    {sess.isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[#16845B]/15 text-[#16845B] text-[10px] font-extrabold uppercase">
                        This Device
                      </span>
                    )}
                  </div>
                  <span className="text-[#6F6874] dark:text-[#A8A1AF] mt-0.5 block">
                    {sess.browser} · {sess.location} · {sess.ip}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`font-semibold block ${sess.isCurrent ? "text-[#16845B]" : "text-[#6F6874] dark:text-[#A8A1AF]"}`}>
                  {sess.lastActive}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Event Timeline */}
      <div className="bg-white dark:bg-[#16131A] rounded-3xl border border-[#E9E4EA] dark:border-white/10 p-6 sm:p-7 shadow-sm space-y-4">
        <span className="font-heading font-bold text-lg text-[#17131A] dark:text-white block">
          Security Event Audit Timeline
        </span>
        <div className="space-y-3">
          {securityEvents.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-white/5 border border-[#E9E4EA] dark:border-white/10 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[#16845B]" />
                <div>
                  <span className="font-bold text-[#17131A] dark:text-white block">
                    {ev.title}
                  </span>
                  <span className="text-[#6F6874] dark:text-[#A8A1AF]">
                    {ev.detail}
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-[#6F6874] dark:text-[#A8A1AF] font-mono">
                {ev.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
