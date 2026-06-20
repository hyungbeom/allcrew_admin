"use client";

import {
  BellOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  LinkOutlined,
  SafetyOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  App,
  Avatar,
  Button,
  Col,
  Empty,
  Form,
  Input,
  Menu,
  Row,
  Space,
  Switch,
  Table,
  Typography,
  Upload,
} from "antd";
import type { MenuProps, UploadProps } from "antd";
import { useMemo, useState } from "react";
import { openDaumPostcode } from "@/lib/daumPostcode";
import styles from "./MyPage.module.css";

const AVATAR_URL =
  "https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png";
const MAX_LOGO_SIZE_MB = 2;

type MenuKey = "basic" | "security" | "binding" | "notifications" | "billing";

const notificationSettings = [
  {
    key: "safenet",
    title: "세이프넷 레드알림",
    description: "현장 이탈, SOS 등 긴급 상황 발생 시 즉시 알림을 받습니다.",
    defaultChecked: true,
  },
  {
    key: "attendance",
    title: "크루 출근 알림",
    description: "프로젝트별 크루 출근·지각·미출근 현황을 알려드립니다.",
    defaultChecked: true,
  },
  {
    key: "settlement",
    title: "정산 완료 알림",
    description: "정산 처리 완료 및 지급 예정일을 알려드립니다.",
    defaultChecked: false,
  },
  {
    key: "project",
    title: "프로젝트 마감 알림",
    description: "모집 마감, 일정 변경 등 프로젝트 관련 알림을 받습니다.",
    defaultChecked: true,
  },
];

const menuLabels: Record<MenuKey, string> = {
  basic: "기본 설정",
  security: "보안 설정",
  binding: "계정 연동",
  notifications: "새 메시지 알림",
  billing: "요금제 · 결제",
};

