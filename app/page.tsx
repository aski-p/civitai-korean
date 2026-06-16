import Header from "@/components/Header"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
            한국어 AI 창작 플랫폼
            <span className="block bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              크리에이타이
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 leading-relaxed">
            AI로 이미지를 만들고, 공유하고, 즐기는 커뮤니티<br />
            나만의 아바타를 커스터마이징하고 크리에이터로 활동하세요!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" 
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-4 rounded-2xl text-lg font-bold 
                hover:shadow-xl hover:scale-105 transition-all shadow-lg">
              🎨 무료로 시작하기
            </Link>
            <Link href="/images"
              className="bg-white text-purple-600 border-2 border-purple-200 px-8 py-4 rounded-2xl text-lg font-bold 
                hover:border-purple-400 hover:shadow-lg transition-all">
              🖼️ 이미지 감상하기
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mb-12">
          {[["🖼️", "0+", "이미지"], ["👤", "곧 개시", "사용자"], ["🏆", "5개 계급", "랭킹"]].map(([emoji, val, label]) => (
            <div key={String(label)} className="text-center bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-bold text-slate-900">{val}</div>
              <div className="text-xs text-slate-500">{label}</div>
            </div>
          ))}
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { emoji: "🎭", title: "나만의 아바타", desc: "눈, 코, 입, 옷을 커스터마이징할 수 있어요" },
            { emoji: "🖼️", title: "이미지 갤러리", desc: "동물, 사람, 사물 카테고리로 탐색해요" },
            { emoji: "🏆", title: "랭킹 시스템", desc: "포인트로 계급을 올리세요!" },
          ].map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
