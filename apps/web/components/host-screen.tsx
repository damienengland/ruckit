"use client";

import { useState } from "react";
import { FieldHalf } from "@/components/field-half";
import { HostRealtime } from "@/components/host-realtime";
import { HostNavBar } from "@/components/host-nav-bar";
import { defaultLineupPositions } from "@/lib/formation-defaults";
import type { FormationPositionInput } from "@/lib/formations";

type ConnectionStatus = "connecting" | "connected" | "closed" | "error";

export function HostScreen({ code }: { code: string }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [playerCount, setPlayerCount] = useState(0);
  const [movementLocked, setMovementLocked] = useState(true);
  const [currentPositions, setCurrentPositions] = useState<
    FormationPositionInput[]
  >([]);
  const [formationPositions, setFormationPositions] = useState<Record<number, { x: number; y: number }>>(
    () => ({ ...defaultLineupPositions })
  );
  const [jerseyVisibility, setJerseyVisibility] = useState<Record<number, boolean>>(
    () =>
      Object.fromEntries(
        Array.from({ length: 15 }, (_, index) => [index + 1, true])
      )
  );

  const handleLoadFormation = (positions: FormationPositionInput[]) => {
    const nextPositions = { ...defaultLineupPositions };
    positions.forEach((position) => {
      nextPositions[position.jerseyNumber] = { x: position.x, y: position.y };
    });
    setFormationPositions(nextPositions);
  };

  const handleJerseyToggle = (number: number) => {
    setJerseyVisibility((prev) => ({
      ...prev,
      [number]: !prev[number],
    }));
  };

  return (
    <div className="flex h-screen w-full flex-col bg-red-700">
      <HostNavBar
        status={status}
        playerCount={playerCount}
        onMovementLockChange={setMovementLocked}
        jerseyVisibility={jerseyVisibility}
        onJerseyToggle={handleJerseyToggle}
        currentFormationPositions={currentPositions}
        onLoadFormation={handleLoadFormation}
      />
      <section className="flex flex-1 w-full flex-col items-center overflow-hidden">

        <FieldHalf>
          <HostRealtime
            code={code}
            onStatusChange={setStatus}
            onPlayerCountChange={setPlayerCount}
            movementLocked={movementLocked}
            jerseyVisibility={jerseyVisibility}
            formationPositions={formationPositions}
            onPositionsChange={setCurrentPositions}
          />
        </FieldHalf>

        {/* <HostNavHud /> */}
      </section>
    </div>
  );
}
