"use client";

import { Tiny } from "@ant-design/charts";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Progress,
  Row,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  App,
} from "antd";
import type { ProgressProps } from "antd";
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./DashboardHome.module.css";
import DashboardChartsLazy from "./DashboardChartsLazy";
import { toSparklineData } from "./chartUtils";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import { statusLabel, type ProjectStatus } from "@/components/project/projectData";
import { companyPath } from "@/lib/companyPaths";
import { ApiError } from "@/lib/api/client";
import { fetchDashboard, type DashboardApiResponse } from "@/lib/api/operations";

const attendanceProgressColors: ProgressProps["strokeColor"] = {
  "0%": "#108ee9",
  "100%": "#87d068",
};

const recruitingSparkline = [2, 3, 4, 3, 5, 6, 5, 7, 8, 6, 7, 9, 8, 7, 6, 8, 6];

type TaskCard = {
  key: string;
  label: string;
  value: string;
  tooltip: string;
  footerLabel: string;
  footerValue: string;
  variant: "area" | "progress" | "applicants";
  sparkline?: number[];
  progress?: number;
  verifiedCount?: number;
  unverifiedCount?: number;
};

function TaskCardContent({ task }: { task: TaskCard }) {
  if (task.variant === "applicants" && task.unverifiedCount !== undefined && task.verifiedCount !== undefined) {
    const totalApplicants = task.unverifiedCount + task.verifiedCount;
    const unverifiedPercent = totalApplicants > 0
      ? Math.round((task.unverifiedCount / totalApplicants) * 100)
      : 0;

    return (
      <div className={styles.taskChartArea}>
        <Progress
          percent={unverifiedPercent}
          strokeColor={attendanceProgressColors}
          status="active"
          showInfo
        />
      </div>
    );
  }

  if (task.variant === "area" && task.sparkline) {
    return (
      <div className={styles.taskChartArea}>
        <Tiny.Area
          height={46}
          autoFit
          data={toSparklineData(task.sparkline)}
          xField="index"
          yField="value"
          style={{
            fill: "linear-gradient(-90deg, white 0%, #975FE4 100%)",
            fillOpacity: 0.6,
          }}
        />
      </div>
    );
  }

  if (task.variant === "progress" && task.progress !== undefined) {
    return (
      <div className={styles.taskChartArea}>
        <Progress
          percent={task.progress}
          strokeColor={attendanceProgressColors}
          status="active"
          showInfo
        />
      </div>
    );
  }

  return null;
}

const MAX_ACTIVITY_ITEMS = 5;

