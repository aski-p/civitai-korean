"use client"
import Header from "@/components/Header"
import Link from "next/link"
import { useEffect, useState } from "react"
import type { SubAgent, Role } from "@/lib/types"

export default function AgentsPage() {
  const [agents, setAgents] = useState<SubAgent[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [aRes, rRes] = await Promise.all([
        fetch("/api/agents"),
        fetch("/api/roles"),
      ])
      const agents = aRes.ok ? await aRes.json() : []
      const roles = rRes.ok ? await rRes.json() : []
      setAgents(agents)
      setRoles(roles)
    } finally {
      setLoading(false)
    }
  }

  const getRole = (roleId?: string | null) => {
    if (!roleId) return { name: "미지정", icon: "🎭", color: "#6366f1" }
    return roles.find((r: Role) => r.id === roleId) || { name: "알 수 없음", icon: "❓", color: "#6b7280" }
  }

  const filterCounts = {
    all: agents.length,
    active: agents.filter(a => a.status === "active").length,
    busy: agents.filter(a => a.status === "busy").length,
    idle: agents.filter(a => a.status === "idle").length,
    offline: agents.filter(a => a.status === "offline").length,
  }

  const filteredAgents = filter === "all" ? agents : agents.filter(a => a.status === filter)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-medium">에이전트 로딩 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              에이전트 제어실
            </h1>
            <p className="text-slate-500 mt-1">에이전트를 등록하고 상태를 관리하세요</p>
          </div>
          <Link href="/agents/register"
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all active:scale-[0.98]">
            <span className="text-xl group-hover:rotate-90 transition-transform duration-300">+</span>
            신규 등록
          </Link>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {[
            { key: "all", label: "전체", emoji: "🤖", bg: "from-slate-800/80 to-slate-900/80", border: "border-slate-700/50" },
            { key: "active", label: "활성화", emoji: "⚡", bg: "from-emerald-950/50 to-emerald-900/30", border: "border-emerald-700/30" },
            { key: "busy", label: "작업중", emoji: "🔥", bg: "from-amber-950/50 to-amber-900/30", border: "border-amber-700/30" },
            { key: "idle", label: "대기", emoji: "⏸️", bg: "from-blue-950/50 to-blue-900/30", border: "border-blue-700/30" },
            { key: "offline", label: "오프라인", emoji: "💤", bg: "from-red-950/50 to-red-900/30", border: "border-red-700/30" },
          ].map(s => (
            <button
              key={s.key}
              onClick={() => setFilter(s.key)}
              className={`relative overflow-hidden rounded-xl p-4 text-center border ${s.border} bg-gradient-to-br ${s.bg} backdrop-blur-sm transition-all cursor-pointer ${filter === s.key ? "ring-2 ring-indigo-500/60 scale-[1.02]" : "hover:scale-[1.01]"}`}>
              <div className="text-lg mb-0.5">{s.emoji}</div>
              <div className="text-2xl font-extrabold text-white">{filterCounts[s.key as keyof typeof filterCounts]}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </button>
          ))}
        </div>

        {/* Agent grid */}
        {agents.length === 0 ? (
          <div className="text-center py-24 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/50 to-indigo-950/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(129,140,248,0.05),transparent_70%)]" />
            <div className="relative">
              <div className="text-7xl mb-6">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-3">에이전트를 시작하세요</h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">첫 번째 AI 에이전트를 등록하여 자동화 워크플로우를 만들어보세요</p>
              <Link href="/agents/register"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                에이전트 만들기 <span className="text-xl">→</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {filteredAgents.map(agent => {
              const role = getRole(agent.role_id)
              const statusConfig = {
                active: { label: "활성화", dot: "bg-emerald-400", pulse: true, ring: "ring-emerald-400/20" },
                busy: { label: "작업중", dot: "bg-amber-400", pulse: true, ring: "ring-amber-400/20" },
                idle: { label: "대기", dot: "bg-blue-400", pulse: false, ring: "ring-blue-400/20" },
                offline: { label: "오프라인", dot: "bg-slate-500", pulse: false, ring: "ring-slate-500/20" },
              }
              const status = statusConfig[agent.status] || statusConfig.offline

              return (
                <div key={agent.id}
                  className="group relative border border-slate-800 hover:border-indigo-500/40 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/10 bg-gradient-to-b from-slate-900 to-slate-900/80 backdrop-blur-sm">

                  {/* Role accent bar */}
                  <div className="h-1 w-full" style={{ background: `linear-gradient(to right, ${role?.color || "#6366f1"}88, ${role?.color || "#6366f1"}22)` }} />

                  <div className="p-5">
                    {/* Agent identity */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center flex-shrink-0 relative group-hover:scale-105 transition-transform">
                        {agent.avatar_url ? (
                          <img src={agent.avatar_url} alt={agent.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <span className="text-2xl">{role?.icon || "🤖"}</span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white text-lg truncate group-hover:text-indigo-300 transition-colors">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                          <span>{role?.icon}</span>
                          <span className="truncate">{role?.name}</span>
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div className={`flex-shrink-0 w-3 h-3 rounded-full ${status.dot} ring-4 ${status.ring} ${status.pulse ? "animate-pulse" : ""}`} />
                    </div>

                    {/* Description */}
                    {agent.description && (
                      <p className="text-sm text-slate-400 mb-4 line-clamp-2 leading-relaxed">{agent.description}</p>
                    )}

                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-center">
                        <div className="text-sm font-extrabold text-white">{agent.task_count ?? 0}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">작업</div>
                      </div>
                      <div className="rounded-lg bg-slate-800/50 px-3 py-2 text-center">
                        <div className="text-sm font-extrabold text-white">{agent.success_rate ?? "—"}%</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">성공률</div>
                      </div>
                      <div className={`rounded-lg px-3 py-2 text-center ${status.dot === "bg-emerald-400" ? "bg-emerald-950/30" : status.dot === "bg-amber-400" ? "bg-amber-950/30" : status.dot === "bg-blue-400" ? "bg-blue-950/30" : "bg-slate-800/50"}`}>
                        <div className="text-xs font-bold mt-0.5">{status.label}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500">상태</div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/agents/chat/${agent.id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors border border-indigo-500/20">
                        <span>💬</span> 채팅
                      </Link>
                      <button onClick={() => toggleStatus(agent.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all border ${agent.status === "offline" ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"}`}>
                        <span>{agent.status === "offline" ? "▶️" : "⏹️"}</span> {agent.status === "offline" ? "시동" : "정지"}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Summary info */}
        {agents.length > 0 && (
          <div className="text-center pb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-sm text-slate-400">
              <span>{agents.length}개 에이전트</span>
              <span className="text-slate-600">•</span>
              <span>{filter === "all" ? "전체 보기" : `${filterCounts[filter as keyof typeof filterCounts]}개 필터}`}</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

async function toggleStatus(agentId: string) {
  try {
    await fetch("/api/agents", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: agentId, status: "offline" }),
    })
    location.reload()
  } catch (err) {
    console.error("상태 변경 실패:", err)
  }
}
