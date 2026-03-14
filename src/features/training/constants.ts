export const TIMED_LIMIT = 120; // 2 minutes in seconds

export const MODE_COUNTS: Record<string, number> = {
  marathon: 50,
  timed: 20,
  daily: 15,
  default: 10,
};

export function getModeCount(mode: string): number {
  return MODE_COUNTS[mode] ?? MODE_COUNTS.default;
}
