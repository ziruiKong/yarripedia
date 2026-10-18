"use client";

import { useState } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";

export default function AccountControl() {
  const { user, loading, notice, signIn, signOut, clearNotice } = useAuth();
  const [open, setOpen] = useState(false);

  if (loading) return <span className="account-loading" aria-hidden="true" />;
  if (!user) return <div className="account-control">
    <button className="account-login" type="button" onClick={() => { setOpen((value) => !value); clearNotice(); signIn(); }}><UserRound size={15} /> 登录以编辑</button>
    {open && notice && <div className="account-popover"><p>{notice}</p><small>在 Google Cloud Console 创建 OAuth 网页客户端，并将 <code>http://localhost:3000/api/auth/google/callback</code> 加入授权重定向 URI。</small></div>}
  </div>;

  return <div className="account-control">
    <button className="account-user-button" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}><UserAvatar name={user.name} picture={user.picture} size="small" /><span className="account-user-label">{user.name}</span></button>
    {open && <div className="account-popover account-popover-user">
      <div className="account-card"><UserAvatar name={user.name} picture={user.picture} size="medium" /><span><b>{user.name}</b><small>{user.email}</small></span></div>
      <Link href="/profile" onClick={() => setOpen(false)}>个人主页</Link>
      <Link href="/profile#history" onClick={() => setOpen(false)}>我的修改记录</Link>
      <button type="button" onClick={() => { setOpen(false); void signOut(); }}><LogOut size={14} />退出登录</button>
    </div>}
  </div>;
}
