import type { Metadata } from "next";
import LoginPage from "@/components/login/LoginPage";

export const metadata: Metadata = {
  title: "로그인 | ALLCREW Admin",
  description: "ALLCREW 관리자 로그인",
};

export default function LoginRoutePage() {
  return <LoginPage />;
}
