import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import type { Project, ProjectStatus } from "@/components/project/projectData";

export type EventStatus = "completed" | "ongoing" | "scheduled";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  category: string;
  location: string;
  period: string;
  memo: string;
  status: EventStatus;
  projectId: string;
};

export const statusLabel: Record<EventStatus, string> = {
  completed: "완료",
  ongoing: "진행 중",
  scheduled: "예정",
};

export const calendarEventAccentColors = {
  past: "#bfbfbf",
  ongoing: "#52c41a",
  scheduled: "#faad14",
} as const;

/** 캘린더 막대용 연한 배경색 (불투명 — segment 겹침 시 경계선이 보이지 않음) */
export const calendarEventBarColors = {
  past: "#f0f0f0",
  ongoing: "#edf9e8",
  scheduled: "#fff4e0",
} as const;

export type EventColorKey = keyof typeof calendarEventAccentColors;

function resolveEventColorKey(
  cellDate: Dayjs,
  event: Pick<CalendarEvent, "status">,
  now: Dayjs = dayjs(),
): EventColorKey {
  if (cellDate.startOf("day").isBefore(now.startOf("day"))) {
    return "past";
  }

  switch (event.status) {
    case "ongoing":
      return "ongoing";
    case "scheduled":
      return "scheduled";
    case "completed":
      return "past";
  }
}

export function getBarTextColor(): string {
  return "rgba(0, 0, 0, 0.75)";
}

export function getEventAccentColor(
  cellDate: Dayjs,
  event: Pick<CalendarEvent, "status">,
  now?: Dayjs,
): string {
  return calendarEventAccentColors[resolveEventColorKey(cellDate, event, now)];
}

export function getEventBarBackgroundColor(
  cellDate: Dayjs,
  event: Pick<CalendarEvent, "status">,
  now?: Dayjs,
): string {
  return calendarEventBarColors[resolveEventColorKey(cellDate, event, now)];
}

export type BarSegment = "single" | "start" | "middle" | "end";

export type ProjectSpan = {
  projectId: string;
  title: string;
  category: string;
  location: string;
  period: string;
  memo: string;
  status: EventStatus;
  startDate: string;
  endDate: string;
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

function formatProjectPeriod(project: Project): string {
  if (project.fullStartDate && project.fullEndDate) {
    const start = project.fullStartDate.replace(/-/g, ".");
    const end = project.fullEndDate.replace(/-/g, ".");
    return start === end ? start : `${start} ~ ${end}`;
  }

  return `${project.startDate} ~ ${project.endDate}`;
}

export function buildProjectSpans(projects: Project[]): ProjectSpan[] {
  const spans: ProjectSpan[] = [];

  for (const project of projects) {
    const start = parseDateKey(project.fullStartDate ?? project.createdAt);
    const end = parseDateKey(project.fullEndDate ?? project.fullStartDate ?? project.createdAt);
    if (!start || !end) continue;

    const last = end < start ? start : end;

    spans.push({
      projectId: project.id,
      title: project.name,
      category: project.category,
      location: project.location,
      period: formatProjectPeriod(project),
      memo: project.memo?.trim() || "메모 없음",
      status: mapProjectStatus(project.status),
      startDate: toDateKeyFromDate(start),
      endDate: toDateKeyFromDate(last),
    });
  }

  return spans.sort((a, b) => a.startDate.localeCompare(b.startDate) || a.title.localeCompare(b.title));
}

export function getProjectSpansForDate(dateKey: string, spans: ProjectSpan[]) {
  return spans.filter((span) => dateKey >= span.startDate && dateKey <= span.endDate);
}

export function getBarSegment(date: Dayjs, startKey: string, endKey: string): BarSegment {
  const dateKey = toDateKey(date);

  if (startKey === endKey) {
    return "single";
  }

  const isProjectStart = dateKey === startKey;
  const isProjectEnd = dateKey === endKey;
  const isWeekStart = date.day() === 0;
  const isWeekEnd = date.day() === 6;

  const startsHere = isProjectStart || (isWeekStart && dateKey > startKey);
  const endsHere = isProjectEnd || (isWeekEnd && dateKey < endKey);

  if (startsHere && endsHere) {
    return "single";
  }
  if (startsHere) {
    return "start";
  }
  if (endsHere) {
    return "end";
  }
  return "middle";
}

export function getRowSegmentInfo(
  date: Dayjs,
  projectStartKey: string,
  projectEndKey: string,
): { rowStartKey: string; rowEndKey: string; daysInRow: number; labelAnchorKey: string } {
  const weekStartKey = toDateKey(date.subtract(date.day(), "day"));
  const weekEndKey = toDateKey(date.add(6 - date.day(), "day"));

  const rowStartKey = weekStartKey < projectStartKey ? projectStartKey : weekStartKey;
  const rowEndKey = weekEndKey > projectEndKey ? projectEndKey : weekEndKey;

  const daysInRow = dayjs(rowEndKey).diff(dayjs(rowStartKey), "day") + 1;
  const centerOffset = Math.floor((daysInRow - 1) / 2);
  const labelAnchorKey = toDateKey(dayjs(rowStartKey).add(centerOffset, "day"));

  return { rowStartKey, rowEndKey, daysInRow, labelAnchorKey };
}

export function shouldShowBarLabel(
  date: Dayjs,
  projectStartKey: string,
  projectEndKey: string,
  segment: BarSegment,
): boolean {
  if (segment === "single") {
    return true;
  }

  const { labelAnchorKey } = getRowSegmentInfo(date, projectStartKey, projectEndKey);
  return toDateKey(date) === labelAnchorKey;
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
        category: project.category,
        location: project.location,
        period: formatProjectPeriod(project),
        memo: project.memo?.trim() || "메모 없음",
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
