"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Breadcrumb } from "antd";
import { getBreadcrumb } from "@/config/navigation";

export default function ContentBreadcrumb() {
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumb(pathname);

  return (
    <Breadcrumb
      style={{ marginBottom: 16 }}
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
  );
}
