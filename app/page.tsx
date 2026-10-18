import Link from "next/link";
import Image from "next/image";
import { articles, articlePath, categoryInfo, type Category } from "@/lib/data";

const categories: Category[] = ["政治", "王室", "历史", "地理", "经济", "教育", "军事", "人物", "文化"];
const featured = [
  ["雅礼王冠", "the-crown-of-yarrie"],
  ["雅礼王国", "kingdom-of-yarrie"],
  ["威廉五世", "william-v"],
];

export default function HomePage() {
  const quickFacts = [
    { text: "雅礼王冠代表最高统治权的历史承继与合法性，不等同于英国法中的抽象法律人格。", slug: "the-crown-of-yarrie", title: "雅礼王冠" },
    { text: "青路奈是雅礼王国现代首都；“塞罗纳”也是 Seirona 的现代中文音译。", slug: "seirona", title: "青路奈" },
    { text: "鹤见州曾是雅礼古都，如今仍是重要的王室遗产中心。", slug: "tsurumi", title: "鹤见州" },
  ];
  const history = [
    ["1924", "宪政民主化", "1924-democratization"],
    ["1956", "王冠冻结危机", "1956-crown-freeze-crisis"],
    ["2026", "王冠复权危机", "2026-crown-restoration-crisis"],
  ];

  return <main className="portal-home">
    <section className="portal-hero" aria-label="Yarripedia 简介">
      <div className="portal-hero-logo"><Image src="/yarripedia-mark.png" alt="Yarripedia 字母 Y 标志" width={1627} height={926} priority /></div>
      <div className="portal-hero-copy">
        <h1>Yarripedia</h1>
        <p>The Free Encyclopedia of Yarrie</p>
        <span>一部关于雅礼王国的协作式百科全书</span>
      </div>
      <div className="portal-hero-aside">
        <div className="portal-welcome">
          <p className="portal-welcome-kicker">欢迎来到 Yarripedia</p>
          <p>探索雅礼王国的历史、人物与故事。</p>
          <p>每一次阅读，都在发现新的连接。</p>
          <p>欢迎加入编辑，让百科继续生长。</p>
        </div>
      </div>
    </section>

    <div className="portal-home-grid">
      <div className="portal-home-primary">
        <section className="portal-section portal-featured-section">
          <div className="portal-section-title"><h2>典范条目</h2><span>精选阅读</span></div>
          <Link className="portal-featured-entry" href={articlePath("kingdom-of-yarrie")}>
            <span className="portal-featured-number">01</span>
            <span className="portal-featured-copy"><b>雅礼王国</b><small>Kingdom of Yarrie</small></span>
            <span className="portal-featured-more">阅读条目 →</span>
          </Link>
          <div className="portal-featured-links">{featured.map(([title, slug]) => <Link href={articlePath(slug)} key={slug}><b>{title}</b></Link>)}</div>
          <p className="portal-inline-links"><b>分类：</b>{categories.map((category, index) => <span key={category}><Link href={`/category/${categoryInfo[category].slug}`}>{category}</Link>{index < categories.length - 1 ? "　·　" : ""}</span>)}</p>
        </section>

        <section className="portal-section portal-did-you-know">
          <div className="portal-section-title"><h2>你知道吗？</h2><Link href="/category/history">探索更多 →</Link></div>
          <ul>{quickFacts.map((fact) => <li key={fact.slug}><span>•</span><p>{fact.text} <Link href={articlePath(fact.slug)}>{fact.title}</Link></p></li>)}</ul>
        </section>
      </div>

      <aside className="portal-home-secondary">
        <section className="portal-section portal-news">
          <div className="portal-section-title"><h2>条目动态</h2><span>探索雅礼</span></div>
          <ul>{featured.map(([title, slug]) => <li key={slug}><span>•</span><p><Link href={articlePath(slug)}>{title}</Link></p></li>)}</ul>
          <div className="portal-news-category"><b>正在探索：</b>{categories.slice(0, 4).map((category, index) => <span key={category}><Link href={`/category/${categoryInfo[category].slug}`}>{category}</Link>{index < 3 ? " · " : ""}</span>)}</div>
        </section>

        <section className="portal-section portal-history">
          <div className="portal-section-title"><h2>雅礼历史节点</h2><span>重要年表</span></div>
          {history.map(([year, title, slug]) => <Link href={articlePath(slug)} key={slug}><time>{year}</time><span>{title}</span></Link>)}
        </section>
      </aside>
    </div>

    <section className="portal-category-strip" aria-label="按分类浏览">
      <div>{categories.map((category) => <Link href={`/category/${categoryInfo[category].slug}`} key={category}>{category}<small>{articles.filter((article) => article.category.includes(category)).length} 篇</small></Link>)}</div>
    </section>

    <footer id="portal-footer" className="portal-footer">
      <div className="portal-about"><span className="portal-footer-mark"><Image src="/yarripedia-mark.png" alt="" width={1627} height={926} /></span><p>一部关于雅礼王国的协作式百科全书。<br />内容以已确立的世界观设定为基础。</p></div>
      <Link href={articlePath("kingdom-of-yarrie")}><b>雅礼王国</b><small>国家概览</small></Link>
      <Link href={articlePath("the-crown-of-yarrie")}><b>雅礼王冠</b><small>王室与宪制</small></Link>
      <Link href="/about"><b>关于 Yarripedia</b><small>本站说明</small></Link>
    </footer>
  </main>;
}
