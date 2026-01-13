export function getRoomWsUrl(code: string) {
  const base = process.env.NEXT_PUBLIC_REALTIME_URL || "wss://realtime.damien-w-england.workers.dev";
  return `${base.replace(/\/$/, "")}/ws/${code}`;
}