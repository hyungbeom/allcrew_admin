export type NotificationItem = {
  id: string;
  tag: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
};

const notificationTemplates: Omit<NotificationItem, "id" | "read">[] = [
  {
    tag: "EXTENSION_REQUEST",
    title: "근무시간 연장 요청이 도착했어요",
    description: "박서준님이 '6/16 test'에서 30분 연장을 요청했어요",
    time: "2일 전",
  },
  {
    tag: "TRAINING_COMPLETED",
    title: "교육 이수가 완료되었어요",
    description: "이민호님이 '안전교육 기초' 과정을 완료했어요",
    time: "2일 전",
  },
  {
    tag: "EXTENSION_REQUEST",
    title: "근무시간 연장 요청이 도착했어요",
    description: "최유진님이 '강남 현장 A'에서 60분 연장을 요청했어요",
    time: "3일 전",
  },
  {
    tag: "ATTENDANCE_ALERT",
    title: "지각 알림이 발생했어요",
    description: "김지훈님이 오늘 09:15에 출근했어요",
    time: "3일 전",
  },
  {
    tag: "TRAINING_COMPLETED",
    title: "교육 이수가 완료되었어요",
    description: "정수아님이 '위험작업 안전교육' 과정을 완료했어요",
    time: "3일 전",
  },
  {
    tag: "ZONE_EXIT",
    title: "구역 이탈이 감지되었어요",
    description: "한동훈님이 '판교 현장 B' 안전구역을 벗어났어요",
    time: "4일 전",
  },
];

export const initialNotifications: NotificationItem[] = Array.from({ length: 25 }, (_, index) => {
  const template = notificationTemplates[index % notificationTemplates.length];
  return {
    ...template,
    id: String(index + 1),
    read: false,
  };
});
