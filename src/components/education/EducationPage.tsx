"use client";

import {
  DownloadOutlined,
  FolderOutlined,
  PlusOutlined,
  SettingOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Empty, Progress, Select, Spin, Switch, Tag, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchEducationOverview, updateEducationSettings } from "@/lib/api/operations";
import styles from "./EducationPage.module.css";

const statusTabKeys = [
  { key: "all", label: "전체" },
  { key: "completed", label: "이수" },
  { key: "expiring", label: "만료 임박" },
  { key: "incomplete", label: "미이수" },
] as const;

export default function EducationPage() {
  const { message } = App.useApp();
  const { options: projectOptions, loading: optionsLoading } = useProjectFilterOptions(false);
  const [projectCode, setProjectCode] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [ktlRequired, setKtlRequired] = useState(false);
  const [siteRequired, setSiteRequired] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completionRate, setCompletionRate] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({
    all: 0,
    completed: 0,
    expiring: 0,
    incomplete: 0,
  });

  const loadOverview = useCallback(
    async (code: string) => {
      if (!code) return;
      setLoading(true);
      try {
        const data = await fetchEducationOverview(code);
        setCompletionRate(data.completionRate);
        setCompletedCount(data.completedCount);
        setTotalCount(data.totalCount);
        setKtlRequired(data.ktlRequired);
        setSiteRequired(data.siteRequired);
        setStatusCounts(data.statusCounts);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : "교육 현황을 불러오지 못했습니다.";
        message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [message],
  );

  useEffect(() => {
    if (!projectCode && projectOptions.length > 0) {
      setProjectCode(projectOptions[0].value);
    }
  }, [projectCode, projectOptions]);

  useEffect(() => {
    if (projectCode) {
      void loadOverview(projectCode);
    }
  }, [loadOverview, projectCode]);

  const handleToggle = async (field: "ktlRequired" | "siteRequired", checked: boolean) => {
    const nextKtl = field === "ktlRequired" ? checked : ktlRequired;
    const nextSite = field === "siteRequired" ? checked : siteRequired;
    if (field === "ktlRequired") setKtlRequired(checked);
    if (field === "siteRequired") setSiteRequired(checked);

    try {
      await updateEducationSettings({
        projectCode,
        ktlRequired: nextKtl,
        siteRequired: nextSite,
      });
    } catch (error) {
      if (field === "ktlRequired") setKtlRequired(!checked);
      if (field === "siteRequired") setSiteRequired(!checked);
      const errorMessage =
        error instanceof ApiError ? error.message : "교육 설정 저장에 실패했습니다.";
      message.error(errorMessage);
    }
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.page}>
        <div className={styles.pageTop}>
          <Typography.Text className={styles.subtitle}>
            미이수 크루는 게이트 출입이 차단됩니다. 필수 교육 콘텐츠 이수 후 출근 가능합니다.
          </Typography.Text>
          <Button icon={<DownloadOutlined />}>이수 현황 CSV</Button>
        </div>

        <Select
          className={styles.projectSelect}
          value={projectCode || undefined}
          options={projectOptions}
          loading={optionsLoading}
          prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
          onChange={setProjectCode}
        />

        <Card className={styles.summaryCard} size="small">
          <Typography.Text className={styles.summaryTitle}>안전 교육 이수율</Typography.Text>
          <div className={styles.summaryHeader}>
            <Typography.Text className={styles.summaryRate}>{completionRate}%</Typography.Text>
            <span className={styles.summaryBadge}>미이수자 {statusCounts.incomplete ?? 0}명</span>
          </div>
          <Progress percent={completionRate} showInfo={false} strokeColor="#1677ff" />
          <div className={styles.summaryFooter}>
            <span>필수 교육 콘텐츠 이수 현황</span>
            <span>
              {completedCount} / {totalCount}명
            </span>
          </div>
          <Typography.Text className={styles.summaryNote}>필수 콘텐츠 1개 기준</Typography.Text>
        </Card>

        <div className={styles.bottomRow}>
          <Card className={styles.panelCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
            <div className={styles.panelHeader}>
              <Typography.Title level={5} className={styles.panelTitle}>
                스태프별 상세 현황
              </Typography.Title>
              <Typography.Text className={styles.panelCount}>총 {totalCount}명</Typography.Text>
            </div>

            <div className={styles.statusTabs}>
              {statusTabKeys.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`${styles.statusTab} ${activeTab === tab.key ? styles.statusTabActive : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label} {statusCounts[tab.key] ?? 0}
                </button>
              ))}
            </div>

            <div className={styles.emptyWrap}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="아직 배정된 크루가 없어요." />
            </div>
          </Card>

          <Card className={styles.panelCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
            <div className={styles.manageHeader}>
              <span className={styles.manageTitle}>
                <SettingOutlined />
                교육 항목 관리
              </span>
              <Button size="small" icon={<PlusOutlined />}>
                추가
              </Button>
            </div>

            <div className={styles.groupTitle}>
              <span className={styles.groupDot} />
              기본 안전교육
            </div>

            <div className={styles.manageItem}>
              <div className={styles.manageItemLeft}>
                <div className={`${styles.manageIcon} ${styles.manageIconGold}`}>
                  <TrophyOutlined />
                </div>
                <div>
                  <Typography.Text className={styles.manageName}>KTL 수료증 제출 요구</Typography.Text>
                  <Typography.Text className={styles.manageDesc}>
                    크루가 외부 발급 수료증을 업로드해야 출근 가능
                  </Typography.Text>
                  <Tag variant="filled" className={styles.defaultTag}>
                    기본
                  </Tag>
                </div>
              </div>
              <Switch checked={ktlRequired} onChange={(checked) => void handleToggle("ktlRequired", checked)} />
            </div>

            <div className={styles.manageItem}>
              <div className={styles.manageItemLeft}>
                <div className={`${styles.manageIcon} ${styles.manageIconBlue}`}>
                  <FileTextOutlined />
                </div>
                <div>
                  <Typography.Text className={styles.manageName}>현장 자체교육 자료 이수</Typography.Text>
                  <Typography.Text className={styles.manageDesc}>
                    에이전시가 등록 시 생성·이수해야 출근 가능
                  </Typography.Text>
                </div>
              </div>
              <Switch checked={siteRequired} onChange={(checked) => void handleToggle("siteRequired", checked)} />
            </div>
          </Card>
        </div>
      </div>
    </Spin>
  );
}
