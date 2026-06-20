"use client";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { App, Button, Calendar, Card, Empty, Space, Spin, Typography } from "antd";
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
  getEventsByDate,
  getEventsInMonth,
  statusLabel,
  toDateKey,
  type CalendarEvent,
} from "./calendarData";
import styles from "./CalendarPage.module.css";

dayjs.locale("ko");

const MAX_VISIBLE_EVENTS = 2;

export default function CalendarPage() {
  const router = useRouter();
  const companySlug = useCompanySlug();
  const { message } = App.useApp();
  const [panelDate, setPanelDate] = useState(() => dayjs());
  const [selectedDate, setSelectedDate] = useState(() => dayjs());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const projects = await fetchProjects();
      setEvents(buildCalendarEvents(projects));
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "캘린더 일정을 불러오지 못했습니다.";
      message.error(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const monthEvents = useMemo(
    () => getEventsInMonth(events, panelDate.year(), panelDate.month() + 1),
    [events, panelDate],
  );

  const selectedEvents = useMemo(
    () => getEventsByDate(events, toDateKey(selectedDate)),
    [events, selectedDate],
  );

  const moveMonth = (offset: number) => {
    setPanelDate((prev) => prev.add(offset, "month"));
  };

  const goToday = () => {
    const today = dayjs();
    setPanelDate(today);
    setSelectedDate(today);
  };

  const handleEventClick = (event: CalendarEvent) => {
    router.push(companyPath(companySlug, `project/${event.projectId}`));
  };

  const renderDateCell = (date: Dayjs) => {
    const dateKey = toDateKey(date);
    const dayEvents = getEventsByDate(events, dateKey);
    const visibleEvents = dayEvents.slice(0, MAX_VISIBLE_EVENTS);
    const hiddenCount = dayEvents.length - visibleEvents.length;
    const isSelected = selectedDate.isSame(date, "day");
    const isCurrentMonth = date.isSame(panelDate, "month");

    return (
      <div
        className={[
          styles.dateCell,
          isSelected ? styles.dateCellSelected : "",
          !isCurrentMonth ? styles.dateCellOtherMonth : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setSelectedDate(date)}
      >
        <span
          className={[
            styles.dateNumber,
            isSelected ? styles.dateNumberSelected : "",
            !isCurrentMonth ? styles.dateNumberOtherMonth : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {date.date()}
        </span>
        <div className={styles.eventList}>
          {visibleEvents.map((event) => (
            <div key={event.id} className={styles.eventTag} title={event.title}>
              {event.title}
            </div>
          ))}
          {hiddenCount > 0 && <div className={styles.moreCount}>+{hiddenCount}건</div>}
        </div>
      </div>
    );
  };

  return (
    <Spin spinning={loading}>
      <div className={styles.page}>
        <div className={styles.pageTop}>
          <Typography.Text className={styles.subtitle}>
            진행 중인 프로젝트의 일정을 한눈에 확인하세요.
          </Typography.Text>
          <Space.Compact>
            <Button aria-label="이전 달" icon={<LeftOutlined />} onClick={() => moveMonth(-1)} />
            <Button onClick={goToday}>오늘</Button>
            <Button aria-label="다음 달" icon={<RightOutlined />} onClick={() => moveMonth(1)} />
          </Space.Compact>
        </div>

        <div className={styles.layout}>
          <Card className={styles.calendarCard} styles={{ body: { padding: "16px 20px 20px" } }}>
            <div className={styles.calendarHeader}>
              <span className={styles.monthLabel}>
                {panelDate.format("YYYY")} {panelDate.format("M")}월
              </span>
              <span className={styles.totalCount}>총 {monthEvents.length}건</span>
            </div>

            <Calendar
              fullscreen={false}
              value={panelDate}
              headerRender={() => null}
              fullCellRender={renderDateCell}
              onPanelChange={(date) => setPanelDate(date)}
              onSelect={(date) => {
                setSelectedDate(date);
                setPanelDate(date);
              }}
            />
          </Card>

          <Card className={styles.detailCard} styles={{ body: { padding: "20px" } }}>
            <Typography.Text className={styles.detailLabel}>선택한 날짜</Typography.Text>
            <Typography.Text className={styles.detailDate}>
              {selectedDate.format("YYYY.MM.DD")} ({selectedDate.format("dddd")})
            </Typography.Text>

            {selectedEvents.length > 0 ? (
              selectedEvents.map((event) => (
                <div
                  key={event.id}
                  className={styles.eventCard}
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
                  <div className={styles.eventAccent} />
                  <div className={styles.eventBody}>
                    <Typography.Text className={styles.eventTitle}>{event.title}</Typography.Text>
                    <span className={styles.statusBadge}>
                      <span className={styles.statusDot} />
                      {statusLabel[event.status]}
                    </span>
                  </div>
                  <RightOutlined className={styles.eventChevron} />
                </div>
              ))
            ) : (
              <div className={styles.emptyDetail}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="선택한 날짜에 일정이 없습니다."
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </Spin>
  );
}
