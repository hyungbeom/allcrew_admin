import * as XLSX from "xlsx";
import { formatBudget, statusLabel, type Project } from "@/components/project/projectData";

export function downloadProjectListExcel(projects: Project[]) {
  const rows = projects.map((project) => ({
    프로젝트ID: project.id,
    프로젝트: project.name,
    카테고리: project.category,
    장소: project.location,
    기간: `${project.startDate} - ${project.endDate}`,
    크루: `${project.crewCurrent}/${project.crewTotal}`,
    매니저: project.manager ?? "-",
    예산: formatBudget(project.budget),
    진행률: `${project.progress}%`,
    상태: statusLabel[project.status],
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "프로젝트");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `프로젝트_리스트_${date}.xlsx`);
}
