"use client";

import { Column, Line, Pie } from "@ant-design/charts";
import { Button, Card, Col, Dropdown, Row, Typography } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import styles from "./DashboardCharts.module.css";
import cardTheme from "./dashboardCard.module.css";
import {
  createChartKey,
  normalizeCategoryPoints,
  normalizeChartPoints,
  normalizeStatPoints,
  withChartFallbackPoints,
  withStatFallbackPoints,
  type CategoryPoint,
  type ChartPoint,
  type StatPoint,
} from "./chartUtils";

const CHART_COLORS = [
  "#1677ff",
  "#69b1ff",
  "#faad14",
  "#52c41a",
  "#bfbfbf",
  "#722ed1",
  "#ff4d4f",
  "#13c2c2",
];

type DashboardChartsProps = {
  monthlySales: ChartPoint[];
  categoryDistribution: CategoryPoint[];
  contractStats: StatPoint[];
  settlementStats: StatPoint[];
};

function formatSalesAmount(value: number) {
  if (value >= 10000) {
    return `₩${Math.round(value / 10000)}만`;
  }
  return `₩${value.toLocaleString("ko-KR")}`;
}

function buildColumnConfig(data: StatPoint[], color: string) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return {
    data,
    xField: "label",
    yField: "value",
    height: 108,
    autoFit: true,
    paddingTop: 12,
    paddingBottom: 28,
    style: { fill: color, radiusTopLeft: 4, radiusTopRight: 4 },
    axis: {
      x: { title: false },
      y: { title: false, grid: true, gridLineDash: [4, 4] },
    },
    scale: {
      y: { domain: [0, maxValue], nice: true },
    },
    label: {
      text: (datum: { value: number }) => (datum.value > 0 ? `${datum.value}` : ""),
      position: "top" as const,
      style: { fill: "rgba(0,0,0,0.65)", fontSize: 11 },
    },
    tooltip: {
      items: [{ field: "value", name: "건수", valueFormatter: (v: number) => `${v}건` }],
    },
  };
}

function ContractSettlementCard({
  contractStats,
  settlementStats,
}: {
  contractStats: StatPoint[];
  settlementStats: StatPoint[];
}) {
  const contractColumnConfig = useMemo(
    () => buildColumnConfig(contractStats, "#1677ff"),
    [contractStats],
  );
  const settlementColumnConfig = useMemo(
    () => buildColumnConfig(settlementStats, "#52c41a"),
    [settlementStats],
  );

  return (
    <Card
      className={`${cardTheme.dashboardCardHead} ${styles.chartCard}`}
      title="계약 · 정산 현황"
      styles={{ body: { padding: "16px 24px 12px" } }}
    >
      <Typography.Text type="secondary" className={styles.chartBodyLead}>
        미처리 건 빠른 확인
      </Typography.Text>
      <div className={styles.dualMiniChart}>
        <div>
          <Typography.Text type="secondary" className={styles.miniChartLabel}>
            계약
          </Typography.Text>
          <Column key={createChartKey("contract", contractStats)} {...contractColumnConfig} />
        </div>
        <div>
          <Typography.Text type="secondary" className={styles.miniChartLabel}>
            정산
          </Typography.Text>
          <Column key={createChartKey("settlement", settlementStats)} {...settlementColumnConfig} />
        </div>
      </div>
    </Card>
  );
}

export default function DashboardCharts({
  monthlySales,
  categoryDistribution,
  contractStats,
  settlementStats,
}: DashboardChartsProps) {
  const salesData = useMemo(
    () => withChartFallbackPoints(normalizeChartPoints(monthlySales)),
    [monthlySales],
  );
  const salesTotal = useMemo(
    () => salesData.reduce((sum, item) => sum + item.value, 0),
    [salesData],
  );

  const categoryData = useMemo(() => {
    const normalized = normalizeCategoryPoints(categoryDistribution);
    return normalized.map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [categoryDistribution]);

  const normalizedContractStats = useMemo(
    () => withStatFallbackPoints(normalizeStatPoints(contractStats)),
    [contractStats],
  );
  const normalizedSettlementStats = useMemo(
    () => withStatFallbackPoints(normalizeStatPoints(settlementStats)),
    [settlementStats],
  );

  const totalProjects = categoryData.reduce((sum, item) => sum + item.value, 0);

  const lineConfig = useMemo(
    () => ({
      data: salesData,
      xField: "month",
      yField: "value",
      height: 260,
      autoFit: true,
      paddingLeft: 48,
      paddingRight: 16,
      interaction: {
        tooltip: {
          marker: true,
        },
      },
      style: {
        stroke: "#1677ff",
        lineWidth: 2,
      },
      axis: {
        x: { title: false },
        y: { title: false, grid: true },
      },
      scale: {
        y: { nice: true },
      },
    }),
    [salesData],
  );

  const pieConfig = useMemo(
    () => ({
      data: categoryData,
      angleField: "value",
      colorField: "category",
      height: 260,
      autoFit: true,
      innerRadius: 0.62,
      legend: false,
      scale: {
        color: {
          range: categoryData.map((item) => item.color),
        },
      },
      label: false,
      tooltip: {
        title: (datum: { category: string }) => datum.category,
      },
    }),
    [categoryData],
  );

  return (
    <Row gutter={[16, 16]} className={styles.chartRow}>
      <Col xs={24} lg={8}>
        <Card
          className={`${cardTheme.dashboardCardHead} ${styles.chartCard}`}
          title="월별 매출"
          styles={{ body: { padding: "16px 24px 8px" } }}
        >
          <Typography.Title level={3} className={styles.chartCardValue}>
            {formatSalesAmount(salesTotal)}
          </Typography.Title>

          <div className={styles.chartAreaWrap}>
            <Line key={createChartKey("sales", salesData)} {...lineConfig} />
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card
          className={`${cardTheme.dashboardCardHead} ${styles.chartCard}`}
          title="카테고리 분포"
          extra={
            <Dropdown
              menu={{
                items: [
                  { key: "export", label: "데이터 내보내기" },
                  { key: "detail", label: "상세 보기" },
                ],
              }}
              trigger={["click"]}
            >
              <Button type="text" icon={<EllipsisOutlined />} className={styles.chartMenuButton} />
            </Dropdown>
          }
          styles={{ body: { padding: "16px 24px 8px" } }}
        >
          <Typography.Text type="secondary" className={styles.chartBodyLead}>
            이번 분기 프로젝트
          </Typography.Text>

          <div className={styles.chartPieWrap}>
            {categoryData.length > 0 ? (
              <div className={styles.pieLayout}>
                <div className={styles.pieChartArea}>
                  <Pie key={createChartKey("category", categoryData)} {...pieConfig} />
                  <div className={styles.pieCenter}>
                    <Typography.Text type="secondary" className={styles.pieCenterLabel}>
                      총 프로젝트
                    </Typography.Text>
                    <Typography.Title level={3} className={styles.pieCenterValue}>
                      {totalProjects}
                    </Typography.Title>
                  </div>
                </div>

                <ul className={styles.pieLegend}>
                  {categoryData.map((item) => (
                    <li key={item.category} className={styles.pieLegendItem}>
                      <span
                        className={styles.pieLegendMarker}
                        style={{ backgroundColor: item.color }}
                      />
                      <Typography.Text className={styles.pieLegendLabel}>{item.category}</Typography.Text>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <Typography.Text type="secondary">프로젝트 데이터가 없습니다.</Typography.Text>
            )}
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <ContractSettlementCard
          contractStats={normalizedContractStats}
          settlementStats={normalizedSettlementStats}
        />
      </Col>
    </Row>
  );
}
