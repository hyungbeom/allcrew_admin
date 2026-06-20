"use client";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Calendar, Card, Empty, Space, Typography } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import { useMemo, useState } from "react";
import {
  getEventsByDate,
  getEventsInMonth,
  statusLabel,
  toDateKey,
} from "./calendarData";
import styles from "./CalendarPage.module.css";

dayjs.locale("ko");

const MAX_VISIBLE_EVENTS = 2;

export default function CalendarPage() {
  const [panelDate, setPanelDate] = useState(() => dayjs("2026-06-19"));
  const [selectedDate, setSelectedDate] = useState(() => dayjs("2026-06-19"));

  const monthEvents = useMemo(
    () => getEventsInMonth(panelDate.year(), panelDate.month() + 1),
    [panelDate],
  );

  const selectedEvents = useMemo(
    () => getEventsByDate(toDateKey(selectedDate)),
    [selectedDate],
  );

  const moveMonth = (offset: number) => {
    setPanelDate((prev) => prev.add(offset, "month"));
  };

  const goToday = () => {
    const today = dayjs();
    setPanelDate(today);
    setSelectedDate(today);
  };

  const renderDateCell = (date: Dayjs) => {
    const dateKey = toDateKey(date);
    const dayEvents = getEventsByDate(dateKey);
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
              <div key={event.id} className={styles.eventCard}>
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
  );
}
