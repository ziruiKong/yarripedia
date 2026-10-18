"use client";

import { useState, type FormEvent } from "react";
import { Check, Eye, FileEdit, Save, X } from "lucide-react";
import { categoryInfo, type Article, type Category } from "@/lib/data";
import type { LocalArticleEdit } from "@/lib/localEdits";

const allCategories = Object.keys(categoryInfo) as Category[];

function toSource(article: Article) {
  return (article.sections || []).map((section) => `== ${section.heading} ==\n\n${section.paragraphs.join("\n\n")}`).join("\n\n");
}

function parseSource(source: string) {
  const sections: NonNullable<Article["sections"]> = [];
  let heading = "概况";
  let paragraphs: string[] = [];
  let hasHeading = false;
  const flush = () => {
    const text = paragraphs.join("\n").trim();
    if (text || hasHeading) sections.push({ heading, paragraphs: text ? text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean) : [] });
    paragraphs = [];
  };
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^==\s*(.*?)\s*==$/);
    if (match) { flush(); heading = match[1].trim() || "概况"; hasHeading = true; }
    else if (line.trim()) paragraphs.push(line.trim());
    else if (paragraphs.length && paragraphs[paragraphs.length - 1] !== "") paragraphs.push("");
  }
  if (paragraphs.length || (hasHeading && !sections.length)) flush();
  return sections;
}

export default function ArticleEditor({
  article,
  onSave,
  onCancel,
}: {
  article: Article;
  onSave: (edit: LocalArticleEdit, summary: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(article.title);
  const [english, setEnglish] = useState(article.english || "");
  const [lead, setLead] = useState(article.summary);
  const [source, setSource] = useState(toSource(article));
  const [categories, setCategories] = useState<Category[]>(article.category);
  const [editSummary, setEditSummary] = useState("");
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const parsedSections = parseSource(source);

  function toggleCategory(category: Category) {
    setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim() || !lead.trim() || categories.length === 0 || saving) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        english: english.trim(),
        summary: lead.trim(),
        category: categories,
        sections: parsedSections,
        infobox: article.infobox,
      }, editSummary);
    } finally { setSaving(false); }
  }

  return <section className="wiki-editor" aria-label="条目编辑器">
    <div className="wiki-editor-head">
      <div><span className="editor-kicker"><FileEdit size={14} /> 编辑条目</span><h2>{article.title}</h2></div>
      <button className="editor-icon-button" type="button" onClick={onCancel} aria-label="退出编辑"><X size={18} /></button>
    </div>
    <form onSubmit={submit}>
      <label className="editor-field">条目标题<input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
      <label className="editor-field">英文名称<input value={english} onChange={(event) => setEnglish(event.target.value)} placeholder="可选" /></label>
      <label className="editor-field">导语<textarea value={lead} onChange={(event) => setLead(event.target.value)} rows={3} required /></label>
      <fieldset className="editor-categories"><legend>分类</legend>{allCategories.map((category) => <label key={category}><input type="checkbox" checked={categories.includes(category)} onChange={() => toggleCategory(category)} />{category}</label>)}</fieldset>
      <div className="editor-source-head"><label htmlFor="wiki-source">正文（维基文本）</label><button type="button" onClick={() => setPreview((value) => !value)}><Eye size={14} />{preview ? "编辑源码" : "预览"}</button></div>
      {preview ? <div className="editor-preview">
        <p className="lead">{lead}</p>
        {parsedSections.map((section, index) => <section key={`${section.heading}-${index}`}><h3>{section.heading}</h3>{section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</section>)}
      </div> : <textarea id="wiki-source" className="editor-source" value={source} onChange={(event) => setSource(event.target.value)} spellCheck rows={16} placeholder={"== 概况 ==\n\n在这里编写条目正文。\n\n== 历史 ==\n\n使用双等号标记章节标题。"} />}
      <label className="editor-field editor-summary-field">编辑摘要<input value={editSummary} onChange={(event) => setEditSummary(event.target.value)} placeholder="简要说明你做了哪些更改" /></label>
      <div className="editor-actions"><span>更改保存在本地网站中</span><button type="button" className="editor-cancel" onClick={onCancel}>取消</button><button type="submit" className="editor-save" disabled={!title.trim() || !lead.trim() || !categories.length || saving}><Save size={15} />{saving ? "保存中…" : "保存更改"}</button></div>
    </form>
  </section>;
}
