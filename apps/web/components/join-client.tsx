// components/player/join-client.tsx
"use client";

import { useMemo, useState } from "react";
import { connectPlayerWs, type ServerToPlayerMsg } from "@/lib/player-realtime";
import { PlayerController } from "@/components/player-controller";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";

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
  const [playerName, setPlayerName] = useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);

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
            setPlayerName(msg.name);
            setPlayerNumber(msg.number);
            setPhase("playing");
          } else if (msg.type === "join_rejected") {
            setPhase("form");
            setError(
              msg.reason === "number_taken"
                ? "That number is already taken. Choose another."
                : "Couldn't join. Please try again."
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
  if (phase === "playing" && ws && playerId && playerName !== null && playerNumber !== null) {
    return <PlayerController ws={ws} playerId={playerId} name={playerName} number={playerNumber} code={code} />;
  }

  return (
    <div className="flex min-h-screen bg-red-700 font-sans">
      <div className="flex flex-col w-full min-h-screen items-center justify-center">
        <section className="flex flex-col gap-4 w-full max-w-lg px-4">
          <div className="text-center mb-4">
            <p className="mb-2 text-sm font-medium text-white/80">Game Code</p>
            <div className="inline-flex items-center justify-center rounded-lg border-2 border-red-400/30 bg-red-700/20 backdrop-blur-xs px-6 py-3">
              <span className="text-3xl font-bold tracking-wider text-white">{code.toUpperCase()}</span>
            </div>
          </div>

          <Card className="bg-red-700/20 backdrop-blur-xs border-2 border-red-400/30 w-full shadow-2xl shadow-black/50">
            <CardHeader className="text-center pt-6">
              <CardTitle className="text-white font-bold text-2xl"><Logo /></CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {error ? (
                <div className="rounded-lg border border-red-500/50 bg-red-500/20 backdrop-blur p-3 text-sm text-white">
                  {error}
                </div>
              ) : null}

              <div className="space-y-3">
                <Label htmlFor="name" className="text-white text-base">Player Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="What should we call you?"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 bg-white/10 border-red-400/30 text-white placeholder:text-white/60 text-base font-semibold focus-visible:border-white/60 focus-visible:ring-white/30"
                  autoFocus
                  disabled={phase === "joining"}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-white text-base">Choose Your Number</Label>
                <div className="rounded-lg border-2 border-dashed border-red-400/30 bg-white/5 backdrop-blur p-4">
                  <div className="grid grid-cols-5 gap-3">
                    {numbers.map((n) => (
                      <Button
                        key={n}
                        type="button"
                        variant={selectedNumber === n ? "default" : "outline"}
                        onClick={() => setSelectedNumber(n)}
                        className={`h-14 w-14 rounded-full p-0 text-xl font-bold transition-all hover:scale-105 active:scale-95 ${
                          selectedNumber === n 
                            ? "bg-red-600 border-red-400 text-white" 
                            : "bg-white/10 border-red-400/30 text-white hover:bg-white/20"
                        }`}
                        disabled={phase === "joining"}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                className="h-12 w-full bg-black/50 text-white font-semibold text-base hover:bg-black/70 disabled:opacity-50"
                size="lg"
                disabled={phase === "joining" || !name.trim() || selectedNumber === null}
                onClick={onJoin}
              >
                {phase === "joining" ? "Joining…" : "Join Session"}
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
