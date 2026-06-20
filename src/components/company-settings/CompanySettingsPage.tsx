"use client";

import { App, Button, Card, Form, Input, Spin, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import {
  fetchAgencySettings,
  updateAgencySettings,
  type AgencySettingsApiResponse,
} from "@/lib/api/operations";
import styles from "./CompanySettingsPage.module.css";

type SettingsFormValues = {
  companyName: string;
  businessNumber: string;
  companySlug: string;
  address?: string;
  addressDetail?: string;
};

export default function CompanySettingsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<SettingsFormValues>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<AgencySettingsApiResponse | null>(null);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAgencySettings();
      setSettings(data);
      form.setFieldsValue({
        companyName: data.companyName,
        businessNumber: data.businessNumber,
        companySlug: data.companySlug,
        address: data.address ?? undefined,
        addressDetail: data.addressDetail ?? undefined,
      });
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "기업 설정을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [form, message]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSave = async (values: SettingsFormValues) => {
    setSaving(true);
    try {
      const updated = await updateAgencySettings({
        companyName: values.companyName,
        address: values.address,
        addressDetail: values.addressDetail,
      });
      setSettings(updated);
      message.success("기업 설정이 저장되었습니다.");
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "기업 설정 저장에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Typography.Text className={styles.subtitle}>
        업체 기본 정보를 관리합니다. 영문 URL({settings?.companySlug})은 변경할 수 없습니다.
      </Typography.Text>

      <Card className={styles.formCard}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="회사명"
            name="companyName"
            rules={[{ required: true, message: "회사명을 입력해 주세요." }]}
          >
            <Input placeholder="회사명" />
          </Form.Item>

          <Form.Item label="사업자등록번호" name="businessNumber">
            <Input disabled />
          </Form.Item>

          <Form.Item label="영문 URL" name="companySlug">
            <Input disabled addonBefore="/" />
          </Form.Item>

          <Form.Item label="주소" name="address">
            <Input placeholder="주소" />
          </Form.Item>

          <Form.Item label="상세 주소" name="addressDetail">
            <Input placeholder="상세 주소" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={saving}>
            저장
          </Button>
        </Form>
      </Card>
    </div>
  );
}
