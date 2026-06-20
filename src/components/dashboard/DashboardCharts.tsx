"use client";

import { Line, Pie } from "@ant-design/charts";
import { Button, Card, Col, Dropdown, Flex, Row, Typography } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";
import { useMemo } from "react";
import styles from "./DashboardCharts.module.css";

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

type ChartPoint = { month: string; value: number };
type CategoryPoint = { category: string; value: number };

type DashboardChartsProps = {
  monthlySales: ChartPoint[];
  categoryDistribution: CategoryPoint[];
};

function formatSalesAmount(value: number) {
  if (value >= 10000) {
    return `₩${Math.round(value / 10000)}만`;
  }
  return `₩${value.toLocaleString("ko-KR")}`;
}

export default function DashboardCharts({
  monthlySales,
  categoryDistribution,
}: DashboardChartsProps) {
  const salesData = monthlySales.length > 0 ? monthlySales : [{ month: "1월", value: 0 }];
  const salesTotal = useMemo(
    () => salesData.reduce((sum, item) => sum + item.value, 0),
    [salesData],
  );

  const categoryData = useMemo(
    () =>
      categoryDistribution.map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length],
      })),
    [categoryDistribution],
  );

  const totalProjects = categoryData.reduce((sum, item) => sum + item.value, 0);

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
            {categoryData.length > 0 ? (
              <div className={styles.pieLayout}>
                <div className={styles.pieChartArea}>
                  <Pie {...pieConfig} />
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
    </Row>
  );
}
