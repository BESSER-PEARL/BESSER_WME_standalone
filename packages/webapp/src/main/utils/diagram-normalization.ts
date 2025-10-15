import { UMLModel } from '@besser/wme';

type BoundingBox = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type Offset = { x: number; y: number };

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const asBounds = (
  value: any
): { x: number; y: number; width: number; height: number } | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const x = toFiniteNumber(value.x);
  const y = toFiniteNumber(value.y);
  const width = toFiniteNumber(value.width);
  const height = toFiniteNumber(value.height);

  if (x === null || y === null || width === null || height === null) {
    return undefined;
  }

  return { x, y, width, height };
};

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

const contextsToIgnoreForBounds = new Set(['path', 'source', 'target']);

const collectBounds = (value: unknown, bounds: BoundingBox | null, context?: string): BoundingBox | null => {
  if (!value) {
    return bounds;
  }

  if (Array.isArray(value)) {
    if (context && contextsToIgnoreForBounds.has(context)) {
      return bounds;
    }
    return value.reduce<BoundingBox | null>((acc, item) => collectBounds(item, acc, context), bounds);
  }

  if (value instanceof Map) {
    return Array.from(value.entries()).reduce<BoundingBox | null>(
      (acc, [key, item]) => collectBounds(item, acc, String(key)),
      bounds
    );
  }

  if (value instanceof Set) {
    return Array.from(value.values()).reduce<BoundingBox | null>((acc, item) => collectBounds(item, acc, context), bounds);
  }

  if (typeof value === 'object') {
    if (context && contextsToIgnoreForBounds.has(context)) {
      return bounds;
    }
    const rect = asBounds(value);
    if (rect) {
      return updateBoundsWithRect(bounds, rect);
    }

    const point = asPoint(value);
    if (point) {
      return updateBoundsWithPoint(bounds, point);
    }

    return Object.entries(value).reduce<BoundingBox | null>((acc, [key, item]) => collectBounds(item, acc, key), bounds);
  }

  return bounds;
};

const asPoint = (value: any): { x: number; y: number } | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const x = toFiniteNumber(value.x);
  const y = toFiniteNumber(value.y);

  if (x === null || y === null) {
    return undefined;
  }

  // Ignore points that already qualified as bounds
  if (toFiniteNumber((value as any).width) !== null || toFiniteNumber((value as any).height) !== null) {
    return undefined;
  }

  return { x, y };
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

const shiftPoint = <T extends { x: any; y: any }>(point: T, offset: Offset): T => {
  const x = toFiniteNumber(point.x);
  const y = toFiniteNumber(point.y);

  if (x === null || y === null) {
    return point;
  }

  return {
    ...point,
    x: x + offset.x,
    y: y + offset.y,
  };
};

const shiftRect = <T extends { x: any; y: any }>(rect: T, offset: Offset): T => {
  const x = toFiniteNumber(rect.x);
  const y = toFiniteNumber(rect.y);

  if (x === null || y === null) {
    return rect;
  }

  return {
    ...rect,
    x: x + offset.x,
    y: y + offset.y,
  };
};

const applyOffset = <T>(value: T, offset: Offset, context?: string): T => {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    if (context && contextsToIgnoreForBounds.has(context)) {
      return value;
    }
    return value.map((item) => applyOffset(item, offset, context)) as T;
  }

  if (value instanceof Map) {
    const shifted = new Map<unknown, unknown>();
    value.forEach((item, key) => {
      shifted.set(key, applyOffset(item, offset, String(key)));
    });
    return shifted as T;
  }

  if (value instanceof Set) {
    const shifted = new Set<unknown>();
    value.forEach((item) => {
      shifted.add(applyOffset(item, offset, context));
    });
    return shifted as T;
  }

  if (typeof value === 'object') {
    if (context && context === 'path') {
      return value;
    }

    if (context && (context === 'source' || context === 'target')) {
      return value;
    }

    const rect = asBounds(value);
    if (rect) {
      return shiftRect({ ...(value as Record<string, unknown>), ...rect }, offset) as T;
    }

    const point = asPoint(value);
    if (point) {
      return shiftPoint({ ...(value as Record<string, unknown>), ...point }, offset) as T;
    }

    const clone: Record<string, unknown> = { ...(value as Record<string, unknown>) };

    Object.entries(clone).forEach(([key, item]) => {
      clone[key] = applyOffset(item, offset, key);
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

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  const offset: Offset = {
    x: -padding - bounds.minX,
    y: -padding - bounds.minY,
  };

  const normalizedSize = {
    width: Math.max(width + padding * 2, 2 * padding),
    height: Math.max(height + padding * 2, 2 * padding),
  };

  if (offset.x === 0 && offset.y === 0) {
    if (model.size && model.size.width === normalizedSize.width && model.size.height === normalizedSize.height) {
      return { model, offset };
    }

    return {
      model: {
        ...model,
        size: normalizedSize,
      },
      offset,
    };
  }

  return {
    model: {
      ...model,
      size: normalizedSize,
      elements: applyOffset(model.elements, offset),
      relationships: applyOffset(model.relationships, offset),
      interactive: applyOffset(model.interactive, offset),
    },
    offset,
  };
};
