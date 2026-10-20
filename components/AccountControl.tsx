"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";

export default function AccountControl() {
  const { user, loading, notice, signIn, signOut, clearNotice } = useAuth();
  const [open, setOpen] = useState(false);
  const controlRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const path = event.composedPath();
      if (controlRef.current && !path.includes(controlRef.current)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [open]);

  if (loading) return <span className="account-loading" aria-hidden="true" />;
  if (!user) return <div ref={controlRef} className="account-control">
    <button className="account-login" type="button" onClick={() => { setOpen((value) => !value); clearNotice(); signIn(); }}><UserRound size={15} /> 登录以编辑</button>
    {open && notice && <div className="account-popover"><p>{notice}</p><small>在 Google Cloud Console 创建 OAuth 网页客户端，并将 <code>http://localhost:3000/api/auth/google/callback</code> 加入授权重定向 URI。</small></div>}
  </div>;

  return <div ref={controlRef} className="account-control">
    <button className="account-user-button" type="button" aria-label={`${user.name}的个人中心`} aria-expanded={open} onClick={() => setOpen((value) => !value)}><UserAvatar name={user.name} picture={user.picture} size="medium" /><span className="account-user-label" aria-hidden="true">{user.name}</span></button>
    {open && <div className="account-popover account-popover-user" onPointerDownCapture={(event) => event.stopPropagation()}>
      <div className="account-card"><UserAvatar name={user.name} picture={user.picture} size="medium" /><span><b>{user.name}</b><small>{user.email}</small></span></div>
      <a href="/profile" onClick={(event) => { event.stopPropagation(); setOpen(false); window.location.assign("/profile"); }}>个人主页</a>
      <a href="/profile#history" onClick={(event) => { event.stopPropagation(); setOpen(false); window.location.assign("/profile#history"); }}>我的修改记录</a>
      <button type="button" onClick={() => { setOpen(false); void signOut(); }}><LogOut size={14} />退出登录</button>
    </div>}
  </div>;
}
