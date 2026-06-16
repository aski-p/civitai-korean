"use client"
import { useState, useRef, useEffect } from "react"

const DEFAULT_CONFIG = {
  eyes: "기본 눈", mouth: "기본 입", nose: "기본 코",
  hair: "짧은 머리", clothing: "티셔츠",
  skinColor: "#FDBCB4", hairColor: "#2d1b69", clothesColor: "#6366f1"
}

const EYES = ["기본 눈", "웃는 눈", "큰 눈", "샤넬 눈"]
const NOSE = ["기본 코", "점잔 코", "큰 코", "작은 코"]
const MOUTH_OPT = ["기본 입", "웃는 입", "작은 미소", "열린 입"]
const HAIR_OPT = ["짧은 머리", "긴 머리", "곱슬 머리", "말라버린 머리"]
const CLOTH_OPT = ["티셔츠", "정장 셔츠", "후드", "자켓"]

function OptionGroup({ title, options, value, onChange }: {
  title: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <label className="text-sm font-semibold text-slate-600 mb-2 block">{title}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(opt => (
          <button key={opt} onClick={() => onChange(opt)}
            className={value === opt ? "px-3 py-1.5 rounded-lg text-sm bg-purple-600 text-white shadow" : "px-3 py-1.5 rounded-lg text-sm bg-slate-100 hover:bg-slate-200"}>
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ColorPicker({ title, color, onSelect }: {
  title: string; color: string; onSelect: (c: string) => void
}) {
  const palette = title === "피부톤" ? ["#FDBCB4","#e8bbad","#c68642","#704214"]
    : title === "머리색" ? ["#2d1b69","#3e2723","#f0c808","#ef4444"]
    : ["#6366f1","#ef4444","#22c55e","#3b82f6"]

  return (
    <div>
      <span className="text-xs text-slate-500">{title}</span>
      <div className="flex gap-1 mt-1">
        {palette.map(c => (
          <button key={c} onClick={() => onSelect(c)}
            className={color === c ? "w-7 h-7 rounded-full border-2 border-purple-600 scale-110" : "w-7 h-7 rounded-full border-2 border-transparent hover:scale-105"}
            style={{ backgroundColor: c }} />
        ))}
      </div>
    </div>
  )
}

function drawAvatar(ctx: CanvasRenderingContext2D, cfg: typeof DEFAULT_CONFIG) {
  ctx.clearRect(0, 0, 256, 256)
  const grad = ctx.createLinearGradient(0, 0, 0, 256)
  grad.addColorStop(0, "#87CEEB")
  grad.addColorStop(1, "#E0F7FA")
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 256, 256)

  ctx.fillStyle = "#8BC34A"
  ctx.beginPath()
  ctx.ellipse(128, 240, 120, 30, 0, 0, Math.PI * 2)
  ctx.fill()

  const cx = 128, cy = 105

  // Body
  ctx.fillStyle = cfg.clothesColor
  ctx.beginPath()
  ctx.moveTo(cx - 45, 170)
  ctx.quadraticCurveTo(cx, 230, cx + 45, 170)
  ctx.lineTo(cx + 35, 140)
  ctx.lineTo(cx - 35, 140)
  ctx.closePath()
  ctx.fill()

  if (cfg.clothing === "정장 셔츠") {
    ctx.fillStyle = "#fff"
    ctx.beginPath()
    ctx.moveTo(cx, 225); ctx.lineTo(cx - 10, 140); ctx.lineTo(cx + 10, 140)
    ctx.closePath(); ctx.fill()
  } else if (cfg.clothing === "후드") {
    ctx.fillStyle = cfg.clothesColor
    ctx.beginPath()
    ctx.moveTo(cx - 50, 135); ctx.quadraticCurveTo(cx - 30, 80, cx, 75)
    ctx.quadraticCurveTo(cx + 30, 80, cx + 50, 135)
    ctx.fill()
  } else if (cfg.clothing === "자켓") {
    ctx.strokeStyle = "#000"; ctx.lineWidth = 2
    ctx.beginPath(); ctx.moveTo(cx - 45, 170); ctx.lineTo(cx - 38, 136)
    ctx.stroke()
  }

  ctx.fillStyle = cfg.skinColor
  ctx.fillRect(cx - 12, 132, 24, 18)
  ctx.beginPath()
  ctx.ellipse(cx, cy, 52, 58, 0, 0, Math.PI * 2)
  ctx.fill()

  // Hair
  ctx.fillStyle = cfg.hairColor
  if (cfg.hair === "긴 머리") {
    ctx.beginPath(); ctx.ellipse(cx, cy - 18, 56, 42, 0, Math.PI, Math.PI * 2); ctx.fill()
    ctx.fillRect(cx - 56, cy - 18, 24, 70)
    ctx.fillRect(cx + 32, cy - 18, 24, 70)
  } else if (cfg.hair === "곱슬 머리") {
    for (let a = Math.PI; a < Math.PI * 2; a += 0.6) {
      ctx.beginPath()
      ctx.arc(cx + 53 * Math.cos(a), cy - 15 + 40 * Math.sin(a), 18, 0, Math.PI * 2)
      ctx.fill()
    }
  } else if (cfg.hair === "말라버린 머리") {
    ctx.beginPath()
    ctx.moveTo(cx - 56, cy - 20); ctx.lineTo(cx - 45, cy - 65)
    ctx.lineTo(cx, cy - 70); ctx.lineTo(cx + 45, cy - 65)
    ctx.quadraticCurveTo(cx, cy - 55, cx - 56, cy - 20)
    ctx.fill()
  } else {
    ctx.beginPath(); ctx.ellipse(cx, cy - 18, 54, 32, 0, Math.PI, Math.PI * 2); ctx.fill()
  }

  // Eyes
  const ey = cy - 5
  if (cfg.eyes === "웃는 눈") {
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 3
    ctx.beginPath(); ctx.arc(cx - 18, ey, 10, 0, Math.PI); ctx.stroke()
    ctx.beginPath(); ctx.arc(cx + 18, ey, 10, 0, Math.PI); ctx.stroke()
  } else if (cfg.eyes === "큰 눈") {
    ctx.fillStyle = "#fff"
    ctx.beginPath(); ctx.ellipse(cx - 16, ey, 14, 17, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse(cx + 16, ey, 14, 17, 0, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "#2d5be3"
    ctx.beginPath(); ctx.arc(cx - 16, ey + 2, 9, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx + 16, ey + 2, 9, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = "#000"
    ctx.beginPath(); ctx.arc(cx - 16, ey + 2, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx + 16, ey + 2, 5, 0, Math.PI * 2); ctx.fill()
  } else if (cfg.eyes === "샤넬 눈") {
    ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 3
    ctx.beginPath(); ctx.moveTo(cx - 28, ey); ctx.lineTo(cx - 8, ey); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(cx + 8, ey); ctx.lineTo(cx + 28, ey); ctx.stroke()
  } else {
    ctx.fillStyle = "#000"
    ctx.beginPath(); ctx.arc(cx - 16, ey, 5, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx + 16, ey, 5, 0, Math.PI * 2); ctx.fill()
  }

  // Nose
  if (cfg.nose === "점잔 코") {
    ctx.fillStyle = "#e8a090"
    ctx.beginPath(); ctx.arc(cx, cy + 12, 3, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.strokeStyle = "#c49a8b"; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(cx, cy + 10, 4, 0.3, Math.PI - 0.3); ctx.stroke()
  }

  // Mouth
  const my = cy + 28
  if (cfg.mouth === "웃는 입") {
    ctx.strokeStyle = "#c62828"; ctx.lineWidth = 2.5
    ctx.beginPath(); ctx.arc(cx, my - 4, 14, 0.15, Math.PI - 0.15); ctx.stroke()
  } else if (cfg.mouth === "열린 입") {
    ctx.fillStyle = "#c62828"
    ctx.beginPath(); ctx.ellipse(cx, my + 3, 10, 6, 0, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.strokeStyle = "#c62828"; ctx.lineWidth = 2
    ctx.beginPath(); ctx.arc(cx, my + 1, 9, 0.1, Math.PI - 0.1); ctx.stroke()
  }

  // Blush
  ctx.fillStyle = "rgba(255, 138, 128, 0.3)"
  ctx.beginPath(); ctx.ellipse(cx - 32, cy + 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill()
  ctx.beginPath(); ctx.ellipse(cx + 32, cy + 12, 12, 7, 0, 0, Math.PI * 2); ctx.fill()

  // Sparkles
  const t = Date.now() / 500
  for (let i = 0; i < 3; i++) {
    const sx = 40 + Math.sin(t + i * 2.1) * 80 + i * 25
    const sy = 30 + Math.cos(t * 1.3 + i) * 20
    ctx.fillStyle = "rgba(255, 255, 200, 0.6)"
    for (let p = 0; p < 4; p++) {
      const a = (p / 4) * Math.PI * 2
      ctx.lineTo(sx + Math.cos(a) * 5, sy + Math.sin(a) * 5)
    }
  }
}

export default function AvatarCreator({ onSave }: { onSave: (cfg: typeof DEFAULT_CONFIG) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [cfg, setCfg] = useState(DEFAULT_CONFIG)
  const key = useRef(0).current
  const prevKey = useRef(0)

  useEffect(() => {
    if (prevKey.current === key) return
    prevKey.current = key
    const c = canvasRef.current
    if (!c) return
    const ctx = c.getContext("2d")
    if (!ctx) return
    drawAvatar(ctx, cfg)
  }, [cfg])

  const setField = (f: string, v: string) => {
    prevKey.current++
    setCfg(p => ({ ...p, [f]: v }))
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start w-full">
      <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
        <h3 className="text-center text-sm font-bold text-slate-500 mb-4">아바타 미리보기</h3>
        <canvas ref={canvasRef} width="256" height="256" className="rounded-full border-4 border-slate-200" />
        <button onClick={() => onSave(cfg)}
          className="mt-6 w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition">
          이 아바타로 완료
        </button>
      </div>

      <div className="flex-1 space-y-4 w-full max-w-md mx-auto lg:mx-0">
        <h3 className="text-lg font-bold text-slate-700 mb-2">⚙️ 커스터마이징</h3>

        <OptionGroup title="👁 눈" options={EYES} value={cfg.eyes} onChange={v => setField("eyes", v)} />
        <OptionGroup title="👃 코" options={NOSE} value={cfg.nose} onChange={v => setField("nose", v)} />
        <OptionGroup title="👄 입" options={MOUTH_OPT} value={cfg.mouth} onChange={v => setField("mouth", v)} />
        <OptionGroup title="💇 머리" options={HAIR_OPT} value={cfg.hair} onChange={v => setField("hair", v)} />
        <OptionGroup title="👕 옷" options={CLOTH_OPT} value={cfg.clothing} onChange={v => setField("clothing", v)} />

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <label className="text-sm font-semibold text-slate-600 mb-2 block">🎨 색상</label>
          <div className="grid grid-cols-3 gap-4">
            <ColorPicker title="피부톤" color={cfg.skinColor} onSelect={v => setField("skinColor", v)} />
            <ColorPicker title="머리색" color={cfg.hairColor} onSelect={v => setField("hairColor", v)} />
            <ColorPicker title="옷색" color={cfg.clothesColor} onSelect={v => setField("clothesColor", v)} />
          </div>
        </div>
      </div>
    </div>
  )
}
