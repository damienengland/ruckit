"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface JoinFormProps {
  code: string
}

export function JoinForm({ code }: JoinFormProps) {
  const [name, setName] = useState("")
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null)

  // Generate numbers 1-15
  const numbers = Array.from({ length: 15 }, (_, i) => i + 1)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 p-4 font-sans dark:from-black dark:to-zinc-950">
      <div className="w-full max-w-lg space-y-6">
        {/* Game Code Display */}
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground mb-2">Game Code</p>
          <div className="inline-flex items-center justify-center rounded-lg border-2 border-primary/20 bg-primary/5 px-6 py-3">
            <span className="text-3xl font-bold tracking-wider text-primary">{code.toUpperCase()}</span>
          </div>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader className="text-center space-y-2 pb-4">
            <CardTitle className="text-2xl">Join the Game</CardTitle>
            <CardDescription className="text-base">
              Enter your details to start playing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Name Input */}
            <div className="space-y-3">
              <Label htmlFor="name" className="text-base">
                Player Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="What should we call you?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 text-base"
                autoFocus
              />
            </div>

            {/* Number Selection */}
            <div className="space-y-4">
              <Label className="text-base">
                Choose Your Number
              </Label>
              <div className="rounded-lg border-2 border-dashed border-muted bg-muted/30 p-4">
                <div className="grid grid-cols-5 gap-3">
                  {numbers.map((number) => (
                    <Button
                      key={number}
                      type="button"
                      variant={selectedNumber === number ? "default" : "outline"}
                      onClick={() => setSelectedNumber(number)}
                      className="h-14 w-14 rounded-full p-0 text-xl font-bold transition-all hover:scale-105 active:scale-95"
                    >
                      {number}
                    </Button>
                  ))}
                </div>
              </div>
              {selectedNumber && (
                <p className="text-center text-sm text-muted-foreground">
                  You selected: <span className="font-semibold text-foreground">{selectedNumber}</span>
                </p>
              )}
            </div>

            {/* Join Button */}
            <Button
              className="w-full h-12 text-base font-semibold"
              disabled={!name.trim() || selectedNumber === null}
              size="lg"
            >
              Join Game
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
