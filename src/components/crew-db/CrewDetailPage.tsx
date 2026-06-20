"use client";

import { MessageOutlined, StarFilled } from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Card,
  Descriptions,
  Empty,
  Space,
  Spin,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import { useLayout } from "@/components/layout/LayoutContext";
import breadcrumbStyles from "@/components/layout/ContentBreadcrumb.module.css";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchCrewMember } from "@/lib/api/operations";
import { companyPath } from "@/lib/companyPaths";
import {
  avatarColors,
  formatPhone,
  formatRecentWork,
  type CrewMember,
} from "./crewData";
import styles from "./CrewDetailPage.module.css";

type CrewDetailPageProps = {
  crewId: string;
};

function pickAvatarColor(name: string) {
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % avatarColors.length;
  return avatarColors[index];
}

export default function CrewDetailPage({ crewId }: CrewDetailPageProps) {
  const router = useRouter();
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const { setPageHeaderTitle } = useLayout();
  const { options: projectFilterOptions } = useProjectFilterOptions();
  const [crew, setCrew] = useState<CrewMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const projectLabelMap = useMemo(
    () => new Map(projectFilterOptions.map((option) => [option.value, option.label])),
    [projectFilterOptions],
  );

  const loadCrew = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await fetchCrewMember(crewId);
      setCrew(data);
    } catch (error) {
      setCrew(null);
      if (error instanceof ApiError && error.status === 404) {
        setNotFound(true);
        return;
      }
      const errorMessage =
        error instanceof ApiError ? error.message : "크루 정보를 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [crewId, message]);

  useEffect(() => {
    void loadCrew();
  }, [loadCrew]);

  useEffect(() => {
    if (!crew) {
      setPageHeaderTitle(null);
      return;
    }

    setPageHeaderTitle(
      <>
        <span className={breadcrumbStyles.pageTitleMuted}>크루 상세</span>
        <span className={breadcrumbStyles.pageTitleSeparator}>&gt;</span>
        <span className={breadcrumbStyles.pageTitleName}>{crew.name}</span>
        <Tag variant="filled">{crew.role}</Tag>
      </>,
    );

    return () => setPageHeaderTitle(null);
  }, [crew, setPageHeaderTitle]);

  const handleGoToChat = () => {
    router.push(companyPath(companySlug, "chat"));
  };

  if (loading) {
    return (
      <div className={styles.pageLoading}>
        <Spin size="large" />
      </div>
    );
  }

  if (!crew || notFound) {
    return (
      <Empty description="크루를 찾을 수 없습니다.">
        <Link href={companyPath(companySlug, "crew-db")}>
          <Button type="primary">크루 DB로</Button>
        </Link>
      </Empty>
    );
  }

  return (
    <div className={styles.page}>
      <Card className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <Avatar size={72} style={{ backgroundColor: pickAvatarColor(crew.name) }}>
            {crew.name.charAt(0)}
          </Avatar>
          <div className={styles.profileInfo}>
            <Typography.Title level={3} className={styles.profileName}>
              {crew.name}
            </Typography.Title>
            <Space wrap>
              <Tag variant="filled">{crew.role}</Tag>
              <span className={styles.ratingCell}>
                <StarFilled className={styles.ratingStar} />
                {crew.rating.toFixed(1)}
              </span>
            </Space>
          </div>
          <Space className={styles.profileActions}>
            <Button icon={<MessageOutlined />} onClick={handleGoToChat}>
              채팅
            </Button>
          </Space>
        </div>

        <Descriptions bordered column={{ xs: 1, sm: 2 }} size="middle">
          <Descriptions.Item label="연락처">{formatPhone(crew.phone)}</Descriptions.Item>
          <Descriptions.Item label="누적 프로젝트">{crew.projectCount}건</Descriptions.Item>
          <Descriptions.Item label="누적 근무">{crew.workDays}일</Descriptions.Item>
          <Descriptions.Item label="최근 근무">{formatRecentWork(crew.recentWorkDate)}</Descriptions.Item>
          <Descriptions.Item label="안전교육">{crew.safetyTraining ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="크루 ID">{crew.id}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="참여 프로젝트" className={styles.projectCard}>
        {crew.projectIds.length > 0 ? (
          <div className={styles.projectList}>
            {crew.projectIds.map((projectId) => (
              <Link
                key={projectId}
                href={companyPath(companySlug, `project/${projectId}`)}
                className={styles.projectLink}
              >
                <span>{projectLabelMap.get(projectId) ?? projectId}</span>
                <Typography.Text type="secondary">{projectId}</Typography.Text>
              </Link>
            ))}
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="참여 프로젝트가 없습니다." />
        )}
      </Card>
    </div>
  );
}
