import Link from "next/link";
import Image from "next/image";
export default function WikiFooter(){return <footer className="site-footer"><div><span className="footer-mark"><Image src="/yarripedia-mark.png" alt="" width={1627} height={926} /></span><span>YARRIPEDIA <small>雅礼百科全书</small></span></div><p>一部关于雅礼王国的协作式百科全书。</p><nav><Link href="/">首页</Link><Link href="/category/politics">分类目录</Link><Link href="/about">关于本站</Link></nav><small>本网站为架空世界观项目。内容以已确立设定为准。</small></footer>}
