"use client";

import { FolderOutlined, PlusOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Empty, Input, Select, Typography } from "antd";
import { useMemo, useState } from "react";
import { projectFilterOptions } from "@/components/crew-db/crewData";
import { chatRooms, getChatTypeCounts, type ChatRoom, type ChatTypeFilter } from "./chatData";
import styles from "./ChatPage.module.css";

const typeFilters: { key: ChatTypeFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "project", label: "프로젝트" },
  { key: "direct", label: "1:1" },
];

export default function ChatPage() {
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<ChatTypeFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const typeCounts = useMemo(() => getChatTypeCounts(chatRooms), []);

  const filteredRooms = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return chatRooms.filter((room) => {
      if (projectFilter !== "all" && room.projectId !== projectFilter) return false;
      if (typeFilter !== "all" && room.type !== typeFilter) return false;
      if (!keyword) return true;

      return (
        room.title.toLowerCase().includes(keyword) ||
        room.preview.toLowerCase().includes(keyword)
      );
    });
  }, [projectFilter, searchText, typeFilter]);

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          프로젝트별 채팅방에서 크루와 직접 소통하세요.
        </Typography.Text>
        <Button type="primary" icon={<PlusOutlined />}>
          새 채팅방
        </Button>
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
          {typeFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`${styles.statusTab} ${typeFilter === item.key ? styles.statusTabActive : ""}`}
              onClick={() => setTypeFilter(item.key)}
            >
              {item.label} {typeCounts[item.key]}
            </button>
          ))}
        </div>
        <Input.Search
          allowClear
          className={styles.searchInput}
          placeholder="채팅방·메시지 검색"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>

      <div className={styles.layout}>
        <Card className={styles.listCard} styles={{ body: { padding: "12px 16px 16px", height: "100%" } }}>
          <div className={styles.listHeader}>
            <Typography.Text className={styles.listTitle}>채팅방</Typography.Text>
            <Typography.Text className={styles.listCount}>{filteredRooms.length}개</Typography.Text>
          </div>
          <div className={styles.roomList}>
            {filteredRooms.map((room: ChatRoom) => (
              <button
                key={room.id}
                type="button"
                className={`${styles.roomItem} ${selectedRoomId === room.id ? styles.roomItemActive : ""}`}
                onClick={() => setSelectedRoomId(room.id)}
              >
                <Avatar style={{ backgroundColor: room.avatarColor }}>{room.avatarText}</Avatar>
                <div className={styles.roomInfo}>
                  <Typography.Text className={styles.roomTitle}>{room.title}</Typography.Text>
                  <Typography.Text className={styles.roomPreview}>{room.preview}</Typography.Text>
                </div>
                <Typography.Text className={styles.roomTime}>{room.time}</Typography.Text>
              </button>
            ))}
          </div>
        </Card>

        <Card className={styles.chatCard} styles={{ body: { padding: 0, height: "100%" } }}>
          <div className={styles.emptyChat}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="채팅방을 선택해 주세요"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
