import { apiFetch } from "./client";
import type { CreateProjectFormValues } from "@/components/project/CreateProjectModal";
import type { Project, ProjectStatus } from "@/components/project/projectData";

export type ApiProjectResponse = {
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
  status: string;
  createdAt: string;
  workHours?: string;
  fullStartDate?: string;
  fullEndDate?: string;
};

export type ProjectListApiResponse = {
  items: ApiProjectResponse[];
  total: number;
};

export type CreateProjectApiResponse = {
  message: string;
  project: ApiProjectResponse;
};

export function toCreateProjectPayload(values: CreateProjectFormValues) {
  return {
    name: values.name.trim(),
    eventType: values.eventType,
    description: values.description?.trim() || undefined,
    startDate: values.startDate.format("YYYY-MM-DD"),
    endDate: values.endDate.format("YYYY-MM-DD"),
    workStartTime: values.workStartTime.format("HH:mm:ss"),
    workEndTime: values.workEndTime.format("HH:mm:ss"),
    address: values.address?.trim() ?? "",
    addressDetail: values.addressDetail?.trim() || undefined,
    gpsRadius: values.gpsRadius,
    breakMinutes: values.breakMinutes,
    welfare: values.welfare ?? [],
    recruitmentDeadline: values.recruitmentDeadline.format("YYYY-MM-DD"),
    preferredQualifications: values.preferredQualifications?.trim() || undefined,
    startRecruitmentImmediately: values.startRecruitmentImmediately,
    positions: values.positions.map((position) => ({
      name: position.name.trim(),
      count: position.count,
      payType: position.payType,
      amount: position.amount,
    })),
  };
}

export function mapApiProject(project: ApiProjectResponse): Project {
  return {
    id: project.id,
    name: project.name,
    category: project.category,
    location: project.location,
    startDate: project.startDate,
    endDate: project.endDate,
    crewCurrent: project.crewCurrent,
    crewTotal: project.crewTotal,
    manager: project.manager,
    budget: Number(project.budget),
    progress: project.progress,
    status: project.status as ProjectStatus,
    createdAt: project.createdAt,
    workHours: project.workHours,
    fullStartDate: project.fullStartDate,
    fullEndDate: project.fullEndDate,
  };
}

export type ApiProjectDetailResponse = ApiProjectResponse & {
  description?: string | null;
  address?: string;
  addressDetail?: string | null;
  gpsRadius?: number;
  breakMinutes?: number;
  welfare?: string[];
  recruitmentDeadline?: string;
  preferredQualifications?: string | null;
  startRecruitmentImmediately?: boolean;
  positions?: {
    name: string;
    count: number;
    payType: string;
    amount: number;
  }[];
  avgHourlyWage?: number | null;
  accumulatedCost?: number;
  applicantCount?: number;
};

export function mapApiProjectDetail(project: ApiProjectDetailResponse): Project {
  return {
    ...mapApiProject(project),
    memo: project.description ?? undefined,
    slug: project.id.toLowerCase(),
    gpsRadius: project.gpsRadius,
    breakMinutes: project.breakMinutes,
    welfare: project.welfare ?? [],
    positions: project.positions ?? [],
    avgHourlyWage: project.avgHourlyWage ?? undefined,
    accumulatedCost: project.accumulatedCost ?? 0,
    applicantCount: project.applicantCount ?? 0,
  };
}

export async function fetchProject(projectCode: string) {
  const response = await apiFetch<ApiProjectDetailResponse>(
    `/api/admin/projects/${encodeURIComponent(projectCode)}`,
  );
  return mapApiProjectDetail(response);
}

export async function fetchProjects() {
  const response = await apiFetch<ProjectListApiResponse>("/api/admin/projects");
  return response.items.map(mapApiProject);
}

export async function createProject(values: CreateProjectFormValues) {
  const response = await apiFetch<CreateProjectApiResponse>("/api/admin/projects", {
    method: "POST",
    body: JSON.stringify(toCreateProjectPayload(values)),
  });
  return mapApiProject(response.project);
}
