export function toSparklineData(values: number[]) {
  return values.map((value, index) => ({ index, value }));
}
