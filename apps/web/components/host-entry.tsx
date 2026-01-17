"use client"

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useState } from "react";
import { generateSessionCode } from "@/lib/session-code";


export function HostEntry() {

  const gamePin = generateSessionCode();

  return (
    <div className="flex w-full min-w-lg flex-col items-center">
      <Card className="bg-red-700/20 backdrop-blur-xs border-2 border-red-400/30 w-full shadow-2xl shadow-black/50">
        <CardHeader className="text-center pt-6">
          <CardTitle className="text-white font-bold text-2xl"><Logo /></CardTitle>
        </CardHeader>
        <CardContent>
          <Link href={`/host/${gamePin}`} className="w-full">
            <Button className="w-full bg-black/50 text-white font-semibold text-base h-12 hover:bg-black/70">Create Session</Button>
          </Link>
        </CardContent>

      </Card>
    </div>
  );
}