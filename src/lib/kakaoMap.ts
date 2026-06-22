export type KakaoLatLng = {
  latitude: number;
  longitude: number;
};

type KakaoMapsEvent = {
  addListener: (target: unknown, type: string, handler: (event: { latLng: KakaoMapLatLng }) => void) => void;
};

type KakaoMapLatLng = {
  getLat: () => number;
  getLng: () => number;
};

type KakaoMapInstance = {
  setCenter: (latLng: KakaoMapLatLng) => void;
  setLevel: (level: number) => void;
};

type KakaoMarker = {
  setMap: (map: KakaoMapInstance | null) => void;
  setPosition: (latLng: KakaoMapLatLng) => void;
};

type KakaoCircle = {
  setMap: (map: KakaoMapInstance | null) => void;
  setPosition: (latLng: KakaoMapLatLng) => void;
};

type KakaoGeocoderResult = {
  x: string;
  y: string;
};

type KakaoMapsNamespace = {
  load: (callback: () => void) => void;
  Map: new (container: HTMLElement, options: { center: KakaoMapLatLng; level: number }) => KakaoMapInstance;
  LatLng: new (lat: number, lng: number) => KakaoMapLatLng;
  Marker: new (options: { map?: KakaoMapInstance; position: KakaoMapLatLng }) => KakaoMarker;
  Circle: new (options: {
    center: KakaoMapLatLng;
    radius: number;
    strokeWeight: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeStyle: string;
    fillColor: string;
    fillOpacity: number;
  }) => KakaoCircle;
  event: KakaoMapsEvent;
  services: {
    Geocoder: new () => {
      addressSearch: (
        address: string,
        callback: (result: KakaoGeocoderResult[], status: string) => void,
      ) => void;
    };
    Status: {
      OK: string;
    };
  };
};

type KakaoNamespace = {
  maps: KakaoMapsNamespace;
};

declare global {
  interface Window {
    kakao?: KakaoNamespace;
  }
}

const DEFAULT_CENTER: KakaoLatLng = {
  latitude: 37.5665,
  longitude: 126.978,
};

const KAKAO_MAP_SCRIPT = "https://dapi.kakao.com/v2/maps/sdk.js";

function getKakaoMapAppKey() {
  return process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY?.trim() ?? "";
}

export function loadKakaoMap(libraries = "services"): Promise<KakaoNamespace> {
  const appKey = getKakaoMapAppKey();
  if (!appKey) {
    return Promise.reject(new Error("카카오 지도 API 키가 설정되지 않았습니다."));
  }

  const initKakao = () =>
    new Promise<KakaoNamespace>((resolve, reject) => {
      if (!window.kakao?.maps) {
        reject(new Error("카카오 지도 SDK를 불러오지 못했습니다."));
        return;
      }

      window.kakao.maps.load(() => {
        if (!window.kakao?.maps) {
          reject(new Error("카카오 지도 SDK를 초기화하지 못했습니다."));
          return;
        }
        resolve(window.kakao);
      });
    });

  if (window.kakao?.maps) {
    return initKakao();
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-kakao-map="true"]');

    const handleLoad = () => {
      initKakao().then(resolve).catch(reject);
    };

    if (existing) {
      existing.addEventListener("load", handleLoad, { once: true });
      if (window.kakao?.maps) {
        handleLoad();
      }
      return;
    }

    const script = document.createElement("script");
    script.src = `${KAKAO_MAP_SCRIPT}?appkey=${appKey}&autoload=false&libraries=${libraries}`;
    script.async = true;
    script.dataset.kakaoMap = "true";
    script.onload = handleLoad;
    script.onerror = () => reject(new Error("카카오 지도 SDK 로드에 실패했습니다."));
    document.head.appendChild(script);
  });
}

export async function geocodeAddress(address: string): Promise<KakaoLatLng | null> {
  const trimmed = address.trim();
  if (!trimmed) return null;

  const kakao = await loadKakaoMap("services");
  const geocoder = new kakao.maps.services.Geocoder();

  return new Promise((resolve) => {
    geocoder.addressSearch(trimmed, (result, status) => {
      if (status !== kakao.maps.services.Status.OK || result.length === 0) {
        resolve(null);
        return;
      }

      resolve({
        latitude: Number(result[0].y),
        longitude: Number(result[0].x),
      });
    });
  });
}

export function getDefaultMapCenter() {
  return DEFAULT_CENTER;
}

export type ProjectMapHandle = {
  setCenter: (center: KakaoLatLng) => void;
};

type CreateProjectMapOptions = {
  container: HTMLElement;
  center: KakaoLatLng;
  radius?: number;
  interactive?: boolean;
  level?: number;
  onLocationSelect?: (center: KakaoLatLng) => void;
};

export async function createProjectMap({
  container,
  center,
  radius = 100,
  interactive = false,
  level = 3,
  onLocationSelect,
}: CreateProjectMapOptions) {
  const kakao = await loadKakaoMap("services");
  const position = new kakao.maps.LatLng(center.latitude, center.longitude);
  const map = new kakao.maps.Map(container, { center: position, level });
  const marker = new kakao.maps.Marker({ map, position });
  const circle = new kakao.maps.Circle({
    center: position,
    radius,
    strokeWeight: 2,
    strokeColor: "#1677ff",
    strokeOpacity: 0.8,
    strokeStyle: "solid",
    fillColor: "#1677ff",
    fillOpacity: 0.12,
  });
  circle.setMap(map);

  const updatePosition = (next: KakaoLatLng) => {
    const latLng = new kakao.maps.LatLng(next.latitude, next.longitude);
    map.setCenter(latLng);
    marker.setPosition(latLng);
    circle.setPosition(latLng);
  };

  if (interactive && onLocationSelect) {
    kakao.maps.event.addListener(map, "click", (mouseEvent) => {
      const latLng = mouseEvent.latLng;
      const next = {
        latitude: latLng.getLat(),
        longitude: latLng.getLng(),
      };
      updatePosition(next);
      onLocationSelect(next);
    });
  }

  return {
    setCenter: updatePosition,
  };
}
