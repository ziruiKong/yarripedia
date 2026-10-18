import type { Article } from "@/lib/data";
import type { AuthUser } from "@/lib/auth-types";

const EDITS_KEY = "yarripedia-local-edits";
const HISTORY_KEY = "yarripedia-local-revisions";

export type LocalArticleEdit = Pick<Article, "title" | "english" | "summary" | "category" | "sections" | "infobox">;
export type LocalRevision = { slug: string; title: string; summary: string; timestamp: string; userId?: string; userName?: string; picture?: string };
export type LocalWikiStore = { edits: Record<string, Partial<LocalArticleEdit>>; revisions: LocalRevision[] };

export async function fetchWikiStore(options: { slug?: string; userId?: string } = {}): Promise<LocalWikiStore> {
  const params = new URLSearchParams();
  if (options.slug) params.set("slug", options.slug);
  if (options.userId) params.set("userId", options.userId);
  const response = await fetch(`/api/wiki/store${params.size ? `?${params.toString()}` : ""}`, { cache: "no-store" });
  if (!response.ok) throw new Error("无法载入编辑记录");
  return response.json() as Promise<LocalWikiStore>;
}

export function readLocalEdits(): Record<string, Partial<LocalArticleEdit>> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.localStorage.getItem(EDITS_KEY) || "{}"); }
  catch { return {}; }
}

export async function saveLocalEdit(slug: string, article: LocalArticleEdit, summary: string, _author: AuthUser) {
  const response = await fetch("/api/wiki/store", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, edit: article, summary: summary.trim() || "编辑条目" }),
  });
  const result = await response.json() as { error?: string; revision?: LocalRevision };
  if (!response.ok || !result.revision) throw new Error(result.error || "保存失败，请重试。");
  return result.revision;
}
