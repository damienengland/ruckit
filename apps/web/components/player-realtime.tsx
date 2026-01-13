"use client";

import { useEffect, useRef, useState } from "react";
import { getRoomWsUrl } from "@/lib/realtime";
import { Joystick } from "@/components/player-joystick";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getOrCreatePlayerId() {
  const key = "ruckit_player_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id = `p_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  localStorage.setItem(key, id);
  return id;
}

export function PlayerRealtime({ code }: { code: string }) {
  const wsRef = useRef<WebSocket | null>(null);

  const [status, setStatus] = useState("connecting");
  const [playerId, setPlayerId] = useState<string | null>(null);

  const vxRef = useRef(0);
  const vyRef = useRef(0);

  // ✅ Compute playerId ONLY on client after mount
  useEffect(() => {
    setPlayerId(getOrCreatePlayerId());
  }, []);

  // ✅ Connect websocket only once we have playerId
  useEffect(() => {
    if (!playerId) return;

    const ws = new WebSocket(getRoomWsUrl(code));
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      ws.send(JSON.stringify({ type: "join", role: "player", playerId }));
    };

    ws.onclose = () => setStatus("closed");
    ws.onerror = () => setStatus("error");

    return () => ws.close();
  }, [code, playerId]);

  // ✅ Send input at 20Hz (only when connected + playerId exists)
  useEffect(() => {
    if (!playerId) return;

    const interval = setInterval(() => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return;

      ws.send(
        JSON.stringify({
          type: "input",
          playerId,
          vx: clamp(vxRef.current, -1, 1),
          vy: clamp(vyRef.current, -1, 1),
          t: Date.now(),
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [playerId]);

  // Arrow keys for testing
  // useEffect(() => {
  //   const down = (e: KeyboardEvent) => {
  //     if (e.key === "ArrowLeft") vxRef.current = -1;
  //     if (e.key === "ArrowRight") vxRef.current = 1;
  //     if (e.key === "ArrowUp") vyRef.current = -1;
  //     if (e.key === "ArrowDown") vyRef.current = 1;
  //   };
  //   const up = (e: KeyboardEvent) => {
  //     if (e.key === "ArrowLeft" || e.key === "ArrowRight") vxRef.current = 0;
  //     if (e.key === "ArrowUp" || e.key === "ArrowDown") vyRef.current = 0;
  //   };
  //   window.addEventListener("keydown", down);
  //   window.addEventListener("keyup", up);
  //   return () => {
  //     window.removeEventListener("keydown", down);
  //     window.removeEventListener("keyup", up);
  //   };
  // }, []);
  // Joystick updates (normalized -1..1)
  const handleJoystick = (v: { x: number; y: number }) => {
    vxRef.current = v.x;
    vyRef.current = v.y;
  };

  return (
    <div className="p-6">
      <div className="text-sm opacity-70">
        Player: <b>{playerId ?? "…"}</b> • Realtime: <b>{status}</b>
      </div>

      <div className="mt-6 flex justify-center">
        <Joystick
          onChange={handleJoystick}
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