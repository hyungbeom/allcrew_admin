"use client";

import { Typography } from "antd";

type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div>
      <Typography.Title level={3} style={{ marginBottom: 8 }}>
        {title}
      </Typography.Title>
      <Typography.Text type="secondary">{description ?? `${title} 페이지입니다.`}</Typography.Text>
    </div>
  );
}
