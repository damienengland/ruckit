"use client";

import { useState } from "react";
import { HalfField } from "@/components/field/half-field";
import { HostRealtime } from "@/components/host/host-realtime";
import { HostNavBar } from "@/components/host/host-nav-bar";

type ConnectionStatus = "connecting" | "connected" | "closed" | "error";

export function HostScreen({ code }: { code: string }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [playerCount, setPlayerCount] = useState(0);

  return (
    <div className="flex h-screen w-full flex-col bg-green-800">
      <HostNavBar status={status} playerCount={playerCount} />
      <section className="flex flex-1 w-full flex-col items-center overflow-hidden">
        {/* HUD outside the field, centered */}
        {/* <HostHud status={status} code={code} playerCount={playerCount} /> */}
        {/* <JoinQrButton code={code} /> */}
        {/* Field with realtime overlays inside */}
        
        <HalfField>
          
          <HostRealtime
            code={code}
            onStatusChange={setStatus}
            onPlayerCountChange={setPlayerCount}
          />
        </HalfField>

        {/* <HostNavHud /> */}
      </section>
    </div>
  );
}