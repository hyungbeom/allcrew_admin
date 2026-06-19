"use client";

import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Flex,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from "antd";
import type { ProgressProps } from "antd";
import {
  ArrowRightOutlined,
  BankOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  ProjectOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./DashboardHome.module.css";

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

const tasks = [
  {
    key: "applicants",
    icon: <UserAddOutlined />,
    iconColor: "#fa8c16",
    iconBg: "#fff7e6",
    badge: "확인 필요",
    badgeColor: "warning",
    label: "미확인 지원자",
    value: "2명",
    status: "승인 대기",
    link: "승인 화면",
  },
  {
    key: "recruiting",
    icon: <ProjectOutlined />,
    iconColor: "#1677ff",
    iconBg: "#e6f4ff",
    label: "모집 중 프로젝트",
    value: "0건",
    status: "진행 중",
    link: "보러가기",
  },
  {
    key: "settlement",
    icon: <BankOutlined />,
    iconColor: "#722ed1",
    iconBg: "#f9f0ff",
    label: "정산 대기",
    value: "0건",
    status: "처리 필요",
    link: "정산 관리",
  },
  {
    key: "education",
    icon: <SafetyOutlined />,
    iconColor: "#52c41a",
    iconBg: "#f6ffed",
    label: "교육 만료 예정",
    value: "0명",
    status: "30일 이내",
    link: "크루 확인",
  },
];

const activities = [
  { text: "박서준님이 박서준님 정산 지급 완료", time: "1일 전" },
  { text: "이민호님이 이민호님 정산 지급 완료", time: "1일 전" },
  { text: "최유진님이 최유진님 정산 지급 완료", time: "1일 전" },
  { text: "김지훈님이 김지훈님 정산 지급 완료", time: "2일 전" },
  { text: "정수아님이 정수아님 정산 지급 완료", time: "2일 전" },
];

const siteStats = [
  { label: "진행중인 현장", value: 3, icon: <ProjectOutlined /> },
  { label: "현장 크루", value: TOTAL_COUNT, icon: <TeamOutlined /> },
  { label: "구역 이탈", value: 2, icon: <EnvironmentOutlined /> },
];

export default function DashboardHome() {
  return (
    <>
      <Row gutter={[16, 16]} align="stretch" style={{ marginBottom: 20 }}>
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
              <Button
                type="primary"
                size="small"
                icon={<ArrowRightOutlined />}
                iconPlacement="end"
                className={styles.siteHeaderButton}
              >
                세이프넷 관제센터 열기
              </Button>
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
        <Row gutter={[16, 16]}>
          {tasks.map((task) => (
            <Col xs={24} sm={12} xl={6} key={task.key} className={styles.taskCol}>
              <Card
                hoverable
                className={styles.taskCard}
                styles={{ body: { padding: 20, height: "100%", display: "flex", flexDirection: "column" } }}
              >
                <Flex justify="space-between" align="flex-start" style={{ marginBottom: 16 }}>
                  <Avatar
                    size={40}
                    icon={task.icon}
                    style={{ backgroundColor: task.iconBg, color: task.iconColor }}
                  />
                  {task.badge && (
                    <Tag variant="filled" color={task.badgeColor} style={{ margin: 0 }}>
                      {task.badge}
                    </Tag>
                  )}
                </Flex>

                <Statistic
                  title={<Typography.Text type="secondary">{task.label}</Typography.Text>}
                  value={task.value}
                  styles={{
                    title: { marginBottom: 4 },
                    content: { fontSize: 28, fontWeight: 600, lineHeight: 1.2 },
                  }}
                />

                <Divider style={{ margin: "16px 0 12px" }} />

                <Flex justify="space-between" align="center" style={{ marginTop: "auto" }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {task.status}
                  </Typography.Text>
                  <Button type="link" size="small" style={{ padding: 0, height: "auto" }} icon={<ArrowRightOutlined />} iconPlacement="end">
                    {task.link}
                  </Button>
                </Flex>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={15}>
          <Card
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
          >
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="오늘 진행 중인 프로젝트가 없어요."
              style={{ padding: "32px 0" }}
            />
          </Card>
        </Col>

        <Col xs={24} xl={9}>
          <Card
            title="최근 활동"
            extra={
              <Tag variant="filled" color="success" style={{ margin: 0 }}>
                <Badge status="processing" color="#52c41a" text="실시간" />
              </Tag>
            }
            styles={{ body: { paddingTop: 8 } }}
          >
            <div>
              {activities.map((item, index) => (
                <Flex
                  key={item.text}
                  gap={10}
                  align="flex-start"
                  style={{
                    padding: "12px 0",
                    borderBottom: index < activities.length - 1 ? "1px solid #f0f0f0" : undefined,
                  }}
                >
                  <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#e6f4ff", color: "#1677ff", flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <Typography.Text style={{ fontSize: 13, display: "block", marginBottom: 3 }}>
                      {item.text}
                    </Typography.Text>
                    <Space size={4}>
                      <ClockCircleOutlined style={{ fontSize: 11, color: "rgba(0,0,0,0.25)" }} />
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {item.time}
                      </Typography.Text>
                    </Space>
                  </div>
                </Flex>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
