export function getNextRunAt(intervalMinutes: number) {
  return new Date(Date.now() + intervalMinutes * 60 * 1000);
}

export function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
}
