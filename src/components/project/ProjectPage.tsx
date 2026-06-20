"use client";

import {
  AppstoreOutlined,
  DownloadOutlined,
  FolderOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { Button, Card, Input, Progress, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  formatBudget,
  getStatusCounts,
  projects,
  statusLabel,
  type Project,
  type ProjectStatus,
  type StatusFilter,
} from "./projectData";
import styles from "./ProjectPage.module.css";

type ViewMode = "list" | "grid";

const statusFilters: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "in_progress", label: "진행중" },
  { key: "recruiting", label: "모집중" },
  { key: "completed", label: "완료" },
];

const statusTagColor: Record<ProjectStatus, string> = {
  in_progress: "processing",
  recruiting: "warning",
  completed: "default",
};

export default function ProjectPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const statusCounts = useMemo(() => getStatusCounts(projects), []);

  const filteredProjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return projects
      .filter((project) => {
        if (statusFilter !== "all" && project.status !== statusFilter) {
          return false;
        }

        if (!keyword) {
          return true;
        }

        return (
          project.name.toLowerCase().includes(keyword) ||
          project.location.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [searchText, statusFilter]);

  const handleRowClick = (record: Project) => {
    router.push(`/project/${record.id}`);
  };

  const isSelectionClick = (target: EventTarget) => {
    const element = target as HTMLElement;
    return Boolean(element.closest(".ant-checkbox-wrapper") || element.closest(".ant-checkbox"));
  };

  const columns: ColumnsType<Project> = [
    {
      title: "프로젝트",
      dataIndex: "name",
      key: "name",
      width: 180,
      ellipsis: true,
    },
    {
      title: "장소",
      dataIndex: "location",
      key: "location",
      ellipsis: true,
    },
    {
      title: "기간",
      key: "period",
      width: 120,
      render: (_, record) => `${record.startDate} - ${record.endDate}`,
    },
    {
      title: "크루",
      key: "crew",
      width: 100,
      render: (_, record) => {
        const percent = Math.round((record.crewCurrent / record.crewTotal) * 100);
        return (
          <Progress percent={percent} showInfo={false} size="small" status="success" />
        );
      },
    },
    {
      title: "매니저",
      dataIndex: "manager",
      key: "manager",
      width: 100,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "예산",
      dataIndex: "budget",
      key: "budget",
      width: 120,
      render: (value: number) => formatBudget(value),
    },
    {
      title: "진행률",
      key: "progress",
      width: 100,
      render: (_, record) => (
        <Progress percent={record.progress} showInfo={false} size="small" />
      ),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      width: 90,
      render: (value: ProjectStatus) => (
        <Tag color={statusTagColor[value]}>{statusLabel[value]}</Tag>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <span className={styles.subtitle}>총 {projects.length}개의 프로젝트가 등록되어 있어요.</span>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={() => message.info("CSV 다운로드를 준비 중입니다.")}>
            CSV
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            새 프로젝트
          </Button>
        </Space>
      </div>

      <div className={styles.toolbar}>
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

        <div className={styles.toolbarRight}>
          <Input.Search
            allowClear
            className={styles.searchInput}
            placeholder="프로젝트명, 장소로 검색"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          <div className={styles.viewToggle}>
            <button
              type="button"
              aria-label="리스트 보기"
              className={`${styles.viewButton} ${viewMode === "list" ? styles.viewButtonActive : ""}`}
              onClick={() => setViewMode("list")}
            >
              <UnorderedListOutlined />
            </button>
            <button
              type="button"
              aria-label="그리드 보기"
              className={`${styles.viewButton} ${viewMode === "grid" ? styles.viewButtonActive : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <AppstoreOutlined />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        <Table<Project>
          rowKey="id"
          size="small"
          bordered
          columns={columns}
          dataSource={filteredProjects}
          pagination={false}
          scroll={{ x: 1100 }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          onRow={(record) => ({
            onClick: (event) => {
              if (isSelectionClick(event.target)) return;
              handleRowClick(record);
            },
            style: { cursor: "pointer" },
          })}
        />
      ) : (
        <div className={styles.grid}>
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className={styles.gridCard}
              size="small"
              hoverable
              onClick={() => handleRowClick(project)}
            >
              <div className={styles.gridCardHeader}>
                <div className={styles.projectIcon}>
                  <FolderOutlined />
                </div>
                <div className={styles.projectInfo}>
                  <strong>{project.name}</strong>
                  <div className={styles.projectMeta}>
                    {project.id} · {project.category}
                  </div>
                </div>
              </div>
              <div className={styles.gridMetaRow}>
                <span>장소</span>
                <span>{project.location}</span>
              </div>
              <div className={styles.gridMetaRow}>
                <span>기간</span>
                <span>
                  {project.startDate} - {project.endDate}
                </span>
              </div>
              <div className={styles.gridMetaRow}>
                <span>상태</span>
                <Tag color={statusTagColor[project.status]}>{statusLabel[project.status]}</Tag>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
