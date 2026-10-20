"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Search, Menu, X, Globe2 } from "lucide-react";
import { articles, articlePath, categoryInfo } from "@/lib/data";
import { fetchWikiStore } from "@/lib/localEdits";
import AccountControl from "@/components/AccountControl";

function GlobalSearch(){
 const [query,setQuery]=useState("");const [open,setOpen]=useState(false);const [active,setActive]=useState(0);const [searchArticles,setSearchArticles]=useState(articles);const ref=useRef<HTMLInputElement>(null);
 useEffect(()=>{void fetchWikiStore().then(({edits})=>setSearchArticles(articles.map(article=>({...article,...edits[article.slug]})))).catch(()=>setSearchArticles(articles))},[]);
 const results=query.trim()?searchArticles.filter(a=>[a.title,a.english,...(a.aliases||[]),a.summary,...a.category].join(" ").toLowerCase().includes(query.trim().toLowerCase())).slice(0,8):[];
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.key==="/"&&!((e.target as HTMLElement)?.matches("input,textarea,[contenteditable=true]"))){e.preventDefault();ref.current?.focus();setOpen(true)}if(e.key==="Escape"){setOpen(false);ref.current?.blur()}if(open&&results.length&&e.key==="ArrowDown"){e.preventDefault();setActive((active+1)%results.length)}if(open&&results.length&&e.key==="ArrowUp"){e.preventDefault();setActive((active+results.length-1)%results.length)}if(open&&results.length&&e.key==="Enter"){window.location.href=articlePath(results[active].slug)}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key)},[open,results,active]);
 return <div className="search-wrap" id="global-search"><div className="searchbox"><Search size={17}/><input ref={ref} value={query} onChange={e=>{setQuery(e.target.value);setOpen(true);setActive(0)}} onFocus={()=>setOpen(true)} placeholder="搜索条目" aria-label="搜索条目"/></div>{open&&query.trim()&&<><button className="search-dismiss" aria-label="关闭搜索结果" onClick={()=>setOpen(false)}></button><div className="search-results">{results.length?results.map((a,i)=><a key={a.slug} className={`search-result ${i===active?"active":""}`} href={articlePath(a.slug)} onClick={()=>setOpen(false)}><span className="search-result-title">{a.title}{a.english&&<small>{a.english}</small>}</span><span className="result-meta">{a.category.map(category=><span className="search-result-tag" key={category}>{category}</span>)}</span></a>):<div className="empty-search"><strong>未找到相关条目</strong><span>请尝试中文名称、英文名称或分类关键词。</span></div>}<div className="search-hint">↑ ↓ 选择　↵ 打开　Esc 关闭</div></div></>}</div>
}
export default function WikiHeader(){
 const [menu,setMenu]=useState(false);
 const [categoriesOpen,setCategoriesOpen]=useState(false);
 const [globeSpinning,setGlobeSpinning]=useState(false);
 const headerRef=useRef<HTMLElement>(null);
 const categoryRef=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(!menu)return;const closeOnOutsideClick=(event:PointerEvent)=>{if(headerRef.current&&!headerRef.current.contains(event.target as Node))setMenu(false)};document.addEventListener("pointerdown",closeOnOutsideClick);return()=>document.removeEventListener("pointerdown",closeOnOutsideClick)},[menu]);
 useEffect(()=>{if(!categoriesOpen)return;const closeOnOutsideClick=(event:PointerEvent)=>{if(categoryRef.current&&!categoryRef.current.contains(event.target as Node))setCategoriesOpen(false)};document.addEventListener("pointerdown",closeOnOutsideClick);return()=>document.removeEventListener("pointerdown",closeOnOutsideClick)},[categoriesOpen]);
 const randomArticle=()=>{if(globeSpinning)return;setGlobeSpinning(true);const slug=articles[Math.floor(Math.random()*articles.length)].slug;window.setTimeout(()=>{window.location.href=articlePath(slug)},650)};
 return <header ref={headerRef} className="site-header"><div className="header-inner"><Link href="/" className="brand" aria-label="雅礼百科全书首页"><span className="brand-word"><b>Yarripedia</b></span></Link><button className="mobile-menu icon-button" aria-label={menu?"关闭导航":"打开导航"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X size={18}/>:<Menu size={18}/>}</button><div className="header-controls"><GlobalSearch/><nav className={`header-nav ${menu?"is-open":""}`}><div ref={categoryRef} className="nav-category-wrap"><button className="nav-categories" aria-expanded={categoriesOpen} onClick={()=>setCategoriesOpen(!categoriesOpen)}>分类</button>{categoriesOpen&&<div className="nav-category-menu">{Object.entries(categoryInfo).map(([name,info])=><Link key={name} href={`/category/${info.slug}`} onClick={()=>setCategoriesOpen(false)}>{name}<small>{info.description}</small></Link>)}</div>}</div><Link href="/about">关于百科</Link><button className={`nav-random globe-random ${globeSpinning?"is-spinning":""}`} onClick={randomArticle} aria-label="随机条目" title="随机条目" disabled={globeSpinning}><Globe2 size={18} strokeWidth={1.8}/></button></nav></div><AccountControl/></div></header>
}
