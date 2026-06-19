"use client";

import { Layout } from "antd";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import ContentBreadcrumb from "@/components/layout/ContentBreadcrumb";
import { LayoutProvider, useLayout } from "@/components/layout/LayoutContext";
import { HEADER_HEIGHT, SIDER_COLLAPSED_WIDTH, SIDER_WIDTH } from "@/config/layout";
import styles from "./DashboardLayout.module.css";

const { Content } = Layout;

function DashboardLayoutInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useLayout();

  return (
    <Layout className={styles.root}>
      <Header />
      <Layout className={styles.body} style={{ paddingTop: HEADER_HEIGHT }}>
        <Sidebar />
        <Layout
          className={styles.main}
          style={{ marginLeft: collapsed ? SIDER_COLLAPSED_WIDTH : SIDER_WIDTH }}
        >
          <Content className={styles.content}>
            <ContentBreadcrumb />
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </LayoutProvider>
  );
}
