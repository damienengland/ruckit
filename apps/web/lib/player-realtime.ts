// lib/player-realtime.ts
import { getRoomWsUrl } from "@/lib/realtime";

export type JoinAccepted = {
  type: "join_accepted";
  playerId: string;
  name: string;
  number: number;
};

export type JoinRejected = {
  type: "join_rejected";
  reason: "number_taken" | "invalid_number" | string;
};

export type ServerToPlayerMsg = JoinAccepted | JoinRejected | { type: "ready" } | { type: "error"; error: string };

export type PlayerJoinPayload = {
  playerId: string;
  name: string;
  number: number;
};

export function connectPlayerWs(
  code: string,
  payload: PlayerJoinPayload,
  opts: {
    onStatus?: (s: "connecting" | "connected" | "closed" | "error") => void;
    onMessage?: (msg: ServerToPlayerMsg) => void;
  } = {}
) {
  opts.onStatus?.("connecting");

  const ws = new WebSocket(getRoomWsUrl(code));

  ws.onopen = () => {
    console.log("[player] ws open");
    opts.onStatus?.("connected");
    const joinMsg = {
      type: "join_request",
      role: "player",
      ...payload,
    };

    console.log("[player] sending join_request", joinMsg);
    ws.send(JSON.stringify(joinMsg));
  };

  ws.onmessage = (e) => {
    console.log("[player] ws message", e.data);
    try {
      const msg = JSON.parse(e.data) as ServerToPlayerMsg;
      opts.onMessage?.(msg);
    } catch {
      // ignore non-json
    }
  };

  ws.onclose = () => opts.onStatus?.("closed");
  ws.onerror = () => opts.onStatus?.("error");

  return ws;
}

export function sendPlayerInput(
  ws: WebSocket,
  input: { playerId: string; vx: number; vy: number; t: number }
) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type: "input", ...input }));
}