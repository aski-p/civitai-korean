import { NextRequest, NextResponse } from "next/server"

const SPA = "https://hyovtguangyykehxwnvp.supabase.co/rest/v1"
const getToken = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

function headersObj() {
  return {
    "Authorization": `Bearer ${getToken()}`,
    "apikey": getToken(),
    "Content-Type": "application/json",
  }
}

// PUT /api/employees/[id] - 직원 정보 수정
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // 역할 정보 업데이트
    let roleId = body.role_id;
    if (body.role) {
      const roleRes = await fetch(`${SPA}/roles?select=id&name=eq.${body.role}`, { headers: headersObj() })
      if (!roleRes.ok) return NextResponse.json({ error: "역할을 찾지 못했습니다" }, { status: 502 })
      
      const roles = await roleRes.json()
      if (roles.length === 0) {
        return NextResponse.json({ error: "존재하지 않는 역할입니다" }, { status: 400 })
      }
      
      roleId = roles[0].id
    }
    
    const res = await fetch(`${SPA}/employees?id=eq.${id}`, {
      method: "PATCH",
      headers: headersObj(),
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        role_id: roleId,
        status: body.status || "active",
        updated_at: new Date().toISOString()
      }),
    })
    
    if (!res.ok) return NextResponse.json({ error: "업데이트 실패" }, { status: 502 })
    
    const data = await res.json()
    return NextResponse.json(data[0])
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/employees/[id] - 직원 삭제
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const res = await fetch(`${SPA}/employees?id=eq.${id}`, {
      method: "DELETE",
      headers: headersObj(),
    })
    
    if (!res.ok) return NextResponse.json({ error: "삭제 실패" }, { status: 502 })
    
    return NextResponse.json({ message: "직원이 삭제되었습니다" })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
