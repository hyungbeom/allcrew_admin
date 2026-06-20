"use client";

import { Line, Pie } from "@ant-design/charts";
import { Button, Card, Col, Dropdown, Flex, Row, Typography } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import styles from "./DashboardCharts.module.css";

const MONTH_LABELS = Array.from({ length: 12 }, (_, index) => `${index + 1}월`);

const monthlySalesByYear: Record<number, { month: string; value: number }[]> = {
  2025: [
    { month: "1월", value: 22000 },
    { month: "2월", value: 18500 },
    { month: "3월", value: 31000 },
    { month: "4월", value: 28000 },
    { month: "5월", value: 42000 },
    { month: "6월", value: 278000 },
    { month: "7월", value: 186000 },
    { month: "8월", value: 154000 },
    { month: "9월", value: 132000 },
    { month: "10월", value: 98000 },
    { month: "11월", value: 112000 },
    { month: "12월", value: 245000 },
  ],
  2026: [
    { month: "1월", value: 52000 },
    { month: "2월", value: 68000 },
    { month: "3월", value: 74000 },
    { month: "4월", value: 91000 },
    { month: "5월", value: 88000 },
    { month: "6월", value: 125000 },
    { month: "7월", value: 142000 },
    { month: "8월", value: 158000 },
    { month: "9월", value: 134000 },
    { month: "10월", value: 169000 },
    { month: "11월", value: 178000 },
    { month: "12월", value: 196000 },
  ],
};

const categoryData = [
  { category: "공연·행사", value: 3, color: "#1677ff" },
  { category: "방송·미디어", value: 2, color: "#69b1ff" },
  { category: "물류·창고", value: 2, color: "#faad14" },
  { category: "기타", value: 2, color: "#52c41a" },
  { category: "MICE·전시", value: 1, color: "#bfbfbf" },
  { category: "제조·공장", value: 1, color: "#722ed1" },
  { category: "공연", value: 1, color: "#ff4d4f" },
];

const TOTAL_PROJECTS = categoryData.reduce((sum, item) => sum + item.value, 0);

function formatSalesAmount(value: number) {
  if (value >= 10000) {
    return `₩${Math.round(value / 10000)}만`;
  }
  return `₩${value.toLocaleString("ko-KR")}`;
}

export default function DashboardCharts() {
  const [salesYear, setSalesYear] = useState<2025 | 2026>(2025);

  const salesData = monthlySalesByYear[salesYear];
  const salesTotal = useMemo(
    () => salesData.reduce((sum, item) => sum + item.value, 0),
    [salesData],
  );

  const lineConfig = useMemo(
    () => ({
      data: salesData,
      xField: "month",
      yField: "value",
      height: 280,
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
        x: { domain: MONTH_LABELS },
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
      height: 280,
      autoFit: true,
      innerRadius: 0.62,
      legend: {
        color: {
          position: "right" as const,
          layout: { justifyContent: "center" },
        },
      },
      scale: {
        color: {
          range: categoryData.map((item) => item.color),
        },
      },
      label: false,
    }),
    [],
  );

  return (
    <Row gutter={[16, 16]} className={styles.chartRow}>
      <Col xs={24} lg={16}>
        <Card className={styles.chartCard} styles={{ body: { padding: "20px 24px 8px" } }}>
          <Flex justify="space-between" align="flex-start" className={styles.chartCardHead}>
            <div>
              <Typography.Text type="secondary" className={styles.chartCardSubtitle}>
                월별 매출
              </Typography.Text>
              <Typography.Title level={3} className={styles.chartCardValue}>
                {formatSalesAmount(salesTotal)}
              </Typography.Title>
            </div>

            <div className={styles.yearToggle}>
              {[2026, 2025].map((year) => (
                <Button
                  key={year}
                  type="text"
                  className={`${styles.yearButton} ${salesYear === year ? styles.yearButtonActive : ""}`}
                  onClick={() => setSalesYear(year as 2025 | 2026)}
                >
                  {year}
                </Button>
              ))}
            </div>
          </Flex>

          <div className={styles.chartAreaWrap}>
            <Line {...lineConfig} />
          </div>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
        <Card className={styles.chartCard} styles={{ body: { padding: "20px 24px 8px" } }}>
          <Flex justify="space-between" align="flex-start" className={styles.chartCardHead}>
            <div>
              <Typography.Text type="secondary" className={styles.chartCardSubtitle}>
                카테고리 분포
              </Typography.Text>
              <Typography.Title level={5} className={styles.chartCardTitle}>
                이번 분기 프로젝트
              </Typography.Title>
            </div>

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
          </Flex>

          <div className={styles.chartPieWrap}>
            <Pie {...pieConfig} />
            <div className={styles.pieCenter}>
              <Typography.Text type="secondary" className={styles.pieCenterLabel}>
                총 프로젝트
              </Typography.Text>
              <Typography.Title level={3} className={styles.pieCenterValue}>
                {TOTAL_PROJECTS}
              </Typography.Title>
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
