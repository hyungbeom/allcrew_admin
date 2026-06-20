"use client";

import {
  AppstoreOutlined,
  FileExcelOutlined,
  FolderOutlined,
  MessageOutlined,
  PlusOutlined,
  RightOutlined,
  StarFilled,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { App, Button, Card, Input, Select, Space, Table, Tag, Typography } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import { companyPath } from "@/lib/companyPaths";
import {
  formatPhone,
  formatRecentWork,
  type CrewMember,
} from "./crewData";
import { ApiError } from "@/lib/api/client";
import { downloadCrewListExcel } from "@/lib/export/downloadCrewListExcel";
import { fetchCrewMembers } from "@/lib/api/operations";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import AddCrewDrawer from "./AddCrewDrawer";
import styles from "./CrewDbPage.module.css";

const PAGE_SIZE = 10;

type ViewMode = "list" | "grid";

export default function CrewDbPage() {
  const router = useRouter();
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const { options: projectFilterOptions } = useProjectFilterOptions();
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [addCrewOpen, setAddCrewOpen] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const loadCrew = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchCrewMembers();
      setCrewMembers(items);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "크루 목록을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadCrew();
  }, [loadCrew]);

  const filteredCrew = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return crewMembers.filter((crew) => {
      if (projectFilter !== "all" && !crew.projectIds.includes(projectFilter)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        crew.name.toLowerCase().includes(keyword) ||
        crew.phone.replace(/\D/g, "").includes(keyword.replace(/\D/g, ""))
      );
    });
  }, [crewMembers, projectFilter, searchText]);

  const roleFilters = useMemo(() => {
    const roles = [...new Set(crewMembers.map((crew) => crew.role))];

    return roles.map((role) => ({
      text: role,
      value: role,
    }));
  }, [crewMembers]);

  const handleTableChange: TableProps<CrewMember>["onChange"] = (pagination) => {
    if (pagination.current) {
      setCurrentPage(pagination.current);
    }
  };

  const handleDownloadCrewList = () => {
    if (filteredCrew.length === 0) {
      message.warning("다운로드할 크루가 없습니다.");
      return;
    }

    downloadCrewListExcel(filteredCrew);
    message.success("크루 리스트를 다운로드했습니다.");
  };

  const handleGoToChat = useCallback(() => {
    router.push(companyPath(companySlug, "chat"));
  }, [companySlug, router]);

  const handleRowClick = useCallback(
    (record: CrewMember) => {
      router.push(companyPath(companySlug, `crew-db/${record.id}`));
    },
    [companySlug, router],
  );

  const isSelectionClick = (target: EventTarget) => {
    const element = target as HTMLElement;
    return Boolean(element.closest(".ant-checkbox-wrapper") || element.closest(".ant-checkbox"));
  };

  const isActionClick = (target: EventTarget) => {
    const element = target as HTMLElement;
    return Boolean(element.closest("button") || element.closest("a"));
  };

  const columns: TableColumnsType<CrewMember> = [
    {
      title: "크루",
      key: "crew",
      width: "16%",
      sorter: (a, b) => a.name.localeCompare(b.name, "ko"),
      render: (_, record) => (
        <Typography.Text className={styles.crewName}>{record.name}</Typography.Text>
      ),
    },
    {
      title: "연락처",
      dataIndex: "phone",
      key: "phone",
      width: "14%",
      sorter: (a, b) => a.phone.localeCompare(b.phone),
      render: (value: string) => (
        <Typography.Text className={styles.phoneCell}>{formatPhone(value)}</Typography.Text>
      ),
    },
    {
      title: "주 직무",
      dataIndex: "role",
      key: "role",
      width: "9%",
      sorter: (a, b) => a.role.localeCompare(b.role, "ko"),
      filters: roleFilters,
      filterSearch: true,
      onFilter: (value, record) => record.role === value,
      render: (value: string) => (
        <Tag variant="filled" className={styles.roleTag}>
          {value}
        </Tag>
      ),
    },
    {
      title: "누적 프로젝트",
      dataIndex: "projectCount",
      key: "projectCount",
      width: "12%",
      sorter: (a, b) => a.projectCount - b.projectCount,
      render: (value: number) => `${value}건`,
    },
    {
      title: "누적 근무",
      dataIndex: "workDays",
      key: "workDays",
      width: "10%",
      sorter: (a, b) => a.workDays - b.workDays,
      render: (value: number) => `${value}일`,
    },
    {
      title: "최근 근무",
      dataIndex: "recentWorkDate",
      key: "recentWorkDate",
      width: "12%",
      sorter: (a, b) => (a.recentWorkDate || "").localeCompare(b.recentWorkDate || ""),
      render: (value: string) => formatRecentWork(value),
    },
    {
      title: "안전교육",
      dataIndex: "safetyTraining",
      key: "safetyTraining",
      width: "10%",
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "평점",
      dataIndex: "rating",
      key: "rating",
      width: "10%",
      sorter: (a, b) => a.rating - b.rating,
      render: (value: number) => (
        <span className={styles.ratingCell}>
          <StarFilled className={styles.ratingStar} />
          {value.toFixed(1)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: "10%",
      align: "right",
      render: (_, record) => (
        <div className={styles.actionCell}>
          <Button
            type="text"
            size="small"
            icon={<MessageOutlined />}
            aria-label="메시지 보내기"
            onClick={(event) => {
              event.stopPropagation();
              handleGoToChat();
            }}
          />
          <Button
            type="text"
            size="small"
            icon={<RightOutlined />}
            aria-label="상세 보기"
            onClick={(event) => {
              event.stopPropagation();
              handleRowClick(record);
            }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          프로젝트를 진행하며 쌓인 크루 명단이에요. 실제 근무 이력이 있는 크루 {crewMembers.length}명이
          등록되어 있어요.
        </Typography.Text>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddCrewOpen(true)}>
            크루 추가하기
          </Button>
          <Button
            className={styles.downloadButton}
            icon={<FileExcelOutlined className={styles.downloadIcon} />}
            onClick={handleDownloadCrewList}
          >
            크루 리스트 다운로드
          </Button>
        </Space>
      </div>

      <div className={styles.toolbar}>
        <Select
          className={styles.projectSelect}
          value={projectFilter}
          options={projectFilterOptions}
          prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
          onChange={(value) => {
            setProjectFilter(value);
            setCurrentPage(1);
          }}
        />
        <Input.Search
          allowClear
          className={styles.searchInput}
          placeholder="이름, 연락처로 검색"
          value={searchText}
          onChange={(event) => {
            setSearchText(event.target.value);
            setCurrentPage(1);
          }}
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
        <Table<CrewMember>
          className={styles.crewTable}
          size="middle"
          rowKey="id"
          columns={columns}
          dataSource={filteredCrew}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: "max-content" }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: currentPage,
            pageSize: PAGE_SIZE,
            total: filteredCrew.length,
            showSizeChanger: false,
            showTotal: (total, range) => `${total}개 중 ${range[0]}-${range[1]} 표시`,
          }}
          onRow={(record) => ({
            onClick: (event) => {
              if (isSelectionClick(event.target) || isActionClick(event.target)) return;
              handleRowClick(record);
            },
            style: { cursor: "pointer" },
          })}
        />
      ) : (
        <div className={styles.grid}>
          {filteredCrew.map((crew) => (
            <Card
              key={crew.id}
              className={styles.gridCard}
              size="small"
              hoverable
              onClick={() => handleRowClick(crew)}
            >
              <div className={styles.gridCardHeader}>
                <Typography.Text className={styles.crewName}>{crew.name}</Typography.Text>
              </div>
              <div className={styles.gridMetaRow}>
                <span>연락처</span>
                <span>{formatPhone(crew.phone)}</span>
              </div>
              <div className={styles.gridMetaRow}>
                <span>주 직무</span>
                <Tag variant="filled" className={styles.roleTag}>
                  {crew.role}
                </Tag>
              </div>
              <div className={styles.gridMetaRow}>
                <span>누적 프로젝트</span>
                <span>{crew.projectCount}건</span>
              </div>
              <div className={styles.gridMetaRow}>
                <span>누적 근무</span>
                <span>{crew.workDays}일</span>
              </div>
              <div className={styles.gridMetaRow}>
                <span>평점</span>
                <span className={styles.ratingCell}>
                  <StarFilled className={styles.ratingStar} />
                  {crew.rating.toFixed(1)}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddCrewDrawer
        open={addCrewOpen}
        onClose={() => setAddCrewOpen(false)}
        onCreated={loadCrew}
      />
    </div>
  );
}
