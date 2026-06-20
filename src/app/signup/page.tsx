import type { Metadata } from "next";
import SignupPage from "@/components/signup/SignupPage";

export const metadata: Metadata = {
  title: "회원가입 | ALLCREW Admin",
  description: "ALLCREW 에이전시 회원가입",
};

export default function SignupRoutePage() {
  return <SignupPage />;
}
