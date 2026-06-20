"use client";

import { PlusOutlined, SmileOutlined } from "@ant-design/icons";
import { App, Avatar, Button, Empty, Input, Spin, Typography } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { fetchChatMessages, sendChatMessage } from "@/lib/api/operations";
import type { ChatMessage, ChatRoom } from "./chatData";
import { buildMessageDisplayMeta } from "./chatMessageLayout";
import styles from "./ChatConversationPanel.module.css";

type ChatConversationPanelProps = {
  room: ChatRoom | null;
  onRoomUpdated?: (room: ChatRoom) => void;
};

export default function ChatConversationPanel({ room, onRoomUpdated }: ChatConversationPanelProps) {
  const { message } = App.useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const messageListRef = useRef<HTMLDivElement>(null);

  const displayMeta = useMemo(() => buildMessageDisplayMeta(messages), [messages]);

  const scrollToBottom = useCallback(() => {
    const container = messageListRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  const loadMessages = useCallback(async () => {
    if (!room) {
      setMessages([]);
      return;
    }

    setLoading(true);
    try {
      const items = await fetchChatMessages(room.id);
      setMessages(items);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "메시지를 불러오지 못했습니다.";
      message.error(errorMessage);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [message, room]);

  useEffect(() => {
    setDraft("");
    void loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [loading, messages, scrollToBottom]);

  const handleSend = async () => {
    if (!room) return;

    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    try {
      const response = await sendChatMessage(room.id, content);
      setMessages((prev) => [...prev, response.message]);
      setDraft("");
      onRoomUpdated?.(response.room);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "메시지 전송에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  if (!room) {
    return (
      <div className={styles.emptyState}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="채팅방을 선택해 주세요" />
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <Avatar style={{ backgroundColor: room.avatarColor }}>{room.avatarText}</Avatar>
        <Typography.Text className={styles.headerTitle}>{room.title}</Typography.Text>
      </div>

      <div ref={messageListRef} className={styles.messageList}>
        {loading ? (
          <div className={styles.loadingState}>
            <Spin />
          </div>
        ) : messages.length > 0 ? (
          messages.map((item, index) => {
            const meta = displayMeta[index];
            const rowSpacingClass =
              meta.groupPosition === "middle" || meta.groupPosition === "last"
                ? styles.messageRowGrouped
                : "";

            return (
              <div key={item.id}>
                {meta.showDateDivider ? (
                  <div className={styles.dateDivider}>
                    <span>{meta.dateDividerLabel}</span>
                  </div>
                ) : null}

                <div
                  className={`${styles.messageRow} ${item.isMine ? styles.messageRowMine : styles.messageRowOther} ${rowSpacingClass}`}
                >
                  {!item.isMine ? (
                    meta.showAvatar ? (
                      <Avatar size={40} className={styles.messageAvatar}>
                        {item.senderName.charAt(0)}
                      </Avatar>
                    ) : (
                      <div className={styles.avatarSpacer} />
                    )
                  ) : null}

                  <div
                    className={`${styles.messageContent} ${item.isMine ? styles.messageContentMine : styles.messageContentOther}`}
                  >
                    {!item.isMine && meta.showSenderName ? (
                      <Typography.Text className={styles.messageSender}>{item.senderName}</Typography.Text>
                    ) : null}

                    <div
                      className={`${styles.messageBody} ${item.isMine ? styles.messageBodyMine : styles.messageBodyOther}`}
                    >
                      {item.isMine && meta.showTimestamp ? (
                        <Typography.Text className={styles.messageTime}>{item.sentAt}</Typography.Text>
                      ) : null}

                      <div
                        className={`${styles.bubble} ${item.isMine ? styles.bubbleMine : styles.bubbleOther}`}
                      >
                        <Typography.Text className={styles.bubbleText}>{item.content}</Typography.Text>
                      </div>

                      {!item.isMine && meta.showTimestamp ? (
                        <Typography.Text className={styles.messageTime}>{item.sentAt}</Typography.Text>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className={styles.emptyMessages}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="대화를 시작해 보세요." />
          </div>
        )}
      </div>

      <div className={styles.composer}>
        <Button type="text" className={styles.composerIconButton} icon={<PlusOutlined />} aria-label="첨부" />
        <div className={styles.composerInputWrap}>
          <Input.TextArea
            value={draft}
            autoSize={{ minRows: 1, maxRows: 4 }}
            placeholder="메시지를 입력하세요"
            disabled={sending}
            variant="borderless"
            className={styles.composerInput}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Button type="text" className={styles.composerIconButton} icon={<SmileOutlined />} aria-label="이모티콘" />
        </div>
        <Button
          type="text"
          className={`${styles.sendButton} ${draft.trim() ? styles.sendButtonActive : ""}`}
          loading={sending}
          disabled={!draft.trim()}
          onClick={() => void handleSend()}
        >
          전송
        </Button>
      </div>
    </div>
  );
}
