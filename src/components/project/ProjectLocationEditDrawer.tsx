"use client";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { App, Button, Drawer, Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/api/client";
import { updateProjectLocation } from "@/lib/api/project";
import {
  createProjectMap,
  geocodeAddress,
  getDefaultMapCenter,
  type KakaoLatLng,
} from "@/lib/kakaoMap";
import type { Project } from "./projectData";
import styles from "./ProjectLocationEditDrawer.module.css";

type ProjectLocationEditDrawerProps = {
  open: boolean;
  project: Project;
  initialCenter: KakaoLatLng | null;
  onClose: () => void;
  onProjectUpdated: (project: Project) => void;
  onLocationSaved: (center: KakaoLatLng) => void;
};

function formatCoordinates(center: KakaoLatLng) {
  return `${center.latitude.toFixed(6)}, ${center.longitude.toFixed(6)}`;
}

export default function ProjectLocationEditDrawer({
  open,
  project,
  initialCenter,
  onClose,
  onProjectUpdated,
  onLocationSaved,
}: ProjectLocationEditDrawerProps) {
  const { message } = App.useApp();
  const [drawerReady, setDrawerReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mapCenter, setMapCenter] = useState<KakaoLatLng>(getDefaultMapCenter());
  const [draftCenter, setDraftCenter] = useState<KakaoLatLng | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const resolveInitialCenter = useCallback(async (): Promise<KakaoLatLng> => {
    if (initialCenter) return initialCenter;

    if (project.latitude != null && project.longitude != null) {
      return { latitude: project.latitude, longitude: project.longitude };
    }

    try {
      const geocoded = await geocodeAddress(project.address ?? project.location);
      return geocoded ?? getDefaultMapCenter();
    } catch {
      return getDefaultMapCenter();
    }
  }, [initialCenter, project.address, project.latitude, project.location, project.longitude]);

  useEffect(() => {
    if (!open) {
      setDrawerReady(false);
      return;
    }

    let cancelled = false;

    const prepareCenter = async () => {
      const center = await resolveInitialCenter();
      if (cancelled) return;
      setMapCenter(center);
      setDraftCenter(center);
    };

    void prepareCenter();

    return () => {
      cancelled = true;
    };
  }, [open, resolveInitialCenter]);

  useEffect(() => {
    if (!open || !drawerReady) return;

    let cancelled = false;
    const container = mapContainerRef.current;
    if (!container) return;

    const initEditMap = async () => {
      try {
        if (cancelled) return;

        await createProjectMap({
          container,
          center: mapCenter,
          radius: project.gpsRadius ?? 100,
          interactive: true,
          level: 2,
          onLocationSelect: setDraftCenter,
        });
      } catch (error) {
        if (!cancelled) {
          message.error(
            error instanceof Error ? error.message : "카카오 지도를 불러오지 못했습니다.",
          );
        }
      }
    };

    const timer = window.setTimeout(() => {
      void initEditMap();
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      container.replaceChildren();
    };
  }, [drawerReady, mapCenter, message, open, project.gpsRadius]);

  const handleSaveLocation = async () => {
    if (!draftCenter) {
      message.warning("지도에서 위치를 선택해 주세요.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateProjectLocation(project.id, {
        latitude: draftCenter.latitude,
        longitude: draftCenter.longitude,
      });
      onProjectUpdated(updated);
      onLocationSaved(draftCenter);
      onClose();
      message.success("현장 GPS 위치를 저장했습니다.");
    } catch (error) {
      const errorMessage =
        error instanceof ApiError ? error.message : "위치 저장에 실패했습니다.";
      message.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      placement="right"
      size={720}
      destroyOnHidden
      zIndex={1200}
      className={styles.drawer}
      title={null}
      closable={false}
      onClose={onClose}
      afterOpenChange={setDrawerReady}
      styles={{ body: { padding: 0, overflow: "hidden" } }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <Typography.Title level={2} className={styles.title}>
            현장 GPS 위치 수정
          </Typography.Title>
          <Typography.Text type="secondary" className={styles.guide}>
            지도를 클릭해 현장 위치를 선택하세요. 선택한 좌표가 GPS 기준점으로 저장됩니다.
          </Typography.Text>
        </div>

        <div className={styles.body}>
          <div ref={mapContainerRef} className={styles.mapCanvas} />
          {draftCenter ? (
            <Typography.Text className={styles.coordinateText}>
              선택 좌표: {formatCoordinates(draftCenter)}
            </Typography.Text>
          ) : null}
        </div>

        <div className={styles.footer}>
          <Button icon={<LeftOutlined />} onClick={onClose}>
            취소
          </Button>
          <Button type="primary" loading={saving} onClick={() => void handleSaveLocation()}>
            저장 <RightOutlined />
          </Button>
        </div>
      </div>
    </Drawer>
  );
}
