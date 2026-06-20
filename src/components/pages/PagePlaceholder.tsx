"use client";

import { Typography } from "antd";

type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export default function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <Typography.Text type="secondary">{description ?? `${title} 페이지입니다.`}</Typography.Text>
  );
}
