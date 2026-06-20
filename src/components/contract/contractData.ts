export type ContractStatus = "signed" | "pending" | "unsigned";

export type Contract = {
  id: string;
  crewName: string;
  crewRole: string;
  projectName: string;
  projectId: string;
  contractType: string;
  sentDate: string | null;
  signedDate: string | null;
  status: ContractStatus;
};

export const statusLabel: Record<ContractStatus, string> = {
  signed: "서명 완료",
  pending: "서명 대기",
  unsigned: "게이트 차단",
};

export type ContractStatusFilter = "all" | ContractStatus;

export const contracts: Contract[] = [
  {
    id: "CTR-0011",
    crewName: "박서준",
    crewRole: "운영",
    projectName: "asd",
    projectId: "PRJ-0012",
    contractType: "표준 근로",
    sentDate: "2026.06.18",
    signedDate: "2026.06.18",
    status: "signed",
  },
  {
    id: "CTR-0010",
    crewName: "김민수",
    crewRole: "크루",
    projectName: "6/16 test",
    projectId: "PRJ-0009",
    contractType: "표준 근로",
    sentDate: "2026.06.17",
    signedDate: "2026.06.17",
    status: "signed",
  },
  {
    id: "CTR-0009",
    crewName: "이서연",
    crewRole: "크루",
    projectName: "신논현 치맥 페스티벌",
    projectId: "PRJ-0010",
    contractType: "표준 근로",
    sentDate: "2026.06.10",
    signedDate: "2026.06.11",
    status: "signed",
  },
  {
    id: "CTR-0008",
    crewName: "최유진",
    crewRole: "크루",
    projectName: "asd",
    projectId: "PRJ-0012",
    contractType: "표준 근로",
    sentDate: "2026.06.16",
    signedDate: null,
    status: "pending",
  },
  {
    id: "CTR-0007",
    crewName: "정하늘",
    crewRole: "크루",
    projectName: "6/16 test",
    projectId: "PRJ-0009",
    contractType: "표준 근로",
    sentDate: null,
    signedDate: null,
    status: "unsigned",
  },
  {
    id: "CTR-0006",
    crewName: "박준호",
    crewRole: "크루",
    projectName: "강남 팝업 스태프",
    projectId: "PRJ-0008",
    contractType: "표준 근로",
    sentDate: "2026.05.28",
    signedDate: "2026.05.28",
    status: "signed",
  },
  {
    id: "CTR-0005",
    crewName: "윤지아",
    crewRole: "크루",
    projectName: "홍대 야간 행사",
    projectId: "PRJ-0007",
    contractType: "표준 근로",
    sentDate: "2026.05.20",
    signedDate: "2026.05.21",
    status: "signed",
  },
  {
    id: "CTR-0004",
    crewName: "한소희",
    crewRole: "크루",
    projectName: "asd",
    projectId: "PRJ-0012",
    contractType: "표준 근로",
    sentDate: "2026.06.12",
    signedDate: "2026.06.12",
    status: "signed",
  },
  {
    id: "CTR-0003",
    crewName: "오민재",
    crewRole: "크루",
    projectName: "6/16 test",
    projectId: "PRJ-0009",
    contractType: "표준 근로",
    sentDate: null,
    signedDate: null,
    status: "unsigned",
  },
  {
    id: "CTR-0002",
    crewName: "송다은",
    crewRole: "크루",
    projectName: "신논현 치맥 페스티벌",
    projectId: "PRJ-0010",
    contractType: "표준 근로",
    sentDate: "2026.06.08",
    signedDate: "2026.06.08",
    status: "signed",
  },
  {
    id: "CTR-0001",
    crewName: "임태양",
    crewRole: "크루",
    projectName: "asd",
    projectId: "PRJ-0012",
    contractType: "표준 근로",
    sentDate: "2026.06.05",
    signedDate: "2026.06.06",
    status: "signed",
  },
];

export function getContractStatusCounts(items: Contract[]) {
  return {
    all: items.length,
    signed: items.filter((item) => item.status === "signed").length,
    pending: items.filter((item) => item.status === "pending").length,
    unsigned: items.filter((item) => item.status === "unsigned").length,
  };
}

export const contractStats = {
  total: 11,
  signed: 8,
  pending: 1,
  unsigned: 2,
};
