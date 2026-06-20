"use client";

import dynamic from "next/dynamic";

const StatisticsCharts = dynamic(() => import("./StatisticsCharts"), {
  ssr: false,
  loading: () => <div style={{ minHeight: 320 }} />,
});

export default StatisticsCharts;
