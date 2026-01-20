"use client";

import React, { useEffect, useState } from "react";
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
  Grid,
  Lock,
  LockOpen
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type NavItem = "walkthrough" | "live" | "settings";
type ConnectionStatus = "connecting" | "connected" | "closed" | "error";

type HostNavBarProps = {
  status?: ConnectionStatus;
  playerCount?: number;
  onMovementLockChange?: (locked: boolean) => void;
};

type UtilityIcon = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  id?: "lock";
  onClick?: () => void;
};

export function HostNavBar({
  status = "connecting",
  playerCount = 0,
  onMovementLockChange,
}: HostNavBarProps) {
  const [activeNav, setActiveNav] = useState<NavItem>("walkthrough");
  const [hoveredNav, setHoveredNav] = useState<NavItem | null>(null);
  const [liveMovementLocked, setLiveMovementLocked] = useState(false);

  const navItems = [
    { 
      id: "walkthrough" as NavItem, 
      label: "Walkthrough", 
      icon: Footprints,
      color: "cyan",
      style: "bg-cyan-500 text-cyan-50 border-cyan-400 shadow-cyan-500/50 hover:bg-cyan-600 hover:text-cyan-50 hover:border-cyan-400 hover:shadow-cyan-500/50",
    },
    { 
      id: "live" as NavItem, 
      label: "Live", 
      icon: Play,
      color: "lime",
      style: "bg-lime-500 text-lime-50 border-lime-400 shadow-lime-500/50 hover:bg-lime-600 hover:text-lime-50 hover:border-lime-400 hover:shadow-lime-500/50",
    },
    { 
      id: "settings" as NavItem, 
      label: "Settings", 
      icon: Settings,
      color: "amber",
      style: "bg-amber-500 text-amber-50 border-amber-400 shadow-amber-500/50 hover:bg-amber-600 hover:text-amber-50 hover:border-amber-400 hover:shadow-amber-500/50",
    },
  ];

  // Utility icons for each menu
  const utilityIcons: Record<NavItem, UtilityIcon[]> = {
    walkthrough: [
      { icon: Pencil, title: "Edit Walkthrough" },
      { icon: Map, title: "Map View" },
      { icon: QrCode, title: "QR Code" },
      { icon: MoreVertical, title: "More options" },
    ],
    live: [],
    settings: [
      { icon: Users, title: "Players" },
      { icon: Shirt, title: "Jersey" },
      { icon: Grid, title: "Field" },
      { icon: QrCode, title: "QR Code" },
      { icon: MoreVertical, title: "More options" },
    ],
  };

  const movementLocked = activeNav === "walkthrough" || liveMovementLocked;

  useEffect(() => {
    onMovementLockChange?.(movementLocked);
  }, [movementLocked, onMovementLockChange]);

  // Get utility icons for active menu
  const getUtilityIcons = (): UtilityIcon[] => {
    if (activeNav === "live") {
      return [
        {
          id: "lock",
          icon: liveMovementLocked ? Lock : LockOpen,
          title: liveMovementLocked ? "Unlock movement" : "Lock movement",
          onClick: () => setLiveMovementLocked((prev) => !prev),
        },
        { icon: RotateCcw, title: "Reset" },
        { icon: Layers, title: "Field Overlay" },
        { icon: QrCode, title: "QR Code" },
        { icon: MoreVertical, title: "More options" },
      ];
    }

    return utilityIcons[activeNav];
  };


  return (
    <nav className="relative z-50 w-full">
      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-transparent pointer-events-none" />
      
      {/* Main nav container */}
      <div className="relative border-b border-white/10 bg-black/10 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 w-full items-center justify-between px-10">
          {/* Left side - Primary navigation buttons */}
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              const isHovered = hoveredNav === item.id;
              const shouldDim = !isActive && !isHovered;
              
              return (
                <motion.div
                  key={item.id}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  animate={{
                    opacity: shouldDim ? 0.5 : 1,
                    scale: isActive ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    size="default"
                    onClick={() => setActiveNav(item.id)}
                    className={cn(
                      "relative flex items-center justify-center gap-2 font-semibold transition-all duration-200",
                      "h-10 rounded-full border-2 shadow-md px-4",
                      "focus:outline-none focus:ring-0 focus-visible:ring-0",
                      "active:outline-none active:ring-0",
                      item.style,
                      shouldDim && "grayscale-[0.3]"
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
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
                "flex items-center gap-2 rounded-xl border border-2 bg-white/5 px-3 py-1.5 shadow-md text-white",
                status === "connected" && "border-violet-500/30 bg-violet-500 shadow-violet-500/50 border-violet-400",
                status === "connecting" && "border-yellow-500/30 bg-yellow-500 border-yellow-400 shadow-yellow-500/50",
                status === "error" && "border-red-500/30 bg-red-500 border-red-400 shadow-red-500/50",
                status === "closed" && "border-gray-500/30 bg-gray-500 border-gray-400 shadow-gray-500/50"
              )}
            >
              {status === "connecting" ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span className="text-xs font-medium">Connecting</span>
                </>
              ) : status === "connected" ? (
                <>
                  <Wifi className="size-3.5 text-white" />
                  <span className="text-xs font-medium text-white">Connected</span>
                  <span className="text-xs font-semibold text-white">•</span>
                  <span className="text-xs font-medium text-white">{playerCount}</span>
                </>
              ) : status === "error" ? (
                <>
                  <Wifi className="size-3.5" />
                  <span className="text-xs font-medium">Error</span>
                </>
              ) : (
                <>
                  <Wifi className="size-3.5" />
                  <span className="text-xs font-medium">Disconnected</span>
                </>
              )}
            </motion.div>
          </div>

          {/* Right side - Utility icon buttons */}
          <div className="flex items-center gap-1.5">
            {getUtilityIcons().map((utility, index) => {
              const IconComponent = utility.icon;
              const activeItem = navItems.find(item => item.id === activeNav);
              const isLockButton = utility.id === "lock";
              
              // Get utility button style matching active button color
              const getUtilityButtonStyle = () => {
                if (!activeItem) return "";
                
                if (activeItem.color === "cyan") {
                  return "bg-cyan-500 text-cyan-50 border-cyan-400 shadow-cyan-500/50 hover:bg-cyan-600 hover:text-cyan-50 hover:border-cyan-400";
                } else if (activeItem.color === "lime") {
                  return "bg-lime-500 text-lime-50 border-lime-400 shadow-lime-500/50 hover:bg-lime-600 hover:text-lime-50 hover:border-lime-400";
                } else if (activeItem.color === "amber") {
                  return "bg-amber-500 text-amber-50 border-amber-400 shadow-amber-500/50 hover:bg-amber-600 hover:text-amber-50 hover:border-amber-400";
                }
                return "";
              };
              
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
                    className={cn(
                      "size-10 rounded-full border-2 shadow-md active:scale-[0.97]",
                      "focus:outline-none focus:ring-0 focus-visible:ring-0",
                      "active:outline-none active:ring-0",
                      getUtilityButtonStyle(),
                      isLockButton && liveMovementLocked && "ring-2 ring-white/70"
                    )}
                    title={utility.title}
                    onClick={utility.onClick}
                    aria-pressed={isLockButton ? liveMovementLocked : undefined}
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
