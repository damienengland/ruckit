export function generateSessionCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0, O, 1, I, l
  let code = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % chars.length;
    code += chars[randomIndex];
  }

  return code;
}