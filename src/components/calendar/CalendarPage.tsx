"use client";

import { RightOutlined } from "@ant-design/icons";
import { App, Calendar, Drawer, Empty, Spin, Typography } from "antd";
import type { CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCompanySlug } from "@/components/layout/CompanySlugProvider";
import { companyPath } from "@/lib/companyPaths";
import { fetchProjects } from "@/lib/api/project";
import { ApiError } from "@/lib/api/client";
import {
  buildCalendarEvents,
  buildProjectSpans,
  getBarSegment,
  getBarTextColor,
  getEventBadgeColor,
  getEventsByDate,
  getEventsInMonth,
  getProjectSpansForDate,
  shouldShowBarLabel,
  toDateKey,
  type CalendarEvent,
  type ProjectSpan,
} from "./calendarData";
import styles from "./CalendarPage.module.css";

dayjs.locale("ko");

export default function CalendarPage() {
  const router = useRouter();
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [detailOpen, setDetailOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projectSpans, setProjectSpans] = useState<ProjectSpan[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const projects = await fetchProjects();
      setProjectSpans(buildProjectSpans(projects));
      setEvents(buildCalendarEvents(projects));
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "캘린더 일정을 불러오지 못했습니다.";
      message.error(errorMessage);
      setProjectSpans([]);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const selectedEvents = useMemo(
    () => getEventsByDate(events, toDateKey(selectedDate)),
    [events, selectedDate],
  );

  const handleDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setDetailOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    router.push(companyPath(companySlug, `project/${event.projectId}`));
  };

  const dateCellRender = (value: Dayjs) => {
    const dateKey = toDateKey(value);
    const spans = getProjectSpansForDate(dateKey, projectSpans);

    return (
      <ul className={styles.events}>
        {spans.map((span) => {
          const segment = getBarSegment(value, span.startDate, span.endDate);
          const color = getEventBadgeColor(value, span);
          const showLabel = shouldShowBarLabel(value, span.startDate, span.endDate, segment);
          const segmentClass =
            segment === "single"
              ? styles.eventBar_single
              : segment === "start"
                ? styles.eventBar_start
                : segment === "middle"
                  ? styles.eventBar_middle
                  : styles.eventBar_end;

          return (
            <li key={`${span.projectId}-${dateKey}`}>
              <div
                className={`${styles.eventBar} ${segmentClass}${showLabel ? ` ${styles.eventBar_labeled}` : ""}`}
                style={{ backgroundColor: color, color: getBarTextColor(color) }}
                title={span.title}
              >
                {showLabel ? span.title : "\u00A0"}
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  const monthCellRender = (value: Dayjs) => {
    const count = getEventsInMonth(events, value.year(), value.month() + 1).length;

    return count ? (
      <div className="notes-month">
        <section>{count}</section>
        <span>일정</span>
      </div>
    ) : null;
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") {
      return dateCellRender(current);
    }
    if (info.type === "month") {
      return monthCellRender(current);
    }
    return info.originNode;
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.page}>
        <Typography.Text className={styles.subtitle}>
          진행 중인 프로젝트의 일정을 한눈에 확인하세요.
        </Typography.Text>

        <div className={styles.calendarWrap}>
          <Calendar
            cellRender={cellRender}
            value={selectedDate}
            onSelect={handleDateSelect}
            styles={{
              itemContent: {
                minHeight: 86,
                height: "auto",
                overflow: "visible",
              },
            }}
          />
        </div>

        <Drawer
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          placement="right"
          closable={false}
          size={420}
          className={styles.detailDrawer}
          styles={{ body: { padding: "20px 24px" } }}
        >
          <Typography.Text className={styles.detailLabel}>선택한 날짜</Typography.Text>
          <Typography.Text className={styles.detailDate}>
            {selectedDate.format("YYYY.MM.DD")} ({selectedDate.format("dddd")})
          </Typography.Text>

          {selectedEvents.length > 0 ? (
            <div className={styles.eventList}>
              {selectedEvents.map((event) => {
                const accentColor = getEventBadgeColor(selectedDate, event);

                return (
                  <div
                    key={event.id}
                    className={styles.eventCard}
                    style={{ borderColor: accentColor }}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEventClick(event)}
                    onKeyDown={(keyboardEvent) => {
                      if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                        keyboardEvent.preventDefault();
                        handleEventClick(event);
                      }
                    }}
                  >
                    <div className={styles.eventCardContent}>
                      <div className={styles.eventCardHead}>
                        <Typography.Text className={styles.eventCardTitle}>
                          {event.title}
                        </Typography.Text>
                        <Typography.Text className={styles.eventCardCategory}>
                          {event.category}
                        </Typography.Text>
                      </div>

                      <dl className={styles.eventCardMeta}>
                        <div className={styles.metaRow}>
                          <dt>장소</dt>
                          <dd>{event.location}</dd>
                        </div>
                        <div className={styles.metaRow}>
                          <dt>기간</dt>
                          <dd>{event.period}</dd>
                        </div>
                        <div className={styles.metaRow}>
                          <dt>메모내용</dt>
                          <dd>{event.memo}</dd>
                        </div>
                      </dl>
                    </div>
                    <RightOutlined className={styles.eventChevron} />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyDetail}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="선택한 날짜에 일정이 없습니다."
              />
            </div>
          )}
        </Drawer>
      </div>
    </Spin>
  );
}
