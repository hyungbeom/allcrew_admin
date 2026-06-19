"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar, Badge, Button, Drawer, Flex, Space, Tag, Typography } from "antd";
import { BellOutlined, CheckOutlined } from "@ant-design/icons";
import { initialNotifications, type NotificationItem } from "./notifications";
import styles from "./NotificationDrawer.module.css";

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
  const totalCount = notifications.length;
  const displayList =
    unreadCount > 0 ? notifications.filter((item) => !item.read) : notifications;

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
        <Flex vertical gap={2}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            알림
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13, fontWeight: 400 }}>
            전체 {totalCount}건 · 안 읽음 {unreadCount}건
          </Typography.Text>
        </Flex>
      }
      extra={
        <Button type="primary" icon={<CheckOutlined />} onClick={handleMarkAllRead}>
          모두 읽음
        </Button>
      }
      placement="right"
      open={open}
      onClose={onClose}
      size={400}
      className={styles.drawer}
      destroyOnHidden={false}
      styles={{ body: { padding: 0 } }}
    >
      {unreadCount > 0 && (
        <div className={styles.sectionHeader}>안 읽음 {unreadCount}</div>
      )}

      <div className={styles.list}>
        {displayList.map((item) => (
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
            <Avatar size={36} icon={<BellOutlined />} className={styles.itemAvatar} />

            <div className={styles.itemBody}>
              <Flex align="center" justify="space-between" gap={8} className={styles.itemMeta}>
                <Space size={6} align="center">
                  <Tag className={styles.itemTag}>{item.tag}</Tag>
                  {!item.read && <Badge dot color="#1677ff" />}
                </Space>
                <Typography.Text type="secondary" className={styles.itemTime}>
                  {item.time}
                </Typography.Text>
              </Flex>

              <Typography.Text strong className={styles.itemTitle}>
                {item.title}
              </Typography.Text>
              <Typography.Text type="secondary" className={styles.itemDescription}>
                {item.description}
              </Typography.Text>
            </div>
          </div>
        ))}
      </div>
    </Drawer>
  );
}
