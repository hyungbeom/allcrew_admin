"use client";

import {
  CalendarOutlined,
  EnvironmentOutlined,
  StarFilled,
  ThunderboltOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Spin,
  Tabs,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import { useLayout } from "@/components/layout/LayoutContext";
import breadcrumbStyles from "@/components/layout/ContentBreadcrumb.module.css";
import { companyPath } from "@/lib/companyPaths";
import { fetchProject } from "@/lib/api/project";
import { ApiError } from "@/lib/api/client";
import { SummaryStatsRow } from "./ProjectDetailSummary";
import {
  ContractTab,
  EducationTab,
  FieldTab,
  NoticeTab,
  PartnerTab,
  PttTab,
  SafenetTab,
  ScheduleTab,
  SettlementTab,
} from "./ProjectDetailTabs";
import {
  formatBudget,
  getApplicantStatusCounts,
  getProjectApplicants,
  getProjectCrewMembers,
  getProjectPlacements,
  getProjectPeriod,
  getUnassignedCrewCount,
  applicantStatusLabel,
  statusLabel,
  type ApplicantStatus,
  type Project,
  type ProjectStatus,
} from "./projectData";
import styles from "./ProjectDetailPage.module.css";

type ProjectDetailPageProps = {
  projectId: string;
};

type DetailTabKey =
  | "overview"
  | "crew"
  | "placement"
  | "applicants"
  | "field"
  | "notice"
  | "schedule"
  | "partner"
  | "contract"
  | "education"
  | "settlement"
  | "safenet"
  | "ptt";

const statusTagColor: Record<ProjectStatus, string> = {
  in_progress: "processing",
  recruiting: "warning",
  completed: "default",
};

function ApplicantStatusDot({ status }: { status: ApplicantStatus }) {
  const className =
    status === "approved"
      ? styles.statusDotGreen
      : status === "rejected"
        ? styles.statusDotRed
        : styles.statusDotGrey;

  return <span className={className} />;
}

function CrewTab({ project }: { project: Project }) {
  const members = getProjectCrewMembers(project.id);

  return (
    <>
      <Typography.Text type="secondary" className={styles.crewSummary}>
        총 {members.length}명
        {project.status === "completed" && " · 마감된 프로젝트라 평가만 가능합니다"}
      </Typography.Text>

      {members.length > 0 ? (
        members.map((member) => (
          <Card key={member.id} size="small" className={styles.crewMemberCard}>
            <div className={styles.crewMemberRow}>
              <Avatar size={48} style={{ backgroundColor: member.avatarColor }}>
                {member.name[0]}
              </Avatar>
              <div className={styles.crewMemberInfo}>
                <Typography.Text className={styles.crewMemberName}>{member.name}</Typography.Text>
                <Typography.Text className={styles.crewMemberMeta}>
                  {member.role} · Lv.{member.level}
                </Typography.Text>
              </div>
              <span className={styles.crewRating}>
                <StarFilled className={styles.crewRatingStar} />
                {member.rating.toFixed(1)}
              </span>
            </div>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="배정된 크루가 없습니다." />
      )}

      <SummaryStatsRow project={project} />
    </>
  );
}

function ApplicantsTab({ project }: { project: Project }) {
  const applicants = getProjectApplicants(project.id);
  const counts = getApplicantStatusCounts(project.id);

  return (
    <>
      <div className={styles.applicantHeader}>
        <div>
          <Typography.Text className={styles.applicantSummaryTitle}>
            {counts.total}명이 지원했어요
          </Typography.Text>
          <Typography.Text className={styles.applicantSummaryDesc}>
            대기 {counts.pending}명 · 승인 {counts.approved}명 · 거절 {counts.rejected}명
          </Typography.Text>
        </div>
        <Space>
          <Button icon={<ThunderboltOutlined />}>AI 자동 선발</Button>
          <Button type="primary" icon={<ThunderboltOutlined />}>
            AI 매칭 분석
          </Button>
        </Space>
      </div>

      {applicants.length > 0 ? (
        applicants.map((applicant) => (
          <Card key={applicant.id} size="small" className={styles.applicantCard}>
            <div className={styles.applicantRow}>
              <div className={styles.applicantLeft}>
                <Avatar size={48} style={{ backgroundColor: applicant.avatarColor }}>
                  {applicant.name[0]}
                </Avatar>
                <div className={styles.crewMemberInfo}>
                  <Typography.Text className={styles.crewMemberName}>{applicant.name}</Typography.Text>
                  <Typography.Text className={styles.crewMemberMeta}>{applicant.role}</Typography.Text>
                </div>
              </div>
              <span className={styles.applicantStatus}>
                <ApplicantStatusDot status={applicant.status} />
                {applicantStatusLabel[applicant.status]}
              </span>
            </div>
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="지원자가 없습니다." />
      )}

      <SummaryStatsRow project={project} />
    </>
  );
}

function PlacementTab({ project }: { project: Project }) {
  const zones = getProjectPlacements(project.id);
  const unassignedCount = getUnassignedCrewCount(project.id);

  return (
    <>
      <div className={styles.placementSummary}>
        <Typography.Text className={styles.placementSummaryTitle}>
          미배치 크루 {unassignedCount}명
        </Typography.Text>
        <Typography.Text className={styles.placementSummaryDesc}>
          {unassignedCount === 0
            ? "모든 승인 크루가 구역에 배치됐어요."
            : "승인된 크루를 구역에 배치해 주세요."}
        </Typography.Text>
      </div>

      {zones.length > 0 ? (
        zones.map((zone) => (
          <Card key={zone.id} size="small" className={styles.zoneCard}>
            <div className={styles.zoneHeader}>
              <span className={styles.zoneDot} />
              <Typography.Text className={styles.zoneTitle}>{zone.name}</Typography.Text>
            </div>
            {zone.members.map((member) => (
              <div key={member.id} className={styles.zoneMemberRow}>
                <div className={styles.zoneMemberLeft}>
                  <Avatar size={40} style={{ backgroundColor: member.avatarColor }}>
                    {member.name[0]}
                  </Avatar>
                  <div className={styles.crewMemberInfo}>
                    <Typography.Text className={styles.crewMemberName}>{member.name}</Typography.Text>
                    <Typography.Text className={styles.crewMemberMeta}>{member.role}</Typography.Text>
                  </div>
                </div>
                <Space>
                  <Typography.Text className={styles.zoneMemberCount}>
                    {zone.members.length}/{zone.capacity}명
                  </Typography.Text>
                  <Select
                    size="small"
                    defaultValue={zone.name}
                    style={{ width: 100 }}
                    options={[{ value: zone.name, label: zone.name }]}
                  />
                </Space>
              </div>
            ))}
          </Card>
        ))
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="배치 구역이 없습니다." />
      )}

      <SummaryStatsRow project={project} />
    </>
  );
}

function OverviewTab({ project }: { project: Project }) {
  const [mapView, setMapView] = useState<"map" | "list">("map");

  return (
    <>
      <Row gutter={16} className={styles.contentRow}>
        <Col xs={24} lg={14}>
          <Card title="프로젝트 정보" size="small">
            <Descriptions column={1} size="small">
              <Descriptions.Item label="프로젝트명">{project.name}</Descriptions.Item>
              <Descriptions.Item label="카테고리">{project.category}</Descriptions.Item>
              <Descriptions.Item label="장소">{project.location}</Descriptions.Item>
              <Descriptions.Item label="기간">{getProjectPeriod(project)}</Descriptions.Item>
              <Descriptions.Item label="근무 시간">
                {project.workHours ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="예산">{formatBudget(project.budget)}</Descriptions.Item>
              <Descriptions.Item label="담당 매니저">
                {project.manager ?? "미지정"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
          <Card title="메모" size="small" className={styles.memoCard}>
            <Typography.Paragraph style={{ margin: 0 }}>
              {project.memo ?? "등록된 메모가 없습니다."}
            </Typography.Paragraph>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card size="small">
            <div className={styles.mapHeader}>
              <Space>
                <Typography.Text className={styles.mapTitle}>현장 GPS</Typography.Text>
                <span className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  실시간
                </span>
              </Space>
              <Segmented
                size="small"
                value={mapView}
                options={[
                  { label: "지도", value: "map" },
                  { label: "리스트", value: "list" },
                ]}
                onChange={(value) => setMapView(value as "map" | "list")}
              />
            </div>
            {mapView === "map" ? (
              <>
                <div className={styles.mapPlaceholder}>Kakao Map · 현장 위치</div>
                <div className={styles.mapOverlay}>
                  <Tag>현장 크루 {project.crewCurrent}명</Tag>
                  <Tag>GPS 반경 {project.gpsRadius ?? 100}m</Tag>
                </div>
              </>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="GPS 리스트가 없습니다." />
            )}
          </Card>
        </Col>
      </Row>

      <SummaryStatsRow project={project} />
    </>
  );
}

export default function ProjectDetailPage({ projectId }: ProjectDetailPageProps) {
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const { setPageHeaderTitle } = useLayout();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTabKey>("overview");

  const loadProject = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await fetchProject(projectId);
      setProject(data);
    } catch (error) {
      setProject(null);
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true);
        return;
      }
      const errorMessage =
        error instanceof ApiError ? error.message : "프로젝트 정보를 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message, projectId]);

  useEffect(() => {
    void loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (!project) {
      setPageHeaderTitle(null);
      return;
    }

    setPageHeaderTitle(
      <>
        <span className={breadcrumbStyles.pageTitleMuted}>프로젝트 상세</span>
        <span className={breadcrumbStyles.pageTitleSeparator}>&gt;</span>
        <span className={breadcrumbStyles.pageTitleName}>{project.name}</span>
        <Tag color={statusTagColor[project.status]}>{statusLabel[project.status]}</Tag>
      </>,
    );

    return () => setPageHeaderTitle(null);
  }, [project, setPageHeaderTitle]);

  const tabItems = useMemo(() => {
    if (!project) return [];

    const applicantCount = project.applicantCount ?? 0;

    return [
      { key: "overview", label: "개요" },
      { key: "crew", label: `크루 ${project.crewCurrent}` },
      { key: "placement", label: "배치" },
      { key: "applicants", label: `지원자 ${applicantCount}` },
      { key: "field", label: "현장 운영" },
      { key: "notice", label: "공지사항" },
      { key: "schedule", label: "일정" },
      { key: "partner", label: "파트너" },
      { key: "contract", label: "계약서" },
      { key: "education", label: "안전교육" },
      { key: "settlement", label: "정산" },
      { key: "safenet", label: "세이프넷" },
      { key: "ptt", label: "PTT" },
    ];
  }, [project]);

  if (loading) {
    return (
      <div className={styles.pageLoading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project || notFound) {
    return (
      <Empty description="프로젝트를 찾을 수 없습니다.">
        <Link href={companyPath(companySlug, "project")}>
          <Button type="primary">프로젝트 목록으로</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.infoRow}>
          <span className={styles.infoItem}>
            <EnvironmentOutlined />
            {project.location}
          </span>
          <span className={styles.infoItem}>
            <CalendarOutlined />
            {getProjectPeriod(project)}
          </span>
          <span className={styles.infoItem}>
            <WalletOutlined />
            예산 {formatBudget(project.budget)}
          </span>
        </div>

        <div className={styles.progressWrap}>
          <Progress percent={project.progress} />
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        items={tabItems}
        onChange={(key) => setActiveTab(key as DetailTabKey)}
      />

      {activeTab === "overview" ? (
        <OverviewTab project={project} />
      ) : activeTab === "crew" ? (
        <CrewTab project={project} />
      ) : activeTab === "placement" ? (
        <PlacementTab project={project} />
      ) : activeTab === "applicants" ? (
        <ApplicantsTab project={project} />
      ) : activeTab === "field" ? (
        <FieldTab project={project} />
      ) : activeTab === "notice" ? (
        <NoticeTab project={project} />
      ) : activeTab === "schedule" ? (
        <ScheduleTab project={project} />
      ) : activeTab === "partner" ? (
        <PartnerTab project={project} />
      ) : activeTab === "contract" ? (
        <ContractTab project={project} />
      ) : activeTab === "education" ? (
        <EducationTab project={project} />
      ) : activeTab === "settlement" ? (
        <SettlementTab project={project} />
      ) : activeTab === "safenet" ? (
        <SafenetTab project={project} />
      ) : activeTab === "ptt" ? (
        <PttTab project={project} />
      ) : (
        <div className={styles.emptyTab}>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="준비 중인 탭입니다." />
        </div>
      )}
    </div>
  );
}