function BasicSettingsSection() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(AVATAR_URL);

  const uploadProps: UploadProps = {
    accept: ".png,.svg,.jpg,.jpeg",
    maxCount: 1,
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = ["image/png", "image/svg+xml", "image/jpeg", "image/jpg"].includes(file.type);
      const isLt2M = file.size / 1024 / 1024 < MAX_LOGO_SIZE_MB;

      if (!isImage) {
        message.error("PNG, SVG, JPG 형식만 업로드할 수 있습니다.");
        return Upload.LIST_IGNORE;
      }

      if (!isLt2M) {
        message.error(`이미지는 ${MAX_LOGO_SIZE_MB}MB 이하만 업로드할 수 있습니다.`);
        return Upload.LIST_IGNORE;
      }

      setAvatarUrl(URL.createObjectURL(file));
      return false;
    },
  };

  const handleAddressSearch = () => {
    openDaumPostcode((address) => {
      form.setFieldValue("address", address);
    });
  };

  return (
    <>
      <Typography.Title level={3} className={styles.contentTitle}>
        기본 설정
      </Typography.Title>

      <Row gutter={[48, 24]}>
        <Col xs={24} lg={14} xl={13}>
          <Form
            form={form}
            layout="vertical"
            className={styles.settingsForm}
            initialValues={{
              email: "admin@allcrew.com",
              managerName: "김대표",
              companyIntro: "",
              companyName: "올크루 주식회사",
              businessNumber: "4079903458",
              address: "경기 고양시 덕양구 청초로 10",
              addressDetail: "1513호",
              phonePrefix: "010",
              phone: "06311031",
            }}
            onFinish={() => message.success("기본 정보가 저장되었습니다.")}
          >
            <Form.Item
              label="이메일"
              name="email"
              rules={[
                { required: true, message: "이메일을 입력해 주세요." },
                { type: "email", message: "올바른 이메일 형식이 아닙니다." },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item label="담당자명" name="managerName" rules={[{ required: true }]}>
              <Input allowClear />
            </Form.Item>
            <Form.Item label="회사 소개" name="companyIntro">
              <Input.TextArea rows={4} placeholder="회사 소개" />
            </Form.Item>
            <Form.Item label="회사명" name="companyName" rules={[{ required: true }]}>
              <Input allowClear />
            </Form.Item>
            <Form.Item label="사업자등록번호" name="businessNumber" rules={[{ required: true }]}>
              <Input allowClear />
            </Form.Item>
            <Form.Item label="주소">
              <Space.Compact className={styles.addressCompact}>
                <Form.Item name="address" noStyle>
                  <Input
                    readOnly
                    placeholder="주소 검색"
                    prefix={<EnvironmentOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                  />
                </Form.Item>
                <Button onClick={handleAddressSearch}>주소 검색</Button>
              </Space.Compact>
            </Form.Item>
            <Form.Item label="상세 주소" name="addressDetail">
              <Input allowClear placeholder="상세 주소" />
            </Form.Item>
            <Form.Item label="연락처">
              <Space.Compact className={styles.phoneCompact}>
                <Form.Item name="phonePrefix" noStyle>
                  <Input style={{ width: 88 }} allowClear />
                </Form.Item>
                <Form.Item name="phone" noStyle rules={[{ required: true }]}>
                  <Input allowClear placeholder="전화번호" />
                </Form.Item>
              </Space.Compact>
            </Form.Item>
            <Form.Item className={styles.submitItem}>
              <Button type="primary" htmlType="submit">
                기본 정보 업데이트
              </Button>
            </Form.Item>
          </Form>
        </Col>

        <Col xs={24} lg={10} xl={8}>
          <div className={styles.avatarSection}>
            <Typography.Text className={styles.avatarLabel}>아바타</Typography.Text>
            <Avatar size={104} src={avatarUrl} className={styles.avatar} />
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>아바타 변경</Button>
            </Upload>
          </div>
        </Col>
      </Row>
    </>
  );
}

function SecuritySettingsSection() {
  const { message } = App.useApp();
  const [form] = Form.useForm();

  return (
    <>
      <Typography.Title level={3} className={styles.contentTitle}>
        보안 설정
      </Typography.Title>

      <Form
        form={form}
        layout="vertical"
        className={styles.settingsForm}
        onFinish={() => message.success("비밀번호가 변경되었습니다.")}
      >
        <Form.Item
          label="현재 비밀번호"
          name="currentPassword"
          rules={[{ required: true, message: "현재 비밀번호를 입력해 주세요." }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="새 비밀번호"
          name="newPassword"
          rules={[{ required: true, message: "새 비밀번호를 입력해 주세요." }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="새 비밀번호 확인"
          name="confirmPassword"
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "새 비밀번호 확인을 입력해 주세요." },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("비밀번호가 일치하지 않습니다."));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item className={styles.submitItem}>
          <Button type="primary" htmlType="submit">
            비밀번호 변경
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}

function BindingSection() {
  return (
    <>
      <div className={styles.sectionHeader}>
        <Typography.Title level={3} className={styles.contentTitle}>
          계정 연동
        </Typography.Title>
        <Button type="primary" icon={<UserAddOutlined />}>
          팀원 초대
        </Button>
      </div>

      <Table
        className={styles.teamTable}
        size="middle"
        columns={[
          { title: "팀원", dataIndex: "member", key: "member" },
          { title: "역할", dataIndex: "role", key: "role" },
          { title: "상태", dataIndex: "status", key: "status" },
        ]}
        dataSource={[]}
        pagination={false}
        locale={{
          emptyText: (
            <div className={styles.emptyWrap}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="아직 연동된 팀원이 없어요. '팀원 초대'로 초대 코드를 발급하세요."
              />
            </div>
          ),
        }}
      />
    </>
  );
}

function NotificationsSection() {
  return (
    <>
      <Typography.Title level={3} className={styles.contentTitle}>
        새 메시지 알림
      </Typography.Title>

      <div className={styles.notificationList}>
        {notificationSettings.map((item) => (
          <div key={item.key} className={styles.notificationItem}>
            <div>
              <Typography.Text className={styles.notificationTitle}>{item.title}</Typography.Text>
              <Typography.Text className={styles.notificationDesc}>{item.description}</Typography.Text>
            </div>
            <Switch defaultChecked={item.defaultChecked} />
          </div>
        ))}
      </div>
    </>
  );
}

function BillingSection() {
  return (
    <>
      <Typography.Title level={3} className={styles.contentTitle}>
        요금제 · 결제
      </Typography.Title>

      <div className={styles.planBox}>
        <div className={styles.planInfo}>
          <div className={styles.planIcon}>
            <ThunderboltOutlined />
          </div>
          <div>
            <Typography.Text className={styles.planName}>Pro 플랜</Typography.Text>
            <Typography.Text className={styles.planDesc}>
              최대 200명 크루 · 무제한 프로젝트 · 세이프넷 관제
            </Typography.Text>
          </div>
        </div>
        <div className={styles.planPricing}>
          <Typography.Text className={styles.planPrice}>₩290,000 / 월</Typography.Text>
          <Button size="small">플랜 변경</Button>
        </div>
      </div>

      <div className={styles.paymentRow}>
        <div className={styles.paymentInfo}>
          <span className={styles.visaBadge}>VISA</span>
          <Typography.Text className={styles.paymentText}>
            **** **** **** 4242
            <span className={styles.paymentExpiry}>만료 09/28</span>
          </Typography.Text>
        </div>
        <Button size="small">결제수단 변경</Button>
      </div>
    </>
  );
}

export default function MyPage() {
  const [activeMenu, setActiveMenu] = useState<MenuKey>("basic");

  const menuItems: MenuProps["items"] = useMemo(
    () => [
      { key: "basic", icon: <SettingOutlined />, label: menuLabels.basic },
      { key: "security", icon: <SafetyOutlined />, label: menuLabels.security },
      { key: "binding", icon: <LinkOutlined />, label: menuLabels.binding },
      { key: "notifications", icon: <BellOutlined />, label: menuLabels.notifications },
      { key: "billing", icon: <CreditCardOutlined />, label: menuLabels.billing },
    ],
    [],
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "basic":
        return <BasicSettingsSection />;
      case "security":
        return <SecuritySettingsSection />;
      case "binding":
        return <BindingSection />;
      case "notifications":
        return <NotificationsSection />;
      case "billing":
        return <BillingSection />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.page}>
      <Row gutter={24} wrap={false} className={styles.layout}>
        <Col flex="0 0 224px" className={styles.menuCol}>
          <Menu
            mode="inline"
            selectedKeys={[activeMenu]}
            items={menuItems}
            className={styles.sideMenu}
            onClick={({ key }) => setActiveMenu(key as MenuKey)}
          />
        </Col>
        <Col flex="auto" className={styles.contentCol}>
          <div className={styles.main}>{renderContent()}</div>
        </Col>
      </Row>
    </div>
  );
}
