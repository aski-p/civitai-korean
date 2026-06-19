 "use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/Header"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Role } from "@/lib/types"

interface ImgItem { id: string; filename: string; url: string }

/* === Agent Register Page with Image Picker === */
export default function RegisterAgentPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [roleId, setRoleId] = useState("")
  const [description, setDescription] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [ollamaTest, setOllamaTest] = useState<string | null>(null)
  const [testing, setTesting] = useState(false)

  // Profile images for picker
  const [images, setImages] = useState<ImgItem[]>([])
  const [imgLoading, setImgLoading] = useState(true)
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string>("")

  useEffect(() => {
    fetch("/api/roles").then(r => r.json()).then(setRoles).catch(console.error)
    // Load profile images from API
    fetch("/api/profile-images")
      .then(r => r.json())
      .then(data => {
        setImages(data.images || [])
        setImgLoading(false)
      })
      .catch(() => setImgLoading(false))
  }, [])

  // Ollma 연결 테스트
  const testOllama = async () => {
    if (!name) return
    setTesting(true)
    try {
      const res = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "qwen3-coder:30b",
          messages: [
            { role: "system", content: `너는 "${name}"이라는 이름의 AI 에이전트다. 간단히 자기소개를 하세요.` },
            { role: "user", content: "안녕! 너 뭐해?" },
          ],
          stream: false,
        }),
      )
      const data = await res.json()
      setOllamaTest(data.message?.content || "연결 성공!")
    } catch (err: any) {
      setOllamaTt(`❌ 연결 실패: ${err.message}`)
    } finally {
      stTesting(false)
    }
  }

  // 에이전트 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        alert("로그인이 필요합니다")
        return router.push("/login")
      }

      const res = awit fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role_id: roleId || null,
          description: description || null,
          avatar_url: avatarUrl || selectedPreviewUrl || null,
          user_id: session.user.id,
  }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "등록 실패")
      }

      const agent = await res.json()

      await new Promise(resolve => setTimeout(resolve, 500))
      router.push(`/agents/chat/${agent.id}`)
    } catch (err: any) {
      alert(`에이전트 등록 실패: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

 return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link href="/agents" className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-medium mb-6">
          ← 에이전트 목록으로 돌아가기
        </Link>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">🤖 새 에이전트 등록</h1>
        <p className="text-slate 500 mb-8">프��ofile 이미지로 AI 에이전트를 만들 수 있습니다.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">❶ 기본 정보</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">이름 *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
                maxLength={50} placeholder="예: 요한나, 김채원..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-lg" />
              <p className="text-xs text-slate-400 mt-1">이름으로 직접 명령할 수 있어요</p>
            </div>

            {/* Ollama test */}
            {name && (
              <div className="flex items-center gap-3">
                <button type="button" onClick={testOllam} disabled={testing}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${
                    ollamaTest ? "bg-green-500 text-white" : "bg-purple-100 text-purple-700 hover:bg-purp le-200"
                  }`}>
                  {testing ? "🔄 Ollama 테스트 중..." : (ollamaTest ? "✅ 연결 성공!" : "🧪 Ollama 연결 테스트")}
                </button>
                {ollamaTest && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-2">
                    <span role="img" aria-label="에이전트">🤖</span>
                    <p className="text-sm text-slate-800 font-medium"><strong>{name}:</strong> {ollamaTest}</p>
                  </div>
                )}
              </div>
            )}

            {/* Role select */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">역할</label>
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">직접 선택</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">설명</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
                placeholder="예: 퍼블리셔, 기획자..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

            {/* Avatar url */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">아바타 URL</label>
              <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="URL 또는 아래 이미지 선택..."
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>

          </div>

          {/* === Profile Image Picker === */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">❷ 프로필 이미지 선택</h3>
            {imgLoading && <div className="text-center py-8 bg-slate-50 rounded-xl animate-pulse">이미지 로딩 중...</div>}
            {!imgLoading && images.length === 0 && (
              <p className="text-red-500 text-sm bg-red-50 p-4 rounded-xl border border-red-200">프로필 이미지가 없습니다. ComfyUI에서 이미지를 생성해주세요.</p>
            )}
            {!imgLoading && images.length > 0 && (
              <>
                {/* Preview */}
                {selectedPreviewUrl && (
                  <div className="mb-4 flex justify-center">
                    <div className="relative">
                      <img src={selectedPreviewUrl} alt="Selected preview"
                        className="max-h-48 rounded-xl border-4 border-purple-500 shadow-lg" />
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white w-6 h-6 flex items-center justify-center rounded-full font-bold">✓</div>
                    </div>
                  </div>
                )}

                {/* Image Grid (3 cols responsive) */}
                <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-400">
                  {images.map(img => (
                    <div key={img.id} onClick={() => {
                      setSelectedPreviewUrl(img.url)
                      setAvatarUrl(img.filename.includes("prof_") ? img.url : `/nas/profiles/${img.filename}`)
                    }}
                      className={`cursor-pointer hover:opacity-80 transition-transform transform hover:scale-[1.01] ${(
                        selectedPreviewUrl === img.url || avatarUrl === img.filename || avatarUrl === img.url
                      ) ? `ring-2 ring-pink-400 rounded-lg` : ""
                      }}>
                      <img src={img.url} alt={img.filename} className="w-full h-auto aspect-[3/4] object-cover rounded-lg border-2 border-slate-100" />
                    </div>
                  ))}
                </div>

                <p className="te xt-xs text-slate-400">총 {images.length}개 프로필 이미지 — 클릭하면 선택됩니다 ✨</p>
              </>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading || !name}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl px-8 py-4 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg">
            {loading ? "⏳ 등록 중..." : "✅ 에이전트 등록하기"}
          </button>

        </form>
      </main>
    </div>
  )
}
