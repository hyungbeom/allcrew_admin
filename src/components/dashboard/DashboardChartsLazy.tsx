"use client";

import dynamic from "next/dynamic";

type ChartPoint = { month: string; value: number };
type CategoryPoint = { category: string; value: number };

type DashboardChartsLazyProps = {
  monthlySales: ChartPoint[];
  categoryDistribution: CategoryPoint[];
};

const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 320 }} />,
});

export default function DashboardChartsLazy(props: DashboardChartsLazyProps) {
  return <DashboardCharts {...props} />;
}
