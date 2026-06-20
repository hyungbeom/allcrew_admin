"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Drawer, Tag, Typography } from "antd";
import {
  getNotificationTimeDisplay,
  initialNotifications,
  type NotificationItem,
} from "./notifications";
import styles from "./NotificationDrawer.module.css";

function getRelativeTagColor(daysAgo: number) {
  if (daysAgo === 1) {
    return "processing";
  }
  if (daysAgo <= 3) {
    return "blue";
  }
  return "default";
}

function NotificationTime({ createdAt }: { createdAt: string }) {
  const display = getNotificationTimeDisplay(createdAt);

  if (display.kind === "relative") {
    return (
      <Tag
        variant="filled"
        color={getRelativeTagColor(display.daysAgo)}
        className={styles.relativeTag}
      >
        {display.label}
      </Tag>
    );
  }

  return <Typography.Text className={styles.itemTime}>{display.label}</Typography.Text>;
}

type NotificationDrawerProps = {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
};

export default function NotificationDrawer({
  open,
  onClose,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((item) => !item.read).length;

  useEffect(() => {
    onUnreadCountChange?.(unreadCount);
  }, [unreadCount, onUnreadCountChange]);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
  }, []);

  const handleItemClick = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
    );
  }, []);

  return (
    <Drawer
      title={
        <div className={styles.header}>
          <Typography.Title level={4} className={styles.headerTitle}>
            알림
          </Typography.Title>
          <Typography.Paragraph className={styles.headerDesc}>
            시스템 알림과 데이터 변경 내역을 확인할 수 있습니다.
          </Typography.Paragraph>
        </div>
      }
      extra={
        <Button className={styles.markAllButton} onClick={handleMarkAllRead}>
          모두 읽음
        </Button>
      }
      placement="right"
      open={open}
      onClose={onClose}
      closable={false}
      size={420}
      className={styles.drawer}
      destroyOnHidden={false}
      styles={{ body: { padding: 0 } }}
    >
      <div className={styles.list}>
        {notifications.map((item) => (
          <div
            key={item.id}
            className={`${styles.item} ${!item.read ? styles.itemUnread : ""}`}
            onClick={() => handleItemClick(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                handleItemClick(item.id);
              }
            }}
          >
            <div className={styles.itemHead}>
              <Typography.Text className={styles.itemTitle}>{item.title}</Typography.Text>
              <NotificationTime createdAt={item.createdAt} />
            </div>
            <Typography.Paragraph className={styles.itemDescription}>
              {item.description}
            </Typography.Paragraph>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
