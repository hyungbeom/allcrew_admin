"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb, Typography } from "antd";
import { getBreadcrumb, getPageTitle } from "@/config/navigation";
import { parseAppPathname } from "@/lib/companyPaths";
import styles from "./ContentBreadcrumb.module.css";

export default function ContentBreadcrumb() {
  const pathname = usePathname();
  const { routePath } = parseAppPathname(pathname);
  const isDashboard = routePath === "/dashboard";
  const breadcrumbItems = getBreadcrumb(pathname);
  const pageTitle = getPageTitle(pathname);

  return (
    <div className={`${styles.pageHeader} ${isDashboard ? styles.pageHeaderDashboard : ""}`}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          return {
            title: item.href && !isLast ? (
              <Link href={item.href} style={{ color: "rgba(0,0,0,0.45)" }}>
                {item.label}
              </Link>
            ) : (
              item.label
            ),
          };
        })}
      />
      {!isDashboard && (
        <Typography.Title level={2} className={styles.pageTitle}>
          {pageTitle}
        </Typography.Title>
      )}
    </div>
  );
}
