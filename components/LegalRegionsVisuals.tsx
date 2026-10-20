const regions = [
  "迪亚拉法",
  "塞罗纳法",
  "莫斯瓦赫法",
];

function LegalRegionsTree() {
  const nodeX = [24, 315, 606];
  const nodeCenters = nodeX.map((x) => x + 135);

  return <div className="legal-tree-svg" role="img" aria-label="雅礼国王通过不同执行机构管理三大法区">
    <svg viewBox="0 0 900 740" aria-hidden="true" focusable="false">
      <g className="legal-tree-connectors" fill="none" stroke="#9eb2c9" strokeWidth="1.5">
        <path d="M450 325V353" />
        <path d={`M${nodeCenters[0]} 353H${nodeCenters[2]}`} />
        {nodeCenters.map((center) => <path key={center} d={`M${center} 353V379`} />)}
      </g>

      <g className="legal-tree-root-node">
        <rect x="340" y="10" width="220" height="315" rx="3" />
        <rect x="350" y="18" width="200" height="255" rx="1" className="legal-tree-thumb-frame" />
        <image href="/king-yarrie.png" x="360" y="28" width="180" height="235" preserveAspectRatio="xMidYMid slice" />
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/wiki/oswin-v" aria-label="雅礼国王（奥斯温五世）">
          <text x="450" y="294" textAnchor="middle" className="legal-tree-node-title legal-tree-root-link">雅礼国王</text>
        </a>
        <text x="450" y="313" textAnchor="middle" className="legal-tree-node-subtitle">三大法区共同最高权威</text>
      </g>

      {regions.map((name, index) => {
        const x = nodeX[index];
        const center = nodeCenters[index];
        return <g className={`legal-tree-region-node${index === 0 ? " legal-tree-region-node-diara" : ""}`} key={name}>
          <rect x={x} y="379" width="270" height="330" rx="3" />
          {index === 0 && <>
            <rect x={x + 22} y="418" width="108" height="144" rx="1" className="legal-tree-leader-placeholder" />
            <rect x={x + 140} y="418" width="108" height="144" rx="1" className="legal-tree-leader-placeholder" />
            <image href="/diara-first-peer.png" x={x + 22} y="418" width="108" height="144" preserveAspectRatio="xMidYMid slice" className="legal-tree-leader-image" />
            <image href="/diara-grand-duke.png" x={x + 140} y="418" width="108" height="144" preserveAspectRatio="xMidYMid slice" className="legal-tree-leader-image" />
            <text x={x + 76} y="578" textAnchor="middle" className="legal-tree-leader-name">伊利安·阿维兰</text>
            <text x={x + 194} y="578" textAnchor="middle" className="legal-tree-leader-name">卡西安·莫尔维克</text>
            <text x={x + 76} y="593" textAnchor="middle" className="legal-tree-leader-title">迪亚拉王廷</text>
            <text x={x + 76} y="607" textAnchor="middle" className="legal-tree-leader-title">首席贵族</text>
            <text x={x + 194} y="593" textAnchor="middle" className="legal-tree-leader-title">莫尔维克大公</text>
            <text x={x + 194} y="607" textAnchor="middle" className="legal-tree-leader-title">领国军事首席</text>
          </>}
          <line x1={x + 1} y1="379" x2={x + 269} y2="379" />
          <text x={x + 18} y="406" className="legal-tree-node-title">{name}</text>
          {index === 1 && <>
            <text x={x + 18} y="431" className="legal-tree-node-subtitle">主要人物</text>
            <text x={x + 18} y="450" className="legal-tree-node-body">雅礼最高法院大法官、议会主席</text>
          </>}
          <circle cx={center} cy="353" r="3" />
        </g>;
      })}
    </svg>
  </div>;
}

export default function LegalRegionsVisuals() {
  return <section className="legal-regions-visuals" aria-label="雅礼王国三大法区结构示意">
    <LegalRegionsTree />

    <div className="legal-comparison-chart">
      <div className="legal-chart-title"><span>三大法区制度对比</span><small>设定关系示意，不代表统计数值</small></div>
      <table className="legal-comparison-table">
        <caption className="sr-only">三大法区制度维度对比</caption>
        <thead><tr><th scope="col">比较维度</th><th scope="col">迪亚拉法</th><th scope="col">塞罗纳法</th><th scope="col">莫斯瓦赫法</th></tr></thead>
        <tbody>
          <tr><th scope="row">共同效忠对象</th><td>雅礼国王与王冠</td><td>雅礼国王与王冠</td><td>雅礼国王与王冠</td></tr>
          <tr><th scope="row">主要执行机构</th><td>王廷、贵族会议、领主官署</td><td>首相府、议会、法院</td><td>枢密机构、军事官署、地方总督</td></tr>
          <tr><th scope="row">地方权利来源</th><td>封地、家族传统、王冠确认</td><td>宪法、法律、行政授权</td><td>王朝官署、军政任命、地方承认</td></tr>
          <tr><th scope="row">制度重点</th><td>王冠与历史身份</td><td>成文宪制与公共行政</td><td>军政整合与地方执行</td></tr>
        </tbody>
      </table>
    </div>
  </section>;
}
