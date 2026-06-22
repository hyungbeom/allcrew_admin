"use client";

import { App, Button, Empty, Spin } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { socialLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import {
  getSocialRedirectUri,
  type SocialProvider,
} from "@/lib/auth/socialLogin";
import { companyPath } from "@/lib/companyPaths";

type PageProps = {
  params: Promise<{ provider: string }>;
};

const PROVIDERS: SocialProvider[] = ["kakao", "google", "apple"];

function isSocialProvider(value: string): value is SocialProvider {
  return PROVIDERS.includes(value as SocialProvider);
}

export default function SocialOAuthCallbackPage({ params }: PageProps) {
  const router = useRouter();
  const { message } = App.useApp();
  const [provider, setProvider] = useState<SocialProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const resolvedParams = await params;
      const resolvedProvider = resolvedParams.provider;

      if (!isSocialProvider(resolvedProvider)) {
        setErrorMessage("지원하지 않는 SNS 로그인입니다.");
        return;
      }

      setProvider(resolvedProvider);

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const oauthError = searchParams.get("error");

      if (oauthError) {
        setErrorMessage("SNS 로그인이 취소되었습니다.");
        return;
      }

      if (!code) {
        setErrorMessage("인증 코드를 받지 못했습니다.");
        return;
      }

      try {
        const auth = await socialLogin(resolvedProvider, code, getSocialRedirectUri(resolvedProvider));
        if (cancelled) return;

        message.success("로그인되었습니다.");
        const slug = auth.member.companySlug;
        if (!slug) {
          setErrorMessage("업체 정보를 불러올 수 없습니다. 관리자에게 문의해 주세요.");
          return;
        }

        router.replace(companyPath(slug, "dashboard"));
      } catch (error) {
        if (cancelled) return;
        const nextMessage =
          error instanceof ApiError ? error.message : "SNS 로그인에 실패했습니다.";
        setErrorMessage(nextMessage);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [message, params, router]);

  if (errorMessage) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <Empty description={errorMessage}>
          <Link href="/login">
            <Button type="primary">로그인으로 돌아가기</Button>
          </Link>
        </Empty>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Spin size="large" tip={provider ? `${provider} 로그인 처리 중...` : "로그인 처리 중..."} />
    </div>
  );
}
