"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { AuthUser } from "@/lib/auth-types";

type AuthContextValue = {
  user: AuthUser | null;
  googleEnabled: boolean;
  loading: boolean;
  notice: string;
  signIn: (returnTo?: string) => void;
  signOut: () => Promise<void>;
  clearNotice: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await response.json() as { user: AuthUser | null; googleEnabled: boolean };
      setUser(data.user);
      setGoogleEnabled(data.googleEnabled);
    } catch {
      setUser(null);
      setGoogleEnabled(false);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    void refresh();
    const params = new URLSearchParams(window.location.search);
    const authMessage = params.get("auth");
    if (authMessage === "google-config-missing") setNotice("Google 登录尚未配置。请设置 GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET 和 SESSION_SECRET。");
    else if (authMessage === "google-failed") setNotice("Google 登录未完成，请重试。");
    if (authMessage) {
      params.delete("auth");
      const query = params.toString();
      window.history.replaceState({}, "", `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`);
    }
  }, [refresh]);

  const signIn = useCallback((returnTo?: string) => {
    if (!googleEnabled) {
      setNotice("Google 登录尚未配置。请在项目 .env.local 中设置 GOOGLE_CLIENT_ID、GOOGLE_CLIENT_SECRET 和 SESSION_SECRET。");
      return;
    }
    const destination = returnTo || `${window.location.pathname}${window.location.search}${window.location.hash}`;
    window.location.assign(`/api/auth/google/start?next=${encodeURIComponent(destination)}`);
  }, [googleEnabled]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setNotice("已退出登录。");
  }, []);

  const value = useMemo(() => ({ user, googleEnabled, loading, notice, signIn, signOut, clearNotice: () => setNotice(""), refresh }), [user, googleEnabled, loading, notice, signIn, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
