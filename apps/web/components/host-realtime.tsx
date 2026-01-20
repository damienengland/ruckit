"use client";

import { useEffect, useRef, useState } from "react";
import { getRoomWsUrl } from "@/lib/realtime";
import { PlayerAvatar } from "@/components/player-avatar";

type Player = {
  id: string;
  name: string;
  number: number;
  x: number; // 0..1
  y: number; // 0..1
  vx: number; // -1..1
  vy: number; // -1..1
  lastInputT: number;
};

// ✅ Backward compatible Msg type
type Msg =
  | { type: "ready" }
  | { type: "player_joined"; playerId: string; name?: string; number?: number }
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
  movementLocked?: boolean;
  jerseyVisibility?: Record<number, boolean>;
};

export function HostRealtime({
  code,
  onStatusChange,
  onPlayerCountChange,
  movementLocked = false,
  jerseyVisibility,
}: HostRealtimeProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const playersRef = useRef<Map<string, Player>>(new Map());
  const movementLockedRef = useRef(movementLocked);

  const [renderPlayers, setRenderPlayers] = useState<Player[]>([]);

  const lineupPositions: Record<number, { x: number; y: number }> = {
    1: { x: 0.35, y: 0.85 },
    2: { x: 0.5, y: 0.85 },
    3: { x: 0.65, y: 0.85 },
    4: { x: 0.42, y: 0.7 },
    5: { x: 0.58, y: 0.7 },
    6: { x: 0.3, y: 0.58 },
    7: { x: 0.7, y: 0.58 },
    8: { x: 0.5, y: 0.58 },
    9: { x: 0.46, y: 0.45 },
    10: { x: 0.54, y: 0.45 },
    11: { x: 0.2, y: 0.25 },
    12: { x: 0.4, y: 0.35 },
    13: { x: 0.6, y: 0.35 },
    14: { x: 0.8, y: 0.25 },
    15: { x: 0.5, y: 0.15 },
  };

  const jerseyNumbers = Array.from({ length: 15 }, (_, index) => index + 1);

  const syncPlayerCount = () => onPlayerCountChange?.(playersRef.current.size);

  useEffect(() => {
    // ✅ if code is ever undefined in your “new” version, this prevents silent failure
    const safeCode = (code ?? "").trim().toUpperCase();
    if (!safeCode) return;

    const url = getRoomWsUrl(safeCode);
    console.log("[host ws url]", url, "code:", safeCode);

    const ws = new WebSocket(url);
    wsRef.current = ws;

    onStatusChange?.("connecting");

    ws.onopen = () => {
      onStatusChange?.("connected");
      ws.send(JSON.stringify({ type: "join", role: "host" }));
      ws.send(JSON.stringify({ type: "control_update", movementLocked: movementLockedRef.current }));
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
        const existing = playersRef.current.get(msg.playerId);

        playersRef.current.set(msg.playerId, {
          id: msg.playerId,
          // ✅ prefer server-provided name/number; fallback to sensible defaults
          name: msg.name ?? existing?.name ?? msg.playerId,
          number: msg.number ?? existing?.number ?? 4,
          x: existing?.x ?? 0.5,
          y: existing?.y ?? 0.75,
          vx: existing?.vx ?? 0,
          vy: existing?.vy ?? 0,
          lastInputT: Date.now(),
        });

        syncPlayerCount();
        return;
      }

      if (msg.type === "player_left") {
        if (playersRef.current.delete(msg.playerId)) syncPlayerCount();
        return;
      }

      if (msg.type === "input") {
        const existing = playersRef.current.get(msg.playerId);
        if (!existing) return;

        if (movementLockedRef.current) {
          existing.vx = 0;
          existing.vy = 0;
          existing.lastInputT = msg.t;
          return;
        }

        existing.vx = clamp(msg.vx, -1, 1);
        existing.vy = clamp(msg.vy, -1, 1);
        existing.lastInputT = msg.t;
        return;
      }
    };

    ws.onclose = () => onStatusChange?.("closed");
    ws.onerror = () => onStatusChange?.("error");

    return () => ws.close();
  }, [code, onPlayerCountChange, onStatusChange]);

  useEffect(() => {
    movementLockedRef.current = movementLocked;
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: "control_update", movementLocked }));
    if (movementLocked) {
      for (const player of playersRef.current.values()) {
        player.vx = 0;
        player.vy = 0;
      }
    }
  }, [movementLocked]);

  // 60fps sim loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();

    const speed = 0.10; // control speed here

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
      {renderPlayers.map((p) => {
        const isVisible = jerseyVisibility?.[p.number] ?? true;
        if (!isVisible) return null;

        return (
          <div
            key={p.id}
            className="absolute z-40 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
            title={p.id}
          >
            <PlayerAvatar name={p.name} number={p.number} />
          </div>
        );
      })}
      {jerseyNumbers.map((number) => {
        const isVisible = jerseyVisibility?.[number] ?? true;
        const hasPlayer = renderPlayers.some((player) => player.number === number);
        const position = lineupPositions[number];

        if (!isVisible || hasPlayer || !position) return null;

        return (
          <div
            key={`placeholder-${number}`}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 opacity-70"
            style={{ left: `${position.x * 100}%`, top: `${position.y * 100}%` }}
          >
            <PlayerAvatar name="Open" number={number} />
          </div>
        );
      })}
    </>
  );
}
