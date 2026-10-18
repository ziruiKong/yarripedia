"use client";

export default function UserAvatar({ name, picture, size = "medium" }: { name: string; picture?: string; size?: "small" | "medium" | "large" }) {
  const initial = Array.from(name.trim())[0] || "Y";
  return <span className={`user-avatar user-avatar-${size}`} aria-label={`${name} 的头像`} role="img" style={picture ? { backgroundImage: `url("${picture}")` } : undefined}>
    {!picture && <span>{initial}</span>}
  </span>;
}
