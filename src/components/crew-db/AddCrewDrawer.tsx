"use client";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { App, Button, Drawer, Form, Input, Select, Typography } from "antd";
import { useEffect, useState } from "react";
import { useProjectFilterOptions } from "@/hooks/useProjectFilterOptions";
import { ApiError } from "@/lib/api/client";
import { createCrewMember } from "@/lib/api/operations";
import styles from "./AddCrewDrawer.module.css";

export type AddCrewFormValues = {
  name: string;
  phone: string;
  role: string;
  projectIds: string[];
};

const ROLE_OPTIONS = [
  { value: "크루", label: "크루" },
  { value: "리더", label: "리더" },
  { value: "매니저", label: "매니저" },
  { value: "스태프", label: "스태프" },
];

function getDefaultValues(): AddCrewFormValues {
  return {
    name: "",
    phone: "",
    role: "크루",
    projectIds: [],
  };
}

type AddCrewDrawerProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddCrewDrawer({ open, onClose, onCreated }: AddCrewDrawerProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<AddCrewFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const { options: projectOptions, loading: projectOptionsLoading } = useProjectFilterOptions(false);

  const resetDrawer = () => {
    form.setFieldsValue(getDefaultValues());
  };

  const handleClose = () => {
    onClose();
    resetDrawer();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      await createCrewMember({
        name: values.name.trim(),
        phone: values.phone.trim(),
        role: values.role,
        projectIds: values.projectIds ?? [],
      });

      message.success("크루가 추가되었습니다.");
      onCreated?.();
      handleClose();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message);
        return;
      }
      if (error && typeof error === "object" && "errorFields" in error) {
        message.warning("필수 항목을 입력해 주세요.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (open) {
      form.setFieldsValue(getDefaultValues());
    }
  }, [form, open]);

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      placement="right"
      size={720}
      destroyOnHidden
      className={styles.drawer}
      title={null}
      closable={false}
      styles={{ body: { padding: 0, overflow: "hidden" } }}
    >
      <div className={styles.drawerContainer}>
        <div className={styles.header}>
          <Typography.Title level={2} className={styles.title}>
            크루 추가하기
          </Typography.Title>
          <Typography.Text className={styles.subtitle}>
            크루 DB에 등록할 기본 정보를 입력해 주세요.
          </Typography.Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={getDefaultValues()}
          className={styles.body}
        >
          <div className={styles.formSection}>
            <Form.Item
              label={
                <span className={styles.fieldLabel}>
                  이름 <span className={styles.required}>*</span>
                </span>
              }
              name="name"
              rules={[{ required: true, message: "이름을 입력해 주세요." }]}
            >
              <Input size="large" placeholder="크루 이름" allowClear />
            </Form.Item>

            <Form.Item
              label={
                <span className={styles.fieldLabel}>
                  연락처 <span className={styles.required}>*</span>
                </span>
              }
              name="phone"
              rules={[
                { required: true, message: "연락처를 입력해 주세요." },
                {
                  pattern: /^01[0-9]-?\d{3,4}-?\d{4}$/,
                  message: "올바른 휴대폰 번호 형식이 아닙니다.",
                },
              ]}
            >
              <Input size="large" placeholder="010-0000-0000" allowClear />
            </Form.Item>

            <Form.Item
              label={
                <span className={styles.fieldLabel}>
                  주 직무 <span className={styles.required}>*</span>
                </span>
              }
              name="role"
              rules={[{ required: true, message: "주 직무를 선택해 주세요." }]}
            >
              <Select size="large" options={ROLE_OPTIONS} placeholder="주 직무 선택" />
            </Form.Item>

            <Form.Item
              label={<span className={styles.fieldLabel}>참여 프로젝트 (선택)</span>}
              name="projectIds"
            >
              <Select
                mode="multiple"
                size="large"
                allowClear
                loading={projectOptionsLoading}
                options={projectOptions}
                placeholder="참여한 프로젝트를 선택해 주세요"
                maxTagCount="responsive"
              />
            </Form.Item>
          </div>
        </Form>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            <Button icon={<LeftOutlined />} onClick={handleClose}>
              취소
            </Button>
            <Button type="primary" loading={submitting} onClick={handleSubmit}>
              크루 추가하기 <RightOutlined />
            </Button>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
