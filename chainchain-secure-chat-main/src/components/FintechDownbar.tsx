import React from "react";
import { sound } from "@/lib/audio";
import {
  PieChart,
  ShieldCheck,
  Sliders,
  History,
  Terminal,
  ChevronUp,
} from "lucide-react";

interface FintechDownbarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function FintechDownbar({
  activeSection,
  onSectionChange,
}: FintechDownbarProps) {
  const downbarItems = [
    {
      id: "networth",
      label: "Net Worth",
      icon: PieChart,
      badge: "Analytics",
    },
    {
      id: "security",
      label: "Security",
      icon: ShieldCheck,
      badge: "Audited",
    },
    {
      id: "spending",
      label: "Spending",
      icon: Sliders,
      badge: "Limits",
    },
    {
      id: "activity",
      label: "Activity",
      icon: History,
      badge: "Passbook",
    },
    {
      id: "developer",
      label: "Dev API",
      icon: Terminal,
      badge: "Console",
    },
  ];

  return (
    <aside
      aria-label="Secondary Navigation Dock"
      className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[94vw] sm:max-w-none select-none animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-full bg-white/92 dark:bg-[#16131A]/92 backdrop-blur-xl border border-[#E9E4EA] dark:border-white/10 shadow-[0_16px_40px_rgba(23,19,26,0.14)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
        {/* Dock Section Label Pill */}
        <div className="hidden lg:flex items-center gap-1.5 pl-3 pr-2 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[#6F6874] dark:text-[#A8A1AF] border-r border-[#E9E4EA] dark:border-white/10 mr-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E5007D] animate-pulse" />
          <span>FINTECH HUB</span>
        </div>

        {/* Downbar Navigation Pills */}
        {downbarItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playCardTap();
                onSectionChange(item.id);
              }}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#17131A] dark:bg-white text-white dark:text-[#17131A] shadow-md scale-102"
                  : "text-[#6F6874] dark:text-[#A8A1AF] hover:text-[#17131A] dark:hover:text-white hover:bg-[#FAF8F5] dark:hover:bg-white/5"
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  isActive ? "text-[#E5007D]" : "opacity-80"
                }`}
              />
              <span className="text-[11px] sm:text-xs tracking-tight">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5007D] ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
