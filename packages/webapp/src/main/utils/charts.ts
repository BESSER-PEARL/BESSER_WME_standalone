export const normalizeColor = (input: any, fallback: string): string => {
  if (typeof input === 'string') return input;
  if (typeof input === 'object' && input !== null) {
    const { r, g, b, a } = input;
    if (
      typeof r === 'number' &&
      typeof g === 'number' &&
      typeof b === 'number'
    ) {
      return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
    }
  }
  return fallback;
};

export const safeNumber = (value: number | undefined, fallback: number): number => {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
};

export const safeMargin = (
  margin: [number, number, number, number] | undefined
): [number, number, number, number] => {
  if (!Array.isArray(margin) || margin.length !== 4) return [20, 30, 0, 10];
  return margin.map((m) => safeNumber(m, 0)) as [
    number,
    number,
    number,
    number
  ];
};
