export interface Env {
  ROOMS: DurableObjectNamespace;
}

type JoinMsg =
  | { type: "join"; role: "host" }
  | { type: "join"; role: "player"; playerId: string };

type InputMsg = {
  type: "input";
  playerId: string;
  vx: number; // -1..1
  vy: number; // -1..1
  t: number;  // timestamp (ms)
};

type Msg = JoinMsg | InputMsg;

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

    // 1) JOIN
    if (data.type === "join") {
      if (data.role === "host") {
        ws.serializeAttachment({ role: "host" });
        ws.send(JSON.stringify({ type: "ready" }));
        return;
      }

      // player join
      if (!data.playerId) {
        ws.send(JSON.stringify({ type: "error", error: "missing_playerId" }));
        return;
      }

      ws.serializeAttachment({ role: "player", playerId: data.playerId });

      // Notify host only
      this.sendToHost({ type: "player_joined", playerId: data.playerId });
      return;
    }

    // 2) INPUT (only accept from players)
    if (data.type === "input") {
      const meta = ws.deserializeAttachment() as
        | { role?: "host" | "player"; playerId?: string }
        | null;

      if (!meta || meta.role !== "player") {
        ws.send(JSON.stringify({ type: "error", error: "not_a_player" }));
        return;
      }

      // Forward to host only
      this.sendToHost({
        type: "input",
        playerId: meta.playerId!,
        vx: data.vx,
        vy: data.vy,
        t: data.t,
      });

      return;
    }
  }

  async webSocketClose(ws: WebSocket) {
    const meta = ws.deserializeAttachment() as
      | { role?: "host" | "player"; playerId?: string | null }
      | null;

    if (meta?.role === "player" && meta.playerId) {
      this.sendToHost({ type: "player_left", playerId: meta.playerId });
    }
  }

  private sendToHost(payload: unknown) {
    const msg = JSON.stringify(payload);
    for (const sock of this.state.getWebSockets()) {
      const meta = sock.deserializeAttachment() as { role?: "host" | "player" } | null;
      if (meta?.role === "host") {
        try {
          sock.send(msg);
        } catch {}
      }
    }
  }
}