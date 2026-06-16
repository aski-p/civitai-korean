import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "크리에이타이 | 한국형 AI 창작 플랫폼",
  description: "AI 이미지를 만들고 공유하는 커뮤니티",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">{children}</body>
    </html>
  )
}
