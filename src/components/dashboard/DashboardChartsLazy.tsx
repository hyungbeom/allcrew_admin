"use client";

import dynamic from "next/dynamic";

const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 320 }} />,
});

export default DashboardCharts;
