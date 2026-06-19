import { NextResponse } from "next/server"

interface ImgItem { id: string; filename: string; url: string }

export async function GET() {
  // 로컬 ComfyUI output 폴더에서 현재 이미지 읽기 (프로그래밍 서버 기준)
  const imgsList: ImgItem[] = []
  try {
    const fsP: any = await import("fs/promises")
    const files = await fsP.readdir("/home/aski/ComfyUI/output/")
    for (const f of files) {
      if ((f.startsWith("prof_") || f.startsWith("profile_")) && f.endsWith(".png")) {
        imgsList.push({ id: f, filename: f, url: `http://127.0.0.1:8188/viewer?filename=${encodeURIComponent(f)}` })
      }
    }
  } catch { /* 개발 환경에서 실패 시 빈 리스트 리턴 */ }

  return NextResponse.json({
    source: imgsList.length > 0 ? "local_comfyui" : "empty",
    count: imgsList.length,
    images: imgsList.slice(0, 300),
    message: imgsList.length === 0 ? "ComfyUI output 폴더에서 이미지를 찾을 수 없습니다. 이미지가 생성되어 있는지 확인하세요." : undefined,
  })
}

/*
 * NAS에 있는 실제 이미지 URL은 아래처럼 사용 가능 (Vercel 서버에서는 로컬 8188 접근 불가 → 별도 S3/R2 저장 권장):
 * /share/CACHEDEV2_DATA/aski_main/comfyui_photos/prof_*.png
 */
