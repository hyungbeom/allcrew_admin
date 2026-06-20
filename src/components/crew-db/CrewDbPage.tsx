"use client";

import {
  DownloadOutlined,
  FilterOutlined,
  FolderOutlined,
  MessageOutlined,
  RightOutlined,
  SortAscendingOutlined,
  StarFilled,
} from "@ant-design/icons";
import { App, Avatar, Button, Input, Select, Table, Tag, Typography } from "antd";
import type { TableColumnsType, TableProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  avatarColors,
  formatRecentWork,
  maskPhone,
  type CrewMember,
} from "./crewData";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchCrewMembers } from "@/lib/api/operations";
import styles from "./CrewDbPage.module.css";

const PAGE_SIZE = 10;

export default function CrewDbPage() {
  const { message } = App.useApp();
  const { options: projectFilterOptions } = useProjectFilterOptions();
  const [projectFilter, setProjectFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);

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

    return crewMembers
      .filter((crew) => {
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

  const columns: TableColumnsType<CrewMember> = [
    {
      title: "크루",
      key: "crew",
      width: "22%",
      sorter: (a, b) => a.name.localeCompare(b.name, "ko"),
      render: (_, record, index) => (
        <div className={styles.crewCell}>
          <Avatar size={40} style={{ backgroundColor: avatarColors[index % avatarColors.length] }}>
            {record.name.slice(-2)}
          </Avatar>
          <div className={styles.crewInfo}>
            <Typography.Text className={styles.crewName}>{record.name}</Typography.Text>
            <Typography.Text className={styles.crewPhone}>{maskPhone(record.phone)}</Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: "주 직무",
      dataIndex: "role",
      key: "role",
      width: "10%",
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
      defaultSortOrder: "descend",
      render: (value: number) => `${value}일`,
    },
    {
      title: "최근 근무",
      dataIndex: "recentWorkDate",
      key: "recentWorkDate",
      width: "12%",
      sorter: (a, b) => a.recentWorkDate.localeCompare(b.recentWorkDate),
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
      render: () => (
        <div className={styles.actionCell}>
          <Button type="text" size="small" icon={<MessageOutlined />} aria-label="메시지 보내기" />
          <Button type="text" size="small" icon={<RightOutlined />} aria-label="상세 보기" />
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
        <Button
          icon={<DownloadOutlined />}
          onClick={() => message.info("CSV 내보내기를 준비 중입니다.")}
        >
          CSV 내보내기
        </Button>
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

        <div className={styles.toolbarRight}>
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
          <Button icon={<SortAscendingOutlined />}>근무 많은 순</Button>
          <Button icon={<FilterOutlined />}>필터</Button>
        </div>
      </div>

      <Table<CrewMember>
        className={styles.crewTable}
        rowKey="id"
        columns={columns}
        dataSource={filteredCrew}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: "max-content" }}
        pagination={{
          current: currentPage,
          pageSize: PAGE_SIZE,
          total: filteredCrew.length,
          showSizeChanger: false,
          showTotal: (total, range) => `${total}개 중 ${range[0]}-${range[1]} 표시`,
        }}
      />
    </div>
  );
}
