export type ChatRoomType = "project" | "direct";

export type ChatRoom = {
  id: string;
  title: string;
  preview: string;
  time: string;
  type: ChatRoomType;
  projectId: string;
  avatarText: string;
  avatarColor: string;
};

export type ChatTypeFilter = "all" | ChatRoomType;

export const chatRooms: ChatRoom[] = [
  {
    id: "CHT-0011",
    title: "6월 12일 테스트 전체",
    preview: "박서준 외 3명 · 메시지가 없어요",
    time: "16:30",
    type: "project",
    projectId: "PRJ-0009",
    avatarText: "6",
    avatarColor: "#fa8c16",
  },
  {
    id: "CHT-0010",
    title: "박서준 · 6/16 test",
    preview: "1:1 · 메시지가 없어요",
    time: "06.15",
    type: "direct",
    projectId: "PRJ-0009",
    avatarText: "박",
    avatarColor: "#1677ff",
  },
  {
    id: "CHT-0009",
    title: "신논현 치맥 페스티벌",
    preview: "김민수 외 5명 · 메시지가 없어요",
    time: "06.12",
    type: "project",
    projectId: "PRJ-0010",
    avatarText: "신",
    avatarColor: "#52c41a",
  },
  {
    id: "CHT-0008",
    title: "이서연 · asd",
    preview: "1:1 · 메시지가 없어요",
    time: "06.10",
    type: "direct",
    projectId: "PRJ-0012",
    avatarText: "이",
    avatarColor: "#722ed1",
  },
  {
    id: "CHT-0007",
    title: "asd 전체",
    preview: "최유진 외 2명 · 메시지가 없어요",
    time: "06.08",
    type: "project",
    projectId: "PRJ-0012",
    avatarText: "a",
    avatarColor: "#13c2c2",
  },
  {
    id: "CHT-0006",
    title: "박준호 · 6/16 test",
    preview: "1:1 · 메시지가 없어요",
    time: "06.07",
    type: "direct",
    projectId: "PRJ-0009",
    avatarText: "박",
    avatarColor: "#eb2f96",
  },
  {
    id: "CHT-0005",
    title: "정하늘 · asd",
    preview: "1:1 · 메시지가 없어요",
    time: "06.05",
    type: "direct",
    projectId: "PRJ-0012",
    avatarText: "정",
    avatarColor: "#fa541c",
  },
  {
    id: "CHT-0004",
    title: "강남 팝업 스태프",
    preview: "윤지아 외 4명 · 메시지가 없어요",
    time: "05.30",
    type: "project",
    projectId: "PRJ-0008",
    avatarText: "강",
    avatarColor: "#2f54eb",
  },
  {
    id: "CHT-0003",
    title: "한소희 · 6/16 test",
    preview: "1:1 · 메시지가 없어요",
    time: "05.28",
    type: "direct",
    projectId: "PRJ-0009",
    avatarText: "한",
    avatarColor: "#a0d911",
  },
  {
    id: "CHT-0002",
    title: "오민재 · asd",
    preview: "1:1 · 메시지가 없어요",
    time: "05.25",
    type: "direct",
    projectId: "PRJ-0012",
    avatarText: "오",
    avatarColor: "#ff4d4f",
  },
  {
    id: "CHT-0001",
    title: "송다은 · 6/16 test",
    preview: "1:1 · 메시지가 없어요",
    time: "05.20",
    type: "direct",
    projectId: "PRJ-0009",
    avatarText: "송",
    avatarColor: "#597ef7",
  },
];

export function getChatTypeCounts(items: ChatRoom[]) {
  return {
    all: items.length,
    project: items.filter((item) => item.type === "project").length,
    direct: items.filter((item) => item.type === "direct").length,
  };
}
