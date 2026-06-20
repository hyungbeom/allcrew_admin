export type ProjectStatus = "in_progress" | "recruiting" | "completed";

export type Project = {
  id: string;
  name: string;
  category: string;
  location: string;
  startDate: string;
  endDate: string;
  crewCurrent: number;
  crewTotal: number;
  manager: string | null;
  budget: number;
  progress: number;
  status: ProjectStatus;
  createdAt: string;
  slug?: string;
  workHours?: string;
  memo?: string;
  fullStartDate?: string;
  fullEndDate?: string;
  avgHourlyWage?: number;
  accumulatedCost?: number;
  applicantCount?: number;
  gpsRadius?: number;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  addressDetail?: string | null;
  breakMinutes?: number;
  welfare?: string[];
  positions?: {
    name: string;
    count: number;
    payType: string;
    amount: number;
  }[];
  fieldAttendance?: {
    normal: number;
    late: number;
    absent: number;
  };
};

export const statusLabel: Record<ProjectStatus, string> = {
  in_progress: "진행중",
  recruiting: "모집중",
  completed: "완료",
};

export type StatusFilter = "all" | ProjectStatus;

export const projects: Project[] = [
  {
    id: "PRJ-0012",
    name: "asd",
    category: "기타",
    location: "GL메트로시티한강 지식산업센터 A동",
    startDate: "06.18",
    endDate: "06.20",
    crewCurrent: 1,
    crewTotal: 2,
    manager: null,
    budget: 22,
    progress: 0,
    status: "completed",
    createdAt: "2026-06-18",
  },
  {
    id: "PRJ-0011",
    name: "6.17",
    category: "기타",
    location: "GL메트로시티한강 지식산업센터 A동",
    startDate: "06.17",
    endDate: "06.19",
    crewCurrent: 1,
    crewTotal: 2,
    manager: null,
    budget: 22,
    progress: 0,
    status: "completed",
    createdAt: "2026-06-17",
  },
  {
    id: "PRJ-0010",
    name: "신논현 치맥 페스티벌",
    category: "기타",
    location: "GL메트로시티한강 지식산업센터 A동",
    startDate: "06.06",
    endDate: "06.09",
    crewCurrent: 1,
    crewTotal: 2,
    manager: null,
    budget: 22,
    progress: 0,
    status: "completed",
    createdAt: "2026-06-06",
  },
  {
    id: "PRJ-0009",
    name: "6/16 test",
    slug: "onqqdnx7",
    category: "공연·행사",
    location: "GL메트로시티한강 지식산업센터 A동",
    startDate: "06.16",
    endDate: "06.16",
    fullStartDate: "2026.06.16",
    fullEndDate: "2026.06.16",
    workHours: "17:30 - 19:00",
    crewCurrent: 1,
    crewTotal: 1,
    manager: null,
    budget: 88000,
    progress: 100,
    status: "completed",
    createdAt: "2026-06-10",
    memo: "인터컴, 발열 등 확인",
    avgHourlyWage: 11000,
    accumulatedCost: 20000,
    applicantCount: 1,
    fieldAttendance: { normal: 36, late: 6, absent: 6 },
  },
  {
    id: "PRJ-0008",
    name: "강남 팝업 스태프",
    category: "행사",
    location: "서울 강남구 테헤란로 152",
    startDate: "05.28",
    endDate: "05.30",
    crewCurrent: 2,
    crewTotal: 2,
    manager: "김매니저",
    budget: 1200000,
    progress: 100,
    status: "completed",
    createdAt: "2026-05-28",
  },
  {
    id: "PRJ-0007",
    name: "홍대 야간 행사",
    category: "행사",
    location: "서울 마포구 와우산로 94",
    startDate: "05.20",
    endDate: "05.22",
    crewCurrent: 3,
    crewTotal: 4,
    manager: "이매니저",
    budget: 890000,
    progress: 100,
    status: "completed",
    createdAt: "2026-05-20",
  },
  {
    id: "PRJ-0006",
    name: "코엑스 전시 보조",
    category: "전시",
    location: "서울 강남구 영동대로 513",
    startDate: "05.12",
    endDate: "05.15",
    crewCurrent: 5,
    crewTotal: 5,
    manager: "박매니저",
    budget: 2100000,
    progress: 100,
    status: "completed",
    createdAt: "2026-05-12",
  },
  {
    id: "PRJ-0005",
    name: "부산 해운대 페스티벌",
    category: "행사",
    location: "부산 해운대구 우동 710-1",
    startDate: "04.28",
    endDate: "05.01",
    crewCurrent: 8,
    crewTotal: 10,
    manager: "최매니저",
    budget: 4500000,
    progress: 100,
    status: "completed",
    createdAt: "2026-04-28",
  },
  {
    id: "PRJ-0004",
    name: "대구 푸드 페어",
    category: "행사",
    location: "대구 북구 유통단지로 105",
    startDate: "04.10",
    endDate: "04.13",
    crewCurrent: 4,
    crewTotal: 6,
    manager: "정매니저",
    budget: 1800000,
    progress: 100,
    status: "completed",
    createdAt: "2026-04-10",
  },
  {
    id: "PRJ-0003",
    name: "인천 항만 안전 점검",
    category: "안전",
    location: "인천 중구 항동7가",
    startDate: "03.22",
    endDate: "03.24",
    crewCurrent: 6,
    crewTotal: 6,
    manager: "한매니저",
    budget: 960000,
    progress: 100,
    status: "completed",
    createdAt: "2026-03-22",
  },
  {
    id: "PRJ-0002",
    name: "광주 문화 축제",
    category: "행사",
    location: "광주 북구 문화전당",
    startDate: "03.05",
    endDate: "03.08",
    crewCurrent: 7,
    crewTotal: 8,
    manager: "윤매니저",
    budget: 3200000,
    progress: 100,
    status: "completed",
    createdAt: "2026-03-05",
  },
  {
    id: "PRJ-0001",
    name: "수원 컨벤션 센터",
    category: "전시",
    location: "경기 수원시 영통구 광교중앙로 140",
    startDate: "02.14",
    endDate: "02.17",
    crewCurrent: 5,
    crewTotal: 5,
    manager: "조매니저",
    budget: 1500000,
    progress: 100,
    status: "completed",
    createdAt: "2026-02-14",
  },
];

