"use client";

import { DownloadOutlined, FolderOutlined, TeamOutlined } from "@ant-design/icons";
import { App, Button, Card, Empty, Input, Select, Spin, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchPttOverview } from "@/lib/api/operations";
import styles from "./PttPage.module.css";

type PttMode = "ptt" | "intercom";

type PttChannel = {
  id: string;
  name: string;
  description: string;
  type: string;
};

export default function PttPage() {
  const { message } = App.useApp();
  const { options: projectOptions, loading: optionsLoading } = useProjectFilterOptions(false);
  const [projectCode, setProjectCode] = useState("");
  const [mode, setMode] = useState<PttMode>("ptt");
  const [searchText, setSearchText] = useState("");
  const [channels, setChannels] = useState<PttChannel[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPtt = useCallback(
    async (code: string) => {
      if (!code) return;
      setLoading(true);
      try {
        const data = await fetchPttOverview(code);
        setChannels(data.channels);
      } catch (error) {
        const errorMessage =
          error instanceof ApiError ? error.message : "PTT 데이터를 불러오지 못했습니다.";
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
      void loadPtt(projectCode);
    }
  }, [loadPtt, projectCode]);

  const filteredChannels = channels.filter((channel) => {
    const keyword = searchText.trim().toLowerCase();
    if (!keyword) return true;
    return (
      channel.name.toLowerCase().includes(keyword) ||
      channel.description.toLowerCase().includes(keyword)
    );
  });

  return (
    <Spin spinning={loading}>
      <div className={styles.page}>
        <div className={styles.pageTop}>
          <Typography.Text className={styles.subtitle}>
            PTT(무전)과 인터컴을 한 곳에서 관리합니다. 채널은 채팅방과 동일하게 구성됩니다.
          </Typography.Text>
          <Button icon={<DownloadOutlined />}>로그 내보내기</Button>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <Select
              className={styles.projectSelect}
              value={projectCode || undefined}
              options={projectOptions}
              loading={optionsLoading}
              prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
              onChange={setProjectCode}
            />
            <div className={styles.modeTabs}>
              <button
                type="button"
                className={`${styles.modeTab} ${mode === "ptt" ? styles.modeTabActive : ""}`}
                onClick={() => setMode("ptt")}
              >
                PTT(무전)
              </button>
              <button
                type="button"
                className={`${styles.modeTab} ${mode === "intercom" ? styles.modeTabActive : ""}`}
                onClick={() => setMode("intercom")}
              >
                인터컴
              </button>
            </div>
          </div>
          <Input.Search
            allowClear
            className={styles.searchInput}
            placeholder="발화 내용 검색"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </div>

        <div className={styles.layout}>
          <Card className={styles.channelCard} size="small" styles={{ body: { padding: "16px 20px 20px" } }}>
            <div className={styles.panelHeader}>
              <Typography.Text className={styles.panelTitle}>채널</Typography.Text>
              <Typography.Text className={styles.panelHint}>채팅방과 동일</Typography.Text>
            </div>
            {filteredChannels.map((channel) => (
              <button key={channel.id} type="button" className={styles.channelItem}>
                <div className={styles.channelIcon}>
                  <TeamOutlined />
                </div>
                <div className={styles.channelInfo}>
                  <Typography.Text className={styles.channelName}>{channel.name}</Typography.Text>
                  <Typography.Text className={styles.channelDesc}>{channel.description}</Typography.Text>
                </div>
                <Typography.Text className={styles.channelType}>
                  {mode === "ptt" ? "PTT" : "인터컴"}
                </Typography.Text>
              </button>
            ))}
          </Card>

          <Card className={styles.logCard} size="small" styles={{ body: { padding: "16px 20px 20px", height: "100%" } }}>
            <div className={styles.logHeader}>
              <Typography.Text className={styles.panelTitle}>전체 로그</Typography.Text>
              <span className={styles.liveBadge}>
                <span className={styles.liveDot} />
                LIVE
              </span>
            </div>
            <div className={styles.emptyWrap}>
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="발화 로그가 없어요." />
            </div>
          </Card>
        </div>
      </div>
    </Spin>
  );
}
