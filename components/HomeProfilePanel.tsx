"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import UserAvatar from "@/components/UserAvatar";
import { fetchWikiStore, type LocalRevision } from "@/lib/localEdits";

export default function HomeProfilePanel() {
  const { user } = useAuth();
  const [revisions, setRevisions] = useState<LocalRevision[]>([]);
  useEffect(() => { if (user) void fetchWikiStore({ userId: user.sub }).then((store) => setRevisions(store.revisions)).catch(() => setRevisions([])); }, [user]);
  if (!user) return null;
  return <div className="home-profile-panel"><UserAvatar name={user.name} picture={user.picture} size="small" /><span><b>{user.name}</b><small>{revisions.length} 次编辑</small></span><Link href="/profile">个人主页 →</Link></div>;
}
