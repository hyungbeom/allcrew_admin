"use client";

import {
  AppstoreOutlined,
  FolderOutlined,
  PlusOutlined,
  UnorderedListOutlined,
} from "@ant-design/icons";
import { App, Avatar, Button, Card, Empty, Input, Select, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { fetchChatRooms } from "@/lib/api/operations";
import { getChatTypeCounts, type ChatRoom, type ChatTypeFilter } from "./chatData";
import CreateChatDrawer from "./CreateChatDrawer";
import ChatConversationPanel from "./ChatConversationPanel";
import styles from "./ChatPage.module.css";

type ViewMode = "list" | "grid";

const typeFilters: { key: ChatTypeFilter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "project", label: "프로젝트" },
  { key: "direct", label: "1:1" },
];

export default function ChatPage() {
  const { message } = App.useApp();
  const { options: projectFilterOptions } = useProjectFilterOptions();
  const [projectFilter, setProjectFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<ChatTypeFilter>("all");
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [createChatOpen, setCreateChatOpen] = useState(false);

  const loadChatRooms = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchChatRooms();
      setChatRooms(items);
      setSelectedRoomId((prev) => prev ?? items[0]?.id ?? null);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "채팅 목록을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadChatRooms();
  }, [loadChatRooms]);

  const typeCounts = useMemo(() => getChatTypeCounts(chatRooms), [chatRooms]);

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
  }, [chatRooms, projectFilter, searchText, typeFilter]);

  const selectedRoom = useMemo(
    () => filteredRooms.find((room) => room.id === selectedRoomId) ?? null,
    [filteredRooms, selectedRoomId],
  );

  useEffect(() => {
    if (filteredRooms.length === 0) {
      setSelectedRoomId(null);
      return;
    }

    if (!filteredRooms.some((room) => room.id === selectedRoomId)) {
      setSelectedRoomId(filteredRooms[0].id);
    }
  }, [filteredRooms, selectedRoomId]);

  const handleChatStarted = useCallback(
    (room: ChatRoom) => {
      setChatRooms((prev) => {
        if (prev.some((item) => item.id === room.id)) {
          return prev;
        }
        return [room, ...prev];
      });
      setSelectedRoomId(room.id);
      setTypeFilter(room.type === "direct" ? "direct" : "project");
      if (projectFilter === "all" && room.projectId) {
        setProjectFilter(room.projectId);
      }
    },
    [projectFilter],
  );

  const renderTypeTabs = () => (
    <div className={styles.typeTabs}>
      {typeFilters.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`${styles.typeTab} ${typeFilter === item.key ? styles.typeTabActive : ""}`}
          onClick={() => setTypeFilter(item.key)}
        >
          {item.label} {typeCounts[item.key]}
        </button>
      ))}
    </div>
  );

  const renderRoomButton = (room: ChatRoom) => (
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
  );

  const handleRoomUpdated = useCallback((room: ChatRoom) => {
    setChatRooms((prev) => prev.map((item) => (item.id === room.id ? room : item)));
  }, []);

  const renderChatPanel = () => (
    <Card className={styles.chatCard} styles={{ body: { padding: 0, height: "100%" } }}>
      <ChatConversationPanel room={selectedRoom} onRoomUpdated={handleRoomUpdated} />
    </Card>
  );

  return (
    <div className={styles.page}>
      <div className={styles.pageTop}>
        <Typography.Text className={styles.subtitle}>
          프로젝트별 채팅방에서 크루와 직접 소통하세요.
        </Typography.Text>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateChatOpen(true)}>
            새 채팅방
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
          placeholder="채팅방·메시지 검색"
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

      {renderTypeTabs()}

      {viewMode === "list" ? (
        <div className={styles.layout}>
          <Card className={styles.listCard} styles={{ body: { padding: "12px 16px 16px", height: "100%" } }}>
            <div className={styles.listHeader}>
              <Typography.Text className={styles.listTitle}>채팅방</Typography.Text>
              <Typography.Text className={styles.listCount}>{filteredRooms.length}개</Typography.Text>
            </div>
            <div
              className={`${styles.roomList} ${filteredRooms.length === 0 ? styles.roomListEmpty : ""}`}
            >
              {filteredRooms.length > 0 ? (
                filteredRooms.map(renderRoomButton)
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="채팅방이 없습니다." />
              )}
            </div>
          </Card>
          {renderChatPanel()}
        </div>
      ) : (
        <div className={styles.gridLayout}>
          <div className={styles.grid}>
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => (
                <Card
                  key={room.id}
                  className={`${styles.gridCard} ${selectedRoomId === room.id ? styles.gridCardActive : ""}`}
                  size="small"
                  hoverable
                  onClick={() => setSelectedRoomId(room.id)}
                >
                  <div className={styles.gridCardHeader}>
                    <Avatar style={{ backgroundColor: room.avatarColor }}>{room.avatarText}</Avatar>
                    <div className={styles.roomInfo}>
                      <Typography.Text className={styles.roomTitle}>{room.title}</Typography.Text>
                      <Typography.Text className={styles.roomPreview}>{room.preview}</Typography.Text>
                    </div>
                    <Typography.Text className={styles.roomTime}>{room.time}</Typography.Text>
                  </div>
                </Card>
              ))
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="채팅방이 없습니다." />
            )}
          </div>
          {renderChatPanel()}
        </div>
      )}

      <CreateChatDrawer
        open={createChatOpen}
        onClose={() => setCreateChatOpen(false)}
        defaultProjectCode={projectFilter !== "all" ? projectFilter : undefined}
        onChatStarted={handleChatStarted}
      />
    </div>
  );
}
