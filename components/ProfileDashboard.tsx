"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";
import { articlePath } from "@/lib/data";
import { fetchWikiStore, type LocalRevision } from "@/lib/localEdits";

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("zh-CN", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getActivityCells(revisions: LocalRevision[]) {
  const counts = new Map<string, number>();
  const titles = new Map<string, string[]>();
  revisions.forEach((revision) => {
    const key = dateKey(new Date(revision.timestamp));
    counts.set(key, (counts.get(key) || 0) + 1);
    const dayTitles = titles.get(key) || [];
    if (!dayTitles.includes(revision.title)) dayTitles.push(revision.title);
    titles.set(key, dayTitles);
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  // Render 52 complete weeks ending in the current week so today's edits
  // and the latest history entries always have a matching activity cell.
  start.setDate(start.getDate() - start.getDay() - 357);
  const cells = Array.from({ length: 364 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const count = counts.get(dateKey(date)) || 0;
    return { date, count, titles: titles.get(dateKey(date)) || [] };
  });
  const peak = Math.max(1, ...cells.map((cell) => cell.count));
  return cells.map((cell) => ({ ...cell, level: cell.count === 0 ? 0 : Math.min(4, Math.ceil((cell.count / peak) * 4)) }));
}

export default function ProfileDashboard() {
  const { user, loading, googleEnabled, signIn } = useAuth();
  const [revisions, setRevisions] = useState<LocalRevision[]>([]);

  useEffect(() => {
    if (user) void fetchWikiStore().then((store) => setRevisions(store.revisions)).catch(() => setRevisions([]));
    else setRevisions([]);
  }, [user]);

  const orderedRevisions = useMemo(() => [...revisions].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [revisions]);
  const activity = useMemo(() => getActivityCells(orderedRevisions), [orderedRevisions]);
  const firstHistoryIndexByDate = useMemo(() => {
    const targets = new Map<string, number>();
    orderedRevisions.forEach((revision, index) => {
      const key = dateKey(new Date(revision.timestamp));
      if (!targets.has(key)) targets.set(key, index);
    });
    return targets;
  }, [orderedRevisions]);
  const editedArticles = useMemo(() => new Set(orderedRevisions.map((revision) => revision.slug)).size, [orderedRevisions]);
  const activeDays = useMemo(() => new Set(orderedRevisions.map((revision) => dateKey(new Date(revision.timestamp)))).size, [orderedRevisions]);
  const latestRevision = orderedRevisions[0];

  if (loading) return <main className="profile-page"><p className="profile-loading">正在载入个人资料…</p></main>;

  if (!user) return <main className="profile-page profile-page-guest"><nav className="breadcrumbs" aria-label="当前位置"><Link href="/" className="breadcrumb-home">首页</Link><ChevronRight className="breadcrumb-separator" size={13} aria-hidden="true" /><span className="breadcrumb-current" aria-current="page">个人主页</span></nav><section className="profile-guest-card"><div className="profile-guest-avatar"><span>Y</span></div><h1>个人主页</h1><p>登录后查看你的资料、编辑记录和贡献活动。</p><button type="button" onClick={() => signIn()}>使用 Google 登录</button>{!googleEnabled && <small>Google 登录尚未配置；请设置项目环境变量后重启本地网站。</small>}</section></main>;

  return <main className="profile-page">
    <nav className="breadcrumbs" aria-label="当前位置"><Link href="/" className="breadcrumb-home">首页</Link><ChevronRight className="breadcrumb-separator" size={13} aria-hidden="true" /><span className="breadcrumb-current" aria-current="page">个人主页</span></nav>

    <section className="profile-hero" aria-labelledby="profile-name">
      <UserAvatar name={user.name} picture={user.picture} size="large" />
      <h1 id="profile-name">{user.name}</h1>
      <p className="profile-handle">@{user.email.split("@")[0]}</p>
      <p className="profile-email">{user.email}</p>
    </section>

    <section className="profile-stats" aria-label="贡献概览">
      <div><strong>{revisions.length}</strong><span>累计编辑</span></div>
      <div><strong>{editedArticles}</strong><span>编辑条目</span></div>
      <div><strong>{activeDays}</strong><span>活跃天数</span></div>
      <div><strong>{latestRevision ? formatDate(latestRevision.timestamp) : "—"}</strong><span>最近贡献</span></div>
      <div><strong>公开</strong><span>修改记录</span></div>
    </section>

    <section className="profile-featured" aria-labelledby="profile-featured-title">
      <div className="profile-section-heading"><h2 id="profile-featured-title">精选贡献</h2><span>最近编辑的条目</span></div>
      {latestRevision ? <a className="profile-featured-card" href={articlePath(latestRevision.slug)}>
        <div className="profile-featured-mark">Y</div>
        <div className="profile-featured-copy"><span className="profile-featured-kicker">最近更新</span><h3>{latestRevision.title}</h3><p>{latestRevision.summary}</p><small>{formatDateTime(latestRevision.timestamp)} · 查看条目 →</small></div>
      </a> : <div className="profile-featured-empty"><span>Y</span><p>在你的个人资料中展示贡献条目</p><Link href="/">浏览条目并开始编辑</Link></div>}
    </section>

    <section className="profile-activity" aria-labelledby="profile-activity-title">
      <div className="profile-section-heading"><h2 id="profile-activity-title">编辑活动</h2><span>最近一年 · 共 {revisions.length} 次</span></div>
      <div className="profile-activity-scroll"><div className="profile-activity-months"><span>11月</span><span>12月</span><span>1月</span><span>2月</span><span>3月</span><span>4月</span><span>5月</span><span>6月</span><span>7月</span><span>8月</span><span>9月</span><span>10月</span></div><div className="profile-activity-grid" aria-label="最近一年每日编辑次数">{activity.map((cell) => { const key = dateKey(cell.date); const label = `${cell.date.toLocaleDateString("zh-CN")}：${cell.count} 次编辑${cell.titles.length ? `，${cell.titles.join("、")}` : ""}`; const target = firstHistoryIndexByDate.get(key); return cell.count ? <a key={key} href={target === undefined ? "#history" : `#history-record-${target}`} className={`activity-level-${cell.level}`} title={label} aria-label={label} /> : <span key={key} className={`activity-level-${cell.level}`} aria-hidden="true" />; })}</div></div>
      <div className="profile-activity-legend"><span>少</span><i className="activity-level-0" /><i className="activity-level-1" /><i className="activity-level-2" /><i className="activity-level-3" /><i className="activity-level-4" /><span>多</span></div>
    </section>

    <section className="profile-history" id="history"><div className="profile-section-heading"><h2>修改记录</h2><span>云端公开记录 {orderedRevisions.length} 条</span></div>{orderedRevisions.length ? <ol>{orderedRevisions.map((revision, index) => <li id={`history-record-${index}`} key={`${revision.timestamp}-${revision.slug}-${index}`}><time dateTime={revision.timestamp}>{formatDateTime(revision.timestamp)}</time><Link href={articlePath(revision.slug)}>{revision.title}</Link><p>{revision.summary} · {revision.userName || "用户"}</p></li>)}</ol> : <div className="profile-empty">还没有修改记录。打开一个条目，点击“编辑”开始贡献。</div>}</section>
  </main>;
}
