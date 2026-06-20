"use client";

import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  LoadingOutlined,
  PlusOutlined,
  RightOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Checkbox,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Steps,
  TimePicker,
  Typography,
  Upload,
} from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/ko";
import { useMemo, useState } from "react";
import { openDaumPostcode } from "@/lib/daumPostcode";
import { createProject } from "@/lib/api/project";
import { ApiError } from "@/lib/api/client";
import { formatCompactBudget } from "./projectData";
import styles from "./CreateProjectModal.module.css";

dayjs.locale("ko");

export type EventType = "공연" | "전시" | "컨퍼런스" | "축제" | "행사" | "스포츠" | "기타";
export type PayType = "hourly" | "daily";

export type ProjectPosition = {
  name: string;
  count: number;
  payType: PayType;
  amount: number;
};

export type CreateProjectFormValues = {
  name: string;
  eventType: EventType;
  description?: string;
  coverImage?: UploadFile[];
  startDate: Dayjs;
  endDate: Dayjs;
  workStartTime: Dayjs;
  workEndTime: Dayjs;
  address?: string;
  addressDetail?: string;
  positions: ProjectPosition[];
  gpsRadius: number;
  breakMinutes: number;
  welfare: string[];
  recruitmentDeadline: Dayjs;
  preferredQualifications?: string;
  startRecruitmentImmediately: boolean;
};

const EVENT_TYPES: EventType[] = ["공연", "전시", "컨퍼런스", "축제", "행사", "스포츠", "기타"];

const WELFARE_OPTIONS = [
  { key: "meal", label: "식대 제공", icon: "🍱" },
  { key: "transport", label: "교통비 제공", icon: "🚗" },
  { key: "uniform", label: "유니폼 제공", icon: "👕" },
] as const;

const STEP_ITEMS = [
  { title: "기본 정보", icon: FileTextOutlined },
  { title: "일정 & 장소", icon: CalendarOutlined },
  { title: "포지션", icon: TeamOutlined },
  { title: "근무 조건", icon: ClockCircleOutlined },
  { title: "모집 & 검토", icon: CheckCircleOutlined },
];

const STEP_FIELDS: (keyof CreateProjectFormValues)[][] = [
  ["name", "eventType"],
  ["startDate", "endDate", "workStartTime", "workEndTime", "address"],
  ["positions"],
  ["gpsRadius", "breakMinutes"],
  ["recruitmentDeadline"],
];

function getDefaultValues(): CreateProjectFormValues {
  const today = dayjs().startOf("day");
  return {
    name: "",
    eventType: "공연",
    description: "",
    coverImage: [],
    startDate: today,
    endDate: today,
    workStartTime: dayjs("09:00", "HH:mm"),
    workEndTime: dayjs("18:00", "HH:mm"),
    address: "",
    addressDetail: "",
    positions: [{ name: "", count: 1, payType: "hourly", amount: 10320 }],
    gpsRadius: 100,
    breakMinutes: 60,
    welfare: [],
    recruitmentDeadline: today,
    preferredQualifications: "",
    startRecruitmentImmediately: true,
  };
}

function getWorkHours(
  workStartTime: Dayjs,
  workEndTime: Dayjs,
  breakMinutes: number,
): number {
  const totalMinutes = workEndTime.diff(workStartTime, "minute");
  return Math.max(0, (totalMinutes - breakMinutes) / 60);
}

function calculateDailyLaborCost(
  positions: ProjectPosition[],
  workStartTime: Dayjs,
  workEndTime: Dayjs,
  breakMinutes: number,
): number {
  const workHours = getWorkHours(workStartTime, workEndTime, breakMinutes);

  return positions.reduce((total, position) => {
    const count = position.count || 0;
    const amount = position.amount || 0;

    if (position.payType === "daily") {
      return total + count * amount;
    }

    return total + count * amount * workHours;
  }, 0);
}

type CreateProjectModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function CreateProjectModal({
  open,
  onClose,
  onCreated,
}: CreateProjectModalProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<CreateProjectFormValues>();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const watchedValues = Form.useWatch([], form);

  const positions = watchedValues?.positions ?? [{ name: "", count: 1, payType: "hourly", amount: 10320 }];
  const workStartTime = watchedValues?.workStartTime ?? dayjs("09:00", "HH:mm");
  const workEndTime = watchedValues?.workEndTime ?? dayjs("18:00", "HH:mm");
  const breakMinutes = watchedValues?.breakMinutes ?? 60;

  const totalPersonnel = useMemo(
    () => positions.reduce((sum, item) => sum + (item.count || 0), 0),
    [positions],
  );

  const dailyLaborCost = useMemo(
    () => calculateDailyLaborCost(positions, workStartTime, workEndTime, breakMinutes),
    [positions, workStartTime, workEndTime, breakMinutes],
  );

  const stepItems = useMemo(
    () =>
      STEP_ITEMS.map((item, index) => {
        let status: "finish" | "process" | "wait" = "wait";
        if (index < step) {
          status = "finish";
        } else if (index === step) {
          status = "process";
        }

        const Icon = item.icon;
        const isLastStepProcessing = submitting && index === STEP_ITEMS.length - 1 && step === index;

        return {
          title: item.title,
          status,
          icon: isLastStepProcessing ? <LoadingOutlined /> : <Icon />,
        };
      }),
    [step, submitting],
  );

  const resetModal = () => {
    setStep(0);
    form.setFieldsValue(getDefaultValues());
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  const validatePositions = () => {
    const currentPositions = form.getFieldValue("positions") as ProjectPosition[];

    if (!currentPositions?.length) {
      message.warning("최소 1개의 포지션을 추가해 주세요.");
      return false;
    }

    const invalid = currentPositions.some(
      (item) => !item.name?.trim() || !item.count || item.count < 1 || !item.amount,
    );

    if (invalid) {
      message.warning("포지션명, 인원, 급여를 모두 입력해 주세요.");
      return false;
    }

    return true;
  };

  const handleNext = async () => {
    try {
      if (step === 2) {
        if (!validatePositions()) return;
      } else {
        await form.validateFields(STEP_FIELDS[step]);
      }

      setStep((prev) => Math.min(prev + 1, STEP_ITEMS.length - 1));
    } catch {
      message.warning("필수 항목을 입력해 주세요.");
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      if (!validatePositions()) return;

      setSubmitting(true);
      const values = form.getFieldsValue(true) as CreateProjectFormValues;
      await createProject(values);
      message.success("프로젝트가 생성되었습니다.");
      onCreated?.();
      handleClose();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message);
        return;
      }
      message.warning("필수 항목을 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectLocation = () => {
    openDaumPostcode((address) => {
      form.setFieldValue("address", address);
    });
  };

  const renderBasicInfoStep = () => (
    <div className={styles.formSection}>
      <Form.Item
        label={<span className={styles.fieldLabel}>프로젝트명 <span className={styles.required}>*</span></span>}
        name="name"
        rules={[{ required: true, message: "프로젝트명을 입력해 주세요." }]}
      >
        <Input size="large" placeholder="프로젝트 이름을 입력해주세요" />
      </Form.Item>

      <Form.Item
        label={<span className={styles.fieldLabel}>이벤트 타입</span>}
        name="eventType"
      >
        <EventTypeSelector />
      </Form.Item>

      <Form.Item
        label={<span className={styles.fieldLabel}>설명 (선택)</span>}
        name="description"
      >
        <Input.TextArea
          rows={4}
          placeholder="크루에게 보일 행사 설명을 자유롭게 적어주세요"
        />
      </Form.Item>

      <Form.Item
        label={<span className={styles.fieldLabel}>커버 이미지 (선택)</span>}
        name="coverImage"
        valuePropName="fileList"
        getValueFromEvent={(event) => event?.fileList ?? []}
      >
        <Upload.Dragger
          className={styles.uploadBox}
          accept="image/jpeg,image/png"
          maxCount={1}
          beforeUpload={() => false}
          listType="picture"
        >
          <p className={styles.uploadHint}>+ 이미지 선택 (JPG/PNG, 최대 5MB)</p>
        </Upload.Dragger>
      </Form.Item>
    </div>
  );

  const renderScheduleStep = () => (
    <div className={styles.formSection}>
      <div className={styles.row}>
        <Form.Item
          label={<span className={styles.fieldLabel}>시작일 <span className={styles.required}>*</span></span>}
          name="startDate"
          rules={[{ required: true, message: "시작일을 선택해 주세요." }]}
        >
          <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          label={<span className={styles.fieldLabel}>종료일 <span className={styles.required}>*</span></span>}
          name="endDate"
          rules={[{ required: true, message: "종료일을 선택해 주세요." }]}
        >
          <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>
      </div>

      <div className={styles.row}>
        <Form.Item
          label={<span className={styles.fieldLabel}>근무 시작 시간 <span className={styles.required}>*</span></span>}
          name="workStartTime"
          rules={[{ required: true, message: "근무 시작 시간을 선택해 주세요." }]}
        >
          <TimePicker size="large" style={{ width: "100%" }} format="A hh:mm" minuteStep={10} />
        </Form.Item>
        <Form.Item
          label={<span className={styles.fieldLabel}>근무 종료 시간 <span className={styles.required}>*</span></span>}
          name="workEndTime"
          rules={[{ required: true, message: "근무 종료 시간을 선택해 주세요." }]}
        >
          <TimePicker size="large" style={{ width: "100%" }} format="A hh:mm" minuteStep={10} />
        </Form.Item>
      </div>

      <div>
        <span className={styles.fieldLabel}>
          행사 장소 <span className={styles.required}>*</span>
        </span>
        <button type="button" className={styles.locationButton} onClick={handleSelectLocation}>
          <EnvironmentOutlined />
          지도에서 장소 선택
        </button>
      </div>

      <Form.Item
        label={<span className={styles.fieldLabel}>주소 (선택, 자동 채워짐)</span>}
        name="address"
        rules={[{ required: true, message: "행사 장소를 선택해 주세요." }]}
      >
        <Input size="large" placeholder="주소" readOnly />
      </Form.Item>

      <Form.Item
        label={<span className={styles.fieldLabel}>상세 주소 (선택)</span>}
        name="addressDetail"
      >
        <Input size="large" placeholder="ex) 2층 무대 옆 대기실" />
      </Form.Item>

      <div className={styles.infoBox}>
        <InfoCircleOutlined className={styles.infoIcon} />
        <span>선택한 좌표는 출근 GPS 체크인과 실시간 위치 추적에 사용됩니다.</span>
      </div>
    </div>
  );

  const renderPositionStep = () => (
    <div className={styles.formSection}>
      <Form.List name="positions">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field) => {
              const { key, ...restField } = field;

              return (
              <div key={key} className={styles.positionCard}>
                <div className={styles.positionRow}>
                  <Form.Item
                    {...restField}
                    name={[field.name, "name"]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input size="large" placeholder="포지션명 (예: 안내요원)" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[field.name, "count"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber min={1} size="large" style={{ width: "100%" }} />
                  </Form.Item>
                  <button
                    type="button"
                    className={styles.deleteButton}
                    aria-label="포지션 삭제"
                    disabled={fields.length <= 1}
                    onClick={() => remove(field.name)}
                  >
                    <DeleteOutlined />
                  </button>
                </div>
                <div className={styles.payRow}>
                  <PayTypeSelector fieldName={field.name} />
                  <Form.Item
                    {...restField}
                    name={[field.name, "amount"]}
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber
                      min={0}
                      size="large"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              </div>
              );
            })}
            <Button
              block
              type="dashed"
              icon={<PlusOutlined />}
              className={styles.addPositionButton}
              onClick={() => add({ name: "", count: 1, payType: "hourly", amount: 10320 })}
            >
              포지션 추가
            </Button>
          </>
        )}
      </Form.List>

      <div className={styles.summaryBox}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>총 인원</span>
          <span className={styles.summaryValue}>{totalPersonnel}명</span>
        </div>
        <div className={styles.summaryDivider} />
        <div className={styles.summaryItem}>
          <span className={styles.summaryLabel}>1일 인건비</span>
          <span className={`${styles.summaryValue} ${styles.summaryValueHighlight}`}>
            {formatCompactBudget(dailyLaborCost)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderWorkConditionsStep = () => (
    <div className={styles.formSection}>
      <div className={styles.row}>
        <Form.Item
          label={<span className={styles.fieldLabel}>GPS 출퇴근 반경 (M)</span>}
          name="gpsRadius"
        >
          <InputNumber min={10} size="large" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label={<span className={styles.fieldLabel}>휴게시간 (분)</span>}
          name="breakMinutes"
        >
          <InputNumber min={0} size="large" style={{ width: "100%" }} />
        </Form.Item>
      </div>

      <Form.Item
        label={<span className={styles.fieldLabel}>복리후생</span>}
        name="welfare"
      >
        <WelfareSelector />
      </Form.Item>
    </div>
  );

  const renderReviewStep = () => {
    const values = form.getFieldsValue(true) as CreateProjectFormValues;
    const startDate = values.startDate?.format("YYYY-MM-DD") ?? "-";
    const endDate = values.endDate?.format("YYYY-MM-DD") ?? "-";
    const startTime = values.workStartTime?.format("HH:mm") ?? "-";
    const endTime = values.workEndTime?.format("HH:mm") ?? "-";

    return (
      <div className={styles.formSection}>
        <Form.Item
          label={<span className={styles.fieldLabel}>모집 마감일 <span className={styles.required}>*</span></span>}
          name="recruitmentDeadline"
          rules={[{ required: true, message: "모집 마감일을 선택해 주세요." }]}
        >
          <DatePicker size="large" style={{ width: "100%" }} format="YYYY-MM-DD" />
        </Form.Item>

        <Form.Item
          label={<span className={styles.fieldLabel}>우대 자격 (선택)</span>}
          name="preferredQualifications"
        >
          <Input.TextArea
            rows={3}
            placeholder="ex) 행사 진행 경험자, 영어 가능자 우대"
          />
        </Form.Item>

        <div className={styles.recruitOption}>
          <Form.Item name="startRecruitmentImmediately" valuePropName="checked" noStyle>
            <Checkbox>생성 후 즉시 크루 모집 시작</Checkbox>
          </Form.Item>
        </div>

        <div>
          <span className={styles.fieldLabel}>요약</span>
          <div className={styles.reviewSummary}>
            <span className={styles.reviewCategory}>{values.eventType}</span>
            <Typography.Title level={3} className={styles.reviewName}>
              {values.name || "프로젝트명"}
            </Typography.Title>
            <div className={styles.reviewMeta}>
              <span>
                <CalendarOutlined /> {startDate} ~ {endDate}
              </span>
              <span>
                <ClockCircleOutlined /> {startTime} ~ {endTime}
              </span>
            </div>
            <div className={styles.reviewStats}>
              <div className={styles.reviewStatCard}>
                <span className={styles.reviewStatLabel}>포지션</span>
                <span className={styles.reviewStatValue}>{positions.length}개</span>
              </div>
              <div className={styles.reviewStatCard}>
                <span className={styles.reviewStatLabel}>총 인원</span>
                <span className={styles.reviewStatValue}>{totalPersonnel}명</span>
              </div>
              <div className={styles.reviewStatCard}>
                <span className={styles.reviewStatLabel}>1일 인건비</span>
                <span className={`${styles.reviewStatValue} ${styles.reviewStatValueBlue}`}>
                  {formatCompactBudget(dailyLaborCost)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const stepContent = [
    renderBasicInfoStep(),
    renderScheduleStep(),
    renderPositionStep(),
    renderWorkConditionsStep(),
    renderReviewStep(),
  ][step];

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={720}
      centered
      destroyOnHidden
      className={styles.modal}
      title={null}
      afterOpenChange={(visible) => {
        if (visible) {
          form.setFieldsValue(getDefaultValues());
        }
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography.Title level={2} className={styles.title}>
            새 프로젝트 생성
          </Typography.Title>
          <Typography.Text className={styles.subtitle}>
            {[
              "프로젝트의 기본 정보를 입력해주세요",
              "기간, 시간, 행사 장소를 알려주세요",
              "직무별로 필요한 크루 수와 급여를 정해주세요",
              "근무시간, GPS 반경, 복리후생을 설정해주세요",
              "모집 조건을 확인하고 생성해주세요",
            ][step]}
          </Typography.Text>
        </div>

        <div className={styles.stepsWrap}>
          <Steps items={stepItems} size="small" />
        </div>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={getDefaultValues()}
          className={styles.body}
        >
          {stepContent}
        </Form>

        <div className={styles.footer}>
          <div className={styles.footerActions}>
            {step === 0 ? (
              <Button icon={<LeftOutlined />} onClick={handleClose}>
                취소
              </Button>
            ) : (
              <Button icon={<LeftOutlined />} onClick={handlePrev}>
                이전
              </Button>
            )}

            {step < STEP_ITEMS.length - 1 ? (
              <Button type="primary" onClick={handleNext}>
                다음 <RightOutlined />
              </Button>
            ) : (
              <Button type="primary" loading={submitting} onClick={handleSubmit}>
                프로젝트 생성하기 <RightOutlined />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function EventTypeSelector({
  value,
  onChange,
}: {
  value?: EventType;
  onChange?: (value: EventType) => void;
}) {
  return (
    <Radio.Group value={value} buttonStyle="solid" onChange={(event) => onChange?.(event.target.value)}>
      {EVENT_TYPES.map((type) => (
        <Radio.Button key={type} value={type}>
          {type}
        </Radio.Button>
      ))}
    </Radio.Group>
  );
}

function PayTypeSelector({ fieldName }: { fieldName: number }) {
  return (
    <Form.Item name={[fieldName, "payType"]} style={{ marginBottom: 0 }}>
      <PayTypeToggle />
    </Form.Item>
  );
}

function PayTypeToggle({
  value,
  onChange,
}: {
  value?: PayType;
  onChange?: (value: PayType) => void;
}) {
  return (
    <div className={styles.payTypeGroup}>
      <button
        type="button"
        className={`${styles.payTypeButton} ${value === "hourly" ? styles.payTypeButtonActive : ""}`}
        onClick={() => onChange?.("hourly")}
      >
        시급
      </button>
      <button
        type="button"
        className={`${styles.payTypeButton} ${value === "daily" ? styles.payTypeButtonActive : ""}`}
        onClick={() => onChange?.("daily")}
      >
        일급
      </button>
    </div>
  );
}

function WelfareSelector({
  value = [],
  onChange,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
}) {
  const toggle = (key: string) => {
    const next = value.includes(key) ? value.filter((item) => item !== key) : [...value, key];
    onChange?.(next);
  };

  return (
    <div className={styles.welfareGroup}>
      {WELFARE_OPTIONS.map((option) => (
        <button
          key={option.key}
          type="button"
          className={`${styles.welfareButton} ${value.includes(option.key) ? styles.welfareButtonActive : ""}`}
          onClick={() => toggle(option.key)}
        >
          <span>{option.icon}</span>
          {option.label}
        </button>
      ))}
    </div>
  );
}
