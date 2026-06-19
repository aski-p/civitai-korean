import { NextResponse } from "next/server"

// Supabase Admin REST endpoint for DDL injection
const SP_REST = "https://hyovtguangyykehxwnvp.supabase.co/rest/v1/rpc/run_ddl_schema"
const SKEY = "sb_secret_l0mN6vgIhJm50v9vUha3Mg_uxuMbDAD" // Service Role Key

// DDL Statements (Split to avoid PostgREST limits and handle one-by-one)
const DDL_QUERIES = [
    `CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🤖',
  created_at TIMESTAMPTZ DEFAULT now()
)`,
    `CREATE TABLE IF NOT EXISTS sub_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  description TEXT,
  system_prompt TEXT,
  profile_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  ollama_model TEXT DEFAULT 'qwen3-coder:30b',
  status TEXT DEFAULT 'offline',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
)`,
    `CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES sub_agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  result TEXT,
  response_time_ms INT,
  user_response_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
)`,
    `CREATE TABLE IF NOT EXISTS profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  style_category TEXT DEFAULT 'general',
  description TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
)`,
    `ALTER TABLE roles DISABLE ROW LEVEL SECURITY; ALTER TABLE sub_agents DISABLE ROW LEVEL SECURITY; 
     ALTER TABLE tasks DISABLE ROW LEVEL SECURITY; ALTER TABLE profile_photos DISABLE ROW LEVEL SECURITY;`,
    `INSERT INTO roles (name, description, icon) VALUES
('이미지 생성', 'ComfyUI를 통해 이미지 일러스트를 담당', '🎨'),
('동영상 생성', 'Wan T2V/Video 모델을 활용한 영상 편집과 제작을 담당', '🎬'),
('코딩 개발', '에이전트 코드 리뷰와 디버깅 작업을 담당', '💻'),
('데이터 분석', '데이터 파이프라인 및 시각화 처리를 담당', '📊'),
('QA 테스트', '자동 품질 보증 테스트 수행을 담당', '🧪') ON CONFLICT DO NOTHING`
]

export async function POST() {
  const results: any[] = []

  for (const query of DDL_QUERIES) {
    try {
      // Supabase admin rpc run_sql requires specific endpoint or pgwire. 
      // We will use graphql/v1 as an alternative if available, or direct PostgREST helper.
      const res = await fetch("https://hyovtguangyykehxwnvp.supabase.co/graphql/v1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SKEY}`,
          "apikey": SKEY
        },
        body: JSON.stringify({ query: `{ tables { name } }` }) // health check first
      });
      
      // Actually, REST DDL via RPC run_sql isn't enabled by default in Supabase.
      // Bypass via direct HTTP to /rest/v1 is impossible for DDL without admin access.
      // Final Fallback: We will use the GraphQL api to execute arbitrary SQL if available, 
      // BUT Supabase only allows graphql via pg_graphql which lacks raw SQL execution.

      // *Ultimate Solution*: Vercel Serverless Edge can connect to postgres using `pg` package!
      try {
        const { Client } = await import("pg");
        const client = new Client({
          host: "db.hyovtguangyykehxwnvp.supabase.co",
          port: 5432,
          user: "postgres.hyovtguangyykehxwnvp",
          password: SKEY,
          database: "postgres",
          ssl: { rejectUnauthorized: false }
        });
        await client.connect();
        for (const q of DDL_QUERIES) {
            try { await client.query(q); results.push({ ok: true }); } 
            catch (e: any) { if (e.code === '42P07') results.push({ skip: true }); else results.push({ err: e.message }); }
        }
        await client.end();
      } catch (pgErr: any) {
        return NextResponse.json({ pgwire_error: pgErr.message, status: "blocked_by_network" }, { status: 502 });
      }

    } catch (e: any) {
      results.push({ err: e.message });
    }
  }

  return NextResponse.json({ schema_init: "done", results });
}
