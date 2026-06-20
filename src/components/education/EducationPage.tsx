"use client";

import {
  DownloadOutlined,
  FolderOutlined,
  PlusOutlined,
  SettingOutlined,
  TrophyOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { Button, Card, Empty, Progress, Select, Switch, Tag, Typography } from "antd";
import { useState } from "react";
import styles from "./EducationPage.module.css";

const projectOptions = [{ value: "PRJ-0012", label: "asd" }];

const statusTabs = [
  { key: "all", label: "전체", count: 0 },
  { key: "completed", label: "이수", count: 0 },
  { key: "expiring", label: "만료 임박", count: 0 },
  { key: "incomplete", label: "미이수", count: 0 },
];

export default function EducationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [ktlRequired, setKtlRequired] = useState(false);
  const [siteRequired, setSiteRequired] = useState(false);

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          미이수 크루는 게이트 출입이 차단됩니다. 필수 교육 콘텐츠 이수 후 출근 가능합니다.
        </Typography.Text>
        <Button icon={<DownloadOutlined />}>이수 현황 CSV</Button>
      </div>

      <Select
        className={styles.projectSelect}
        defaultValue="PRJ-0012"
        options={projectOptions}
        prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
      />

      <Card className={styles.summaryCard} size="small">
        <Typography.Text className={styles.summaryTitle}>안전 교육 이수율</Typography.Text>
        <div className={styles.summaryHeader}>
          <Typography.Text className={styles.summaryRate}>0%</Typography.Text>
          <span className={styles.summaryBadge}>미이수자 0명</span>
        </div>
        <Progress percent={0} showInfo={false} strokeColor="#1677ff" />
        <div className={styles.summaryFooter}>
          <span>필수 교육 콘텐츠 이수 현황</span>
          <span>0 / 0명</span>
        </div>
        <Typography.Text className={styles.summaryNote}>필수 콘텐츠 1개 기준</Typography.Text>
      </Card>

      <div className={styles.bottomRow}>
        <Card className={styles.panelCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
          <div className={styles.panelHeader}>
            <Typography.Title level={5} className={styles.panelTitle}>
              스태프별 상세 현황
            </Typography.Title>
            <Typography.Text className={styles.panelCount}>총 0명</Typography.Text>
          </div>

          <div className={styles.statusTabs}>
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`${styles.statusTab} ${activeTab === tab.key ? styles.statusTabActive : ""}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} {tab.count}
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
                <Tag bordered={false} className={styles.defaultTag}>
                  기본
                </Tag>
              </div>
            </div>
            <Switch checked={ktlRequired} onChange={setKtlRequired} />
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
            <Switch checked={siteRequired} onChange={setSiteRequired} />
          </div>
        </Card>
      </div>
    </div>
  );
}
