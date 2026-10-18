import type { Metadata } from "next";
import "./globals.css";
import WikiHeader from "@/components/WikiHeader";
import WikiFooter from "@/components/WikiFooter";
import { AuthProvider } from "@/components/AuthProvider";
export const metadata:Metadata={title:{default:"雅礼百科全书 — Yarripedia",template:"%s — Yarripedia"},description:"探索雅礼王国的历史、政治、文化、经济与社会。",applicationName:"Yarripedia",verification:{google:"gbdog6xKuKKgmTY8t1AMvd_u1fPPkIdDP0T1laOkONU"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN" suppressHydrationWarning><body><AuthProvider><WikiHeader/><div className="page-frame">{children}</div><WikiFooter/></AuthProvider></body></html>}
