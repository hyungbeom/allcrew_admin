export type EventStatus = "completed" | "ongoing" | "scheduled";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  status: EventStatus;
};

export const statusLabel: Record<EventStatus, string> = {
  completed: "완료",
  ongoing: "진행 중",
  scheduled: "예정",
};

export const calendarEvents: CalendarEvent[] = [
  { id: "1", date: "2026-06-06", title: "신논현 치맥 페스티벌", status: "ongoing" },
  { id: "1-2", date: "2026-06-06", title: "현장 브리핑", status: "scheduled" },
  { id: "2", date: "2026-06-07", title: "신논현 치맥 페스티벌", status: "ongoing" },
  { id: "2-2", date: "2026-06-07", title: "야간 근무", status: "scheduled" },
  { id: "3", date: "2026-06-08", title: "신논현 치맥 페스티벌", status: "ongoing" },
  { id: "3-2", date: "2026-06-08", title: "안전교육", status: "scheduled" },
  { id: "4", date: "2026-06-09", title: "신논현 치맥 페스티벌", status: "ongoing" },
  { id: "4-2", date: "2026-06-09", title: "철수 점검", status: "scheduled" },
  { id: "5", date: "2026-06-10", title: "6/16 test", status: "scheduled" },
  { id: "5-2", date: "2026-06-10", title: "크루 모집 마감", status: "scheduled" },
  { id: "6", date: "2026-06-11", title: "6/16 test", status: "scheduled" },
  { id: "6-2", date: "2026-06-11", title: "장비 반입", status: "ongoing" },
  { id: "7", date: "2026-06-12", title: "6/16 test", status: "scheduled" },
  { id: "8", date: "2026-06-12", title: "강남 팝업 스태프", status: "scheduled" },
  { id: "9", date: "2026-06-12", title: "홍대 야간 행사", status: "ongoing" },
  { id: "10", date: "2026-06-13", title: "6/16 test", status: "scheduled" },
  { id: "10-2", date: "2026-06-13", title: "중간 정산", status: "scheduled" },
  { id: "11", date: "2026-06-14", title: "6/16 test", status: "scheduled" },
  { id: "11-2", date: "2026-06-14", title: "현장 점검", status: "ongoing" },
  { id: "12", date: "2026-06-15", title: "6/16 test", status: "scheduled" },
  { id: "12-2", date: "2026-06-15", title: "세이프넷 점검", status: "scheduled" },
  { id: "13", date: "2026-06-16", title: "6/16 test", status: "ongoing" },
  { id: "13-2", date: "2026-06-16", title: "오픈 리허설", status: "ongoing" },
  { id: "14", date: "2026-06-17", title: "6/16 test", status: "ongoing" },
  { id: "14-2", date: "2026-06-17", title: "본행사 1일차", status: "ongoing" },
  { id: "15", date: "2026-06-18", title: "6/16 test", status: "ongoing" },
  { id: "15-2", date: "2026-06-18", title: "본행사 2일차", status: "ongoing" },
  { id: "16", date: "2026-06-19", title: "asd", status: "completed" },
  { id: "16-2", date: "2026-06-19", title: "정산 마감", status: "scheduled" },
  { id: "16-3", date: "2026-06-19", title: "크루 피드백", status: "scheduled" },
  { id: "17", date: "2026-06-20", title: "철수", status: "scheduled" },
  { id: "17-2", date: "2026-06-20", title: "장비 회수", status: "scheduled" },
];

export function getEventsByDate(dateKey: string) {
  return calendarEvents.filter((event) => event.date === dateKey);
}

export function getEventsInMonth(year: number, month: number) {
  const monthPrefix = `${year}-${String(month).padStart(2, "0")}`;
  return calendarEvents.filter((event) => event.date.startsWith(monthPrefix));
}

export function toDateKey(date: { year: () => number; month: () => number; date: () => number }) {
  const year = date.year();
  const month = String(date.month() + 1).padStart(2, "0");
  const day = String(date.date()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
