// components/player/join-client.tsx
"use client";

import { useMemo, useState } from "react";
import { connectPlayerWs, type ServerToPlayerMsg } from "@/lib/player-realtime";
import { PlayerController } from "@/components/player-controller";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

function getOrCreatePlayerId() {
  const key = "ruckit_player_id";
  const existing = localStorage.getItem(key);
  if (existing) return existing;

  const id = `p_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  localStorage.setItem(key, id);
  return id;
}

export function JoinClient({ code }: { code: string }) {
  const numbers = useMemo(() => Array.from({ length: 15 }, (_, i) => i + 1), []);

  const [name, setName] = useState("");
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const [phase, setPhase] = useState<"form" | "joining" | "playing">("form");
  const [error, setError] = useState<string | null>(null);

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const onJoin = () => {
    const trimmed = name.trim();
    if (!trimmed || selectedNumber == null) return;

    setError(null);
    setPhase("joining");

    const id = getOrCreatePlayerId();
    setPlayerId(id);

    const socket = connectPlayerWs(
      code,
      { playerId: id, name: trimmed, number: selectedNumber },
      {
        onStatus: (s) => {
          if (s === "error") setError("WebSocket error. Please try again.");
          if (s === "closed" && phase !== "playing") setError("Connection closed. Please try again.");
        },
        onMessage: (msg: ServerToPlayerMsg) => {
          if (msg.type === "join_accepted") {
            setWs(socket);
            setPhase("playing");
          } else if (msg.type === "join_rejected") {
            setPhase("form");
            setError(
              msg.reason === "number_taken"
                ? "That number is already taken. Choose another."
                : "Couldn’t join. Please try again."
            );
            socket.close();
          }
        },
      }
    );

    // store it so we can close later if needed
    setWs(socket);
  };

  // after join accepted we show controller
  if (phase === "playing" && ws && playerId) {
    return <PlayerController ws={ws} playerId={playerId} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 font-sans dark:from-black dark:to-zinc-950">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Game Code</p>
          <div className="inline-flex items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/5 px-6 py-3">
            <span className="text-3xl font-bold tracking-wider text-primary">{code.toUpperCase()}</span>
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="space-y-2 pb-4 text-center">
            <CardTitle className="text-2xl">Join the Game</CardTitle>
            <CardDescription className="text-base">
              Enter your name and choose a jersey number.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {error ? (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm">
                {error}
              </div>
            ) : null}

            <div className="space-y-3">
              <Label htmlFor="name" className="text-base">Player Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
                autoFocus
                disabled={phase === "joining"}
              />
            </div>

            <div className="space-y-4">
              <Label className="text-base">Choose Your Number</Label>
              <div className="rounded-lg border-2 border-dashed border-muted bg-muted/30 p-4">
                <div className="grid grid-cols-5 gap-3">
                  {numbers.map((n) => (
                    <Button
                      key={n}
                      type="button"
                      variant={selectedNumber === n ? "default" : "outline"}
                      onClick={() => setSelectedNumber(n)}
                      className="h-14 w-14 rounded-full p-0 text-xl font-bold transition-all hover:scale-105 active:scale-95"
                      disabled={phase === "joining"}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <Button
              className="h-12 w-full text-base font-semibold"
              size="lg"
              disabled={phase === "joining" || !name.trim() || selectedNumber === null}
              onClick={onJoin}
            >
              {phase === "joining" ? "Joining…" : "Join Game"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}