"use client";

import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  FolderOutlined,
  SendOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Card, Input, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchContracts } from "@/lib/api/operations";
import {
  getContractStatusCounts,
  statusLabel,
  type Contract,
  type ContractStatus,
  type ContractStatusFilter,
} from "./contractData";
import styles from "./ContractPage.module.css";

const statusFilters: { key: ContractStatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "signed", label: "서명 완료" },
  { key: "pending", label: "서명 대기" },
  { key: "unsigned", label: "미서명" },
];

const avatarColors = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16", "#eb2f96"];

function StatusDot({ status }: { status: ContractStatus }) {
  const className =
    status === "signed"
      ? styles.statusDotGreen
      : status === "pending"
        ? styles.statusDotOrange
        : styles.statusDotRed;

  return <span className={className} />;
}

export default function ContractPage() {
  const { message } = App.useApp();
  const { options: projectFilterOptions } = useProjectFilterOptions();
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<ContractStatusFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractStats, setContractStats] = useState({ total: 0, signed: 0, pending: 0, unsigned: 0 });
  const [loading, setLoading] = useState(true);

  const loadContracts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchContracts();
      setContracts(response.items);
      setContractStats(response.stats);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "계약 목록을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadContracts();
  }, [loadContracts]);

  const statusCounts = useMemo(() => getContractStatusCounts(contracts), [contracts]);

  const filteredContracts = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return contracts.filter((item) => {
      if (projectFilter !== "all" && item.projectId !== projectFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (!keyword) return true;

      return (
        item.crewName.toLowerCase().includes(keyword) ||
        item.projectName.toLowerCase().includes(keyword)
      );
    });
  }, [contracts, projectFilter, searchText, statusFilter]);

  const columns: ColumnsType<Contract> = [
    {
      title: "크루",
      key: "crew",
      width: 180,
      render: (_, record, index) => (
        <div className={styles.crewCell}>
          <Avatar size={36} style={{ backgroundColor: avatarColors[index % avatarColors.length] }}>
            {record.crewName[0]}
          </Avatar>
          <div className={styles.crewInfo}>
            <Typography.Text className={styles.crewName}>{record.crewName}</Typography.Text>
            <Typography.Text className={styles.crewRole}>{record.crewRole}</Typography.Text>
          </div>
        </div>
      ),
    },
    { title: "프로젝트", dataIndex: "projectName", key: "projectName", width: 160 },
    { title: "계약 유형", dataIndex: "contractType", key: "contractType", width: 120 },
    {
      title: "발송일",
      dataIndex: "sentDate",
      key: "sentDate",
      width: 100,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "서명일",
      dataIndex: "signedDate",
      key: "signedDate",
      width: 100,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (value: ContractStatus) => (
        <span className={styles.statusBadge}>
          <StatusDot status={value} />
          {statusLabel[value]}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 140,
      render: (_, record) => (
        <div className={styles.actionCell}>
          <Button size="small" icon={<EyeOutlined />}>
            보기
          </Button>
          {record.status === "unsigned" && (
            <Button type="primary" size="small" icon={<SendOutlined />}>
              발송
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          프로젝트 배정 시 계약서가 자동 생성됩니다. 미서명 크루는 게이트 출입이 차단됩니다.
        </Typography.Text>
        <Space>
          <Button icon={<DownloadOutlined />}>CSV</Button>
          <Button type="primary" icon={<SendOutlined />}>
            미서명 일괄 발송
          </Button>
        </Space>
      </div>

      <div className={styles.statRow}>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>전체 계약</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {contractStats.total}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>발송된 계약서</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <FileTextOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>서명 완료</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {contractStats.signed}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>출입 가능</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <CheckCircleOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>서명 대기</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {contractStats.pending}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>발송 후 미서명</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <ClockCircleOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>미서명</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {contractStats.unsigned}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>게이트 차단</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconRed}`}>
            <StopOutlined />
          </div>
        </Card>
      </div>

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
        <Input.Search
          allowClear
          className={styles.searchInput}
          placeholder="크루·프로젝트 검색"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <Card className={styles.tableCard} styles={{ body: { padding: 0 } }}>
        <Table<Contract>
          rowKey="id"
          columns={columns}
          dataSource={filteredContracts}
          loading={loading}
          pagination={false}
          scroll={{ x: 960 }}
        />
      </Card>
    </div>
  );
}
