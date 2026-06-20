"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Avatar, Badge, Dropdown, Layout } from "antd";
import type { MenuProps } from "antd";
import { BellOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { getStoredMember, logout } from "@/lib/api/auth";
import { companyPath } from "@/lib/companyPaths";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import NotificationDrawer from "./NotificationDrawer";
import styles from "./Header.module.css";

const { Header: AntHeader } = Layout;

const AVATAR_URL =
  "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png";

const userMenuItems: MenuProps["items"] = [
  {
    key: "mypage",
    icon: <UserOutlined />,
    label: "마이페이지",
  },
  {
    type: "divider",
  },
  {
    key: "logout",
    icon: <LogoutOutlined />,
    label: "로그아웃",
  },
];

export default function Header() {
  const router = useRouter();
  const companySlug = useCompanySlug();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(25);
  const [userName, setUserName] = useState("사용자");

  useEffect(() => {
    const member = getStoredMember();
    if (member?.name) {
      setUserName(member.name);
    }
  }, []);

  const handleUnreadCountChange = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  const handleUserMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "mypage") {
      router.push(companyPath(companySlug, "mypage"));
      return;
    }

    if (key === "logout") {
      logout();
      router.push("/login");
    }
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.left}>
        <Link href={companyPath(companySlug, "dashboard")} className={styles.logoLink}>
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

        <Dropdown
          menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <div className={styles.userTrigger}>
            <Avatar size={24} src={AVATAR_URL} />
            <span className={styles.userName}>{userName}</span>
          </div>
        </Dropdown>
      </div>
    </AntHeader>
  );
}
