"use client";

import Link from "next/link";
import Image from "next/image";
import { Fragment, useEffect, useRef, useState } from "react";
import { ListTree, ChevronDown, ChevronRight, Info } from "lucide-react";
import { articles, articlePath, categoryInfo, type Article, type ArticleSection } from "@/lib/data";
import { fetchWikiStore, saveLocalEdit, type LocalArticleEdit, type LocalRevision } from "@/lib/localEdits";
import ArticleEditor from "@/components/ArticleEditor";
import ArticleTools from "@/components/ArticleTools";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";
import RichText from "@/components/RichText";
import LegalRegionsVisuals from "@/components/LegalRegionsVisuals";

export function ArticleInfobox({ article }: { article: Article }) {
  if (!article.infobox) return null;
    return <aside className="infobox"><div className="infobox-title"><Info size={15} aria-hidden="true" />信息卡片</div>{article.infoboxImage && <figure className={`infobox-media${article.slug === "oswin-v" ? " infobox-media-portrait" : ""}`}><Image src={article.infoboxImage.src} alt={article.infoboxImage.alt} width={1122} height={1403} sizes="(max-width: 820px) 48vw, 230px" /><figcaption>{article.infoboxImage.caption || article.infoboxImage.alt}</figcaption></figure>}<dl>{article.infobox.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></aside>;
}

function getSectionLevel(section: Pick<ArticleSection, "heading" | "level">): 2 | 3 | 4 {
  if (section.level) return section.level;
  const match = section.heading.match(/^(\d+(?:\.\d+)*)(?:\.)?\s/);
  return match ? Math.min(4, match[1].split(".").length + 1) as 2 | 3 | 4 : 2;
}

function SectionHeading({ heading, level }: { heading: string; level: 2 | 3 | 4 }) {
  const content = <><span className="article-heading-text">{heading}</span><span className="article-heading-icon" aria-hidden="true" /></>;
  if (level === 4) return <h4>{content}</h4>;
  if (level === 3) return <h3>{content}</h3>;
  return <h2>{content}</h2>;
}

function SectionTable({ table }: { table: { columns: string[]; rows: string[][] } }) {
  return <div className="article-table-wrap"><table className="article-table"><thead><tr>{table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function TableOfContents({ article }: { article: Article }) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("");
  const sections: ArticleSection[] = article.sections?.length ? article.sections : [{ heading: "概况", paragraphs: [], level: 2 }];
  const visibleSections = sections;
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-15% 0px -70% 0px" });
    visibleSections.forEach((section) => { const index = sections.indexOf(section); const element = document.getElementById(`section-${index}`); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [sections, visibleSections]);
  return <aside className="toc" id="article-contents"><button className="toc-title" onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed} aria-controls="article-contents-list"><span><ListTree size={15} /> 目录</span></button>{!collapsed && <nav id="article-contents-list">{visibleSections.map((section) => { const index = sections.indexOf(section); const level = getSectionLevel(section); return <a key={`${section.heading}-${index}`} className={`toc-level-${level}${active === `section-${index}` ? " current" : ""}`} aria-level={level} href={`#section-${index}`}>{section.heading}</a>; })}</nav>}</aside>;
}

function AliasDropdown({ aliases }: { aliases: string[] }) {
  const [open, setOpen] = useState(false);
  const aliasRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (aliasRef.current && !aliasRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);
  return <div ref={aliasRef} className={`article-alias${open ? " is-open" : ""}`}>
    <button type="button" className="article-alias-trigger" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-haspopup="listbox">
      <ChevronDown size={13} aria-hidden="true" />
    </button>
    {open && <div className="article-alias-menu" role="listbox" aria-label="条目别名">{aliases.map((alias) => <span key={alias} role="option">{alias}</span>)}</div>}
  </div>;
}

export function ArticlePage({ article }: { article: Article }) {
  const [current, setCurrent] = useState(article);
  const [editedArticles, setEditedArticles] = useState(articles);
  const [editing, setEditing] = useState(false);
  const [revisionTime, setRevisionTime] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<LocalRevision[]>([]);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [saveError, setSaveError] = useState("");
  const { user, googleEnabled, signIn } = useAuth();

  useEffect(() => {
    let alive = true;
    void fetchWikiStore().then((store) => {
      if (!alive) return;
      setEditedArticles(articles.map((item) => ({ ...item, ...store.edits[item.slug] })));
      setCurrent({ ...article, ...store.edits[article.slug] });
      const articleRevisions = store.revisions.filter((revision) => revision.slug === article.slug);
      setRevisionTime(articleRevisions[0]?.timestamp || null);
      setRevisions(articleRevisions);
    }).catch(() => { if (alive) setCurrent(article); });
    return () => { alive = false; };
  }, [article]);

  const linkedText = (text: string) => {
    const linkable = editedArticles.filter((item) => item.slug !== current.slug).sort((a, b) => b.title.length - a.title.length);
    const targets = linkable.flatMap((item) => [item.title, ...(item.aliases || [])].filter(Boolean).map((label) => ({ label, item }))).sort((a, b) => b.label.length - a.label.length);
    if (!targets.length) return text;
    const regex = new RegExp(`(${targets.map(({ label }) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
    return text.split(regex).map((part, index) => {
      const found = targets.find(({ label }) => label === part)?.item;
      return found ? <a className="wiki-link" href={articlePath(found.slug)} key={`${part}-${index}`}>{part}</a> : part;
    });
  };
  const richText = (text: string) => <RichText text={text} renderPlain={linkedText} />;

  function requestEdit() {
    if (user) { setEditing(true); setAuthPrompt(false); }
    else setAuthPrompt(true);
  }

  async function save(edit: LocalArticleEdit, summary: string) {
    if (!user) return;
    setSaveError("");
    try {
      const revision = await saveLocalEdit(current.slug, edit, summary, user);
      setCurrent((value) => ({ ...value, ...edit }));
      setEditedArticles((value) => value.map((item) => item.slug === current.slug ? { ...item, ...edit } : item));
      setRevisionTime(revision.timestamp);
      setRevisions((value) => [revision, ...value]);
      setEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败，请重试。");
    }
  }

  const contributors = Array.from(new Map(revisions.filter((revision) => revision.userId && revision.userName).map((revision) => [revision.userId!, revision])).values());

  return <>
    <div className="article-breadcrumb-row"><nav className="breadcrumbs" aria-label="当前位置"><Link href="/" className="breadcrumb-home">首页</Link><ChevronRight className="breadcrumb-separator" size={13} aria-hidden="true" /><span className="breadcrumb-current" aria-current="page">{current.title}</span></nav><div className="article-inline-title"><div className="article-title-line"><h1>{current.title}</h1>{current.aliases?.length ? <AliasDropdown aliases={current.aliases} /> : null}</div>{current.english && <p className="english-title">{current.english}</p>}</div><div className="article-status-inline" role="status"><span className="status-note-icon" aria-hidden="true">i</span><span>条目正在扩展</span></div></div>
    <div className="article-shell">
    <div className="article-left"><TableOfContents article={current} /></div>
    <main className="article-main" id="article-top">
      <div className="article-rule" />
      <ArticleTools title={current.title} onEdit={requestEdit} />
      {saveError && <p className="editor-error">{saveError}</p>}
      {authPrompt && <div className="article-auth-prompt"><span>登录后即可编辑，修改会记录到你的个人主页。</span><button type="button" onClick={() => signIn(window.location.pathname)}>{googleEnabled ? "使用 Google 登录" : "配置 Google 登录"}</button><button type="button" className="article-auth-dismiss" onClick={() => setAuthPrompt(false)}>关闭</button>{!googleEnabled && <small>需要在项目 .env.local 中配置 Google OAuth 凭据。</small>}</div>}
      {editing ? <ArticleEditor article={current} onSave={save} onCancel={() => setEditing(false)} /> : <div className="article-body" id="article-body">
        <p className="lead">{richText(current.summary)}</p>
        {current.sections?.map((section, index) => { const level = getSectionLevel(section); const hideOverviewHeading = section.heading === "概况" || section.heading === "概述"; return <Fragment key={`${section.heading}-${index}`}><section id={`section-${index}`} className={`article-section article-section-level-${level}${hideOverviewHeading ? " article-section-overview-hidden" : ""}`} data-level={level}>{!hideOverviewHeading && <SectionHeading heading={section.heading} level={level} />}{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{richText(paragraph)}</p>)}{section.table && <SectionTable table={section.table} />}</section>{current.slug === "yarrie-legal-regions" && index === 0 && <LegalRegionsVisuals />}</Fragment>; })}
        {!current.sections?.length && <section className="article-section article-section-overview-hidden" id="section-0"><p>{richText(current.summary)}</p></section>}
      </div>}
      <div className="article-bottom-row">
        <div className="article-bottom-tags" aria-label="条目分类">{current.category.map((category) => <Link className="article-directory-tag" key={category} href={`/category/${categoryInfo[category].slug}`}>{category}</Link>)}</div>
        <div className="article-right-meta">
          <div className="last-edited article-right-last-edited">{revisionTime ? `编辑于 ${new Date(revisionTime).toLocaleString("zh-CN")}` : "本页面于 2026年10月18日建立。"}</div>
          <div className="article-contributors article-contributors-side">
            <div className="article-contributor-group"><small>Created by</small><span className="article-contributor-person"><UserAvatar name="editor" picture="/yarripedia-mark.png" size="small" /><span>editor</span></span></div>
            {contributors.length > 0 && <div className="article-contributor-group"><small>Contributed by</small>{contributors.slice(0, 4).map((contributor) => <span className="article-contributor-person" key={contributor.userId} title={contributor.userName}><Link className="article-contributor-avatar" href="/profile#history" aria-label={`${contributor.userName}的修改记录`}><UserAvatar name={contributor.userName || "用户"} picture={contributor.picture} size="small" /></Link><span>{contributor.userName}</span></span>)}{contributors.length > 4 && <small>+{contributors.length - 4}</small>}</div>}
          </div>
        </div>
      </div>
    </main>
    <aside className="article-right" aria-label="条目特别内容">
      <ArticleInfobox article={current} />
    </aside>
    </div>
  </>;
}
