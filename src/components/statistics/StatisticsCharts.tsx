"use client";

import { Column } from "@ant-design/charts";
import { Card, Typography } from "antd";
import { useMemo } from "react";
import { monthlyCrewData, monthlyProjectData } from "./statisticsData";
import styles from "./StatisticsPage.module.css";

export default function StatisticsCharts() {
  const projectChartConfig = useMemo(
    () => ({
      data: monthlyProjectData,
      xField: "month",
      yField: "value",
      height: 260,
      autoFit: true,
      paddingTop: 24,
      paddingBottom: 24,
      style: { fill: "#1677ff", radiusTopLeft: 4, radiusTopRight: 4 },
      axis: {
        y: { grid: true, gridLineDash: [4, 4] },
      },
      label: {
        text: (datum: { value: number }) => (datum.value > 0 ? `${datum.value}건` : ""),
        position: "top" as const,
        style: { fill: "rgba(0,0,0,0.65)", fontSize: 12 },
      },
      tooltip: {
        title: (datum: { month: string }) => datum.month,
        items: [{ field: "value", name: "프로젝트", valueFormatter: (v: number) => `${v}건` }],
      },
    }),
    [],
  );

  const crewChartConfig = useMemo(
    () => ({
      data: monthlyCrewData,
      xField: "month",
      yField: "value",
      height: 260,
      autoFit: true,
      paddingTop: 24,
      paddingBottom: 24,
      style: { fill: "#52c41a", radiusTopLeft: 4, radiusTopRight: 4 },
      axis: {
        y: { grid: true, gridLineDash: [4, 4] },
      },
      label: {
        text: (datum: { value: number }) => (datum.value > 0 ? `${datum.value}명` : ""),
        position: "top" as const,
        style: { fill: "rgba(0,0,0,0.65)", fontSize: 12 },
      },
      tooltip: {
        title: (datum: { month: string }) => datum.month,
        items: [{ field: "value", name: "크루", valueFormatter: (v: number) => `${v}명` }],
      },
    }),
    [],
  );

  return (
    <div className={styles.chartRow}>
      <Card className={styles.chartCard} size="small" styles={{ body: { padding: "16px 20px 12px" } }}>
        <Typography.Text className={styles.chartTitle}>월별 프로젝트 수</Typography.Text>
        <Typography.Text className={styles.chartSubtitle}>최근 6개월</Typography.Text>
        <Column {...projectChartConfig} />
      </Card>
      <Card className={styles.chartCard} size="small" styles={{ body: { padding: "16px 20px 12px" } }}>
        <Typography.Text className={styles.chartTitle}>월별 투입 크루(연인원)</Typography.Text>
        <Typography.Text className={styles.chartSubtitle}>최근 6개월</Typography.Text>
        <Column {...crewChartConfig} />
      </Card>
    </div>
  );
}
