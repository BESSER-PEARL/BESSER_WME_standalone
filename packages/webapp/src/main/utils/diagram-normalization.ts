import { UMLModel } from '@besser/wme';

type BoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type Offset = { x: number; y: number };

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isBounds = (value: any): value is { x: number; y: number; width: number; height: number } =>
  value &&
  typeof value === 'object' &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  isFiniteNumber(value.width) &&
  isFiniteNumber(value.height);

const isPoint = (value: any): value is { x: number; y: number } =>
  value &&
  typeof value === 'object' &&
  isFiniteNumber(value.x) &&
  isFiniteNumber(value.y) &&
  !isFiniteNumber((value as any).width) &&
  !isFiniteNumber((value as any).height);

const updateBoundsWithRect = (bounds: BoundingBox | null, rect: { x: number; y: number; width: number; height: number }) => {
  const nextBounds: BoundingBox = bounds
    ? { ...bounds }
    : { minX: rect.x, minY: rect.y, maxX: rect.x + rect.width, maxY: rect.y + rect.height };

  nextBounds.minX = Math.min(nextBounds.minX, rect.x);
  nextBounds.minY = Math.min(nextBounds.minY, rect.y);
  nextBounds.maxX = Math.max(nextBounds.maxX, rect.x + rect.width);
  nextBounds.maxY = Math.max(nextBounds.maxY, rect.y + rect.height);

  return nextBounds;
};

const updateBoundsWithPoint = (bounds: BoundingBox | null, point: { x: number; y: number }) => {
  const nextBounds: BoundingBox = bounds
    ? { ...bounds }
    : { minX: point.x, minY: point.y, maxX: point.x, maxY: point.y };

  nextBounds.minX = Math.min(nextBounds.minX, point.x);
  nextBounds.minY = Math.min(nextBounds.minY, point.y);
  nextBounds.maxX = Math.max(nextBounds.maxX, point.x);
  nextBounds.maxY = Math.max(nextBounds.maxY, point.y);

  return nextBounds;
};

const collectBounds = (value: unknown, bounds: BoundingBox | null): BoundingBox | null => {
  if (!value) {
    return bounds;
  }

  if (Array.isArray(value)) {
    return value.reduce<BoundingBox | null>((acc, item) => collectBounds(item, acc), bounds);
  }

  if (typeof value === 'object') {
    if (isBounds(value)) {
      return updateBoundsWithRect(bounds, value);
    }

    if (isPoint(value)) {
      return updateBoundsWithPoint(bounds, value);
    }

    return Object.values(value).reduce<BoundingBox | null>((acc, item) => collectBounds(item, acc), bounds);
  }

  return bounds;
};

const shiftPoint = <T extends { x: number; y: number }>(point: T, offset: Offset): T => ({
  ...point,
  x: point.x + offset.x,
  y: point.y + offset.y,
});

const shiftRect = <T extends { x: number; y: number }>(rect: T, offset: Offset): T => ({
  ...rect,
  x: rect.x + offset.x,
  y: rect.y + offset.y,
});

const applyOffset = <T>(value: T, offset: Offset): T => {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyOffset(item, offset)) as T;
  }

  if (typeof value === 'object') {
    if (isBounds(value)) {
      return shiftRect(value, offset) as T;
    }

    if (isPoint(value)) {
      return shiftPoint(value, offset) as T;
    }

    const clone: Record<string, unknown> = { ...(value as Record<string, unknown>) };

    Object.entries(clone).forEach(([key, item]) => {
      clone[key] = applyOffset(item, offset);
    });

    return clone as T;
  }

  return value;
};

export const normalizeDiagramModel = (model: UMLModel, padding = 100): { model: UMLModel; offset: Offset } => {
  if (!model) {
    return { model, offset: { x: 0, y: 0 } };
  }

  const bounds = collectBounds([model.elements, model.relationships], null);

  if (!bounds) {
    return { model, offset: { x: 0, y: 0 } };
  }

  const offsetFor = (minValue: number): number => {
    if (minValue < 0 || minValue > padding) {
      return padding - minValue;
    }
    return 0;
  };

  const offset: Offset = {
    x: offsetFor(bounds.minX),
    y: offsetFor(bounds.minY),
  };

  if (offset.x === 0 && offset.y === 0) {
    return { model, offset };
  }

  return {
    model: {
      ...model,
      elements: applyOffset(model.elements, offset),
      relationships: applyOffset(model.relationships, offset),
      interactive: applyOffset(model.interactive, offset),
    },
    offset,
  };
};
