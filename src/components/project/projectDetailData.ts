export type ProjectContractItem = {
  id: string;
  crewName: string;
  role: string;
  sent: boolean;
  signedDate: string;
  status: "signed" | "pending";
};

export type ProjectSettlementItem = {
  id: string;
  crewName: string;
  role: string;
  workHours: number;
  amount: number;
  status: "paid" | "pending" | "approved";
};

const projectContracts: Record<string, ProjectContractItem[]> = {
  "PRJ-0009": [
    {
      id: "CTR-001",
      crewName: "박서준",
      role: "운영",
      sent: false,
      signedDate: "2026. 6. 16.",
      status: "signed",
    },
  ],
};

const projectSettlements: Record<string, ProjectSettlementItem[]> = {
  "PRJ-0009": [
    {
      id: "SET-001",
      crewName: "박서준",
      role: "운영",
      workHours: 1.7,
      amount: 16022,
      status: "paid",
    },
  ],
};

export function getProjectContracts(projectId: string) {
  return projectContracts[projectId] ?? [];
}

export function getProjectSettlements(projectId: string) {
  return projectSettlements[projectId] ?? [];
}

export function getSettlementSummary(projectId: string) {
  const items = getProjectSettlements(projectId);
  return {
    paid: items.filter((i) => i.status === "paid").reduce((s, i) => s + i.amount, 0),
    paidCount: items.filter((i) => i.status === "paid").length,
    pending: items.filter((i) => i.status === "pending").reduce((s, i) => s + i.amount, 0),
    pendingCount: items.filter((i) => i.status === "pending").length,
    approved: items.filter((i) => i.status === "approved").reduce((s, i) => s + i.amount, 0),
    approvedCount: items.filter((i) => i.status === "approved").length,
    total: items.reduce((s, i) => s + i.amount, 0),
    count: items.length,
  };
}
