// app/join/[code]/page.tsx
import { JoinClient } from "@/components/join-client";
import { getRoomWsUrl } from "@/lib/realtime";

type Props = {
  params: Promise<{ code: string }>;
};

export default async function JoinPage({ params }: Props) {
  
  const { code } = await params;
  console.log("[player] connecting to", getRoomWsUrl(code));
  return <JoinClient code={code} />;
}