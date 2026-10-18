"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";
import { fetchWikiStore, type LocalRevision } from "@/lib/localEdits";

export default function ProfileDashboard() {
  const { user, loading, googleEnabled, signIn } = useAuth();
  const [revisions, setRevisions] = useState<LocalRevision[]>([]);
  useEffect(() => { if (user) void fetchWikiStore({ userId: user.sub }).then((store) => setRevisions(store.revisions)).catch(() => setRevisions([])); else setRevisions([]); }, [user]);

  if (loading) return <main className="profile-page"><p>正在载入个人资料…</p></main>;
  if (!user) return <main className="profile-page"><h1>个人主页</h1><section className="profile-login-prompt"><h2>登录后查看个人资料</h2><p>使用 Google 账号登录后，你可以编辑条目并查看自己的本地修改记录。</p><button type="button" onClick={() => signIn()}>使用 Google 登录</button>{!googleEnabled && <small>Google 登录尚未配置；请设置项目环境变量后重启本地网站。</small>}</section></main>;

  return <main className="profile-page">
    <div className="breadcrumbs"><Link href="/">首页</Link><span>›</span><b>个人主页</b></div>
    <header className="profile-card"><UserAvatar name={user.name} picture={user.picture} size="large" /><div><span className="profile-kicker">YARRIPEDIA CONTRIBUTOR</span><h1>{user.name}</h1><p>{user.email}</p></div><div className="profile-stat"><b>{revisions.length}</b><span>次本地编辑</span></div></header>
    <section className="profile-history" id="history"><div className="profile-history-head"><h2>我的修改记录</h2><span>此设备保存 {revisions.length} 条</span></div>
      {revisions.length ? <ol>{revisions.map((revision, index) => <li key={`${revision.timestamp}-${revision.slug}-${index}`}><time dateTime={revision.timestamp}>{new Date(revision.timestamp).toLocaleString("zh-CN")}</time><Link href={`/wiki/${revision.slug}`}>{revision.title}</Link><p>{revision.summary}</p></li>)}</ol> : <div className="profile-empty">还没有修改记录。打开一个条目，点击“编辑”开始贡献。</div>}
    </section>
  </main>;
}
