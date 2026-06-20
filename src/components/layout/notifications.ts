import dayjs from "dayjs";

export type NotificationItem = {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

const notificationTemplates: Omit<NotificationItem, "id" | "read" | "createdAt">[] = [
  {
    title: "관리자 페이지 피드백을 받고자 합니다.",
    description:
      "안녕하세요. ALLCREW 관리자 페이지 사용 중 불편했던 점이나 개선이 필요한 부분에 대한 피드백을 받고 있습니다. 짧은 설문이나 의견을 남겨주시면 서비스 개선에 반영하겠습니다.",
  },
  {
    title: "근무시간 연장 요청이 도착했어요",
    description:
      "박서준님이 '6/16 test' 프로젝트에서 30분 연장을 요청했어요. 승인 또는 거절 처리가 필요합니다.",
  },
  {
    title: "교육 이수가 완료되었어요",
    description:
      "이민호님이 '안전교육 기초' 과정을 완료했어요. 크루 DB에서 이수 이력을 확인할 수 있습니다.",
  },
  {
    title: "지각 알림이 발생했어요",
    description:
      "김지훈님이 오늘 09:15에 출근했어요. 지각 기록은 근태 현황에서 확인할 수 있습니다.",
  },
  {
    title: "구역 이탈이 감지되었어요",
    description:
      "한동훈님이 '판교 현장 B' 안전구역을 벗어났어요. 세이프넷 관제센터에서 상세 내역을 확인해 주세요.",
  },
];

const daysAgoByIndex = [0, 1, 2, 3, 5, 6, 7, 10, 12, 14, 20, 30];

export type NotificationTimeDisplay =
  | { kind: "relative"; label: string; daysAgo: number }
  | { kind: "today"; label: string }
  | { kind: "date"; label: string };

export function getNotificationTimeDisplay(
  createdAt: string,
  now = dayjs(),
): NotificationTimeDisplay {
  const date = dayjs(createdAt);
  const diffDays = now.startOf("day").diff(date.startOf("day"), "day");

  if (diffDays >= 1 && diffDays <= 5) {
    return { kind: "relative", label: `${diffDays}일 전`, daysAgo: diffDays };
  }

  if (diffDays === 0) {
    return { kind: "today", label: "오늘" };
  }

  return { kind: "date", label: date.format("YYYY.M.D") };
}

export function formatNotificationTime(createdAt: string, now = dayjs()): string {
  return getNotificationTimeDisplay(createdAt, now).label;
}

export const initialNotifications: NotificationItem[] = daysAgoByIndex.map((daysAgo, index) => {
  const template = notificationTemplates[index % notificationTemplates.length];

  return {
    ...template,
    id: String(index + 1),
    createdAt: dayjs()
      .subtract(daysAgo, "day")
      .hour(9 + (index % 8))
      .minute(10 + index * 3)
      .second(0)
      .toISOString(),
    read: index > 2,
  };
});
