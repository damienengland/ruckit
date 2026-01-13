export function getRoomWsUrl(code: string) {
  const base = process.env.NEXT_PUBLIC_REALTIME_URL!;
  return `${base.replace(/\/$/, "")}/ws/${code}`;
}