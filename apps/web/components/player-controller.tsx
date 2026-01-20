// components/player/player-controller.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Joystick } from "@/components/player-joystick";
import { sendPlayerInput } from "@/lib/player-realtime";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PlayerController({
  ws,
  playerId,
  name,
  number,
  code,
}: {
  ws: WebSocket;
  playerId: string;
  name: string;
  number: number;
  code: string;
}) {
  const [status, setStatus] = useState<"connected" | "closed" | "error">(
    ws.readyState === WebSocket.OPEN ? "connected" : "connected"
  );

  const vxRef = useRef(0);
  const vyRef = useRef(0);

  useEffect(() => {
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("error");
  }, [ws]);

  // send input at 20Hz
  useEffect(() => {
    const interval = setInterval(() => {
      sendPlayerInput(ws, {
        playerId,
        vx: clamp(vxRef.current, -1, 1),
        vy: clamp(vyRef.current, -1, 1),
        t: Date.now(),
      });
    }, 50);

    return () => clearInterval(interval);
  }, [ws, playerId]);

  const getStatusIcon = () => {
    switch (status) {
      case "connected":
        return <Wifi className="size-3.5" />;
      case "error":
        return <AlertCircle className="size-3.5" />;
      default:
        return <WifiOff className="size-3.5" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "text-green-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-red-700 relative">
      {/* Metadata box at top */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg px-4 py-3 shadow-lg">
          <div className="flex items-center gap-4 text-white text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`font-medium capitalize ${getStatusColor()}`}>
                {status}
              </span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-white/70">Game:</span>
              <span className="font-bold tracking-wider">{code.toUpperCase()}</span>
            </div>
            <div className="h-4 w-px bg-white/30" />
            <div className="flex items-center gap-2">
              <span className="text-white/70">Player:</span>
              <span className="font-semibold">#{number}</span>
              <span className="font-medium">{name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Centered joystick */}
      <div className="flex flex-1 items-center justify-center">
        <Joystick
          onChange={(v) => {
            vxRef.current = v.x;
            vyRef.current = v.y;
          }}
          size={180}
          deadzone={0.12}
          smoothing={0.25}
        />
      </div>
    </div>
  );
}
