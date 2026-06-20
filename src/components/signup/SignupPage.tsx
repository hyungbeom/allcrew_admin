"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  AppleOutlined,
  CheckOutlined,
  GoogleOutlined,
  IdcardOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  Space,
  Steps,
  Typography,
} from "antd";
import { openDaumPostcode } from "@/lib/daumPostcode";
import {
  checkBusinessNumberAvailable,
  checkCompanySlugAvailable,
  checkEmailAvailable,
  signupEmployee,
  signupRepresentative,
} from "@/lib/api/auth";
import { getAppHostPrefix, getAppOrigin } from "@/lib/appOrigin";
import { normalizeCompanySlug } from "@/lib/companyPaths";
import { ApiError } from "@/lib/api/client";
import styles from "./SignupPage.module.css";

type SignupType = "representative" | "employee";

type SignupFormValues = {
  signupType: SignupType;
  agreeAll: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeLocation: boolean;
  agreeMarketing: boolean;
  name: string;
  phone: string;
  email: string;
  password: string;
  passwordConfirm: string;
  companyName: string;
  companySlug: string;
  businessNumber: string;
  address: string;
  addressDetail: string;
  inviteCode: string;
};

const REQUIRED_AGREEMENTS: (keyof Pick<
  SignupFormValues,
  "agreeTerms" | "agreePrivacy" | "agreeLocation"
>)[] = ["agreeTerms", "agreePrivacy", "agreeLocation"];

const AGREEMENT_ITEMS = [
  { key: "agreeTerms" as const, label: "[필수] 이용약관 동의", required: true },
  { key: "agreePrivacy" as const, label: "[필수] 개인정보 처리방침 동의", required: true },
  { key: "agreeLocation" as const, label: "[필수] 위치정보 이용 동의", required: true },
  { key: "agreeMarketing" as const, label: "마케팅 정보 수신 동의 (선택)", required: false },
];

function passwordValidator(_: unknown, value: string) {
  if (!value) return Promise.reject(new Error("비밀번호를 입력해 주세요."));
  const valid =
    value.length >= 8 &&
    /[a-zA-Z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^a-zA-Z0-9]/.test(value);
  if (!valid) {
    return Promise.reject(new Error("8자 이상, 영문/숫자/특수문자 조합으로 입력해 주세요."));
  }
  return Promise.resolve();
}

