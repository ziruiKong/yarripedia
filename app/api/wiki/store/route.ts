import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { articles, type Category } from "@/lib/data";
import type { AuthUser } from "@/lib/auth-types";
import { readSessionToken, sessionCookieName } from "@/lib/auth-session";
import { readWikiStore, updateWikiStore } from "@/lib/wiki-store";
import type { LocalArticleEdit } from "@/lib/localEdits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const categories: Category[] = ["政治", "王室", "历史", "地理", "经济", "教育", "军事", "人物", "文化"];

export async function GET(request: NextRequest) {
  const store = await readWikiStore();
  const slug = request.nextUrl.searchParams.get("slug");
  const userId = request.nextUrl.searchParams.get("userId");
  return NextResponse.json({
    edits: slug ? { [slug]: store.edits[slug] || null } : store.edits,
    revisions: store.revisions.filter((revision) => (!slug || revision.slug === slug) && (!userId || revision.userId === userId)),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const session = (await cookies()).get(sessionCookieName)?.value;
  const author = readSessionToken(session);
  if (!author) return NextResponse.json({ error: "请先登录后再编辑。" }, { status: 401 });
  const body = await request.json().catch(() => null) as { slug?: string; edit?: LocalArticleEdit; summary?: string } | null;
  const article = articles.find((item) => item.slug === body?.slug);
  const edit = body?.edit;
  if (!article || !edit || typeof edit.title !== "string" || !edit.title.trim() || edit.title.length > 160 || typeof edit.summary !== "string" || edit.summary.length > 5000 || !Array.isArray(edit.category) || !edit.category.length || edit.category.some((category) => !categories.includes(category))) {
    return NextResponse.json({ error: "条目内容格式无效。" }, { status: 400 });
  }
  if (!Array.isArray(edit.sections) || edit.sections.length > 60 || edit.sections.some((section) => !section || typeof section.heading !== "string" || !Array.isArray(section.paragraphs) || section.paragraphs.length > 100)) {
    return NextResponse.json({ error: "条目章节格式无效。" }, { status: 400 });
  }
  const safeEdit: LocalArticleEdit = {
    title: edit.title.trim(),
    english: typeof edit.english === "string" ? edit.english.slice(0, 160) : "",
    summary: edit.summary.trim(),
    category: edit.category,
    sections: edit.sections.map((section) => ({ heading: section.heading.slice(0, 160), paragraphs: section.paragraphs.filter((paragraph): paragraph is string => typeof paragraph === "string").map((paragraph) => paragraph.slice(0, 10000)) })),
    infobox: article.infobox,
  };
  const revisionAuthor: AuthUser = { sub: author.sub, name: author.name, email: "", picture: author.picture };
  const timestamp = new Date().toISOString();
  const revisions = (await updateWikiStore((store) => ({
    edits: { ...store.edits, [article.slug]: safeEdit },
    revisions: [{ slug: article.slug, title: safeEdit.title, summary: (typeof body?.summary === "string" ? body.summary : "编辑条目").trim().slice(0, 300), timestamp, userId: revisionAuthor.sub, userName: revisionAuthor.name, picture: revisionAuthor.picture }, ...store.revisions].slice(0, 5000),
  }))).revisions;
  return NextResponse.json({ ok: true, revision: revisions[0] }, { headers: { "Cache-Control": "no-store" } });
}
