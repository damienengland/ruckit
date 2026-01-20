"use client";

import { useEffect, useRef, useState } from "react";
import { getRoomWsUrl } from "@/lib/realtime";
import { PlayerAvatar } from "@/components/player-avatar";
import { defaultLineupPositions, jerseyNumbers } from "@/lib/formation-defaults";
import type { FormationPositionInput } from "@/lib/formations";

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
  formationPositions?: Record<number, { x: number; y: number }>;
  onPositionsChange?: (positions: FormationPositionInput[]) => void;
};

export function HostRealtime({
  code,
  onStatusChange,
  onPlayerCountChange,
  movementLocked = false,
  jerseyVisibility,
  formationPositions,
  onPositionsChange,
}: HostRealtimeProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const playersRef = useRef<Map<string, Player>>(new Map());
  const movementLockedRef = useRef(movementLocked);

  const [renderPlayers, setRenderPlayers] = useState<Player[]>([]);

  const activeFormationPositions = formationPositions ?? defaultLineupPositions;

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

  useEffect(() => {
    if (!formationPositions) return;
    for (const player of playersRef.current.values()) {
      const position = formationPositions[player.number];
      if (!position) continue;
      player.x = position.x;
      player.y = position.y;
      player.vx = 0;
      player.vy = 0;
    }
  }, [formationPositions]);

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

  useEffect(() => {
    if (!onPositionsChange) return;
    const positions = jerseyNumbers
      .map((number) => {
        const player = renderPlayers.find((entry) => entry.number === number);
        const fallback = activeFormationPositions[number];
        if (!player && !fallback) return null;
        const position = player ?? fallback;
        return {
          jerseyNumber: number,
          x: position.x,
          y: position.y,
        };
      })
      .filter((position): position is FormationPositionInput => Boolean(position));

    onPositionsChange(positions);
  }, [activeFormationPositions, onPositionsChange, renderPlayers]);

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
        const position = activeFormationPositions[number];

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
