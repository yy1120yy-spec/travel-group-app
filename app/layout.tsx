import type { Metadata } from "next";
import ThemeProvider from "@/components/common/ThemeProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "여행메이트 - 함께 만드는 여행 일정",
  description: "여행 그룹을 위한 일정 관리, 투표, 공지사항, 메뉴 체크 서비스",
  keywords: ["여행", "일정 관리", "그룹 여행", "투표", "여행 플래너"],
  authors: [{ name: "Travel Group App" }],
  openGraph: {
    title: "여행메이트",
    description: "함께 만드는 여행 일정",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
