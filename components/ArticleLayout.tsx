"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ListTree, ChevronDown, ChevronRight, House } from "lucide-react";
import { articles, articlePath, categoryInfo, type Article } from "@/lib/data";
import { fetchWikiStore, saveLocalEdit, type LocalArticleEdit, type LocalRevision } from "@/lib/localEdits";
import ArticleEditor from "@/components/ArticleEditor";
import ArticleTools from "@/components/ArticleTools";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";

export function ArticleInfobox({ article }: { article: Article }) {
  if (!article.infobox) return null;
  return <aside className="infobox"><div className="infobox-title">{article.title}</div>{article.english && <div className="infobox-english">{article.english}</div>}<dl>{article.infobox.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl><div className="infobox-caption">雅礼百科全书 · 条目信息</div></aside>;
}

function TableOfContents({ article }: { article: Article }) {
  const [collapsed, setCollapsed] = useState(false);
  const [active, setActive] = useState("");
  const sections = article.sections?.length ? article.sections : [{ heading: "概况", paragraphs: [] }];
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-15% 0px -70% 0px" });
    sections.forEach((_, index) => { const element = document.getElementById(`section-${index}`); if (element) observer.observe(element); });
    return () => observer.disconnect();
  }, [sections]);
  return <aside className="toc" id="article-contents"><button className="toc-title" onClick={() => setCollapsed((value) => !value)} aria-expanded={!collapsed} aria-controls="article-contents-list"><span><ListTree size={15} /> 目录</span></button>{!collapsed && <nav id="article-contents-list">{sections.map((section, index) => <a key={`${section.heading}-${index}`} className={active === `section-${index}` ? "current" : ""} href={`#section-${index}`}>{section.heading}</a>)}</nav>}</aside>;
}

function AliasDropdown({ aliases }: { aliases: string[] }) {
  const [open, setOpen] = useState(false);
  return <div className={`article-alias${open ? " is-open" : ""}`}>
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
    const titles = linkable.map((item) => item.title).filter(Boolean);
    if (!titles.length) return text;
    const regex = new RegExp(`(${titles.map((title) => title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g");
    return text.split(regex).map((part, index) => {
      const found = linkable.find((item) => item.title === part);
      return found ? <Link className="wiki-link" href={articlePath(found.slug)} key={`${part}-${index}`}>{part}</Link> : part;
    });
  };

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

  const related = editedArticles.filter((item) => item.slug !== current.slug && item.category.some((category) => current.category.includes(category))).slice(0, 5);
  const contributors = Array.from(new Map(revisions.filter((revision) => revision.userId && revision.userName).map((revision) => [revision.userId!, revision])).values());

  return <>
    <nav className="breadcrumbs" aria-label="当前位置"><Link href="/" className="breadcrumb-home"><House size={13} />首页</Link><ChevronRight className="breadcrumb-separator" size={13} aria-hidden="true" /><span className="breadcrumb-current" aria-current="page">{current.title}</span></nav>
    <div className="article-shell">
    <div className="article-left"><TableOfContents article={current} /></div>
    <main className="article-main" id="article-top">
      <header className="article-page-heading">
        <div className="article-heading-row">
          <div className="article-title-block"><div className="article-title-line"><h1>{current.title}</h1>{current.aliases?.length ? <AliasDropdown aliases={current.aliases} /> : null}</div>{current.english && <p className="english-title">{current.english}</p>}</div>
        </div>
      </header>
      <div className="article-rule" />
      <ArticleTools title={current.title} onEdit={requestEdit} />
      {saveError && <p className="editor-error">{saveError}</p>}
      {authPrompt && <div className="article-auth-prompt"><span>登录后即可编辑，修改会记录到你的个人主页。</span><button type="button" onClick={() => signIn(window.location.pathname)}>{googleEnabled ? "使用 Google 登录" : "配置 Google 登录"}</button><button type="button" className="article-auth-dismiss" onClick={() => setAuthPrompt(false)}>关闭</button>{!googleEnabled && <small>需要在项目 .env.local 中配置 Google OAuth 凭据。</small>}</div>}
      {editing ? <ArticleEditor article={current} onSave={save} onCancel={() => setEditing(false)} /> : <div className="article-body" id="article-body">
        <p className="lead">{linkedText(current.summary)}</p>
        {current.status === "条目短小" && <div className="article-status-note"><span className="status-note-icon">i</span><p><b>条目正在扩展</b><br />本文依据目前已确立的设定编写；后续可继续补充细节。</p><button type="button" onClick={requestEdit}>补充条目</button></div>}
        {current.sections?.map((section, index) => <section key={`${section.heading}-${index}`} id={`section-${index}`} className="article-section"><h2><span className="article-heading-text">{section.heading}</span><span className="article-heading-icon" aria-hidden="true" /></h2>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{linkedText(paragraph)}</p>)}</section>)}
        {!current.sections?.length && <section className="article-section" id="section-0"><h2><span className="article-heading-text">概况</span><span className="article-heading-icon" aria-hidden="true" /></h2><p>{linkedText(current.summary)}</p></section>}
        <section className="article-section references">
          <h2><span className="article-heading-text">参见</span><span className="article-heading-icon" aria-hidden="true" /></h2>
          <ul>{related.map((item) => <li key={item.slug}><Link className="wiki-link" href={articlePath(item.slug)}>{item.title}</Link></li>)}</ul>
          <h2><span className="article-heading-text">参考资料</span><span className="article-heading-icon" aria-hidden="true" /></h2>
          <ol><li>本项目提供的雅礼世界观设定。</li><li>本条目依据当前已确立设定编写；未确定内容以条目状态标示。</li></ol>
        </section>
        <div className="article-bottom-tags" aria-label="条目分类">{current.category.map((category) => <Link className="article-directory-tag" key={category} href={`/category/${categoryInfo[category].slug}`}>{category}</Link>)}</div>
      </div>}
    </main>
    <aside className="article-right" aria-label="条目特别内容">
      <ArticleInfobox article={current} />
      <div className="last-edited article-right-last-edited">{revisionTime ? `编辑于 ${new Date(revisionTime).toLocaleString("zh-CN")}` : "本页面于 2026年10月18日建立。"}</div>
      <div className="article-contributors article-contributors-side">
        <div className="article-contributor-group"><small>Created by</small><span className="article-contributor-person"><UserAvatar name="editor" picture="/yarripedia-mark.png" size="small" /><span>editor</span></span></div>
        {contributors.length > 0 && <div className="article-contributor-group"><small>Contributed by</small>{contributors.slice(0, 4).map((contributor) => <span className="article-contributor-person" key={contributor.userId} title={contributor.userName}><Link className="article-contributor-avatar" href="/profile#history" aria-label={`${contributor.userName}的修改记录`}><UserAvatar name={contributor.userName || "用户"} picture={contributor.picture} size="small" /></Link><span>{contributor.userName}</span></span>)}{contributors.length > 4 && <small>+{contributors.length - 4}</small>}</div>}
      </div>
    </aside>
    </div>
  </>;
}
