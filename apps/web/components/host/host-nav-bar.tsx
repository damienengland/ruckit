"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Play, 
  Settings, 
  RotateCcw, 
  MoreVertical, 
  QrCode, 
  Footprints, 
  Wifi, 
  Loader2,
  Pencil,
  Map,
  Layers,
  Shirt,
  Grid
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItem = "walkthrough" | "live" | "settings";
type ConnectionStatus = "connecting" | "connected" | "closed" | "error";

type HostNavBarProps = {
  status?: ConnectionStatus;
  playerCount?: number;
};

type UtilityIcon = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
};

export function HostNavBar({ status = "connecting", playerCount = 0 }: HostNavBarProps) {
  const [activeNav, setActiveNav] = useState<NavItem | null>(null);

  const navItems = [
    { id: "walkthrough" as NavItem, label: "Walkthrough", icon: Footprints },
    { id: "live" as NavItem, label: "Live", icon: Play },
    { id: "settings" as NavItem, label: "Settings", icon: Settings },
  ];

  // Utility icons for each menu
  const utilityIcons: Record<NavItem, UtilityIcon[]> = {
    walkthrough: [
      { icon: Pencil, title: "Edit Walkthrough" },
      { icon: Map, title: "Map View" },
      { icon: QrCode, title: "QR Code" },
      { icon: MoreVertical, title: "More options" },
    ],
    live: [
      { icon: RotateCcw, title: "Reset" },
      { icon: Layers, title: "Field Overlay" },
      { icon: QrCode, title: "QR Code" },
      { icon: MoreVertical, title: "More options" },
    ],
    settings: [
      { icon: Users, title: "Players" },
      { icon: Shirt, title: "Jersey" },
      { icon: Grid, title: "Field" },
      { icon: QrCode, title: "QR Code" },
      { icon: MoreVertical, title: "More options" },
    ],
  };

  // Get utility icons for active menu, or show default (QR + More)
  const getUtilityIcons = (): UtilityIcon[] => {
    if (activeNav && utilityIcons[activeNav]) {
      return utilityIcons[activeNav];
    }
    // Default icons when no menu is selected
    return [
      { icon: QrCode, title: "QR Code" },
      { icon: MoreVertical, title: "More options" },
    ];
  };

  return (
    <nav className="relative z-50 w-full">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent pointer-events-none" />
      
      {/* Main nav container */}
      <div className="relative border-b border-white/10 bg-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-10">
          {/* Left side - Primary navigation buttons */}
          <div className="flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              
              return (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => setActiveNav(isActive ? null : item.id)}
                    className={cn(
                      "relative gap-2 font-semibold transition-all duration-200",
                      "h-10 rounded-xl border border-white/10 bg-white/5 px-4",
                      "text-white/90 hover:bg-white/15 hover:text-white",
                      "hover:border-white/20 active:scale-[0.97]",
                      isActive && "bg-white/20 border-white/20 text-white shadow-lg"
                    )}
                    style={{
                      boxShadow: isActive
                        ? "0 8px 24px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1) inset"
                        : "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Center - Connection status indicator */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5",
                status === "connected" && "border-green-500/30 bg-green-500/10",
                status === "connecting" && "border-yellow-500/30 bg-yellow-500/10",
                status === "error" && "border-red-500/30 bg-red-500/10",
                status === "closed" && "border-gray-500/30 bg-gray-500/10"
              )}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }}
            >
              {status === "connecting" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin text-yellow-400" />
                  <span className="text-xs font-medium text-yellow-400/90">Connecting</span>
                </>
              ) : status === "connected" ? (
                <>
                  <Wifi className="size-3.5 text-green-400" />
                  <span className="text-xs font-medium text-green-400/90">Connected</span>
                  <span className="text-xs font-semibold text-green-400/70">•</span>
                  <span className="text-xs font-medium text-green-400/90">{playerCount}</span>
                </>
              ) : status === "error" ? (
                <>
                  <Wifi className="size-3.5 text-red-400" />
                  <span className="text-xs font-medium text-red-400/90">Error</span>
                </>
              ) : (
                <>
                  <Wifi className="size-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-400/90">Disconnected</span>
                </>
              )}
            </motion.div>
          </div>

          {/* Right side - Utility icon buttons */}
          <div className="flex items-center gap-1.5">
            {getUtilityIcons().map((utility, index) => {
              const IconComponent = utility.icon;
              return (
                <motion.div
                  key={`${activeNav}-${index}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-10 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/15 hover:border-white/20 hover:text-white active:scale-[0.97]"
                    title={utility.title}
                    style={{
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                    }}
                  >
                    <IconComponent className="size-4" />
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
