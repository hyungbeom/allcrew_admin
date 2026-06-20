import { apiFetch } from "./client";
import type { CrewMember } from "@/components/crew-db/crewData";
import type { Contract } from "@/components/contract/contractData";
import type { Settlement } from "@/components/settlement/settlementData";
import type { ChatRoom } from "@/components/chat/chatData";
import type { Incident } from "@/components/safenet/safenetData";
import type { PeriodKey, TopCrewRow } from "@/components/statistics/statisticsData";

export type ProjectFilterOption = { value: string; label: string };

export type DashboardApiResponse = {
  attendance: {
    total: number;
    checkedIn: number;
    normal: number;
    late: number;
    absent: number;
  };
  siteStats: {
    activeSites: number;
    fieldCrew: number;
    zoneViolations: number;
  };
  tasks: {
    unverifiedApplicants: number;
    verifiedApplicants: number;
    recruitingProjects: number;
    pendingSettlements: number;
    educationExpiring: number;
  };
  todayProjects: {
    id: string;
    name: string;
    location: string;
    status: string;
    crewCurrent: number;
    crewTotal: number;
  }[];
  activities: { text: string; date: string }[];
  monthlySales: { month: string; value: number }[];
  categoryDistribution: { category: string; value: number }[];
  contractStats?: { signed: number; pending: number; unsigned: number };
  settlementStats?: { pending: number; approved: number; paid: number };
};

export type CrewListApiResponse = { items: CrewMember[]; total: number };

export type ContractListApiResponse = {
  items: Contract[];
  total: number;
  stats: { total: number; signed: number; pending: number; unsigned: number };
};

export type SettlementListApiResponse = {
  items: Settlement[];
  total: number;
  summary: {
    count: number;
    preTaxTotal: number;
    deductionTotal: number;
    netPayTotal: number;
    pendingCount: number;
  };
};

export type ChatListApiResponse = { items: ChatRoom[]; total: number };

export type SafenetListApiResponse = {
  items: Incident[];
  total: number;
  workflowStats: {
    received: number;
    redAlert: number;
    pttResponse: number;
    closed: number;
  };
};

export type StatisticsApiResponse = {
  period: string;
  range: string;
  summary: {
    totalProjects: number;
    totalCrew: number;
    totalWorkHours: number;
    safetyIncidents: number;
  };
  monthlyProjects: { month: string; value: number }[];
  monthlyCrew: { month: string; value: number }[];
  topCrew: TopCrewRow[];
};

export type EducationOverviewApiResponse = {
  completionRate: number;
  completedCount: number;
  totalCount: number;
  incompleteCount: number;
  ktlRequired: boolean;
  siteRequired: boolean;
  statusCounts: Record<string, number>;
};

export type PttOverviewApiResponse = {
  channels: { id: string; name: string; description: string; type: string }[];
  logs: { id: string; speaker: string; message: string; time: string }[];
};

export type AgencySettingsApiResponse = {
  companyName: string;
  companySlug: string;
  businessNumber: string;
  address: string | null;
  addressDetail: string | null;
};

export async function fetchDashboard() {
  return apiFetch<DashboardApiResponse>("/api/admin/dashboard");
}

export async function fetchCrewMembers() {
  const response = await apiFetch<CrewListApiResponse>("/api/admin/crew");
  return response.items.map((item) => ({
    ...item,
    recentWorkDate: item.recentWorkDate ?? "",
  }));
}

export async function fetchContracts() {
  const response = await apiFetch<ContractListApiResponse>("/api/admin/contracts");
  return response;
}

export async function fetchSettlements() {
  return apiFetch<SettlementListApiResponse>("/api/admin/settlements");
}

export async function fetchChatRooms() {
  const response = await apiFetch<ChatListApiResponse>("/api/admin/chats");
  return response.items;
}

export async function fetchSafenetIncidents() {
  return apiFetch<SafenetListApiResponse>("/api/admin/safenet");
}

export async function fetchStatistics(period: PeriodKey = "quarter") {
  return apiFetch<StatisticsApiResponse>(`/api/admin/statistics?period=${period}`);
}

export async function fetchEducationOverview(projectCode?: string) {
  const query = projectCode ? `?projectCode=${encodeURIComponent(projectCode)}` : "";
  return apiFetch<EducationOverviewApiResponse>(`/api/admin/education${query}`);
}

export async function updateEducationSettings(payload: {
  projectCode?: string;
  ktlRequired: boolean;
  siteRequired: boolean;
}) {
  return apiFetch<EducationOverviewApiResponse>("/api/admin/education", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchPttOverview(projectCode?: string) {
  const query = projectCode ? `?projectCode=${encodeURIComponent(projectCode)}` : "";
  return apiFetch<PttOverviewApiResponse>(`/api/admin/ptt${query}`);
}

export async function fetchAgencySettings() {
  return apiFetch<AgencySettingsApiResponse>("/api/admin/agency");
}

export async function updateAgencySettings(payload: {
  companyName: string;
  address?: string;
  addressDetail?: string;
}) {
  return apiFetch<AgencySettingsApiResponse>("/api/admin/agency", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchProjectFilterOptions(): Promise<ProjectFilterOption[]> {
  const response = await apiFetch<{ items: ProjectFilterOption[] }>(
    "/api/admin/projects/filter-options",
  );
  return response.items;
}
