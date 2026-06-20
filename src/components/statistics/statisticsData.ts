export type PeriodKey = "month" | "quarter" | "year";

export const periodOptions: { key: PeriodKey; label: string; range: string }[] = [
  { key: "month", label: "이번 달", range: "2026.06.01 - 2026.06.30" },
  { key: "quarter", label: "이번 분기", range: "2026.04.01 - 2026.06.30" },
  { key: "year", label: "올해", range: "2026.01.01 - 2026.06.30" },
];

export const summaryStats = {
  totalProjects: 12,
  totalCrew: 11,
  totalWorkHours: 0,
  safetyIncidents: 0,
};

export const monthlyProjectData = [
  { month: "1월", value: 0 },
  { month: "2월", value: 0 },
  { month: "3월", value: 0 },
  { month: "4월", value: 0 },
  { month: "5월", value: 0 },
  { month: "6월", value: 12 },
];

export const monthlyCrewData = [
  { month: "1월", value: 0 },
  { month: "2월", value: 0 },
  { month: "3월", value: 0 },
  { month: "4월", value: 0 },
  { month: "5월", value: 0 },
  { month: "6월", value: 11 },
];

export type TopCrewRow = {
  id: string;
  name: string;
  role: string;
  projectCount: number;
  workHours: number | null;
  rating: number;
};

export const topCrewRows: TopCrewRow[] = [
  { id: "1", name: "박서준", role: "크루", projectCount: 6, workHours: null, rating: 5.0 },
  { id: "2", name: "이서연", role: "크루", projectCount: 2, workHours: null, rating: 5.0 },
  { id: "3", name: "김민수", role: "크루", projectCount: 2, workHours: null, rating: 5.0 },
  { id: "4", name: "최유진", role: "크루", projectCount: 1, workHours: null, rating: 5.0 },
  { id: "5", name: "정하늘", role: "크루", projectCount: 1, workHours: null, rating: 5.0 },
];
