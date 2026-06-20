"use client";

import {
  CheckOutlined,
  CloseOutlined,
  DownloadOutlined,
  FolderOutlined,
  HourglassOutlined,
  MinusCircleOutlined,
  PayCircleOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Card, Empty, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchSettlements } from "@/lib/api/operations";
import {
  formatCurrency,
  formatWorkHours,
  getSettlementStatusCounts,
  getSettlementSummary,
  statusLabel,
  type Settlement,
  type SettlementStatus,
  type SettlementStatusFilter,
} from "./settlementData";
import styles from "./SettlementPage.module.css";

const statusFilters: { key: SettlementStatusFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "pending", label: "대기" },
  { key: "approved", label: "승인" },
  { key: "paid", label: "지급완료" },
];

const avatarColors = ["#1677ff", "#722ed1", "#13c2c2", "#fa8c16", "#eb2f96"];

function StatusDot({ status }: { status: SettlementStatus }) {
  const className =
    status === "paid"
      ? styles.statusDotGreen
      : status === "approved"
        ? styles.statusDotBlue
        : styles.statusDotGrey;

  return <span className={className} />;
}

export default function SettlementPage() {
  const { message } = App.useApp();
  const { options: projectOptions, loading: optionsLoading } = useProjectFilterOptions(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<SettlementStatusFilter>("pending");
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSettlements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchSettlements();
      setSettlements(response.items);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "정산 목록을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadSettlements();
  }, [loadSettlements]);

  useEffect(() => {
    if (!projectFilter && projectOptions.length > 0) {
      setProjectFilter(projectOptions[0].value);
    }
  }, [projectFilter, projectOptions]);

  const projectSettlements = useMemo(
    () => settlements.filter((item) => item.projectId === projectFilter),
    [projectFilter, settlements],
  );

  const statusCounts = useMemo(
    () => getSettlementStatusCounts(projectSettlements),
    [projectSettlements],
  );

  const summary = useMemo(() => getSettlementSummary(projectSettlements), [projectSettlements]);

  const filteredSettlements = useMemo(() => {
    return projectSettlements.filter((item) => {
      if (statusFilter === "all") return true;
      return item.status === statusFilter;
    });
  }, [projectSettlements, statusFilter]);

  const columns: ColumnsType<Settlement> = [
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
    {
      title: "근무",
      dataIndex: "workHours",
      key: "workHours",
      width: 80,
      render: (value: number) => formatWorkHours(value),
    },
    {
      title: "시급",
      dataIndex: "hourlyRate",
      key: "hourlyRate",
      width: 100,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "세전",
      dataIndex: "preTax",
      key: "preTax",
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "공제(3.3%)",
      dataIndex: "deduction",
      key: "deduction",
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "실지급",
      dataIndex: "netPay",
      key: "netPay",
      width: 120,
      render: (value: number) => formatCurrency(value),
    },
    {
      title: "상태",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (value: SettlementStatus) => (
        <span className={styles.statusBadge}>
          <StatusDot status={value} />
          {statusLabel[value]}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          프로젝트별 근무 시간 기준 급여를 검토·승인하고 일괄 송금하세요.
        </Typography.Text>
        <Space>
          <Button icon={<DownloadOutlined />}>CSV 내보내기</Button>
          <Button type="primary" icon={<CheckOutlined />}>
            일괄 승인 후 송금
          </Button>
        </Space>
      </div>

      <div className={styles.statRow}>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>세전 합계</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {formatCurrency(summary.preTaxTotal)}
            </Typography.Text>
            <Typography.Text className={styles.statSub}>
              {summary.count}명 · 근무 기준
            </Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <PayCircleOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>공제 합계</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {formatCurrency(summary.deductionTotal)}
            </Typography.Text>
            <Typography.Text className={styles.statSub}>3.3% 원천징수</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconGrey}`}>
            <MinusCircleOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>실지급액</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {formatCurrency(summary.netPayTotal)}
            </Typography.Text>
            <Typography.Text className={styles.statSub}>총 지급 예정</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <WalletOutlined />
          </div>
        </Card>
        <Card className={styles.statCard} size="small">
          <div>
            <Typography.Text className={styles.statLabel}>정산 대기</Typography.Text>
            <Typography.Text className={styles.statValue}>
              {summary.pendingCount}
              <span className={styles.statUnit}>건</span>
            </Typography.Text>
            <Typography.Text className={styles.statSub}>승인 필요</Typography.Text>
          </div>
          <div className={`${styles.statIcon} ${styles.statIconOrange}`}>
            <HourglassOutlined />
          </div>
        </Card>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Select
            className={styles.projectSelect}
            value={projectFilter || undefined}
            options={projectOptions}
            loading={optionsLoading}
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
        <div className={styles.toolbarActions}>
          <Button danger icon={<CloseOutlined />}>
            반려
          </Button>
          <Button type="primary" icon={<CheckOutlined />}>
            일괄 승인
          </Button>
        </div>
      </div>

      <Card className={styles.tableCard} styles={{ body: { padding: 0 } }}>
        <Table<Settlement>
          rowKey="id"
          columns={columns}
          dataSource={filteredSettlements}
          loading={loading}
          pagination={false}
          scroll={{ x: 960 }}
          locale={{
            emptyText: (
              <div className={styles.emptyWrap}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="해당 상태의 정산 건이 없어요."
                />
              </div>
            ),
          }}
        />
      </Card>
    </div>
  );
}
