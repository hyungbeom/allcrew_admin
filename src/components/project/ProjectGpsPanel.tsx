"use client";

import { EnvironmentOutlined } from "@ant-design/icons";
import { Button, Empty, Radio, Space, Tag, Typography } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createProjectMap,
  geocodeAddress,
  getDefaultMapCenter,
  type KakaoLatLng,
  type ProjectMapHandle,
} from "@/lib/kakaoMap";
import type { Project } from "./projectData";
import styles from "./ProjectGpsPanel.module.css";

type ProjectGpsPanelProps = {
  project: Project;
  onOpenLocationEdit: () => void;
  savedLocation?: KakaoLatLng | null;
};

function formatCoordinates(center: KakaoLatLng) {
  return `${center.latitude.toFixed(6)}, ${center.longitude.toFixed(6)}`;
}

export default function ProjectGpsPanel({
  project,
  onOpenLocationEdit,
  savedLocation,
}: ProjectGpsPanelProps) {
  const [mapView, setMapView] = useState<"map" | "list">("map");
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<KakaoLatLng | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapHandleRef = useRef<ProjectMapHandle | null>(null);

  const resolveInitialCenter = useCallback(async (): Promise<KakaoLatLng> => {
    if (project.latitude != null && project.longitude != null) {
      return { latitude: project.latitude, longitude: project.longitude };
    }

    try {
      const geocoded = await geocodeAddress(project.address ?? project.location);
      return geocoded ?? getDefaultMapCenter();
    } catch {
      return getDefaultMapCenter();
    }
  }, [project.address, project.latitude, project.location, project.longitude]);

  useEffect(() => {
    if (mapView !== "map") return;

    let cancelled = false;
    const container = mapContainerRef.current;
    if (!container) return;

    setMapReady(false);
    setMapError(null);
    mapHandleRef.current = null;

    const initMap = async () => {
      try {
        const center = await resolveInitialCenter();
        if (cancelled) return;

        setSelectedCenter(center);
        mapHandleRef.current = await createProjectMap({
          container,
          center,
          radius: project.gpsRadius ?? 100,
          interactive: false,
        });
        if (!cancelled) {
          setMapReady(true);
        }
      } catch (error) {
        if (!cancelled) {
          setMapError(
            error instanceof Error ? error.message : "카카오 지도를 불러오지 못했습니다.",
          );
        }
      }
    };

    void initMap();

    return () => {
      cancelled = true;
      container.replaceChildren();
      mapHandleRef.current = null;
    };
  }, [mapView, project.gpsRadius, resolveInitialCenter]);

  useEffect(() => {
    if (!savedLocation) return;
    setSelectedCenter(savedLocation);
    mapHandleRef.current?.setCenter(savedLocation);
  }, [savedLocation]);

  return (
    <>
      <div className={styles.mapHeader}>
        <Space>
          <Typography.Text className={styles.mapTitle}>현장 GPS</Typography.Text>
          <span className={styles.liveBadge}>
            <span className={styles.liveDot} />
            실시간
          </span>
        </Space>
        <Space wrap>
          <Button size="small" onClick={onOpenLocationEdit}>
            위치수정
          </Button>
          <Radio.Group
            className={styles.mapViewToggle}
            size="small"
            value={mapView}
            optionType="button"
            buttonStyle="solid"
            onChange={(event) => setMapView(event.target.value as "map" | "list")}
          >
            <Radio.Button value="map">지도</Radio.Button>
            <Radio.Button value="list">리스트</Radio.Button>
          </Radio.Group>
        </Space>
      </div>

      <div className={styles.gpsCardBody}>
        {mapView === "map" ? (
          <>
            {mapError ? (
              <div className={styles.mapFallback}>
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={mapError} />
              </div>
            ) : (
              <div ref={mapContainerRef} className={styles.mapCanvas} aria-busy={!mapReady} />
            )}
            <div className={styles.mapOverlay}>
              <Tag>현장 크루 {project.crewCurrent}명</Tag>
              <Tag>GPS 반경 {project.gpsRadius ?? 100}m</Tag>
              {selectedCenter ? (
                <Tag icon={<EnvironmentOutlined />}>{formatCoordinates(selectedCenter)}</Tag>
              ) : null}
            </div>
          </>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="GPS 리스트가 없습니다." />
        )}
      </div>
    </>
  );
}
