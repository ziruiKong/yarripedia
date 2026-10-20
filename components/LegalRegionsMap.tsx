import Link from "next/link";

type Region = {
  slug: string;
  title: string;
  english: string;
  description: string;
  tone: "diyara" | "seirona" | "moswache";
};

const regions: Region[] = [
  {
    slug: "diyara-law",
    title: "迪亚拉法区",
    english: "Diyara Law",
    description: "王廷与贵族领国传统",
    tone: "diyara",
  },
  {
    slug: "seirona-law",
    title: "塞罗纳法区",
    english: "Seirona Law",
    description: "议会、政府与现代公共法",
    tone: "seirona",
  },
  {
    slug: "moswache-law",
    title: "莫斯瓦赫法区",
    english: "Moswache Law",
    description: "王朝官署与军事整合传统",
    tone: "moswache",
  },
];

function RegionLabel({ region, x, y }: { region: Region; x: number; y: number }) {
  return (
    <Link className={`portal-map-region portal-map-region-${region.tone}`} href={`/wiki/${region.slug}`} aria-label={`打开${region.title}词条`}>
      <text x={x} y={y} textAnchor="middle" className="portal-map-region-title">{region.title}</text>
      <text x={x} y={y + 24} textAnchor="middle" className="portal-map-region-english">{region.english}</text>
      <text x={x} y={y + 49} textAnchor="middle" className="portal-map-region-note">{region.description}</text>
    </Link>
  );
}

export default function LegalRegionsMap() {
  return (
    <section className="portal-map-section" aria-labelledby="portal-map-title">
      <div className="portal-map-heading">
        <div>
          <span className="portal-map-kicker">YARRIE LEGAL GEOGRAPHY</span>
          <h2 id="portal-map-title">雅礼王国 · 三大法区</h2>
        </div>
        <p>共同王权，分区执行 · Azgaar 实际生成</p>
      </div>

      <div className="portal-map-layout">
        <div className="portal-map-canvas">
          <img
            className="portal-map-generated"
            src="/yarrie-azgaar-map.svg"
            alt="由 Azgaar Fantasy Map Generator 生成的雅礼王国三大法区地图，显示迪亚拉、塞罗纳与莫斯瓦赫三个公国级政区及其疆界"
          />
          <div className="portal-map-generated-caption">
            <span>地图数据由 Azgaar&apos;s Fantasy Map Generator 生成</span>
            <a href="https://azgaar.github.io/Fantasy-Map-Generator/" target="_blank" rel="noreferrer">打开真实地图工具 ↗</a>
          </div>
        </div>

        <div className="portal-map-legend">
          <div className="portal-map-legend-head">
            <span>区域索引</span>
            <small>3 个公国级法区</small>
          </div>
          {regions.map((region, index) => (
            <Link href={`/wiki/${region.slug}`} className={`portal-map-legend-item portal-map-legend-${region.tone}`} key={region.slug}>
              <span className="portal-map-legend-number">0{index + 1}</span>
              <span className="portal-map-legend-copy">
                <b>{region.title}</b>
                <small>{region.english}</small>
                <em>{region.description}</em>
              </span>
              <span className="portal-map-legend-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
          <div className="portal-map-legend-note">
            <span className="portal-map-legend-dot" />
            <p>三大法区同属雅礼王国，分别保留不同的历史法源与执行机构。</p>
          </div>
          <Link href="/wiki/yarrie-legal-regions" className="portal-map-more">查看法区制度总览 <span>→</span></Link>
        </div>
      </div>
    </section>
  );
}
