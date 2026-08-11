import type { Metadata } from "next";
import "./globals.css";
import { APP_TITLE } from "@/lib/class-config";

export const metadata: Metadata = {
  title: APP_TITLE,
  description: `${APP_TITLE} 프로그램`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
