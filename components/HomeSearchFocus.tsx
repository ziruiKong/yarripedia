"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { articles, articlePath } from "@/lib/data";
import { fetchWikiStore } from "@/lib/localEdits";

export default function HomeSearchFocus() {
  const [query, setQuery] = useState("");
  const [searchArticles, setSearchArticles] = useState(articles);
  useEffect(() => { void fetchWikiStore().then(({ edits }) => setSearchArticles(articles.map((article) => ({ ...article, ...edits[article.slug] })))).catch(() => setSearchArticles(articles)); }, []);
  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return searchArticles.filter((article) => [article.title, article.english, article.summary, ...(article.aliases || [])]
      .join(" ").toLowerCase().includes(needle)).slice(0, 6);
  }, [query, searchArticles]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (results[0]) window.location.href = articlePath(results[0].slug);
  }

  return <div className="portal-search-wrap">
    <form className="portal-search" onSubmit={submit} role="search">
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Yarripedia" aria-label="搜索 Yarripedia" />
      <button aria-label="搜索" type="submit"><Search size={20} /></button>
    </form>
    {query.trim() && <div className="portal-search-results">
      {results.length ? results.map((article) => <a href={articlePath(article.slug)} key={article.slug}>
        <span>{article.title}</span>
      </a>) : <p>没有找到相关条目</p>}
    </div>}
  </div>;
}
