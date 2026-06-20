"use client";

import { App } from "antd";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { fetchProjectFilterOptions, type ProjectFilterOption } from "@/lib/api/operations";

export type ProjectSelectOption = { value: string; label: string };

export function useProjectFilterOptions(includeAll = true) {
  const { message } = App.useApp();
  const [options, setOptions] = useState<ProjectSelectOption[]>(
    includeAll ? [{ value: "all", label: "전체 프로젝트" }] : [],
  );
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items: ProjectFilterOption[] = await fetchProjectFilterOptions();
      setOptions([
        ...(includeAll ? [{ value: "all", label: "전체 프로젝트" as const }] : []),
        ...items,
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "프로젝트 목록을 불러오지 못했습니다.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [includeAll, message]);

  useEffect(() => {
    void load();
  }, [load]);

  return { options, loading, reload: load };
}
