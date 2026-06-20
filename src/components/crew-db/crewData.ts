export type CrewMember = {
  id: string;
  name: string;
  phone: string;
  role: string;
  projectCount: number;
  workDays: number;
  recentWorkDate: string;
  safetyTraining: string | null;
  rating: number;
  projectIds: string[];
};

export const projectFilterOptions = [
  { value: "all", label: "전체 프로젝트" },
  { value: "PRJ-0010", label: "신논현 치맥 페스티벌" },
  { value: "PRJ-0009", label: "6/16 test" },
  { value: "PRJ-0012", label: "asd" },
  { value: "PRJ-0008", label: "강남 팝업 스태프" },
  { value: "PRJ-0007", label: "홍대 야간 행사" },
];

export const crewMembers: CrewMember[] = [
  {
    id: "CRW-001",
    name: "김민수",
    phone: "010-1111-0012",
    role: "크루",
    projectCount: 6,
    workDays: 6,
    recentWorkDate: "2026-06-19",
    safetyTraining: null,
    rating: 5.0,
    projectIds: ["PRJ-0010", "PRJ-0009", "PRJ-0012"],
  },
  {
    id: "CRW-002",
    name: "이서연",
    phone: "010-2222-0034",
    role: "크루",
    projectCount: 5,
    workDays: 5,
    recentWorkDate: "2026-06-18",
    safetyTraining: null,
    rating: 4.9,
    projectIds: ["PRJ-0010", "PRJ-0008"],
  },
  {
    id: "CRW-003",
    name: "박준호",
    phone: "010-3333-0056",
    role: "크루",
    projectCount: 4,
    workDays: 4,
    recentWorkDate: "2026-06-17",
    safetyTraining: null,
    rating: 4.8,
    projectIds: ["PRJ-0009", "PRJ-0007"],
  },
  {
    id: "CRW-004",
    name: "최유진",
    phone: "010-4444-0078",
    role: "크루",
    projectCount: 3,
    workDays: 3,
    recentWorkDate: "2026-06-15",
    safetyTraining: null,
    rating: 5.0,
    projectIds: ["PRJ-0012", "PRJ-0008"],
  },
  {
    id: "CRW-005",
    name: "정하늘",
    phone: "010-5555-0090",
    role: "크루",
    projectCount: 2,
    workDays: 2,
    recentWorkDate: "2026-06-12",
    safetyTraining: null,
    rating: 4.7,
    projectIds: ["PRJ-0007"],
  },
];

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  return phone;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) {
    return phone;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 9)}**`;
}

export function formatRecentWork(date: string) {
  if (!date?.trim()) {
    return "-";
  }

  const [year, month, day] = date.split("-");
  if (!year || !month || !day) {
    return "-";
  }

  return `${year}.${month}.${day}`;
}

export const avatarColors = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16", "#eb2f96"];