function TodayProjectCard({
  project,
  href,
}: {
  project: DashboardApiResponse["todayProjects"][number];
  href: string;
}) {
  const status = project.status as ProjectStatus;
  const statusText = statusLabel[status] ?? "진행중";
  const crewPercent =
    project.crewTotal > 0 ? Math.round((project.crewCurrent / project.crewTotal) * 100) : 0;

  return (
    <Link href={href} className={styles.todayProjectCardLink}>
      <div className={styles.todayProjectCard}>
        <Tag variant="filled" color="processing" className={styles.todayProjectStatus}>
          <span className={styles.todayProjectStatusDot} />
          {statusText}
        </Tag>

        <Typography.Title level={4} className={styles.todayProjectName}>
          {project.name}
        </Typography.Title>

        <div className={styles.todayProjectLocation}>
          <EnvironmentOutlined />
          <Typography.Text ellipsis>{project.location}</Typography.Text>
        </div>

        <div className={styles.todayProjectProgressRow}>
          <Progress
            percent={crewPercent}
            showInfo={false}
            strokeColor="#1677ff"
            trailColor="#f0f0f0"
            size={[-1, 6]}
            className={styles.todayProjectProgress}
          />
          <Typography.Text className={styles.todayProjectCrewCount}>
            {project.crewCurrent}/{project.crewTotal}명
          </Typography.Text>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardHome() {
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardApiResponse | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "대시보드 데이터를 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const attendance = dashboard?.attendance;
  const totalCount = attendance?.total ?? 0;
  const attendanceCount = attendance?.checkedIn ?? 0;
  const attendancePercent = totalCount > 0 ? Math.round((attendanceCount / totalCount) * 100) : 0;

  const attendanceStats = useMemo(() => {
    if (!attendance) return [];
    return [
      {
        label: "정상 근무",
        value: attendance.normal,
        percent: totalCount > 0 ? Math.round((attendance.normal / totalCount) * 100) : 0,
      },
      {
        label: "지각",
        value: attendance.late,
        percent: totalCount > 0 ? Math.round((attendance.late / totalCount) * 100) : 0,
      },
      {
        label: "미출근",
        value: attendance.absent,
        percent: totalCount > 0 ? Math.round((attendance.absent / totalCount) * 100) : 0,
      },
    ];
  }, [attendance, totalCount]);

  const tasks: TaskCard[] = useMemo(() => {
    const taskData = dashboard?.tasks;
    const unverified = taskData?.unverifiedApplicants ?? 0;
    const verified = taskData?.verifiedApplicants ?? 0;
    const totalApplicants = unverified + verified;
    const recruiting = taskData?.recruitingProjects ?? 0;
    const pendingSettlements = taskData?.pendingSettlements ?? 0;
    const educationExpiring = taskData?.educationExpiring ?? 0;
    const settlementProgress = pendingSettlements > 0 ? Math.min(100, pendingSettlements * 8) : 0;
    const educationProgress = educationExpiring > 0 ? Math.min(100, educationExpiring * 5) : 0;

    return [
      {
        key: "applicants",
        label: "미확인 지원자",
        value: `${unverified}명`,
        tooltip: `확인 지원자 ${verified}명, 미확인 지원자 ${unverified}명 (전체 ${totalApplicants}명)`,
        variant: "applicants",
        unverifiedCount: unverified,
        verifiedCount: verified,
        footerLabel: "확인 지원자",
        footerValue: `${verified}명`,
      },
      {
        key: "recruiting",
        label: "모집 중 프로젝트",
        value: `${recruiting}건`,
        tooltip: "현재 모집 중인 프로젝트 수입니다.",
        variant: "area",
        sparkline: recruitingSparkline,
        footerLabel: "진행 중",
        footerValue: `${recruiting}건`,
      },
      {
        key: "settlement",
        label: "정산 대기",
        value: `${pendingSettlements}건`,
        tooltip: "처리가 필요한 정산 건수입니다.",
        variant: "progress",
        progress: settlementProgress,
        footerLabel: "대기 건수",
        footerValue: `${pendingSettlements}건`,
      },
      {
        key: "education",
        label: "교육 만료 예정",
        value: `${educationExpiring}명`,
        tooltip: "30일 이내 교육 만료 예정 크루 수입니다.",
        variant: "progress",
        progress: educationProgress,
        footerLabel: "30일 이내",
        footerValue: `${educationExpiring}명`,
      },
    ];
  }, [dashboard?.tasks]);

  const siteStats = useMemo(
    () => [
      {
        label: "진행중인 현장",
        value: dashboard?.siteStats.activeSites ?? 0,
        icon: <ProjectOutlined />,
      },
      {
        label: "현장 크루",
        value: dashboard?.siteStats.fieldCrew ?? 0,
        icon: <TeamOutlined />,
      },
      {
        label: "구역 이탈",
        value: dashboard?.siteStats.zoneViolations ?? 0,
        icon: <EnvironmentOutlined />,
      },
    ],
    [dashboard?.siteStats],
  );

  const todayProjects = dashboard?.todayProjects ?? [];
  const activities = dashboard?.activities ?? [];
  const nowLabel = new Date().toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <Spin spinning={loading}>
      <>
        <Row gutter={[16, 16]} align="stretch" className={styles.topPanelRow}>
          <Col xs={24} lg={14} className={styles.equalCol}>
            <Card
              className={`${styles.equalCard} ${styles.attendanceCard}`}
              title="실시간 근태"
              extra={
                <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
                  {nowLabel} 기준
                </Typography.Text>
              }
              styles={{ body: { display: "flex", flexDirection: "column", flex: 1 } }}
            >
              <div className={styles.attendanceSummary}>
                <Flex align="baseline" gap={16} wrap="wrap">
                  <Typography.Title level={2} style={{ margin: 0 }}>
                    {attendanceCount} / {totalCount}명
                  </Typography.Title>
                  <Typography.Text type="secondary">현재 출근 {attendancePercent}%</Typography.Text>
                </Flex>
              </div>

              <div className={styles.attendanceProgressWrap}>
                <Progress
                  percent={attendancePercent}
                  showInfo={false}
                  strokeColor={attendanceProgressColors}
                  strokeLinecap="round"
                  size={[-1, 10]}
                />
              </div>

              <Row gutter={[12, 12]} className={styles.attendanceStatsRow}>
                {attendanceStats.map((stat) => (
                  <Col xs={24} sm={8} key={stat.label} className={styles.statCol}>
                    <div className={styles.statItem}>
                      <div className={styles.statItemContent}>
                        <Typography.Text type="secondary" className={styles.statItemLabel}>
                          {stat.label}
                        </Typography.Text>
                        <Typography.Title level={3} className={styles.statItemValue}>
                          {stat.value}
                        </Typography.Title>
                      </div>
                      <Progress
                        type="circle"
                        percent={stat.percent}
                        strokeColor={attendanceProgressColors}
                        railColor="#e8e8e8"
                        size={52}
                        showInfo={false}
                        className={styles.statItemProgress}
                      />
                    </div>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>

          <Col xs={24} lg={10} className={styles.equalCol}>
            <Card
              className={`${styles.equalCard} ${styles.siteCard}`}
              title="현장 관리"
              extra={
                <Tag variant="filled" color="processing" className={styles.siteHeaderTag}>
                  <span className={styles.siteHeaderTagContent}>
                    세이프넷 관제센터 열기
                    <ArrowRightOutlined />
                  </span>
                </Tag>
              }
              styles={{ body: { display: "flex", flexDirection: "column", flex: 1 } }}
            >
              <div className={styles.siteList}>
                {siteStats.map((item) => (
                  <div key={item.label} className={styles.siteItem}>
                    <Space size={12}>
                      <Avatar size={36} icon={item.icon} className={styles.siteItemIcon} />
                      <Typography.Text className={styles.siteItemLabel}>{item.label}</Typography.Text>
                    </Space>
                    <Typography.Title level={4} className={styles.siteItemValue}>
                      {item.value}
                    </Typography.Title>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <Card
          title="오늘 처리할 일"
          extra={
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              우선순위 순
            </Typography.Text>
          }
          style={{ marginBottom: 20 }}
          styles={{ body: { padding: "20px 24px 24px" } }}
        >
          <Row gutter={[24, 24]}>
            {tasks.map((task) => (
              <Col xs={24} sm={12} xl={6} key={task.key} className={styles.taskCol}>
                <Card className={styles.taskCard} styles={{ body: { padding: "20px 24px 8px" } }}>
                  <Flex justify="space-between" align="center" className={styles.taskCardHead}>
                    <Typography.Text type="secondary">{task.label}</Typography.Text>
                    <Tooltip title={task.tooltip}>
                      <InfoCircleOutlined className={styles.taskCardInfoIcon} />
                    </Tooltip>
                  </Flex>

                  <Typography.Title level={3} className={styles.taskCardValue}>
                    {task.value}
                  </Typography.Title>

                  <TaskCardContent task={task} />

                  <Divider className={styles.taskCardDivider} />

                  <div className={styles.taskCardFooter}>
                    <Typography.Text type="secondary">{task.footerLabel}</Typography.Text>
                    <Typography.Text>{task.footerValue}</Typography.Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        <Row gutter={[16, 16]} align="stretch" className={styles.bottomPanelRow}>
          <Col xs={24} xl={15} className={styles.bottomPanelCol}>
            <Card
              className={styles.bottomPanelCard}
              title={
                <div>
                  <Typography.Title level={5} style={{ margin: 0 }}>
                    오늘의 현장
                  </Typography.Title>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    오늘 진행 중인 프로젝트 {todayProjects.length}건
                  </Typography.Text>
                </div>
              }
              extra={
                <Link href={companyPath(companySlug, "project")} className={styles.todayPanelLink}>
                  전체보기
                  <ArrowRightOutlined />
                </Link>
              }
              styles={{ body: { display: "flex", flexDirection: "column", flex: 1, paddingTop: 16 } }}
            >
              <div
                className={`${styles.bottomPanelBody} ${
                  todayProjects.length > 0 ? styles.bottomPanelBodyFilled : ""
                }`}
              >
                {todayProjects.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="오늘 진행 중인 프로젝트가 없어요."
                  />
                ) : (
                  <div className={styles.todayProjectList}>
                    {todayProjects.map((project) => (
                      <TodayProjectCard
                        key={project.id}
                        project={project}
                        href={companyPath(companySlug, `project/${project.id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} xl={9} className={styles.bottomPanelCol}>
            <Card
              title="최근 활동"
              className={`${styles.bottomPanelCard} ${styles.activityCard}`}
              styles={{ body: { display: "flex", flexDirection: "column", flex: 1, paddingTop: 0 } }}
            >
              <div className={styles.activityList}>
                {activities.slice(0, MAX_ACTIVITY_ITEMS).map((item) => (
                  <div key={`${item.text}-${item.date}`} className={styles.activityItem}>
                    <Typography.Text ellipsis className={styles.activityText}>
                      {item.text}
                    </Typography.Text>
                    <Typography.Text type="secondary" className={styles.activityDate}>
                      {item.date}
                    </Typography.Text>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        <DashboardChartsLazy
          monthlySales={dashboard?.monthlySales ?? []}
          categoryDistribution={dashboard?.categoryDistribution ?? []}
        />
      </>
    </Spin>
  );
}
