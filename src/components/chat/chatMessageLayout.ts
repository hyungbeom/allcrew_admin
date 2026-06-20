import type { ChatMessage } from "./chatData";

export type MessageGroupPosition = "single" | "first" | "middle" | "last";

export type MessageDisplayMeta = {
  showDateDivider: boolean;
  dateDividerLabel?: string;
  showAvatar: boolean;
  showSenderName: boolean;
  showTimestamp: boolean;
  groupPosition: MessageGroupPosition;
};

function getMinuteKey(message: ChatMessage): string {
  if (message.sentAtIso) {
    const date = new Date(message.sentAtIso);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}-${hours}-${minutes}`;
    }
  }

  return message.sentAt;
}

function getDateKey(message: ChatMessage): string {
  if (message.sentAtIso) {
    const date = new Date(message.sentAtIso);
    if (!Number.isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  return message.sentAt;
}

function isSameMinuteGroup(previous: ChatMessage, current: ChatMessage): boolean {
  return (
    previous.isMine === current.isMine &&
    previous.senderName === current.senderName &&
    getMinuteKey(previous) === getMinuteKey(current)
  );
}

export function formatKakaoDateDivider(sentAtIso: string): string {
  const date = new Date(sentAtIso);
  if (Number.isNaN(date.getTime())) {
    return sentAtIso;
  }

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

export function buildMessageDisplayMeta(messages: ChatMessage[]): MessageDisplayMeta[] {
  return messages.map((message, index) => {
    const previous = index > 0 ? messages[index - 1] : null;
    const next = index < messages.length - 1 ? messages[index + 1] : null;

    const groupedWithPrevious = previous ? isSameMinuteGroup(previous, message) : false;
    const groupedWithNext = next ? isSameMinuteGroup(message, next) : false;

    let groupPosition: MessageGroupPosition;
    if (!groupedWithPrevious && !groupedWithNext) {
      groupPosition = "single";
    } else if (!groupedWithPrevious && groupedWithNext) {
      groupPosition = "first";
    } else if (groupedWithPrevious && groupedWithNext) {
      groupPosition = "middle";
    } else {
      groupPosition = "last";
    }

    const showTimestamp = groupPosition === "single" || groupPosition === "last";
    const showAvatar = !message.isMine && (groupPosition === "single" || groupPosition === "first");
    const showSenderName = !message.isMine && (groupPosition === "single" || groupPosition === "first");

    const currentDateKey = getDateKey(message);
    const previousDateKey = previous ? getDateKey(previous) : null;
    const showDateDivider = !previous || currentDateKey !== previousDateKey;

    return {
      showDateDivider,
      dateDividerLabel: showDateDivider ? formatKakaoDateDivider(message.sentAtIso) : undefined,
      showAvatar,
      showSenderName,
      showTimestamp,
      groupPosition,
    };
  });
}
