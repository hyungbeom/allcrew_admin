import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import AntdProvider from "@/components/providers/AntdProvider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ALLCREW Admin",
  description: "ALLCREW 관리자 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKr.variable}>
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  );
}
