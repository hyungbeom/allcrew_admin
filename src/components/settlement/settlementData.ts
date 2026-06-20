export type SettlementStatus = "pending" | "approved" | "paid";

export type Settlement = {
  id: string;
  crewName: string;
  crewRole: string;
  workHours: number;
  hourlyRate: number;
  preTax: number;
  deduction: number;
  netPay: number;
  status: SettlementStatus;
  projectId: string;
};

export const statusLabel: Record<SettlementStatus, string> = {
  pending: "대기",
  approved: "승인",
  paid: "지급완료",
};

export type SettlementStatusFilter = "all" | SettlementStatus;

export const settlements: Settlement[] = [
  {
    id: "SET-0003",
    crewName: "김민수",
    crewRole: "크루",
    workHours: 16,
    hourlyRate: 12000,
    preTax: 192000,
    deduction: 6336,
    netPay: 185664,
    status: "approved",
    projectId: "PRJ-0012",
  },
  {
    id: "SET-0002",
    crewName: "이서연",
    crewRole: "크루",
    workHours: 12,
    hourlyRate: 11000,
    preTax: 132000,
    deduction: 4356,
    netPay: 127644,
    status: "paid",
    projectId: "PRJ-0012",
  },
  {
    id: "SET-0001",
    crewName: "박준호",
    crewRole: "크루",
    workHours: 8,
    hourlyRate: 10000,
    preTax: 80000,
    deduction: 2640,
    netPay: 77360,
    status: "paid",
    projectId: "PRJ-0009",
  },
];

export function getSettlementStatusCounts(items: Settlement[]) {
  return {
    all: items.length,
    pending: items.filter((item) => item.status === "pending").length,
    approved: items.filter((item) => item.status === "approved").length,
    paid: items.filter((item) => item.status === "paid").length,
  };
}

export function getSettlementSummary(items: Settlement[]) {
  const count = items.length;
  const preTaxTotal = items.reduce((sum, item) => sum + item.preTax, 0);
  const deductionTotal = items.reduce((sum, item) => sum + item.deduction, 0);
  const netPayTotal = items.reduce((sum, item) => sum + item.netPay, 0);
  const pendingCount = items.filter((item) => item.status === "pending").length;

  return {
    count,
    preTaxTotal,
    deductionTotal,
    netPayTotal,
    pendingCount,
  };
}

export function formatCurrency(amount: number) {
  return `₩${amount.toLocaleString("ko-KR")}`;
}

export function formatWorkHours(hours: number) {
  return `${hours}h`;
}
