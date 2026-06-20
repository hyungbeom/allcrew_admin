type DaumPostcodeData = {
  userSelectedType: "R" | "J";
  roadAddress: string;
  jibunAddress: string;
};

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void };
    };
  }
}

const DAUM_POSTCODE_SCRIPT = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";

function runPostcode(onComplete: (address: string) => void) {
  new window.daum!.Postcode({
    oncomplete(data) {
      const address = data.userSelectedType === "R" ? data.roadAddress : data.jibunAddress;
      onComplete(address);
    },
  }).open();
}

export function openDaumPostcode(onComplete: (address: string) => void) {
  if (window.daum?.Postcode) {
    runPostcode(onComplete);
    return;
  }

  const existing = document.querySelector<HTMLScriptElement>('script[data-daum-postcode="true"]');

  if (existing) {
    existing.addEventListener("load", () => runPostcode(onComplete), { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = DAUM_POSTCODE_SCRIPT;
  script.async = true;
  script.dataset.daumPostcode = "true";
  script.onload = () => runPostcode(onComplete);
  document.head.appendChild(script);
}
