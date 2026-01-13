import { PlayerRealtime } from "@/components/player/player-realtime";

export default async function Join({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <PlayerRealtime code={code} />;
}