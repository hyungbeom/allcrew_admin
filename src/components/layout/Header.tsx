"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Avatar, Badge, Dropdown, Layout } from "antd";
import type { MenuProps } from "antd";
import { BellOutlined, LogoutOutlined, SettingOutlined, SkinOutlined } from "@ant-design/icons";
import NotificationDrawer from "./NotificationDrawer";
import styles from "./Header.module.css";

const { Header: AntHeader } = Layout;

const AVATAR_URL =
  "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png";

const userMenuItems: MenuProps["items"] = [
  {
    key: "settings",
    icon: <SettingOutlined />,
    label: "个人设置",
  },
  {
    key: "theme",
    icon: <SkinOutlined />,
    label: "主题设置",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "退出登录",
  },
];

export default function Header() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(25);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  return (
    <AntHeader className={styles.header}>
      <div className={styles.left}>
        <Link href="/dashboard" className={styles.logoLink}>
          <img src="/logo.svg" alt="ALLCREW" className={styles.logoImage} />
        </Link>
      </div>

      <div className={styles.right}>
        <span
          className={styles.bellTrigger}
          aria-label="알림"
          onClick={() => setNotificationOpen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setNotificationOpen(true);
            }
          }}
        >
          <Badge count={unreadCount} overflowCount={999} offset={[-4, 4]} className={styles.bellBadge}>
            <span className={styles.bellIconBox}>
              <BellOutlined className={styles.actionIcon} />
            </span>
          </Badge>
        </span>

        <NotificationDrawer
          open={notificationOpen}
          onClose={() => setNotificationOpen(false)}
          onUnreadCountChange={handleUnreadCountChange}
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={["click"]}>
          <div className={styles.userTrigger}>
            <Avatar size={24} src={AVATAR_URL} />
            <span className={styles.userName}>ProUser</span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
