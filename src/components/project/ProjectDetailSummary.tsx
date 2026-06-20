"use client";

import { CheckCircleOutlined, LineChartOutlined, WalletOutlined } from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import {
  formatBudget,
  formatCompactBudget,
  getProjectBudgetUsagePercent,
  type Project,
} from "./projectData";
import styles from "./ProjectDetailPage.module.css";

export function SummaryStatsRow({ project }: { project: Project }) {
  const budgetUsage = getProjectBudgetUsagePercent(project);
  const avgWage = project.avgHourlyWage ?? 0;
  const accumulated = project.accumulatedCost ?? 0;

  return (
    <Row gutter={16} className={styles.statRow}>
      <Col xs={24} md={8}>
        <Card size="small">
          <div className={styles.statCardBody}>
            <div className={styles.statCardContent}>
              <Typography.Text className={styles.statCardLabel}>배정 크루</Typography.Text>
              <Typography.Text className={styles.statCardValue}>{project.crewCurrent}</Typography.Text>
              <Typography.Text className={styles.statCardSub}>총 {project.crewTotal}명 중</Typography.Text>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
              <CheckCircleOutlined />
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card size="small">
          <div className={styles.statCardBody}>
            <div className={styles.statCardContent}>
              <Typography.Text className={styles.statCardLabel}>평균 시급</Typography.Text>
              <Typography.Text className={styles.statCardValue}>{formatBudget(avgWage)}</Typography.Text>
              <Typography.Text className={styles.statCardSub}>직무 평균</Typography.Text>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
              <WalletOutlined />
            </div>
          </div>
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card size="small">
          <div className={styles.statCardBody}>
            <div className={styles.statCardContent}>
              <Typography.Text className={styles.statCardLabel}>누적 비용</Typography.Text>
              <Typography.Text className={styles.statCardValue}>
                {formatCompactBudget(accumulated)}
              </Typography.Text>
              <Typography.Text className={styles.statCardSub}>예산 대비 {budgetUsage}%</Typography.Text>
            </div>
            <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
              <LineChartOutlined />
            </div>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
