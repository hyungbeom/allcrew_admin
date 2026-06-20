"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Divider, Form, Input, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import styles from "./LoginPage.module.css";

function BrandIcon() {
  return (
    <svg className={styles.brandIcon} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 4L12 12L6 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14 4L20 12L14 20"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className={styles.socialIcon} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.616z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H1.057v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H1.057A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 1.057 4.958L4.064 7.29C4.772 5.163 6.756 3.58 9 3.58z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className={styles.socialIcon} width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <circle cx="9" cy="9" r="9" fill="#1877F2" />
      <path
        fill="#fff"
        d="M10.02 14.5V9.75h1.56l.24-1.81H10.02V6.88c0-.52.14-.88.9-.88h.96V4.21c-.17-.02-.74-.07-1.41-.07-1.39 0-2.34.85-2.34 2.41v1.1H7.04v1.81h1.29V14.5h1.69z"
      />
    </svg>
  );
}

type LoginFormValues = {
  email: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [form] = Form.useForm<LoginFormValues>();

  const handleSubmit = (values: LoginFormValues) => {
    void values;
    router.push("/dashboard");
  };

  return (
    <div className={styles.page}>
      <section className={styles.visualSide} aria-label="브랜드 소개">
        <picture>
          <source media="(max-width: 992px)" srcSet="/login_back_mo.png" />
          <img
            src="/login_back_pc.png"
            alt=""
            className={styles.visualBg}
            draggable={false}
          />
        </picture>

        <div className={styles.visualContent}>
          <div className={styles.brand}>
            <BrandIcon />
            <span className={styles.brandName}>Ibrahim MEMON</span>
          </div>

          <div className={styles.headline}>
            <p className={styles.headlineTop}>당신의 모험을</p>
            <p className={styles.headlineAccent}>시작하세요!</p>
          </div>
        </div>
      </section>

      <section className={styles.formSide} aria-label="로그인">
        <div className={styles.formInner}>
          <Typography.Title level={1} className={styles.title}>
            로그인
          </Typography.Title>
          <Typography.Text className={styles.subtitle}>
            이메일 주소로 로그인하세요
          </Typography.Text>

          <Form
            form={form}
            layout="vertical"
            requiredMark={false}
            className={styles.form}
            initialValues={{ email: "" }}
            onFinish={handleSubmit}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "이메일을 입력해 주세요." },
                { type: "email", message: "올바른 이메일 형식이 아닙니다." },
              ]}
            >
              <Input
                className={styles.emailInput}
                size="large"
                placeholder="name@email.com"
                prefix={<MailOutlined className={styles.inputIcon} />}
              />
            </Form.Item>

            <div className={styles.actionRow}>
              <Button type="primary" htmlType="submit" className={styles.primaryButton}>
                로그인
              </Button>
              <Link href="/signup" className={styles.signupLink}>
                <Button className={styles.signupButton}>회원가입</Button>
              </Link>
            </div>
          </Form>

          <Divider plain className={styles.divider}>
            또는
          </Divider>

          <div className={styles.socialRow}>
            <Button className={styles.socialButton} icon={<GoogleIcon />}>
              Google
            </Button>
            <Button className={styles.socialButton} icon={<FacebookIcon />}>
              Facebook
            </Button>
          </div>

          <Typography.Text className={styles.footerText}>
            회원가입 시{" "}
            <Link href="#" className={styles.footerLink}>
              이용약관
            </Link>
            에 동의하게 됩니다
          </Typography.Text>
        </div>
      </section>
    </div>
  );
}
