import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// --- @を使わない書き方に修正 ---
import { AuthProvider } from "../firebase/AuthProvider"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "美術授業支援アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