export default function SignupPage() {
  const router = useRouter();
  const { message } = App.useApp();
  const [form] = Form.useForm<SignupFormValues>();
  const [step, setStep] = useState(0);
  const [emailChecked, setEmailChecked] = useState(false);
  const [businessChecked, setBusinessChecked] = useState(false);
  const [slugChecked, setSlugChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hostPrefix, setHostPrefix] = useState(getAppHostPrefix);
  const [appOrigin, setAppOrigin] = useState(getAppOrigin);

  useEffect(() => {
    setHostPrefix(getAppHostPrefix());
    setAppOrigin(getAppOrigin());
  }, []);

  const signupType = Form.useWatch("signupType", form) ?? "representative";

  const stepItems = useMemo(
    () => [
      { title: "가입 유형" },
      { title: "약관 동의" },
      { title: "계정 정보" },
      { title: signupType === "representative" ? "업체 정보" : "초대 코드" },
    ],
    [signupType],
  );

  const handleAgreeAll = (checked: boolean) => {
    form.setFieldsValue({
      agreeAll: checked,
      agreeTerms: checked,
      agreePrivacy: checked,
      agreeLocation: checked,
      agreeMarketing: checked,
    });
  };

  const syncAgreeAll = () => {
    const values = form.getFieldsValue([
      "agreeTerms",
      "agreePrivacy",
      "agreeLocation",
      "agreeMarketing",
    ]);
    const allChecked = Object.values(values).every(Boolean);
    form.setFieldValue("agreeAll", allChecked);
  };

  const validateStep = async (currentStep: number) => {
    if (currentStep === 0) {
      const type = form.getFieldValue("signupType");
      if (!type) {
        message.warning("가입 유형을 선택해 주세요.");
        return false;
      }
      return true;
    }

    if (currentStep === 1) {
      const values = form.getFieldsValue(REQUIRED_AGREEMENTS);
      const missing = REQUIRED_AGREEMENTS.some((key) => !values[key]);
      if (missing) {
        message.warning("필수 약관에 모두 동의해 주세요.");
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      await form.validateFields(["name", "phone", "email", "password", "passwordConfirm"]);
      if (!emailChecked) {
        message.warning("이메일 중복 확인을 진행해 주세요.");
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (signupType === "representative") {
        await form.validateFields(["companyName", "companySlug", "businessNumber", "address"]);
        if (!slugChecked) {
          message.warning("기업 영문 이름 중복 확인을 진행해 주세요.");
          return false;
        }
        if (!businessChecked) {
          message.warning("사업자등록번호 조회를 진행해 주세요.");
          return false;
        }
      } else {
        await form.validateFields(["inviteCode"]);
      }
    }

    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep(step);
    if (!valid) return;

    if (step < stepItems.length - 1) {
      setStep(step + 1);
      return;
    }

    const values = form.getFieldsValue(true);
    setSubmitting(true);

    try {
      if (signupType === "representative") {
        await signupRepresentative({
          name: values.name,
          phone: values.phone,
          email: values.email,
          password: values.password,
          agreeTerms: values.agreeTerms,
          agreePrivacy: values.agreePrivacy,
          agreeLocation: values.agreeLocation,
          agreeMarketing: values.agreeMarketing,
          companyName: values.companyName,
          companySlug: normalizeCompanySlug(values.companySlug),
          businessNumber: values.businessNumber,
          address: values.address,
          addressDetail: values.addressDetail,
        });
      } else {
        await signupEmployee({
          name: values.name,
          phone: values.phone,
          email: values.email,
          password: values.password,
          agreeTerms: values.agreeTerms,
          agreePrivacy: values.agreePrivacy,
          agreeLocation: values.agreeLocation,
          agreeMarketing: values.agreeMarketing,
          inviteCode: values.inviteCode,
        });
      }

      message.success("회원가입이 완료되었습니다.");
      router.push("/login");
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "회원가입에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (step === 0) {
      router.push("/login");
      return;
    }
    setStep(step - 1);
  };

  const handleEmailCheck = async () => {
    try {
      const email = form.getFieldValue("email");
      await form.validateFields(["email"]);
      if (!email) return;

      const result = await checkEmailAvailable(email.trim());
      if (!result.available) {
        setEmailChecked(false);
        message.error("이미 사용 중인 이메일입니다.");
        return;
      }

      setEmailChecked(true);
      message.success("사용 가능한 이메일입니다.");
    } catch (error) {
      setEmailChecked(false);
      if (error instanceof ApiError) {
        message.error(error.message);
      }
    }
  };

  const handleBusinessLookup = async () => {
    try {
      const businessNumber = form.getFieldValue("businessNumber");
      await form.validateFields(["businessNumber"]);

      const result = await checkBusinessNumberAvailable(businessNumber.trim());
      if (!result.available) {
        setBusinessChecked(false);
        message.error("이미 등록된 사업자등록번호입니다.");
        return;
      }

      setBusinessChecked(true);
      message.success("사업자등록번호가 확인되었습니다.");
    } catch (error) {
      setBusinessChecked(false);
      if (error instanceof ApiError) {
        message.error(error.message);
      }
    }
  };

  const handleSlugCheck = async () => {
    try {
      const companySlug = form.getFieldValue("companySlug");
      await form.validateFields(["companySlug"]);
      if (!companySlug) return;

      const result = await checkCompanySlugAvailable(normalizeCompanySlug(companySlug));
      if (!result.available) {
        setSlugChecked(false);
        message.error("이미 사용 중인 기업 영문 이름입니다.");
        return;
      }

      setSlugChecked(true);
      message.success("사용 가능한 기업 영문 이름입니다.");
    } catch (error) {
      setSlugChecked(false);
      if (error instanceof ApiError) {
        message.error(error.message);
      }
    }
  };

  const handleAddressSearch = () => {
    openDaumPostcode((address) => {
      form.setFieldValue("address", address);
    });
  };

  const renderStepContent = () => {
    if (step === 0) {
      return (
        <>
          <Typography.Text className={styles.stepTitle}>가입 유형을 선택해주세요</Typography.Text>
          <Form.Item name="signupType" noStyle>
            <div className={styles.typeList}>
              {(
                [
                  {
                    value: "representative" as const,
                    icon: <IdcardOutlined />,
                    label: "대표 (회사 신규 등록)",
                    desc: "새 에이전시(회사)를 등록하고 운영합니다.",
                  },
                  {
                    value: "employee" as const,
                    icon: <UserOutlined />,
                    label: "직원 (초대코드로 합류)",
                    desc: "대표가 발급한 초대코드로 팀에 합류합니다.",
                  },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={`${styles.typeOption} ${
                    signupType === item.value ? styles.typeOptionActive : ""
                  }`}
                  onClick={() => form.setFieldValue("signupType", item.value)}
                >
                  <span className={styles.typeIcon}>{item.icon}</span>
                  <span className={styles.typeText}>
                    <span className={styles.typeLabel}>{item.label}</span>
                    <span className={styles.typeDesc}>{item.desc}</span>
                  </span>
                  {signupType === item.value && <CheckOutlined className={styles.typeCheck} />}
                </button>
              ))}
            </div>
          </Form.Item>
        </>
      );
    }

    if (step === 1) {
      return (
        <>
          <Typography.Text className={styles.stepTitle}>약관에 동의해주세요</Typography.Text>
          <div className={styles.agreeAllBox}>
            <Form.Item name="agreeAll" valuePropName="checked" noStyle>
              <Checkbox onChange={(e) => handleAgreeAll(e.target.checked)}>
                전체 동의 (선택 항목 포함)
              </Checkbox>
            </Form.Item>
          </div>
          <div className={styles.agreeList}>
            {AGREEMENT_ITEMS.map((item) => (
              <div key={item.key} className={styles.agreeItem}>
                <Form.Item name={item.key} valuePropName="checked" noStyle>
                  <Checkbox onChange={syncAgreeAll}>{item.label}</Checkbox>
                </Form.Item>
                <Typography.Link className={styles.viewLink}>보기</Typography.Link>
              </div>
            ))}
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <Typography.Text className={styles.stepTitle}>계정 정보를 입력해주세요</Typography.Text>
          <Form.Item
            label="성함"
            name="name"
            rules={[{ required: true, message: "성함을 입력해 주세요." }]}
          >
            <Input placeholder="이름" />
          </Form.Item>
          <Form.Item
            label="휴대폰 번호"
            name="phone"
            rules={[
              { required: true, message: "휴대폰 번호를 입력해 주세요." },
              { pattern: /^\d{10,11}$/, message: "'-' 없이 숫자만 입력해 주세요." },
            ]}
          >
            <Input placeholder="'-' 없이 숫자만" maxLength={11} />
          </Form.Item>
          <Form.Item label="이메일" required>
            <div className={styles.inlineField}>
              <Form.Item
                name="email"
                noStyle
                rules={[
                  { required: true, message: "이메일을 입력해 주세요." },
                  { type: "email", message: "올바른 이메일 형식이 아닙니다." },
                ]}
              >
                <Input
                  placeholder="example@allcrew.com"
                  onChange={() => setEmailChecked(false)}
                />
              </Form.Item>
              <Button onClick={handleEmailCheck}>중복 확인</Button>
            </div>
          </Form.Item>
          <Form.Item
            label="비밀번호"
            name="password"
            rules={[{ validator: passwordValidator }]}
          >
            <Input.Password placeholder="비밀번호 입력" />
          </Form.Item>
          <Typography.Text type="secondary" className={styles.fieldHint}>
            8자 이상, 영문/숫자/특수문자 조합
          </Typography.Text>
          <Form.Item
            label="비밀번호 확인"
            name="passwordConfirm"
            dependencies={["password"]}
            rules={[
              { required: true, message: "비밀번호 확인을 입력해 주세요." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("비밀번호가 일치하지 않습니다."));
                },
              }),
            ]}
          >
            <Input.Password placeholder="비밀번호 재입력" />
          </Form.Item>
        </>
      );
    }

    if (signupType === "employee") {
      return (
        <>
          <Typography.Text className={styles.stepTitle}>초대 코드를 입력해주세요</Typography.Text>
          <Form.Item
            label="초대 코드"
            name="inviteCode"
            rules={[{ required: true, message: "초대 코드를 입력해 주세요." }]}
          >
            <Input placeholder="대표가 발급한 초대 코드" />
          </Form.Item>
        </>
      );
    }

    return (
      <>
        <Typography.Text className={styles.stepTitle}>업체 정보를 입력해주세요</Typography.Text>
        <Form.Item
          label="회사명"
          name="companyName"
          rules={[{ required: true, message: "회사명을 입력해 주세요." }]}
        >
          <Input placeholder="예: 올크루 이벤트" />
        </Form.Item>
        <Form.Item label="기업 영문 이름 (URL)" required>
          <div className={styles.inlineField}>
            <Space.Compact block>
              <Input
                readOnly
                value={hostPrefix}
                tabIndex={-1}
                className={styles.slugPrefixInput}
              />
              <Form.Item
                name="companySlug"
                noStyle
                rules={[
                  { required: true, message: "기업 영문 이름을 입력해 주세요." },
                  {
                    pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: "영문 소문자, 숫자, 하이픈(-)만 사용할 수 있습니다.",
                  },
                  { min: 2, max: 50, message: "2~50자로 입력해 주세요." },
                ]}
              >
                <Input
                  placeholder="allcrew-event"
                  className={styles.slugValueInput}
                  onChange={(event) => {
                    form.setFieldValue("companySlug", normalizeCompanySlug(event.target.value));
                    setSlugChecked(false);
                  }}
                />
              </Form.Item>
            </Space.Compact>
            <Button onClick={handleSlugCheck}>중복 확인</Button>
          </div>
          <Typography.Text type="secondary" className={styles.fieldHint}>
            가입 후 접속 주소: {appOrigin}/기업영문이름/dashboard
          </Typography.Text>
        </Form.Item>
        <Form.Item label="사업자등록번호" required>
          <div className={styles.inlineField}>
            <Form.Item
              name="businessNumber"
              noStyle
              rules={[
                { required: true, message: "사업자등록번호를 입력해 주세요." },
                {
                  pattern: /^\d{3}-\d{2}-\d{5}$/,
                  message: "000-00-00000 형식으로 입력해 주세요.",
                },
              ]}
            >
              <Input
                placeholder="123-45-67890"
                onChange={() => setBusinessChecked(false)}
              />
            </Form.Item>
            <Button onClick={handleBusinessLookup}>번호 조회</Button>
          </div>
        </Form.Item>
        <Form.Item label="회사 주소" name="address">
          <Input.Search
            placeholder="시·도 / 시·군·구 / 상세주소"
            enterButton="주소 검색"
            onSearch={handleAddressSearch}
            readOnly
          />
        </Form.Item>
        <Form.Item name="addressDetail">
          <Input placeholder="상세주소 입력" />
        </Form.Item>
      </>
    );
  };

  const isLastStep = step === stepItems.length - 1;

  return (
    <div className={styles.page}>
      <main className={styles.pageInner} aria-label="회원가입">
        <div className={styles.header}>
          <Typography.Title level={3} className={styles.logo}>
            ALLCREW
          </Typography.Title>
          <Typography.Text type="secondary" className={styles.pageSubtitle}>
            에이전시 회원가입
          </Typography.Text>
        </div>

        <Steps current={step} items={stepItems} className={styles.steps} />

        <Form
          form={form}
          layout="vertical"
          requiredMark
          className={styles.stepForm}
          initialValues={{
            signupType: "representative",
            agreeAll: false,
            agreeTerms: false,
            agreePrivacy: false,
            agreeLocation: false,
            agreeMarketing: false,
          }}
        >
          {renderStepContent()}

          <div className={styles.stepActions}>
            {step > 0 && <Button onClick={handlePrev}>이전</Button>}
            {step === 0 && <Button onClick={handlePrev}>취소</Button>}
            <Button type="primary" onClick={handleNext} loading={submitting}>
              {isLastStep ? "가입하기" : "다음"}
            </Button>
          </div>
        </Form>

        <Typography.Text className={styles.loginHint}>
          이미 계정이 있으신가요? <Link href="/login">로그인</Link>
        </Typography.Text>

        <Divider className={styles.divider} />

        <section className={styles.description}>
          <Typography.Title level={4} className={styles.descriptionTitle}>
            안내
          </Typography.Title>
          <ul className={styles.descriptionList}>
            <li>에이전시 회원가입은 대표 또는 직원(초대코드) 방식으로 진행됩니다.</li>
            <li>필수 약관에 동의해야 다음 단계로 이동할 수 있습니다.</li>
            <li>사업자등록번호는 실제 운영 중인 업체 정보만 등록해 주세요.</li>
            <li>가입 완료 후 로그인하여 ALLCREW 관리자 서비스를 이용할 수 있습니다.</li>
          </ul>
        </section>

        <div className={styles.crewBox}>
          <Typography.Text className={styles.crewTitle}>크루로 가입하시려고요?</Typography.Text>
          <Typography.Text type="secondary" className={styles.crewDesc}>
            크루 회원가입은 모바일 앱에서만 가능해요. 앱을 다운로드한 뒤 가입을 진행해주세요.
          </Typography.Text>
          <div className={styles.storeRow}>
            <Button className={styles.storeButton} icon={<AppleOutlined />}>
              App Store
            </Button>
            <Button className={styles.storeButton} icon={<GoogleOutlined />}>
              Google Play
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
