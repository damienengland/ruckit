"use client"

import {Card, CardContent, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useState } from "react";


export function JoinEntry() {

  const [gamePin, setGamePin] = useState("");

  return (
    <div className="flex w-full min-w-lg flex-col items-center">
      <Card className="bg-red-700/20 backdrop-blur-xs border-2 border-red-400/30 w-full shadow-2xl shadow-black/50">
        <CardHeader className="text-center pt-6">
          <CardTitle className="text-white font-bold text-2xl"><Logo /></CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            type="text" 
            placeholder="Game PIN" 
            value={gamePin}
            onChange={(e) => setGamePin(e.target.value)}
            className="uppercase text-center h-12 bg-white/10 border-red-400/30 text-white placeholder:text-white/60 text-lg font-semibold focus-visible:border-white/60 focus-visible:ring-white/30"
          />
        </CardContent>
        <CardFooter>
          <Link href={`/join/${gamePin}`} className="w-full">
            <Button className="w-full bg-black/50 text-white font-semibold text-base h-12 hover:bg-black/70">Join Session</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}