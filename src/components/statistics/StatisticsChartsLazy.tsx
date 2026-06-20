"use client";

import dynamic from "next/dynamic";

type ChartPoint = { month: string; value: number };

type StatisticsChartsLazyProps = {
  monthlyProjectData: ChartPoint[];
  monthlyCrewData: ChartPoint[];
};

const StatisticsCharts = dynamic(() => import("./StatisticsCharts"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 320 }} />,
});

export default function StatisticsChartsLazy(props: StatisticsChartsLazyProps) {
  return <StatisticsCharts {...props} />;
}
