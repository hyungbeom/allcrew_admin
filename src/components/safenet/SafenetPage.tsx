"use client";

import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  ExpandOutlined,
  FolderOutlined,
  PhoneOutlined,
  SoundOutlined,
} from "@ant-design/icons";
import { Button, Card, Select, Space, Typography } from "antd";
import { useMemo, useState } from "react";
import { projectFilterOptions } from "@/components/crew-db/crewData";
import {
  getIncidentStatusCounts,
  incidents,
  workflowStats,
  type IncidentStatusFilter,
} from "./safenetData";
import styles from "./SafenetPage.module.css";

const statusFilters: { key: IncidentStatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "responding", label: "대응 중" },
  { key: "closed", label: "종결" },
];

export default function SafenetPage() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<IncidentStatusFilter>("all");
  const [selectedId, setSelectedId] = useState(incidents[0]?.id ?? null);

  const statusCounts = useMemo(() => getIncidentStatusCounts(incidents), []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((item) => {
      if (projectFilter !== "all" && item.projectId !== projectFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      return true;
    });
  }, [projectFilter, statusFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          전 현장의 안전 사고를 실시간으로 관제합니다. 신고 접수 → 레드알림 → PTT 대응 → 종결.
        </Typography.Text>
        <Space>
          <Button icon={<DownloadOutlined />}>사고 리포트</Button>
          <Button type="primary" danger icon={<BellOutlined />}>
            레드알림 발행
          </Button>
        </Space>
      </div>

      <div className={styles.workflowRow}>
        <Card className={styles.workflowCard} size="small">
          <div>
            <Typography.Text className={styles.workflowLabel}>신고 접수</Typography.Text>
            <Typography.Text className={styles.workflowValue}>{workflowStats.received}</Typography.Text>
          </div>
          <div className={`${styles.workflowIcon} ${styles.workflowIconBlue}`}>
            <AlertOutlined />
          </div>
        </Card>
        <Card className={styles.workflowCard} size="small">
          <div>
            <Typography.Text className={styles.workflowLabel}>레드알림</Typography.Text>
            <Typography.Text className={styles.workflowValue}>{workflowStats.redAlert}</Typography.Text>
          </div>
          <div className={`${styles.workflowIcon} ${styles.workflowIconRed}`}>
            <BellOutlined />
          </div>
        </Card>
        <Card className={styles.workflowCard} size="small">
          <div>
            <Typography.Text className={styles.workflowLabel}>PTT 대응</Typography.Text>
            <Typography.Text className={styles.workflowValue}>{workflowStats.pttResponse}</Typography.Text>
          </div>
          <div className={`${styles.workflowIcon} ${styles.workflowIconOrange}`}>
            <SoundOutlined />
          </div>
        </Card>
        <Card className={styles.workflowCard} size="small">
          <div>
            <Typography.Text className={styles.workflowLabel}>종결</Typography.Text>
            <Typography.Text className={styles.workflowValue}>{workflowStats.closed}</Typography.Text>
          </div>
          <div className={`${styles.workflowIcon} ${styles.workflowIconGreen}`}>
            <CheckCircleOutlined />
          </div>
        </Card>
      </div>

      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <div className={styles.toolbar}>
            <Select
              className={styles.projectSelect}
              value={projectFilter}
              options={projectFilterOptions}
              prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
              onChange={setProjectFilter}
            />
            <div className={styles.statusTabs}>
              {statusFilters.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`${styles.statusTab} ${statusFilter === item.key ? styles.statusTabActive : ""}`}
                  onClick={() => setStatusFilter(item.key)}
                >
                  {item.label} {statusCounts[item.key]}
                </button>
              ))}
            </div>
          </div>

          <Card className={styles.listCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
            <div className={styles.listHeader}>
              <Typography.Text className={styles.listTitle}>사건 목록</Typography.Text>
              <Typography.Text className={styles.listMeta}>
                {filteredIncidents.length}건 · 최신순
              </Typography.Text>
            </div>

            {filteredIncidents.map((incident) => (
              <div
                key={incident.id}
                className={`${styles.incidentCard} ${selectedId === incident.id ? styles.incidentCardActive : ""}`}
                onClick={() => setSelectedId(incident.id)}
              >
                <div className={styles.incidentTitleRow}>
                  <Typography.Text className={styles.incidentTitle}>{incident.title}</Typography.Text>
                  <span className={styles.statusBadge}>
                    <span className={styles.statusDotGreen} />
                    종결
                  </span>
                </div>
                <Typography.Text className={styles.incidentMeta}>
                  {incident.projectName} · {incident.location}
                  <br />
                  {incident.reporter} · {incident.time} · {incident.id}
                </Typography.Text>
              </div>
            ))}
          </Card>
        </div>

        <div>
          <Card className={`${styles.sideCard} ${styles.mapCard}`} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
            <div className={styles.mapHeader}>
              <Typography.Text className={styles.mapTitle}>라이브 관제 지도</Typography.Text>
              <Space size={12}>
                <span className={styles.mapStatus}>
                  <span className={styles.statusDotGreen} />
                  안정
                </span>
                <Button size="small" icon={<ExpandOutlined />}>
                  전체화면
                </Button>
              </Space>
            </div>
            <div className={styles.mapPlaceholder}>Kakao Map · 실시간 관제</div>
          </Card>

          <Card className={styles.sideCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
            <Typography.Text className={styles.actionTitle}>대응 조치</Typography.Text>
            <div className={styles.actionStack}>
              <Button type="primary" danger block icon={<BellOutlined />}>
                레드알림 발행
              </Button>
              <Button block icon={<SoundOutlined />}>
                PTT 채널 열기
              </Button>
              <Button block icon={<PhoneOutlined />}>
                119 연계 신고
              </Button>
              <Button block icon={<CheckCircleOutlined />}>
                사건 종결 처리
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
