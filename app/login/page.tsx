"use client"
import Header from "@/components/Header"
import AvatarCreator from "@/components/AvatarCreator"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import type { AvatarConfig } from "@/lib/types"

type Step = 1 | 2 | 3  // OAuth select → Avatar setup → Nickname + finalize

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [nickname, setNickname] = useState("")
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session?.user) {
        router.push("/")
      }
    })
  }, [router])

  const handleOAuthLogin = async (provider: "google" | "github" | "discord") => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) console.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarSave = (config: AvatarConfig) => {
    setAvatarConfig(config)
  }

  const handleSubmit = async () => {
    if (!nickname.trim() || !avatarConfig) return
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { nickname, avatar_config: avatarConfig } as any
      })
      
      if (error) throw error
      
      // Create/update profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data?.user?.id,
        nickname,
        avatar_config: avatarConfig,
        points: 0,
      })
      
      if (profileError && profileError.code !== "23505") {
        console.error("Profile error:", profileError)
      }
      
      router.push("/")
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-10">
          {["계정 선택", "아바타 만들기", "닉네임 설정"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step > i ? "bg-green-500 text-white" : step === i + 1 ? "bg-purple-600 text-white scale-110 shadow-lg" : "bg-slate-200 text-slate-500"
              }`}>
                {step > i ? "✓" : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${step === i + 1 ? "text-purple-600" : "text-slate-400"}`}>
                {label}
              </span>
              {i < 2 && <div className="w-8 h-0.5 bg-slate-200 hidden sm:block" />}
            </div>
          ))}
        </div>

        {/* Step 1: Choose provider */}
        {step === 1 && (
          <div className="text-center max-w-md mx-auto">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-3">환영합니다! 👋</h1>
            <p className="text-slate-500 mb-8">계정을 선택하고 나만의 아바타를 만들어보세요</p>
            
            <div className="space-y-3">
              {[
                { id: "google", label: "Google로 시작하기", color: "bg-white hover:bg-slate-50 border-slate-200", icon: `<svg class="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>` },
                { id: "github", label: "GitHub로 시작하기", color: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900", icon: `<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.419-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .319.21.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>` },
                { id: "discord", label: "Discord로 시작하기", color: "bg-[#5865F2] hover:bg-[#4752c4] text-white border-transparent", icon: `🎮` },
              ].map(p => (
                <button key={p.id} onClick={() => { setStep(2); /* OAuth redirect triggers step 2 after return */ }}
                  className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border-2 font-semibold transition-all hover:shadow-lg ${p.color}`}>
                  <span dangerouslySetInnerHTML={{ __html: p.icon }} />
                  {p.label}
                </button>
              ))}
            </div>
            
            <p className="text-xs text-slate-400 mt-6">계정 선택 시 이용약관과 개인정보처리방침에 동의하는 것입니다</p>
          </div>
        )}

        {/* Step 2: Avatar creation */}
        {step === 2 && (
          <div>
            <h1 className="text-center text-2xl font-extrabold text-slate-900 mb-6">나만의 아바타를 만들어보세요! 🎨</h1>
            <AvatarCreator onSave={handleAvatarSave} />
            {avatarConfig && (
              <div className="text-center mt-6">
                <button onClick={() => setStep(3)}
                  className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg">
                  다음 단계 → 
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Nickname + finish */}
        {step === 3 && (
          <div className="max-w-md mx-auto text-center">
            <h1 className="text-2xl font-extrabold text-slate-900 mb-6">마지막 단계! ✨</h1>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-5xl font-bold mb-6 shadow-xl">
                {nickname[0]?.toUpperCase() || "?"}
              </div>
              
              <label className="block text-sm font-medium text-slate-600 mb-2">닉네임</label>
              <input value={nickname} onChange={e => setNickname(e.target.value)}
                placeholder="예: 김팀장, AI마스터..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-500 outline-none text-center text-lg font-medium mb-6"
                maxLength={16}
              />
              
              <button onClick={handleSubmit} disabled={!nickname.trim() || loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold text-lg 
                  hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
                {loading ? "가입 중..." : "🚀 크리에이타이 시작하기!"}
              </button>
              
              <button onClick={() => setStep(2)} className="text-slate-400 hover:text-purple-600 text-sm mt-4 block mx-auto">
                ← 아바타 다시 수정하기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
