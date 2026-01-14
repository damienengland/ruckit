export interface Env {
  ROOMS: DurableObjectNamespace;
}

/**
 * Messages from clients → server
 */
type HostJoinMsg = { type: "join"; role: "host" };

type PlayerJoinRequestMsg = {
  type: "join_request";
  role: "player";
  playerId: string;
  name: string;
  number: number; // 1..15
};

type InputMsg = {
  type: "input";
  playerId: string; // client-sent (ignored; server uses attachment)
  vx: number; // -1..1
  vy: number; // -1..1
  t: number; // timestamp (ms)
};

type Msg = HostJoinMsg | PlayerJoinRequestMsg | InputMsg;

/**
 * Messages from server → player
 */
type JoinAccepted = {
  type: "join_accepted";
  playerId: string;
  name: string;
  number: number;
};

type JoinRejected = {
  type: "join_rejected";
  reason: "invalid_number" | "number_taken";
};

/**
 * Attachment metadata we store on each WebSocket
 */
type SockMeta =
  | { role: "host" }
  | { role: "player"; playerId: string }
  | null;

type PlayerRecord = {
  playerId: string;
  name: string;
  number: number;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/health") return new Response("ok");

    const match = url.pathname.match(/^\/ws\/([A-Z0-9]{6})$/);
    if (!match) return new Response("Not found", { status: 404 });

    const code = match[1];
    const id = env.ROOMS.idFromName(code);
    return env.ROOMS.get(id).fetch(request);
  },
};

export class Room implements DurableObject {
  // in-memory state for this room
  private players = new Map<string, PlayerRecord>(); // playerId -> record
  private numberToPlayerId = new Map<number, string>(); // number -> playerId

  constructor(private state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    this.state.acceptWebSocket(server);

    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    if (typeof message !== "string") return;

    let data: Msg;
    try {
      data = JSON.parse(message);
    } catch {
      ws.send(JSON.stringify({ type: "error", error: "invalid_json" }));
      return;
    }
    console.log("[room] incoming", data);

    // 1) HOST JOIN (unchanged)
    if (data.type === "join" && data.role === "host") {
      ws.serializeAttachment({ role: "host" } satisfies SockMeta);
      ws.send(JSON.stringify({ type: "ready" }));
      return;
    }

    // 2) PLAYER JOIN REQUEST (NEW)
    if (data.type === "join_request" && data.role === "player") {
      const playerId = (data.playerId || "").trim();
      const name = (data.name || "").trim();
      const number = data.number;

      // basic validation
      if (!playerId || !name || typeof number !== "number") {
        ws.send(JSON.stringify({ type: "join_rejected", reason: "invalid_number" } satisfies JoinRejected));
        return;
      }

      if (!Number.isInteger(number) || number < 1 || number > 15) {
        ws.send(JSON.stringify({ type: "join_rejected", reason: "invalid_number" } satisfies JoinRejected));
        return;
      }

      // If this playerId already exists (reconnect), free their old number first
      const existing = this.players.get(playerId);
      if (existing) {
        this.numberToPlayerId.delete(existing.number);
      }

      // enforce unique jersey number
      const takenBy = this.numberToPlayerId.get(number);
      if (takenBy && takenBy !== playerId) {
        ws.send(JSON.stringify({ type: "join_rejected", reason: "number_taken" } satisfies JoinRejected));
        return;
      }

      // accept: store state
      this.players.set(playerId, { playerId, name, number });
      this.numberToPlayerId.set(number, playerId);

      // attach to socket (authoritative identity)
      ws.serializeAttachment({ role: "player", playerId } satisfies SockMeta);

      // reply to player
      ws.send(
        JSON.stringify({
          type: "join_accepted",
          playerId,
          name,
          number,
        } satisfies JoinAccepted)
      );

      // notify host with full metadata
      this.sendToHost({
        type: "player_joined",
        playerId,
        name,
        number,
      });

      return;
    }

    // 3) INPUT (only accept from joined players)
    if (data.type === "input") {
      const meta = ws.deserializeAttachment() as SockMeta;

      if (!meta || meta.role !== "player") {
        ws.send(JSON.stringify({ type: "error", error: "not_a_player" }));
        return;
      }

      const player = this.players.get(meta.playerId);
      if (!player) {
        // player hasn't been accepted (or was cleared)
        ws.send(JSON.stringify({ type: "error", error: "not_joined" }));
        return;
      }

      // Forward to host only (host does the simulation)
      this.sendToHost({
        type: "input",
        playerId: meta.playerId,
        vx: data.vx,
        vy: data.vy,
        t: data.t,
      });

      return;
    }

    // If message type didn't match any handler:
    ws.send(JSON.stringify({ type: "error", error: "unknown_message_type" }));
  }

  async webSocketClose(ws: WebSocket) {
    const meta = ws.deserializeAttachment() as SockMeta;

    if (meta?.role === "player") {
      const playerId = meta.playerId;
      const existing = this.players.get(playerId);

      if (existing) {
        this.players.delete(playerId);
        this.numberToPlayerId.delete(existing.number);

        this.sendToHost({ type: "player_left", playerId });
      }
    }

    // if host disconnects, we just let it go; next host can join again
  }

  private sendToHost(payload: unknown) {
    const msg = JSON.stringify(payload);

    for (const sock of this.state.getWebSockets()) {
      const meta = sock.deserializeAttachment() as SockMeta;
      if (meta?.role === "host") {
        try {
          sock.send(msg);
        } catch {}
      }
    }
  }
}