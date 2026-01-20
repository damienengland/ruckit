// components/player/player-controller.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Joystick } from "@/components/player-joystick";
import { sendPlayerInput } from "@/lib/player-realtime";
import { Wifi, WifiOff, AlertCircle } from "lucide-react";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function PlayerController({
  ws,
  playerId,
  name,
  number,
  code,
  movementLocked = false,
}: {
  ws: WebSocket;
  playerId: string;
  name: string;
  number: number;
  code: string;
  movementLocked?: boolean;
}) {
  const [status, setStatus] = useState<"connected" | "closed" | "error">(
    ws.readyState === WebSocket.OPEN ? "connected" : "connected"
  );

  const vxRef = useRef(0);
  const vyRef = useRef(0);
  const targetVxRef = useRef(0);
  const targetVyRef = useRef(0);
  const lastSendTimeRef = useRef(0);

  // Smooth stop factor - how quickly velocity decays when joystick is released
  // Higher value = faster decay (0.1 = slow smooth stop, 0.25 = faster stop)
  const SMOOTH_STOP_FACTOR = 0.15;

  useEffect(() => {
    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("error");
  }, [ws]);

  useEffect(() => {
    if (!movementLocked) return;
    targetVxRef.current = 0;
    targetVyRef.current = 0;
    vxRef.current = 0;
    vyRef.current = 0;
    sendPlayerInput(ws, {
      playerId,
      vx: 0,
      vy: 0,
      t: Date.now(),
    });
  }, [movementLocked, playerId, ws]);

  // Send input at 20-30Hz with smooth stop deceleration
  useEffect(() => {
    // Clamp send rate to 20-30Hz (33.33ms to 50ms intervals)
    const MIN_INTERVAL_MS = 33.33; // 30Hz max (1000/30)
    const MAX_INTERVAL_MS = 50; // 20Hz min (1000/20)
    const TARGET_INTERVAL_MS = 40; // 25Hz target (middle of range)

    let animationFrameId: number;
    let lastUpdateTime = performance.now();

    const tick = () => {
      const now = performance.now();
      const deltaTime = Math.min(now - lastUpdateTime, 100); // Cap deltaTime to prevent large jumps

      // Smooth stop: gradually decay velocity towards target using exponential decay
      // This ensures smooth deceleration when joystick is released (target becomes 0)
      const stopFactor = 1 - SMOOTH_STOP_FACTOR;
      const lerpFactor = 1 - Math.pow(stopFactor, deltaTime / 16.67); // Normalize to 60fps base
      
      vxRef.current = lerp(vxRef.current, targetVxRef.current, lerpFactor);
      vyRef.current = lerp(vyRef.current, targetVyRef.current, lerpFactor);

      // Clamp values to [-1, 1] range
      vxRef.current = clamp(vxRef.current, -1, 1);
      vyRef.current = clamp(vyRef.current, -1, 1);

      // Send at clamped rate (20-30Hz)
      const timeSinceLastSend = now - lastSendTimeRef.current;
      
      // Ensure interval stays within 20-30Hz range
      const clampedInterval = Math.max(MIN_INTERVAL_MS, Math.min(MAX_INTERVAL_MS, TARGET_INTERVAL_MS));
      
      if (timeSinceLastSend >= clampedInterval) {
        // Send if there's any movement (including smooth stop decay)
        const hasMovement = Math.abs(vxRef.current) > 0.001 || Math.abs(vyRef.current) > 0.001;
        if (hasMovement) {
          sendPlayerInput(ws, {
            playerId,
            vx: vxRef.current,
            vy: vyRef.current,
            t: Date.now(),
          });
          lastSendTimeRef.current = now;
        }
      }

      lastUpdateTime = now;
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [ws, playerId, SMOOTH_STOP_FACTOR]);

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
            // Update target values - smooth stop will handle decay when released
            if (movementLocked) return;
            targetVxRef.current = v.x;
            targetVyRef.current = v.y;
          }}
          disabled={movementLocked}
          size={180}
          deadzone={0.12}
          smoothing={0.25}
        />
      </div>
    </div>
  );
}
