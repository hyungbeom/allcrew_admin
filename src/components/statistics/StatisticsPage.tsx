"use client";

import {
  CalendarOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FolderOutlined,
  SafetyOutlined,
  StarFilled,
  TeamOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Empty, Segmented, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import Link from "next/link";
import { useMemo, useState } from "react";
import StatisticsChartsLazy from "./StatisticsChartsLazy";
import {
  periodOptions,
  summaryStats,
  topCrewRows,
  type PeriodKey,
  type TopCrewRow,
} from "./statisticsData";
import styles from "./StatisticsPage.module.css";

const avatarColors = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16", "#eb2f96"];

export default function StatisticsPage() {
  const [period, setPeriod] = useState<PeriodKey>("quarter");

  const activePeriod = useMemo(
    () => periodOptions.find((item) => item.key === period) ?? periodOptions[1],
    [period],
  );

  const columns: ColumnsType<TopCrewRow> = [
    {
      title: "",
      key: "rank",
      width: 48,
      render: (_, __, index) => <span className={styles.rankCell}>{index + 1}</span>,
    },
    {
      title: "크루",
      key: "crew",
      render: (_, record, index) => (
        <div className={styles.crewCell}>
          <Avatar size={36} style={{ backgroundColor: avatarColors[index % avatarColors.length] }}>
            {record.name[0]}
          </Avatar>
          <div>
            <Typography.Text className={styles.crewName}>{record.name}</Typography.Text>
            <Typography.Text className={styles.crewRole}>{record.role}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "프로젝트",
      dataIndex: "projectCount",
      key: "projectCount",
      width: 100,
      render: (value: number) => `${value}건`,
    },
    {
      title: "근무 시간",
      dataIndex: "workHours",
      key: "workHours",
      width: 100,
      render: (value: number | null) => (value == null ? "-" : `${value}h`),
    },
    {
      title: "평점",
      dataIndex: "rating",
      key: "rating",
      width: 80,
      render: (value: number) => (
        <span className={styles.ratingCell}>
          <StarFilled className={styles.ratingStar} />
          {value.toFixed(1)}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          운영 지표를 한눈에 보고, 정산·안전 리포트를 다운로드하세요.
        </Typography.Text>
        <Space>
          <Button icon={<CalendarOutlined />}>기간 설정</Button>
          <Button type="primary" icon={<DownloadOutlined />}>
            리포트 생성
          </Button>
        </Space>
      </div>

      <div className={styles.statRow}>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>총 프로젝트</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {summaryStats.totalProjects}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>이번 분기</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <FolderOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>투입 크루(연인원)</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {summaryStats.totalCrew}
              <span className={styles.statUnit}>명</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>누적 배치</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <TeamOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>총 근무 시간</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {summaryStats.totalWorkHours}
              <span className={styles.statUnit}>h</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>정산 기준</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconGrey}`}>
            <ClockCircleOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>안전 사고</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {summaryStats.safetyIncidents}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>현황</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <SafetyOutlined />
          </div>
        </Card>
      </div>

      <div className={styles.filterRow}>
        <Segmented
          value={period}
          options={periodOptions.map((item) => ({ label: item.label, value: item.key }))}
          onChange={(value) => setPeriod(value as PeriodKey)}
        />
        <Typography.Text className={styles.periodRange}>{activePeriod.range} 기준</Typography.Text>
      </div>

      <StatisticsChartsLazy />

      <div className={styles.bottomRow}>
        <Card className={styles.panelCard} size="small" styles={{ body: { padding: "16px 20px 8px" } }}>
          <div className={styles.panelHeader}>
            <Typography.Text className={styles.panelTitle}>가장 많이 투입된 크루</Typography.Text>
            <Link href="/crew-db" className={styles.panelLink}>
              크루 DB &gt;
            </Link>
          </div>
          <Table<TopCrewRow>
            className={styles.tableCard}
            rowKey="id"
            columns={columns}
            dataSource={topCrewRows}
            pagination={false}
          />
        </Card>

        <Card className={styles.panelCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
          <div className={styles.panelHeader}>
            <Typography.Text className={styles.panelTitle}>다운로드</Typography.Text>
            <Typography.Text className={styles.panelCount}>0개</Typography.Text>
          </div>
          <div className={styles.emptyWrap}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="생성된 리포트가 없어요." />
          </div>
        </Card>
      </div>
    </div>
  );
}
