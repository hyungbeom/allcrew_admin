import type { Project, ProjectStatus } from "@/components/project/projectData";

export type EventStatus = "completed" | "ongoing" | "scheduled";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  status: EventStatus;
  projectId: string;
};

export const statusLabel: Record<EventStatus, string> = {
  completed: "완료",
  ongoing: "진행 중",
  scheduled: "예정",
};

function mapProjectStatus(status: ProjectStatus): EventStatus {
  switch (status) {
    case "completed":
      return "completed";
    case "in_progress":
      return "ongoing";
    case "recruiting":
      return "scheduled";
  }
}

function parseDateKey(value: string): Date | null {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

function toDateKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** 프로젝트 기간(start~end)을 날짜별 캘린더 이벤트로 변환 */
export function buildCalendarEvents(projects: Project[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const project of projects) {
    const start = parseDateKey(project.fullStartDate ?? project.createdAt);
    const end = parseDateKey(project.fullEndDate ?? project.fullStartDate ?? project.createdAt);
    if (!start || !end) continue;

    const cursor = new Date(start);
    const last = end < start ? start : end;

    while (cursor <= last) {
      const dateKey = toDateKeyFromDate(cursor);
      events.push({
        id: `${project.id}-${dateKey}`,
        date: dateKey,
        title: project.name,
        status: mapProjectStatus(project.status),
        projectId: project.id,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function getEventsByDate(events: CalendarEvent[], dateKey: string) {
  return events.filter((event) => event.date === dateKey);
}

export function getEventsInMonth(events: CalendarEvent[], year: number, month: number) {
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  return events.filter((event) => event.date.startsWith(monthPrefix));
}

export function toDateKey(date: { year: () => number; month: () => number; date: () => number }) {
  const year = date.year();
  const month = String(date.month() + 1).padStart(2, "0");
  const day = String(date.date()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
