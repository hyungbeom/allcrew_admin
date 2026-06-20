"use client";

import {
  BankOutlined,
  BellOutlined,
  CheckOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  UploadOutlined,
  UserAddOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  Space,
  Switch,
  Table,
  Typography,
  Upload,
  message,
} from "antd";
import type { UploadProps } from "antd";
import { useState, type ReactNode } from "react";
import { openDaumPostcode } from "@/lib/daumPostcode";
import styles from "./MyPage.module.css";

const LOGO_PATH = "/logo.svg";
const MAX_LOGO_SIZE_MB = 2;

type MenuKey = "company" | "team" | "notifications" | "billing";

const menuItems: { key: MenuKey; label: string; icon: ReactNode }[] = [
  { key: "company", label: "회사 정보", icon: <BankOutlined /> },
  { key: "team", label: "팀원 · 권한", icon: <TeamOutlined /> },
  { key: "notifications", label: "알림", icon: <BellOutlined /> },
  { key: "billing", label: "요금제 · 결제", icon: <CreditCardOutlined /> },
];

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

function CompanyInfoSection() {
  const [form] = Form.useForm();
  const [logoUrl, setLogoUrl] = useState(LOGO_PATH);

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
        message.error(`로고는 ${MAX_LOGO_SIZE_MB}MB 이하만 업로드할 수 있습니다.`);
        return Upload.LIST_IGNORE;
      }

      setLogoUrl(URL.createObjectURL(file));
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
      <Typography.Title level={4} className={styles.sectionTitle}>
        회사 정보
      </Typography.Title>

      <div className={styles.logoSection}>
        <div className={styles.logoPreview}>
          <img src={logoUrl} alt="회사 로고" className={styles.logoImage} />
        </div>
        <div className={styles.logoActions}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>로고 변경</Button>
          </Upload>
          <Typography.Text className={styles.logoHint}>PNG · SVG, 최대 2MB</Typography.Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          companyName: "올크루 주식회사",
          businessNumber: "4079903458",
          representative: "김대표",
          address: "경기 고양시 덕양구 청초로 10",
          addressDetail: "1513호",
          phone: "01006311031",
        }}
        onFinish={() => message.success("회사 정보가 저장되었습니다.")}
      >
        <div className={styles.formGrid}>
          <Form.Item label="회사명" name="companyName" className={styles.formGridFull}>
            <Input />
          </Form.Item>
          <Form.Item label="사업자등록번호" name="businessNumber">
            <Input />
          </Form.Item>
          <Form.Item label="대표자명" name="representative">
            <Input />
          </Form.Item>
          <Form.Item label="주소" className={styles.formGridFull}>
            <Space.Compact className={styles.addressCompact}>
              <Form.Item name="address" noStyle>
                <Input
                  readOnly
                  placeholder="주소 찾기 버튼으로 검색하세요"
                  prefix={<EnvironmentOutlined style={{ color: "rgba(0,0,0,0.25)" }} />}
                />
              </Form.Item>
              <Button type="default" onClick={handleAddressSearch}>
                주소 찾기
              </Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item label="상세 주소" name="addressDetail" className={styles.formGridFull}>
            <Input placeholder="상세 주소를 입력하세요" />
          </Form.Item>
          <Form.Item label="대표 전화" name="phone" className={styles.formGridFull}>
            <Input />
          </Form.Item>
        </div>

        <div className={styles.formActions}>
          <Button type="primary" htmlType="submit" icon={<CheckOutlined />}>
            저장
          </Button>
          <Button
            onClick={() => {
              form.resetFields();
              setLogoUrl(LOGO_PATH);
            }}
          >
            취소
          </Button>
        </div>
      </Form>
    </>
  );
}

function TeamSection() {
  return (
    <>
      <div className={styles.sectionHeader}>
        <Typography.Title level={4} className={styles.sectionTitle}>
          팀원 · 권한
        </Typography.Title>
        <Button type="primary" size="small" icon={<UserAddOutlined />}>
          팀원 초대
        </Button>
      </div>

      <Table
        className={styles.teamTable}
        size="small"
        bordered
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
                description="아직 팀원이 없어요. '팀원 초대'로 초대 코드를 발급하세요."
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
      <Typography.Title level={4} className={styles.sectionTitle}>
        알림
      </Typography.Title>

      <div className={styles.notificationList}>
        {notificationSettings.map((item) => (
          <div key={item.key} className={styles.notificationItem}>
            <div>
              <Typography.Text className={styles.notificationTitle}>{item.title}</Typography.Text>
              <Typography.Text className={styles.notificationDesc}>{item.description}</Typography.Text>
            </div>
            <Switch size="small" defaultChecked={item.defaultChecked} />
          </div>
        ))}
      </div>
    </>
  );
}

function BillingSection() {
  return (
    <>
      <Typography.Title level={4} className={styles.sectionTitle}>
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
  const [activeMenu, setActiveMenu] = useState<MenuKey>("company");

  const renderContent = () => {
    switch (activeMenu) {
      case "company":
        return <CompanyInfoSection />;
      case "team":
        return <TeamSection />;
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
      <div className={styles.layout}>
        <Card size="small" className={styles.sidebar} styles={{ body: { padding: 8 } }}>
          <nav className={styles.sidebarNav}>
            {menuItems.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`${styles.menuItem} ${activeMenu === item.key ? styles.menuItemActive : ""}`}
                onClick={() => setActiveMenu(item.key)}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </Card>

        <Card size="small" className={styles.contentCard} styles={{ body: { padding: "16px 20px 20px" } }}>
          {renderContent()}
        </Card>
      </div>
    </div>
  );
}
