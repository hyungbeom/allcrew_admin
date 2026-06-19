"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Badge, Layout, Menu } from "antd";
import type { MenuProps } from "antd";
import {
  AccountBookOutlined,
  BuildOutlined,
  DashboardOutlined,
  LeftOutlined,
  RightOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { getGroupKeyByPath, navGroups } from "@/config/navigation";
import { HEADER_HEIGHT, SIDER_COLLAPSED_WIDTH, SIDER_WIDTH } from "@/config/layout";
import { useLayout } from "@/components/layout/LayoutContext";
import styles from "./Sidebar.module.css";

const { Sider } = Layout;

const groupIcons: Record<string, React.ReactNode> = {
  operation: <DashboardOutlined />,
  field: <BuildOutlined />,
  report: <AccountBookOutlined />,
  system: <SettingOutlined />,
};

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { collapsed, toggleCollapsed } = useLayout();
  const [openKeys, setOpenKeys] = useState<string[]>(["operation"]);

  const menuItems: MenuProps["items"] = useMemo(
    () =>
      navGroups.map((group) => ({
        key: group.key,
        icon: groupIcons[group.key],
        label: group.label,
        children: group.children.map((child) => ({
          key: child.path,
          label: child.badge ? (
            <span className={styles.menuItemWithBadge}>
              {child.label}
              <Badge count={child.badge} size="small" />
            </span>
          ) : (
            child.label
          ),
        })),
      })),
    [],
  );

  useEffect(() => {
    const groupKey = getGroupKeyByPath(pathname);
    if (collapsed) {
      setOpenKeys([]);
      return;
    }
    if (groupKey) {
      setOpenKeys((prev) => (prev.includes(groupKey) ? prev : [...prev, groupKey]));
    }
  }, [pathname, collapsed]);

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (key.startsWith("/")) {
      router.push(key);
    }
  };

  const siderWidth = collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH;

  return (
    <>
      <Sider
        width={SIDER_WIDTH}
        collapsedWidth={SIDER_COLLAPSED_WIDTH}
        collapsible
        collapsed={collapsed}
        trigger={null}
        theme="light"
        className={styles.sider}
      >
        <div className={styles.inner}>
          <Menu
            mode="inline"
            items={menuItems}
            selectedKeys={[pathname]}
            openKeys={openKeys}
            onOpenChange={setOpenKeys}
            onClick={handleMenuClick}
            inlineCollapsed={collapsed}
            inlineIndent={16}
            className={styles.menu}
          />
        </div>
      </Sider>

      <button
        type="button"
        className={styles.collapseTrigger}
        style={{ left: siderWidth, top: HEADER_HEIGHT + 16 }}
        onClick={toggleCollapsed}
        aria-label={collapsed ? "메뉴 펼치기" : "메뉴 접기"}
      >
        {collapsed ? <RightOutlined /> : <LeftOutlined />}
      </button>
    </>
  );
}
