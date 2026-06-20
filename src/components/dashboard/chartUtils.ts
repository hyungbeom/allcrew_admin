export function toSparklineData(values: number[] | undefined | null) {
  const safeValues = (Array.isArray(values) ? values : [])
    .filter((value) => typeof value === "number" && Number.isFinite(value));

  if (safeValues.length === 0) {
    return [
      { index: 0, value: 0 },
      { index: 1, value: 0 },
    ];
  }

  if (safeValues.length === 1) {
    return [
      { index: 0, value: safeValues[0] },
      { index: 1, value: safeValues[0] },
    ];
  }

  return safeValues.map((value, index) => ({ index, value }));
}

export type ChartPoint = { month: string; value: number };
export type CategoryPoint = { category: string; value: number };
export type StatPoint = { label: string; value: number };

function toFiniteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function readStringField(item: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = item[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

export function normalizeChartPoints(data: ChartPoint[] | undefined | null): ChartPoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const month = readStringField(record, ["month", "label", "name"]);
      const value = toFiniteNumber(record.value);

      if (!month || value === null) {
        return null;
      }

      return { month, value };
    })
    .filter((item): item is ChartPoint => item !== null);
}

export function normalizeCategoryPoints(data: CategoryPoint[] | undefined | null): CategoryPoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const category = readStringField(record, ["category", "name", "label", "type"]);
      const value = toFiniteNumber(record.value);

      if (!category || value === null) {
        return null;
      }

      return { category, value };
    })
    .filter((item): item is CategoryPoint => item !== null);
}

export function normalizeStatPoints(data: StatPoint[] | undefined | null): StatPoint[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const label = readStringField(record, ["label", "name", "category", "month"]);
      const value = toFiniteNumber(record.value);

      if (!label || value === null) {
        return null;
      }

      return { label, value };
    })
    .filter((item): item is StatPoint => item !== null);
}

export function withChartFallbackPoints(data: ChartPoint[]): ChartPoint[] {
  if (data.length >= 2) {
    return data;
  }

  if (data.length === 1) {
    return [data[0], { ...data[0], month: `${data[0].month}·` }];
  }

  return [
    { month: "1월", value: 0 },
    { month: "2월", value: 0 },
  ];
}

export function withStatFallbackPoints(data: StatPoint[]): StatPoint[] {
  return data.length > 0 ? data : [{ label: "-", value: 0 }];
}

export function createChartKey(prefix: string, data: unknown) {
  return `${prefix}-${JSON.stringify(data)}`;
}
