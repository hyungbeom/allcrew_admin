"use client";

import {
  AppstoreOutlined,
  FileExcelOutlined,
  FolderOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Input, Progress, Select, Space, Table, Tag } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import CreateProjectModal from "./CreateProjectModal";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import { companyPath } from "@/lib/companyPaths";
import { fetchProjects } from "@/lib/api/project";
import { ApiError } from "@/lib/api/client";
import { downloadProjectListExcel } from "@/lib/export/downloadProjectListExcel";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import {
  formatBudget,
  statusLabel,
  type Project,
  type ProjectStatus,
} from "./projectData";
import styles from "./ProjectPage.module.css";

type ViewMode = "list" | "grid";

const statusTagColor: Record<ProjectStatus, string> = {
  in_progress: "processing",
  recruiting: "warning",
  completed: "default",
};

export default function ProjectPage() {
  const router = useRouter();
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const { options: projectFilterOptions } = useProjectFilterOptions();
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchProjects();
      setProjects(items);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "프로젝트 목록을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return projects
      .filter((project) => {
        if (projectFilter !== "all" && project.id !== projectFilter) {
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
  }, [projectFilter, searchText, projects]);

  const handleTableChange: TableProps<Project>["onChange"] = () => {
    // antd Table column filter / sort는 dataSource 기준으로 클라이언트 처리
  };

  const handleDownloadProjectList = () => {
    if (filteredProjects.length === 0) {
      message.warning("다운로드할 프로젝트가 없습니다.");
      return;
    }

    downloadProjectListExcel(filteredProjects);
    message.success("프로젝트 리스트를 다운로드했습니다.");
  };

  const handleRowClick = (record: Project) => {
    router.push(companyPath(companySlug, `project/${record.id}`));
  };

  const isSelectionClick = (target: EventTarget) => {
    const element = target as HTMLElement;
    return Boolean(element.closest(".ant-checkbox-wrapper") || element.closest(".ant-checkbox"));
  };

  const columns: TableColumnsType<Project> = [
    {
      title: "프로젝트",
      dataIndex: "name",
      key: "name",
      width: "22%",
      ellipsis: true,
      sorter: (a, b) => a.name.localeCompare(b.name, "ko"),
    },
    {
      title: "장소",
      dataIndex: "location",
      key: "location",
      width: "22%",
      ellipsis: true,
      sorter: (a, b) => a.location.localeCompare(b.location, "ko"),
    },
    {
      title: "기간",
      key: "period",
      width: "12%",
      sorter: (a, b) => a.createdAt.localeCompare(b.createdAt),
      render: (_, record) => `${record.startDate} - ${record.endDate}`,
    },
    {
      title: "크루",
      key: "crew",
      width: "10%",
      sorter: (a, b) =>
        a.crewCurrent / a.crewTotal - b.crewCurrent / b.crewTotal,
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
      width: "10%",
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "예산",
      dataIndex: "budget",
      key: "budget",
      width: "10%",
      sorter: (a, b) => a.budget - b.budget,
      render: (value: number) => formatBudget(value),
    },
    {
      title: "진행률",
      dataIndex: "progress",
      key: "progress",
      width: "10%",
      sorter: (a, b) => a.progress - b.progress,
      render: (value: number) => <Progress percent={value} showInfo={false} size="small" />,
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      width: "10%",
      filters: [
        { text: statusLabel.in_progress, value: "in_progress" },
        { text: statusLabel.recruiting, value: "recruiting" },
        { text: statusLabel.completed, value: "completed" },
      ],
      filterSearch: true,
      onFilter: (value, record) => record.status === value,
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
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalOpen(true)}>
            새 프로젝트
          </Button>
          <Button
            className={styles.downloadButton}
            icon={<FileExcelOutlined className={styles.downloadIcon} />}
            onClick={handleDownloadProjectList}
          >
            프로젝트 리스트 다운로드
          </Button>
        </Space>
      </div>

      <div className={styles.toolbar}>
        <Select
          className={styles.projectSelect}
          value={projectFilter}
          options={projectFilterOptions}
          prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
          onChange={setProjectFilter}
        />
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

      {viewMode === "list" ? (
        <Table<Project>
          className={styles.projectTable}
          size="medium"
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredProjects}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
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
              size="middle"
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

      <CreateProjectModal
        variant="drawer"
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={loadProjects}
      />
    </div>
  );
}
