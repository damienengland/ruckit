"use client";

import { useState } from "react";
import { FieldHalf } from "@/components/field-half";
import { HostRealtime } from "@/components/host-realtime";
import { HostNavBar } from "@/components/host-nav-bar";

type ConnectionStatus = "connecting" | "connected" | "closed" | "error";

export function HostScreen({ code }: { code: string }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [playerCount, setPlayerCount] = useState(0);

  return (
    <div className="flex h-screen w-full flex-col bg-green-800">
      <HostNavBar status={status} playerCount={playerCount} />
      <section className="flex flex-1 w-full flex-col items-center overflow-hidden">

        <FieldHalf>
          <HostRealtime
            code={code}
            onStatusChange={setStatus}
            onPlayerCountChange={setPlayerCount} />
        </FieldHalf>

        {/* <HostNavHud /> */}
      </section>
    </div>
  );
}