export function getStatusCounts(items: Project[]) {
  return {
    all: items.length,
    in_progress: items.filter((item) => item.status === "in_progress").length,
    recruiting: items.filter((item) => item.status === "recruiting").length,
    completed: items.filter((item) => item.status === "completed").length,
  };
}

export function formatBudget(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getProjectPeriod(project: Project) {
  if (project.fullStartDate && project.fullEndDate) {
    return `${project.fullStartDate} - ${project.fullEndDate}`;
  }
  return `${project.startDate} - ${project.endDate}`;
}

export function getProjectBudgetUsagePercent(project: Project) {
  if (!project.budget || !project.accumulatedCost) return 0;
  return Math.round((project.accumulatedCost / project.budget) * 100);
}

export function formatCompactBudget(amount: number) {
  if (amount >= 10000) {
    return `₩${Math.round(amount / 10000)}만`;
  }
  return formatBudget(amount);
}

export type ProjectCrewMember = {
  id: string;
  name: string;
  role: string;
  level: number;
  rating: number;
  avatarColor: string;
};

const projectCrewMembers: Record<string, ProjectCrewMember[]> = {
  "PRJ-0009": [
    {
      id: "CRW-001",
      name: "박서준",
      role: "CREW",
      level: 2,
      rating: 4.5,
      avatarColor: "#52c41a",
    },
  ],
};

export function getProjectCrewMembers(projectId: string): ProjectCrewMember[] {
  return projectCrewMembers[projectId] ?? [];
}

export type PlacementZoneMember = {
  id: string;
  name: string;
  role: string;
  avatarColor: string;
};

export type PlacementZone = {
  id: string;
  name: string;
  members: PlacementZoneMember[];
  capacity: number;
};

const projectPlacements: Record<string, PlacementZone[]> = {
  "PRJ-0009": [
    {
      id: "zone-operation",
      name: "운영",
      capacity: 1,
      members: [
        {
          id: "CRW-001",
          name: "박서준",
          role: "CREW",
          avatarColor: "#52c41a",
        },
      ],
    },
  ],
};

export function getProjectPlacements(projectId: string): PlacementZone[] {
  return projectPlacements[projectId] ?? [];
}

export function getUnassignedCrewCount(projectId: string): number {
  const members = getProjectCrewMembers(projectId);
  const assigned = getProjectPlacements(projectId).reduce(
    (sum, zone) => sum + zone.members.length,
    0,
  );
  return Math.max(members.length - assigned, 0);
}

export type ApplicantStatus = "pending" | "approved" | "rejected";

export type ProjectApplicant = {
  id: string;
  name: string;
  role: string;
  status: ApplicantStatus;
  avatarColor: string;
};

export const applicantStatusLabel: Record<ApplicantStatus, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "거절",
};

const projectApplicants: Record<string, ProjectApplicant[]> = {
  "PRJ-0009": [
    {
      id: "APP-001",
      name: "박서준",
      role: "운영",
      status: "approved",
      avatarColor: "#52c41a",
    },
  ],
};

export function getProjectApplicants(projectId: string): ProjectApplicant[] {
  return projectApplicants[projectId] ?? [];
}

export function getApplicantStatusCounts(projectId: string) {
  const applicants = getProjectApplicants(projectId);
  return {
    total: applicants.length,
    pending: applicants.filter((item) => item.status === "pending").length,
    approved: applicants.filter((item) => item.status === "approved").length,
    rejected: applicants.filter((item) => item.status === "rejected").length,
  };
}
