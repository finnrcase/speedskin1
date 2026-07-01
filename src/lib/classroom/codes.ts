export type Rng = () => number;

/** Generate a class join code like "SPEED-4821" (always four digits). */
export function generateJoinCode(rng: Rng = Math.random): string {
  const digits = Math.floor(rng() * 9000) + 1000; // 1000-9999
  return `SPEED-${digits}`;
}
