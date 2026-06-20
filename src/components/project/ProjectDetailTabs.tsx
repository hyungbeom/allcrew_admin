"use client";

import {
  FileTextOutlined,
  PlusOutlined,
  SafetyOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Button,
  Card,
  Checkbox,
  Col,
  Empty,
  Input,
  Progress,
  Row,
  Segmented,
  Space,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { formatBudget } from "./projectData";
import type { Project } from "./projectData";
import {
  getProjectContracts,
  getProjectSettlements,
  getSettlementSummary,
} from "./projectDetailData";
import { SummaryStatsRow } from "./ProjectDetailSummary";
import styles from "./ProjectDetailPage.module.css";

type AttendanceCircleCardProps = {
  label: string;
  value: number;
  percent: number;
  strokeColor: string | Record<string, string>;
};

function AttendanceCircleCard({ label, value, percent, strokeColor }: AttendanceCircleCardProps) {
  return (
    <Card size="small" className={styles.attendanceCard}>
      <div className={styles.attendanceCardBody}>
        <div>
          <Typography.Text type="secondary">{label}</Typography.Text>
          <div className={styles.attendanceValue}>{value}</div>
        </div>
        <Progress
          type="circle"
          percent={percent}
          size={56}
          showInfo={false}
          strokeColor={strokeColor}
        />
      </div>
    </Card>
  );
}

function getAttendancePercent(value: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((value / total) * 100);
}

export function FieldTab({ project }: { project: Project }) {
  const [filter, setFilter] = useState("all");

  const normal = project.fieldAttendance?.normal ?? 0;
  const late = project.fieldAttendance?.late ?? 0;
  const absent = project.fieldAttendance?.absent ?? 0;
  const attendanceTotal = normal + late + absent;

  return (
    <>
      <Row gutter={12} className={styles.miniStatRow}>
        <Col xs={24} md={8}>
          <AttendanceCircleCard
            label="정상 근무"
            value={normal}
            percent={getAttendancePercent(normal, attendanceTotal)}
            strokeColor={{ "0%": "#1677ff", "100%": "#52c41a" }}
          />
        </Col>
        <Col xs={24} md={8}>
          <AttendanceCircleCard
            label="지각"
            value={late}
            percent={getAttendancePercent(late, attendanceTotal)}
            strokeColor="#faad14"
          />
        </Col>
        <Col xs={24} md={8}>
          <AttendanceCircleCard
            label="미출근"
            value={absent}
            percent={getAttendancePercent(absent, attendanceTotal)}
            strokeColor="#ff4d4f"
          />
        </Col>
      </Row>

      <Segmented
        className={styles.segmentedFilter}
        value={filter}
        options={[
          { label: "전체", value: "all" },
          { label: "운영", value: "operation" },
        ]}
        onChange={setFilter}
      />

      <Card size="small" className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Space>
            <Typography.Text strong>현장 GPS</Typography.Text>
            <Typography.Text type="secondary" className={styles.sectionSub}>실시간 접속 0명</Typography.Text>
          </Space>
          <Button size="small">GPS 변경 100m</Button>
        </div>
        <div className={styles.mapPlaceholder}>Kakao Map · 현장 위치</div>
        <Tag className={styles.mapTag}>현장 크루 0명</Tag>
      </Card>

      <Card size="small" className={styles.sectionCard} title="실시간 근태 명단 0">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="배정된 스태프가 없어요" />
      </Card>

      <SummaryStatsRow project={project} />
    </>
  );
}

export function NoticeTab({ project }: { project: Project }) {
  return (
    <>
      <div className={styles.sectionHeader}>
        <Typography.Text strong>0개의 공지</Typography.Text>
        <Button type="primary" icon={<PlusOutlined />}>공지 작성</Button>
      </div>
      <Card size="small" className={styles.sectionCard}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <>
              <div>등록된 공지가 없어요</div>
              <Typography.Text type="secondary">‘공지 작성’으로 크루에게 알릴 내용을 등록해 보세요.</Typography.Text>
            </>
          }
        />
      </Card>
      <SummaryStatsRow project={project} />
    </>
  );
}

export function ScheduleTab({ project }: { project: Project }) {
  return (
    <>
      <Space className={styles.scheduleHeader}>
        <Typography.Text strong>DAY 1 · 06.16 (화)</Typography.Text>
        <Tag>{project.workHours ?? "17:30 - 19:00"}</Tag>
      </Space>
      <SummaryStatsRow project={project} />
    </>
  );
}

export function PartnerTab({ project }: { project: Project }) {
  return (
    <>
      <Card size="small" className={styles.sectionCard} title="다른 에이전시 초대">
        <Input.Search placeholder="에이전시명 또는 사업자번호로 검색" />
      </Card>
      <Typography.Text strong className={styles.sectionLabel}>현재 파트너 0</Typography.Text>
      <Card size="small" className={styles.sectionCard}>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <>
              <div>아직 파트너가 없어요</div>
              <Typography.Text type="secondary">다른 에이전시를 초대해 공동 운영해보세요.</Typography.Text>
            </>
          }
        />
      </Card>
      <SummaryStatsRow project={project} />
    </>
  );
}

