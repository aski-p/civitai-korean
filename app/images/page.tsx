"use client"
import Header from "@/components/Header"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { ImageItem, Comment } from "@/lib/types"

const EMOJI_REACTIONS = ["🔥", "❤️", "😂", "😮"]

export default function ImagesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [images, setImages] = useState<ImageItem[]>([])
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  
  // Mock images for demo until R2 + DB are live
  useEffect(() => {
    const mock: ImageItem[] = [
      { id: "1", user_id: "", nickname: "AI마스터", category: "person", url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=600&fit=crop", title: "한복 입힌 AI 캐릭터", likes: 42, reactions: { "🔥": 12, "❤️": 23, "😂": 5, "😮": 2 }, comment_count: 8, created_at: "2026-06-17T01:00:00Z" },
      { id: "2", user_id: "", nickname: "도그러버", category: "animal", url: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&h=600&fit=crop", title: "AI로 본 금뺀이", likes: 31, reactions: { "🔥": 8, "❤️": 15, "😂": 4, "😮": 4 }, comment_count: 3, created_at: "2026-06-17T02:00:00Z" },
      { id: "3", user_id: "", nickname: "크리에이터", category: "object", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=600&fit=crop", title: "AI로 그린 왕관", likes: 19, reactions: { "🔥": 5, "❤️": 8, "😂": 2, "😮": 4 }, comment_count: 5, created_at: "2026-06-17T03:00:00Z" },
      { id: "4", user_id: "", nickname: "펫러버", category: "animal", url: "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=600&fit=crop", title: "AI 고양이 판타지", likes: 57, reactions: { "🔥": 20, "❤️": 25, "😂": 8, "😮": 4 }, comment_count: 12, created_at: "2026-06-17T04:00:00Z" },
      { id: "5", user_id: "", nickname: "아티스트92", category: "person", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=600&fit=crop", title: "판타지 화보", likes: 88, reactions: { "🔥": 35, "❤️": 40, "😂": 7, "😮": 6 }, comment_count: 21, created_at: "2026-06-17T05:00:00Z" },
      { id: "6", user_id: "", nickname: "사이언스", category: "object", url: "https://images.unsplash.com/photo-1614730321144-b9cf24bd0a29?w=600&h=600&fit=crop", title: "AI 우주 배경", likes: 24, reactions: { "🔥": 7, "❤️": 10, "😂": 1, "😮": 6 }, comment_count: 4, created_at: "2026-06-17T05:30:00Z" },
    ]
    setImages(mock)
  }, [])

  const filtered = activeCategory === "all" ? images : images.filter(i => i.category === activeCategory)
  const categoryEmojis: Record<string, string> = { all: "✨", animal: "🐾", person: "👤", object: "🔮" }
  const categoryLabels: Record<string, string> = { all: "전체", animal: "동물", person: "사람", object: "사물" }

  const handleReaction = (id: string, emoji: string) => {
    setImages(prev => prev.map(img => {
      if (img.id !== id) return img
      const newReactions = { ...img.reactions, [emoji]: (img.reactions[emoji] || 0) + 1 }
      return { ...img, reactions: newReactions }
    }))
  }

  const handleLike = (id: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, likes: img.likes + 1 } : img))
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">🖼️ 이미지 갤러리</h1>
        
        {/* Category tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button key={key} onClick={() => setActiveCategory(key)}
              className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                activeCategory === key 
                  ? "bg-purple-600 text-white shadow-md scale-105" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}>
              {categoryEmojis[key]} {label} ({key === "all" ? images.length : images.filter(i => i.category === key).length})
            </button>
          ))}
        </div>
        
        {/* Image grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">아직 이미지가 없어요</h3>
            <p className="text-slate-500">첫 번째 이미지를 업로드해보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(img => (
              <div key={img.id} 
                onClick={() => setSelectedImage(img)}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1">
                {/* Thumbnail */}
                <div className="relative aspect-square overflow-hidden">
                  <img src={img.url} alt={img.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs">
                    {categoryEmojis[img.category]} {categoryLabels[img.category]}
                  </div>
                </div>
                
                {/* Meta */}
                <div className="p-4">
                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-1">{img.title}</h3>
                  
                  <div className="flex items-center gap-1 mb-3">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center text-[10px] font-bold">
                      {img.nickname[0]}
                    </div>
                    <span className="text-xs text-slate-500">{img.nickname}</span>
                  </div>
                  
                  {/* Reactions summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {EMOJI_REACTIONS.map(e => img.reactions[e] ? (
                        <span key={e} className="text-sm">{e}{img.reactions[e]}</span>
                      ) : null)}
                    </div>
                    <span className="text-xs text-slate-400">💬 {img.comment_count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Image detail modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" 
            onClick={e => e.stopPropagation()}>
            
            {/* Image */}
            <div className="relative">
              <img src={selectedImage.url} alt={selectedImage.title} 
                className="w-full aspect-video object-cover rounded-t-2xl" />
              <button onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70">
                ✕
              </button>
            </div>
            
            <div className="p-6">
              {/* Title & author */}
              <h2 className="text-xl font-extrabold text-slate-900 mb-4">{selectedImage.title}</h2>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white flex items-center justify-center font-bold">
                  {selectedImage.nickname[0]}
                </div>
                <div>
                  <div className="font-semibold text-sm">{selectedImage.nickname}</div>
                  <div className="text-xs text-slate-400">{new Date(selectedImage.created_at).toLocaleDateString("ko-KR")}</div>
                </div>
              </div>
              
              {/* Action buttons */}
              <div className="flex gap-2 mb-6">
                <button onClick={() => handleLike(selectedImage.id)}
                  className="flex items-center gap-2 bg-pink-50 text-pink-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-pink-100 transition-colors">
                  ❤️ {selectedImage.likes}
                </button>
                {EMOJI_REACTIONS.map(e => (
                  <button key={e} onClick={() => handleReaction(selectedImage.id, e)}
                    className="bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-lg hover:bg-slate-100 transition-colors">
                    {e}{selectedImage.reactions[e] || ""}
                  </button>
                ))}
              </div>
              
              {/* Comments section */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-slate-900 mb-4">💬 댓글 {selectedImage.comment_count}개</h3>
                
                {/* Comment input */}
                <div className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">나</div>
                  <input value={newComment} onChange={e => setNewComment(e.target.value)}
                    placeholder="댓글을 남겨보세요..."
                    className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-purple-500 outline-none"
                  />
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-purple-700">
                    보내기
                  </button>
                </div>
                
                {/* Demo comments */}
                {[
                  { nickname: "AI마스터", content: "화질 최고야! 🔥🔥", time: "1시간 전" },
                  { nickname: "도그러버", content: "어떤 모델로 만들었어?", time: "2시간 전" },
                ].map((c, i) => (
                  <div key={i} className="flex gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      ["bg-blue-500 text-white", "bg-green-500 text-white"][i] || "bg-slate-400 text-white"
                    }`}>
                      {c.nickname[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold">{c.nickname}</span>
                        <span className="text-xs text-slate-400">{c.time}</span>
                      </div>
                      <p className="text-sm text-slate-700 bg-slate-50 rounded-xl px-4 py-2.5 inline-block">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
