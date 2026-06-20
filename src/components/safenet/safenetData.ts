export type IncidentStatus = "responding" | "closed";

export type Incident = {
  id: string;
  title: string;
  projectName: string;
  location: string;
  reporter: string;
  time: string;
  status: IncidentStatus;
  projectId: string;
};

export type IncidentStatusFilter = "all" | IncidentStatus;

export const incidents: Incident[] = [
  {
    id: "INC-0001",
    title: "미아 발생",
    projectName: "Test",
    location: "덕은동 일대",
    reporter: "박서준",
    time: "16:20",
    status: "closed",
    projectId: "PRJ-0009",
  },
];

export const workflowStats = {
  received: 1,
  redAlert: 0,
  pttResponse: 0,
  closed: 1,
};

export function getIncidentStatusCounts(items: Incident[]) {
  return {
    all: items.length,
    responding: items.filter((item) => item.status === "responding").length,
    closed: items.filter((item) => item.status === "closed").length,
  };
}
