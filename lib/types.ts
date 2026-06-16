export interface User {
  id: string
  email?: string
  nickname: string
  avatar_config: AvatarConfig | null
  points: number
  created_at: string
}

export interface AvatarConfig {
  eyes: string
  mouth: string
  nose: string
  hair: string
  clothing: string
  skinColor: string
  hairColor: string
  clothesColor: string
}

export interface ImageItem {
  id: string
  user_id: string
  nickname: string
  category: "animal" | "person" | "object"
  url: string
  prompt?: string
  title: string
  likes: number
  reactions: Record<string, number>
  comment_count: number
  created_at: string
}

export interface Comment {
  id: string
  image_id: string
  user_id: string
  nickname: string
  avatar_config: AvatarConfig | null
  rank_tier: string
  content: string
  created_at: string
}

export const RANK_TIERS = [
  { name: "bronze", label: "브론즈", minPoints: 0, icon: "🥉" },
  { name: "silver", label: "실버", minPoints: 100, icon: "🥈" },
  { name: "gold", label: "골드", minPoints: 500, icon: "🥇" },
  { name: "platinum", label: "플래티넘", minPoints: 1000, icon: "💎" },
  { name: "diamond", label: "다이아몬드", minPoints: 2500, icon: "👑" },
]

export function getRankTier(points: number): typeof RANK_TIERS[number] {
  let tier = RANK_TIERS[0]
  for (const t of RANK_TIERS) {
    if (points >= t.minPoints) tier = t
    else break
  }
  return tier
}