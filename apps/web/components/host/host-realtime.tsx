"use client";

import { useEffect, useRef, useState } from "react";
import { getRoomWsUrl } from "@/lib/realtime";
import { PlayerAvatar } from "@/components/player/player-avatar";

type Player = {
  id: string;
  x: number; // 0..1
  y: number; // 0..1
  vx: number; // -1..1
  vy: number; // -1..1
  lastInputT: number;
};

type Msg =
  | { type: "ready" }
  | { type: "player_joined"; playerId: string }
  | { type: "player_left"; playerId: string }
  | { type: "input"; playerId: string; vx: number; vy: number; t: number }
  | { type: "error"; error: string };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

type ConnectionStatus = "connecting" | "connected" | "closed" | "error";

type HostRealtimeProps = {
  code: string;
  onStatusChange?: (status: ConnectionStatus) => void;
  onPlayerCountChange?: (count: number) => void;
};

export function HostRealtime({
  code,
  onStatusChange,
  onPlayerCountChange,
}: HostRealtimeProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const playersRef = useRef<Map<string, Player>>(new Map());

  const [renderPlayers, setRenderPlayers] = useState<Player[]>([]);

  // helper to update count from one place
  const syncPlayerCount = () => onPlayerCountChange?.(playersRef.current.size);

  useEffect(() => {
    const ws = new WebSocket(getRoomWsUrl(code));
    wsRef.current = ws;

    onStatusChange?.("connecting");

    ws.onopen = () => {
      onStatusChange?.("connected");
      ws.send(JSON.stringify({ type: "join", role: "host" }));
    };

    ws.onmessage = (e) => {
      let msg: Msg;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }

      if (msg.type === "ready") return;

      if (msg.type === "player_joined") {
        if (!playersRef.current.has(msg.playerId)) {
          playersRef.current.set(msg.playerId, {
            id: msg.playerId,
            x: 0.5,
            y: 0.75,
            vx: 0,
            vy: 0,
            lastInputT: Date.now(),
          });
          syncPlayerCount();
        }
        return;
      }

      if (msg.type === "player_left") {
        if (playersRef.current.delete(msg.playerId)) {
          syncPlayerCount();
        }
        return;
      }

      if (msg.type === "input") {
        const existing =
          playersRef.current.get(msg.playerId) ??
          ({
            id: msg.playerId,
            x: 0.5,
            y: 0.75,
            vx: 0,
            vy: 0,
            lastInputT: Date.now(),
          } satisfies Player);

        existing.vx = clamp(msg.vx, -1, 1);
        existing.vy = clamp(msg.vy, -1, 1);
        existing.lastInputT = msg.t;

        playersRef.current.set(msg.playerId, existing);
      }
    };

    ws.onclose = () => onStatusChange?.("closed");
    ws.onerror = () => onStatusChange?.("error");

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // 60fps sim loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const speed = 0.10; // <-- control speed here

    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;

      for (const p of playersRef.current.values()) {
        p.x = clamp(p.x + p.vx * speed * dt, 0, 1);
        p.y = clamp(p.y + p.vy * speed * dt, 0, 1);
      }

      setRenderPlayers(Array.from(playersRef.current.values()));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      {renderPlayers.map((p) => (
        <div
          key={p.id}
          className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
          title={p.id}
        >
          <PlayerAvatar playerId={p.id} number={4} />
        </div>
      ))}
    </>
  );
}