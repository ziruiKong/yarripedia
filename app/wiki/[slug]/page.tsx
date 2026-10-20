import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { articles,articleBySlug,articlePath } from "@/lib/data";
import { ArticlePage } from "@/components/ArticleLayout";
export function generateStaticParams(){return articles.map(a=>({slug:a.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const a=articleBySlug(slug);return a?{title:a.title,description:a.summary,openGraph:{title:`${a.title} — Yarripedia`,description:a.summary}}:{}}
export default async function WikiPage({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const article=articleBySlug(slug);if(!article)notFound();if(article.slug!==slug)redirect(articlePath(article.slug));return <main className="wiki-page"><ArticlePage article={article}/></main>}
