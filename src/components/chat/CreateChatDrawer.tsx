"use client";

import { FolderOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { App, Button, Checkbox, Drawer, Empty, Input, Select, Spin, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPhone, type CrewMember } from "@/components/crew-db/crewData";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { createDirectChat, createGroupChat, fetchCrewMembers } from "@/lib/api/operations";
import type { ChatRoom } from "./chatData";
import styles from "./CreateChatDrawer.module.css";

type ChatCreateTab = "direct" | "group";

type CreateChatDrawerProps = {
  open: boolean;
  onClose: () => void;
  defaultProjectCode?: string;
  onChatStarted?: (room: ChatRoom) => void;
};

export default function CreateChatDrawer({
  open,
  onClose,
  defaultProjectCode,
  onChatStarted,
}: CreateChatDrawerProps) {
  const { message } = App.useApp();
  const { options: projectOptions } = useProjectFilterOptions(false);
  const [activeTab, setActiveTab] = useState<ChatCreateTab>("direct");
  const [searchText, setSearchText] = useState("");
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startingCrewId, setStartingCrewId] = useState<string | null>(null);
  const [groupProjectCode, setGroupProjectCode] = useState<string | undefined>(defaultProjectCode);
  const [groupTitle, setGroupTitle] = useState("");
  const [selectedCrewIds, setSelectedCrewIds] = useState<string[]>([]);

  const loadCrewMembers = useCallback(async () => {
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
    if (open) {
      setActiveTab("direct");
      setSearchText("");
      setGroupProjectCode(defaultProjectCode);
      setGroupTitle("");
      setSelectedCrewIds([]);
      setStartingCrewId(null);
      setSubmitting(false);
      void loadCrewMembers();
    }
  }, [defaultProjectCode, loadCrewMembers, open]);

  const projectCodeForList =
    activeTab === "direct" ? defaultProjectCode : groupProjectCode;

  const filteredCrew = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return crewMembers.filter((crew) => {
      if (projectCodeForList && !crew.projectIds.includes(projectCodeForList)) {
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
  }, [crewMembers, projectCodeForList, searchText]);

  const handleClose = () => {
    onClose();
  };

  const handleSelectCrew = async (crew: CrewMember) => {
    if (startingCrewId) {
      return;
    }

    setStartingCrewId(crew.id);
    try {
      const response = await createDirectChat({
        crewId: crew.id,
        projectCode: defaultProjectCode,
      });

      message.success(response.message);
      onChatStarted?.(response.room);
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "1:1 채팅방을 시작하지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setStartingCrewId(null);
    }
  };

  const toggleCrewSelection = (crewId: string, checked: boolean) => {
    setSelectedCrewIds((prev) => {
      if (checked) {
        return prev.includes(crewId) ? prev : [...prev, crewId];
      }

      return prev.filter((id) => id !== crewId);
    });
  };

  const handleCreateGroupChat = async () => {
    if (!groupProjectCode) {
      message.warning("프로젝트를 선택해 주세요.");
      return;
    }

    if (selectedCrewIds.length === 0) {
      message.warning("최소 1명의 크루를 선택해 주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await createGroupChat({
        projectCode: groupProjectCode,
        title: groupTitle.trim() || undefined,
        crewIds: selectedCrewIds,
      });

      message.success(response.message);
      onChatStarted?.(response.room);
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "그룹 채팅방을 만들지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const subtitle =
    activeTab === "direct"
      ? "1:1 대화를 시작할 크루를 선택해 주세요."
      : "그룹 채팅에 참여할 크루를 선택해 주세요.";

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="right"
      size={720}
      destroyOnHidden
      className={styles.drawer}
      title={null}
      closable={false}
      styles={{ body: { padding: 0, overflow: "hidden" } }}
    >
      <div className={styles.drawerContainer}>
        <div className={styles.header}>
          <Typography.Title level={2} className={styles.title}>
            새 채팅방
          </Typography.Title>
          <Typography.Text className={styles.subtitle}>{subtitle}</Typography.Text>

          <div className={styles.tabMenu}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "direct" ? styles.tabButtonActive : ""}`}
              onClick={() => {
                setActiveTab("direct");
                setSearchText("");
              }}
            >
              1:1 채팅
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "group" ? styles.tabButtonActive : ""}`}
              onClick={() => {
                setActiveTab("group");
                setSearchText("");
                setSelectedCrewIds([]);
              }}
            >
              그룹 채팅
            </button>
          </div>
        </div>

        <div className={styles.body}>
          {activeTab === "group" && (
            <div className={styles.groupFields}>
              <div className={styles.fieldBlock}>
                <Typography.Text className={styles.fieldLabel}>프로젝트</Typography.Text>
                <Select
                  className={styles.projectSelect}
                  placeholder="프로젝트 선택"
                  value={groupProjectCode}
                  options={projectOptions}
                  prefix={<FolderOutlined style={{ color: "rgba(0, 0, 0, 0.45)" }} />}
                  onChange={(value) => {
                    setGroupProjectCode(value);
                    setSelectedCrewIds([]);
                  }}
                />
              </div>
              <div className={styles.fieldBlock}>
                <Typography.Text className={styles.fieldLabel}>채팅방 이름 (선택)</Typography.Text>
                <Input
                  placeholder="비워두면 프로젝트명 전체로 생성됩니다"
                  value={groupTitle}
                  onChange={(event) => setGroupTitle(event.target.value)}
                />
              </div>
            </div>
          )}

          <div className={styles.searchWrap}>
            <Input.Search
              allowClear
              placeholder="이름, 연락처로 검색"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </div>

          {loading ? (
            <div className={styles.loadingWrap}>
              <Spin />
            </div>
          ) : filteredCrew.length > 0 ? (
            <div className={styles.crewList}>
              {filteredCrew.map((crew) =>
                activeTab === "direct" ? (
                  <button
                    key={crew.id}
                    type="button"
                    className={styles.crewItem}
                    disabled={startingCrewId !== null}
                    onClick={() => void handleSelectCrew(crew)}
                  >
                    <div className={styles.crewItemMain}>
                      <Typography.Text className={styles.crewName}>{crew.name}</Typography.Text>
                      <Typography.Text className={styles.crewMeta}>
                        {crew.role} · {formatPhone(crew.phone)}
                      </Typography.Text>
                    </div>
                    <span className={styles.crewAction}>
                      {startingCrewId === crew.id ? "연결 중..." : "1:1 시작"}
                      <RightOutlined />
                    </span>
                  </button>
                ) : (
                  <label key={crew.id} className={styles.crewCheckItem}>
                    <Checkbox
                      checked={selectedCrewIds.includes(crew.id)}
                      onChange={(event) => toggleCrewSelection(crew.id, event.target.checked)}
                    />
                    <div className={styles.crewItemMain}>
                      <Typography.Text className={styles.crewName}>{crew.name}</Typography.Text>
                      <Typography.Text className={styles.crewMeta}>
                        {crew.role} · {formatPhone(crew.phone)}
                      </Typography.Text>
                    </div>
                  </label>
                ),
              )}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                activeTab === "group" && !groupProjectCode
                  ? "프로젝트를 먼저 선택해 주세요."
                  : "선택 가능한 크루가 없습니다."
              }
            />
          )}
        </div>

        <div className={styles.footer}>
          <Button icon={<LeftOutlined />} onClick={handleClose}>
            취소
          </Button>
          {activeTab === "group" && (
            <Button type="primary" loading={submitting} onClick={() => void handleCreateGroupChat()}>
              그룹 채팅방 만들기
            </Button>
          )}
        </div>
      </div>
    </Drawer>
  );
}
