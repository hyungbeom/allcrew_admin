"use client";

import { DownloadOutlined, FolderOutlined, TeamOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Input, Select, Typography } from "antd";
import { useState } from "react";
import styles from "./PttPage.module.css";

const projectOptions = [{ value: "PRJ-0012", label: "asd" }];

type PttMode = "ptt" | "intercom";

export default function PttPage() {
  const [mode, setMode] = useState<PttMode>("ptt");
  const [searchText, setSearchText] = useState("");

  return (
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
            defaultValue="PRJ-0012"
            options={projectOptions}
            prefix={<FolderOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
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
          <button type="button" className={styles.channelItem}>
            <div className={styles.channelIcon}>
              <TeamOutlined />
            </div>
            <div className={styles.channelInfo}>
              <Typography.Text className={styles.channelName}>전체</Typography.Text>
              <Typography.Text className={styles.channelDesc}>전체 크루</Typography.Text>
            </div>
            <Typography.Text className={styles.channelType}>PTT</Typography.Text>
          </button>
        </Card>

        <Card className={styles.logCard} size="small" styles={{ body: { padding: "16px 20px 20px", height: "100%" } }}>
          <div className={styles.logHeader}>
            <Typography.Text className={styles.panelTitle}>전체 로그</Typography.Text>
            <span className={styles.liveBadge}>
              <span className={styles.liveDot} />
              실시간
            </span>
          </div>
          <div className={styles.emptyLog}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="아직 발화 기록이 없어요." />
          </div>
        </Card>
      </div>
    </div>
  );
}