export function ContractTab({ project }: { project: Project }) {
  const contracts = getProjectContracts(project.id);
  const unsent = contracts.filter((item) => !item.sent).length;

  return (
    <>
      <div className={styles.sectionHeader}>
        <Typography.Text type="secondary">{contracts.length}건 · 미발송 {unsent}건</Typography.Text>
        <Button icon={<SettingOutlined />}>템플릿</Button>
      </div>
      {contracts.map((item) => (
        <Card key={item.id} size="small" className={styles.listCard}>
          <div className={styles.listCardRow}>
            <div className={styles.listCardLeft}>
              <div className={`${styles.listIcon} ${styles.listIconBlue}`}>
                <FileTextOutlined />
              </div>
              <div>
                <Typography.Text strong>{item.crewName} · {item.role}</Typography.Text>
                <Typography.Text type="secondary" className={styles.listCardSub}>
                  {item.sent ? "발송 완료" : "아직 발송 전"} · 서명 {item.signedDate}
                </Typography.Text>
              </div>
            </div>
            <Space>
              <Button size="small">상세</Button>
              <Tag color="success"><span className={styles.statusDotGreen} /> 서명완료</Tag>
            </Space>
          </div>
        </Card>
      ))}
      <SummaryStatsRow project={project} />
    </>
  );
}

export function EducationTab({ project }: { project: Project }) {
  return (
    <>
      <Card size="small" className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <Typography.Text strong>KTL 수료증 제출 요구</Typography.Text>
          <Tag>미요구</Tag>
        </div>
      </Card>
      <Card size="small" className={styles.sectionCard} title="교육 항목 (1건)">
        <div className={styles.educationItem}>
          <span className={styles.zoneDot} />
          <div className={styles.educationInfo}>
            <Typography.Text strong>기본 안전교육</Typography.Text>
            <Typography.Text type="secondary" className={styles.listCardSub}>
              현장 투입 전 공통 안전교육
            </Typography.Text>
          </div>
          <Tag color="processing">기본</Tag>
        </div>
      </Card>
      <SummaryStatsRow project={project} />
    </>
  );
}

export function SettlementTab({ project }: { project: Project }) {
  const summary = getSettlementSummary(project.id);
  const items = getProjectSettlements(project.id);

  return (
    <>
      <Row gutter={12} className={styles.miniStatRow}>
        <Col span={8}>
          <Card size="small">
            <Typography.Text type="secondary">지급 완료</Typography.Text>
            <div className={`${styles.miniStatValue} ${styles.miniStatGreen}`}>{formatBudget(summary.paid)}</div>
            <Typography.Text type="secondary">{summary.paidCount}건</Typography.Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Typography.Text type="secondary">정산 대기</Typography.Text>
            <div className={`${styles.miniStatValue} ${styles.miniStatOrange}`}>{formatBudget(summary.pending)}</div>
            <Typography.Text type="secondary">{summary.pendingCount}건</Typography.Text>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small">
            <Typography.Text type="secondary">승인됨</Typography.Text>
            <div className={`${styles.miniStatValue} ${styles.miniStatBlue}`}>{formatBudget(summary.approved)}</div>
            <Typography.Text type="secondary">{summary.approvedCount}건</Typography.Text>
          </Card>
        </Col>
      </Row>

      <div className={styles.sectionHeader}>
        <Typography.Text type="secondary">총 {formatBudget(summary.total)} · {summary.count}명</Typography.Text>
        <Space>
          <Button icon={<ThunderboltOutlined />}>정산 계산</Button>
          <Button type="primary" icon={<WalletOutlined />}>결제-지급(송금)</Button>
        </Space>
      </div>

      {items.map((item) => (
        <Card key={item.id} size="small" className={styles.listCard}>
          <div className={styles.listCardRow}>
            <Space>
              <Checkbox />
              <Avatar style={{ backgroundColor: "#52c41a" }}>{item.crewName[0]}</Avatar>
              <div>
                <Typography.Text strong>{item.crewName}</Typography.Text>
                <Typography.Text type="secondary" className={styles.listCardSub}>
                  {item.role} · {item.workHours}시간
                </Typography.Text>
              </div>
            </Space>
            <Space>
              <Typography.Text strong>{formatBudget(item.amount)}</Typography.Text>
              <Tag color="success"><span className={styles.statusDotGreen} /> 지급완료</Tag>
            </Space>
          </div>
        </Card>
      ))}

      <SummaryStatsRow project={project} />
    </>
  );
}

export function SafenetTab({ project }: { project: Project }) {
  return (
    <>
      <div className={styles.sectionHeader}>
        <span />
        <Button type="primary" icon={<PlusOutlined />}>사고 신고 등록</Button>
      </div>
      <Row gutter={12} className={styles.miniStatRow}>
        <Col span={8}><Card size="small"><Typography.Text type="secondary">전체 사고</Typography.Text><div className={styles.miniStatValue}>0건</div></Card></Col>
        <Col span={8}><Card size="small"><Typography.Text type="secondary">진행 중</Typography.Text><div className={styles.miniStatValue}>0건</div></Card></Col>
        <Col span={8}><Card size="small"><Typography.Text type="secondary">해결됨</Typography.Text><div className={styles.miniStatValue}>0건</div></Card></Col>
      </Row>
      <Card size="small" className={styles.sectionCard}>
        <Empty
          image={<SafetyOutlined style={{ fontSize: 48, color: "#52c41a" }} />}
          description={
            <>
              <div>보고된 사고가 없어요</div>
              <Typography.Text type="secondary">현장이 안전하게 운영되고 있어요.</Typography.Text>
            </>
          }
        />
      </Card>
      <SummaryStatsRow project={project} />
    </>
  );
}

export function PttTab({ project }: { project: Project }) {
  return (
    <>
      <Card size="small" className={styles.emptyPanel}>
        <Typography.Text type="secondary">아직 PTT 메시지가 없어요.</Typography.Text>
      </Card>
      <SummaryStatsRow project={project} />
    </>
  );
}
