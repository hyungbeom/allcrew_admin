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
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { ProgressProps } from "antd";
import {
  ArrowRightOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  ProjectOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import styles from "./DashboardHome.module.css";
import DashboardCharts from "./DashboardChartsLazy";
import { toSparklineData } from "./chartUtils";

const TOTAL_COUNT = 48;
const ATTENDANCE_COUNT = 42;
const ATTENDANCE_PERCENT = Math.round((ATTENDANCE_COUNT / TOTAL_COUNT) * 100);

const attendanceProgressColors: ProgressProps["strokeColor"] = {
  "0%": "#108ee9",
  "100%": "#87d068",
};

const attendanceStats = [
  { label: "정상 근무", value: 36, percent: Math.round((36 / TOTAL_COUNT) * 100) },
  { label: "지각", value: 6, percent: Math.round((6 / TOTAL_COUNT) * 100) },
  {
    label: "미출근",
    value: TOTAL_COUNT - ATTENDANCE_COUNT,
    percent: Math.round(((TOTAL_COUNT - ATTENDANCE_COUNT) / TOTAL_COUNT) * 100),
  },
];

const UNVERIFIED_APPLICANTS = 8;
const VERIFIED_APPLICANTS = 24;
const TOTAL_APPLICANTS = UNVERIFIED_APPLICANTS + VERIFIED_APPLICANTS;

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

const tasks: TaskCard[] = [
  {
    key: "applicants",
    label: "미확인 지원자",
    value: `${UNVERIFIED_APPLICANTS}명`,
    tooltip: `확인 지원자 ${VERIFIED_APPLICANTS}명, 미확인 지원자 ${UNVERIFIED_APPLICANTS}명 (전체 ${TOTAL_APPLICANTS}명)`,
    variant: "applicants",
    unverifiedCount: UNVERIFIED_APPLICANTS,
    verifiedCount: VERIFIED_APPLICANTS,
    footerLabel: "확인 지원자",
    footerValue: `${VERIFIED_APPLICANTS}명`,
  },
  {
    key: "recruiting",
    label: "모집 중 프로젝트",
    value: "6건",
    tooltip: "현재 모집 중인 프로젝트 수입니다.",
    variant: "area",
    sparkline: recruitingSparkline,
    footerLabel: "진행 중",
    footerValue: "6건",
  },
  {
    key: "settlement",
    label: "정산 대기",
    value: "12건",
    tooltip: "처리가 필요한 정산 건수입니다.",
    variant: "progress",
    progress: 68,
    footerLabel: "전환율",
    footerValue: "68%",
  },
  {
    key: "education",
    label: "교육 만료 예정",
    value: "14명",
    tooltip: "30일 이내 교육 만료 예정 크루 수입니다.",
    variant: "progress",
    progress: 78,
    footerLabel: "30일 이내",
    footerValue: "14명",
  },
];

function TaskCardContent({ task }: { task: TaskCard }) {
  if (task.variant === "applicants" && task.unverifiedCount !== undefined && task.verifiedCount !== undefined) {
    const totalApplicants = task.unverifiedCount + task.verifiedCount;
    const unverifiedPercent = Math.round((task.unverifiedCount / totalApplicants) * 100);

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

const activities = [
  { text: "박서준님 정산 지급 완료", date: "2026-06-19" },
  { text: "이민호님 정산 지급 완료", date: "2026-06-17" },
  { text: "최유진님 정산 지급 완료", date: "2026-06-17" },
  { text: "김지훈님 교육 이수 완료", date: "2026-06-16" },
  { text: "정수아님 프로젝트 배정 완료", date: "2026-06-15" },
];

const MAX_ACTIVITY_ITEMS = 5;

const siteStats = [
  { label: "진행중인 현장", value: 3, icon: <ProjectOutlined /> },
  { label: "현장 크루", value: TOTAL_COUNT, icon: <TeamOutlined /> },
  { label: "구역 이탈", value: 2, icon: <EnvironmentOutlined /> },
];

export default function DashboardHome() {
  return (
    <>
      <Row gutter={[16, 16]} align="stretch" className={styles.topPanelRow}>
        <Col xs={24} lg={14} className={styles.equalCol}>
          <Card
            className={`${styles.equalCard} ${styles.attendanceCard}`}
            title="실시간 근태"
            extra={
              <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
                2026-10-22 21:12:00 기준
              </Typography.Text>
            }
            styles={{ body: { display: "flex", flexDirection: "column", flex: 1 } }}
          >
            <div className={styles.attendanceSummary}>
              <Flex align="baseline" gap={16} wrap="wrap">
                <Typography.Title level={2} style={{ margin: 0 }}>
                  {ATTENDANCE_COUNT} / {TOTAL_COUNT}명
                </Typography.Title>
                <Typography.Text type="secondary">현재 출근 {ATTENDANCE_PERCENT}%</Typography.Text>
              </Flex>
            </div>

            <div className={styles.attendanceProgressWrap}>
              <Progress
                percent={ATTENDANCE_PERCENT}
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
                    <Avatar
                      size={36}
                      icon={item.icon}
                      className={styles.siteItemIcon}
                    />
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
                  오늘 진행 중인 프로젝트 0건
                </Typography.Text>
              </div>
            }
            extra={
              <Button type="link" size="small" icon={<ArrowRightOutlined />} iconPlacement="end">
                전체보기
              </Button>
            }
            styles={{ body: { display: "flex", flexDirection: "column", flex: 1 } }}
          >
            <div className={styles.bottomPanelBody}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="오늘 진행 중인 프로젝트가 없어요."
              />
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

      <DashboardCharts />
    </>
  );
}
