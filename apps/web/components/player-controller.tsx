// components/player/player-controller.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Joystick } from "@/components/player-joystick";
import { sendPlayerInput } from "@/lib/player-realtime";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function PlayerController({
  ws,
  playerId,
}: {
  ws: WebSocket;
  playerId: string;
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

  return (
    <div className="p-6">
      <div className="text-sm opacity-70">
        Realtime: <b>{status}</b>
      </div>

      <div className="mt-6 flex justify-center">
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

      <div className="mt-6 text-center text-xs opacity-60">
        Drag the joystick to move.
      </div>
    </div>
  );
}