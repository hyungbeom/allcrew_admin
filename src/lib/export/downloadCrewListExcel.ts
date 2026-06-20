import * as XLSX from "xlsx";
import { formatPhone, formatRecentWork, type CrewMember } from "@/components/crew-db/crewData";

export function downloadCrewListExcel(crewMembers: CrewMember[]) {
  const rows = crewMembers.map((crew) => ({
    크루ID: crew.id,
    이름: crew.name,
    연락처: formatPhone(crew.phone),
    "주 직무": crew.role,
    "누적 프로젝트": `${crew.projectCount}건`,
    "누적 근무": `${crew.workDays}일`,
    "최근 근무": formatRecentWork(crew.recentWorkDate),
    안전교육: crew.safetyTraining ?? "-",
    평점: crew.rating.toFixed(1),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "크루");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `크루_리스트_${date}.xlsx`);
}
