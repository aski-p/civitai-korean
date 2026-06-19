import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface ImgItem { id: string; filename: string; url: string }

export async function GET() {
  try {
    const supabase: any = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1) profile_photos from Supabase
    const photosRes: any = await supabase.from("profile_photos").select("*");
    if (!photosRes.error && photosRes.data?.length > 0) {
      return NextResponse.json({ source: "supabase", count: photosRes.data.length, images: photosRes.data.map((p: any) => ({ id: p.id, filename: p.filename || p.id, url: p.image_url || p.url })) });
    }

    // 2) sub_agents avatars from Supabase
    const agentsRes: any = await supabase.from("sub_agents").select("id,name,avatar_url");
    if (!agentsRes.error) {
      const hasAvatars = (agentsRes.data || []).filter((a: any) => a.avatar_url);
      if (hasAvatars.length > 0) {
        return NextResponse.json({ source: "sub_agents", count: hasAvatars.length, images: hasAvatars.map((a: any) => ({ id: a.id, filename: a.name, url: a.avatar_url })) });
      }
    }

    // 3) Fallback — local ComfyUI output scan (dev only)
    const imgsList: ImgItem[] = [];
    try {
      const fsP: any = await import("fs/promises");
      const files = await fsP.readdir("/home/aski/ComfyUI/output/");
      for (const f of files) {
        if (f.startsWith("prof_") && f.endsWith(".png")) imgsList.push({ id: f, filename: f, url: `http://127.0.0.1:8188/viewer?filename=${encodeURIComponent(f)}` });
      }
    } catch { /* ignore */ }

    return NextResponse.json({ source: imgsList.length > 0 ? "local" : "empty", count: imgsList.length, images: imgsList.slice(0, 200), message: imgsList.length === 0 ? "이미지가 없습니다." : undefined });
  } catch (err) {
    return NextResponse.json({ source: "error", count: 0, images: [], error: String(err) }, { status: 500 });
  }
}
