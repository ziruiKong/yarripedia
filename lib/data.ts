export type Category = "政治" | "王室" | "历史" | "地理" | "经济" | "教育" | "军事" | "人物" | "文化";
export type Article = { slug:string; title:string; english?:string; category:Category[]; status:"已确立"|"草稿"|"条目短小"; summary:string; aliases?:string[]; sections?:{heading:string; paragraphs:string[]}[]; infobox?:[string,string][] };

export const categoryInfo:Record<Category,{slug:string;description:string}> = {
  政治:{slug:"politics",description:"雅礼的宪制安排、政府机关、政党与公共制度。"}, 王室:{slug:"royalty",description:"王冠、王朝、王室及其宪法地位。"}, 历史:{slug:"history",description:"构成雅礼政治与社会发展的重要历史事件。"}, 地理:{slug:"geography",description:"雅礼的城市、区域与地理沿革。"}, 经济:{slug:"economy",description:"企业、家族商业网络与经济组织。"}, 教育:{slug:"education",description:"高等教育机构及科研组织。"}, 军事:{slug:"institutions",description:"国家机构、武装力量与公共组织。"}, 人物:{slug:"people",description:"王室成员、政治人物与商业人物。"}, 文化:{slug:"society",description:"社会文化与相关主题。"}
};

const expanded=(heading:string, paragraphs:string[])=>[{heading,paragraphs}];
export const articles:Article[] = [
 {slug:"kingdom-of-yarrie",title:"雅礼王国",english:"Kingdom of Yarrie",category:["政治","历史","地理"],status:"已确立",aliases:["雅礼","Yarrie"],summary:"位于架空世界中的君主立宪国家，首都是青路奈。其现行制度由民选议会、首相与保有独立宪法权力的王冠共同构成。",infobox:[["正式名称","Kingdom of Yarrie"],["首都","青路奈（Seirona）"],["历史旧都","鹤见州"],["国家元首","威廉五世"],["政体","君主立宪制"],["王朝","韦礼王朝"],["现行时期","第六王国"]],sections:[{heading:"概况",paragraphs:["雅礼王国是以王冠为主权合法性核心、同时设有民选议会与首相的君主立宪国家。青路奈为现代首都；鹤见州则是历史上的首都，也是王室遗产的重要中心。","雅礼的宪制不将王冠仅视为抽象的国家法律人格。王冠代表最高统治权的历史承继、合法性来源与凭证；现任君主是王冠权力的持有者与行使者。"]},{heading:"宪制与政府",paragraphs:["国家日常政府由议会与首相承担。王冠保有独立的宪法权力，包括真实有效的御准与否决权，以及军事统帅权。两套权力来源在宪制安排中并存。","1924年的宪政民主化确立了现代民主制度框架。2026年的王冠复权危机及其后的第二次宪制和解强化了王冠的宪法权限。"]},{heading:"历史",paragraphs:["雅礼政治史中的关键节点包括1924年宪政民主化、1956年王冠冻结危机，以及2026年王冠复权危机。各事件的详细过程仍待进一步编纂。"]}]},
 {slug:"the-crown-of-yarrie",title:"雅礼王冠",english:"The Crown of Yarrie",category:["王室","政治","历史"],status:"已确立",aliases:["王冠","Crown of Yarrie"],summary:"雅礼最高统治权的历史化身，构成主权合法性的来源与凭证，并代表王朝与王权的最高权威。",infobox:[["名称","雅礼王冠"],["英文名","The Crown of Yarrie"],["性质","最高统治权的历史化身"],["当前持有者","威廉五世"],["相关制度","雅礼君主立宪制度"]],sections:[{heading:"定义",paragraphs:["雅礼王冠是雅礼最高统治权经历史演变形成的化身。它既是主权合法性的来源，也是合法统治的凭证，同时是王朝权威与王权的最高象征。","王冠不等同于现代英国法中作为抽象法律人格的 Crown。雅礼概念强调统治权的历史承继、合法性与实际权威。"]},{heading:"王冠与君主",paragraphs:["现任君主是王冠权力的当前持有者与行使者。王室是承载王朝继承关系的家族，与王冠本身是不同概念：前者是家族，后者是最高统治权的历史化身。"]},{heading:"宪法权限",paragraphs:["雅礼王冠保有独立于民选政府的实质宪法权力，包括御准、否决及军事统帅权限。2026年王冠复权危机后的第二次宪制和解强化了王冠的宪法地位。","关于权限边界、行使程序及与议会关系的更细致规定，现有设定尚未完整说明。"]}]},
 {slug:"wetherby-dynasty",title:"韦礼王朝",english:"Wetherby Dynasty",category:["王室","历史"],status:"条目短小",summary:"统治雅礼的王朝。威廉五世为该王朝君主；现有设定尚未给出完整世系与各代君主年表。",sections:expanded("概况",["韦礼王朝是雅礼王国的统治王朝。现有资料确认威廉五世属于当代王室体系，但尚未提供王朝建立年代、完整世系或历代君主资料。"] )},
 {slug:"yarrie-constitutional-monarchy",title:"雅礼君主立宪制度",category:["政治","王室"],status:"已确立",summary:"由民选议会、首相与保有独立宪法权限的王冠共同构成的雅礼国家制度。",sections:[{heading:"制度构成",paragraphs:["雅礼实行君主立宪制，民选议会与首相负责政府政治，同时王冠保留实质、独立的宪法权力。此制度并非将君主职能完全限于礼仪。"]},{heading:"王冠权限",paragraphs:["已确立的权限包括御准与否决权，以及军事统帅权。2026年危机后的宪制和解强化了王冠权力。现有设定未说明具体行使惯例与司法审查方式。"]}]},
 {slug:"yarrie-parliament",title:"雅礼议会",category:["政治"],status:"条目短小",summary:"雅礼的民选立法机关，是国家议会政治的重要组成部分；议院构成与选举制度尚未确定。"},
 {slug:"prime-minister-of-yarrie",title:"雅礼首相",category:["政治","人物"],status:"条目短小",summary:"雅礼政府首脑。首相与民选议会承担政府政治，具体任命程序和行政权限仍待补充。"},
 {slug:"absolute-democracy-party",title:"绝对民主党",english:"Absolute Democracy Party",category:["政治"],status:"条目短小",summary:"雅礼政党之一。现有设定仅确认其名称，组织沿革、纲领与议会席次未定。"},
 {slug:"1924-democratization",title:"1924年雅礼宪政民主化",category:["历史","政治"],status:"已确立",summary:"雅礼现代宪政民主制度的重要历史节点。具体立法过程及制度细节尚未完整设定。",sections:expanded("历史意义",["1924年，雅礼开始现代宪政民主化。这一节点构成当代民选议会与首相制度的历史背景。现有资料未列出改革法案、参与者或具体时间表。"] )},
 {slug:"1956-crown-freeze-crisis",title:"1956年王冠冻结危机",category:["历史","政治","王室"],status:"已确立",summary:"围绕王冠权力发生的宪制危机。其具体起因、过程与解决方式尚未确立。",sections:expanded("概况",["1956年王冠冻结危机是雅礼宪制史上的重要事件。现有设定确认事件名称与年份，但尚未确定危机的参与方、权力争议及后续安排。"] )},
 {slug:"2026-crown-restoration-crisis",title:"2026年王冠复权危机",category:["历史","政治","王室"],status:"已确立",summary:"促成第二次宪制和解的重大宪制危机，并强化了王冠的宪法权限。",sections:[{heading:"概况",paragraphs:["2026年王冠复权危机是雅礼近代宪制史的重要节点。危机结束后形成第二次宪制和解，进一步确认并强化王冠的宪法权力。","目前设定未说明危机持续时间、参与者、具体冲突过程或政府更替情况。"]}]},
 {slug:"second-constitutional-settlement",title:"第二次宪制和解",category:["政治","历史"],status:"已确立",summary:"2026年王冠复权危机后形成的宪制安排，强化王冠在国家制度中的宪法权限。"},
 {slug:"william-v",title:"威廉五世",english:"William V",category:["人物","王室"],status:"已确立",summary:"雅礼现任君主，1958年4月17日出生，2016年9月3日继承爱德华八世。王后为亚历山德拉。",infobox:[["姓名","威廉五世"],["英文名","William V"],["出生","1958年4月17日"],["即位","2016年9月3日"],["前任","爱德华八世"],["配偶","亚历山德拉王后"]],sections:expanded("生平",["威廉五世生于1958年4月17日，于2016年9月3日继承爱德华八世，成为雅礼君主。其妻为亚历山德拉王后。"] )},
 {slug:"edward-viii",title:"爱德华八世",english:"Edward VIII",category:["人物","王室"],status:"条目短小",summary:"威廉五世的前任君主。威廉五世于2016年9月3日继承其王位。"},
 {slug:"nicholas-kimberley",title:"尼古拉斯·金伯礼",english:"Nicholas Kimberley",category:["人物","政治"],status:"条目短小",summary:"雅礼人物条目。现有设定未提供其生平、职务或历史活动。"},
 {slug:"imperial-robertson",title:"帝皇罗拔臣",english:"Imperial Robertson",category:["人物"],status:"条目短小",summary:"雅礼人物条目。其身份与经历尚未在现有设定中说明。"},
 {slug:"seirona",title:"青路奈",english:"Seirona",category:["地理"],status:"已确立",aliases:["塞罗纳"],summary:"雅礼王国现代首都。塞罗纳是 Seirona 的现代中文音译形式。",infobox:[["中文名称","青路奈"],["罗马字","Seirona"],["性质","首都"],["所属国家","雅礼王国"]],sections:expanded("名称",["青路奈的罗马字为 Seirona。“塞罗纳”是该名称的现代中文音译写法；青路奈则是本条目采用的传统汉字地名。"] )},
 {slug:"seirona-metropolitan-prefecture",title:"青路奈府",english:"Seirona Metropolitan Prefecture",category:["地理"],status:"条目短小",summary:"以现代首都青路奈为中心的都会级行政区域。其行政边界与制度细节尚未确定。"},
 {slug:"tsurumi",title:"鹤见州",english:"Tsurumi",category:["地理","历史","王室"],status:"已确立",aliases:["楚鲁米"],summary:"雅礼历史上的古都，也是重要的王室遗产中心。",sections:expanded("历史地位",["鹤见州曾是雅礼历史上的首都，现为重要的王室遗产中心。其具体历史沿革、行政地位变化与遗产名录仍待编纂。"] )},
 {slug:"arase",title:"阿拉瑟",english:"Arase",category:["地理"],status:"条目短小",summary:"雅礼地名条目。名称采用受日语影响的罗马字音译传统，具体地理与行政信息尚缺。"},
 {slug:"chiang-family",title:"蒋氏家族",category:["经济","人物"],status:"已确立",summary:"由蒋家敏领导的商业家族体系，旗下商业网络由75家公司构成，并有绍系、克系与静系等分支。",sections:[{heading:"商业体系",paragraphs:["蒋氏家族商业体系由75家公司构成，业务命名方式多样，并非所有企业名称都包含“中正”。","家族掌门与第二代商业领袖为蒋家敏。家族旗下三家旗舰上市公司为中正药业、中正盐业与中正化工。"]},{heading:"企业分支",paragraphs:["除中正系外，体系还包括绍系、克系与静系等分支。各分支之间的股权关系、行业构成与沿革尚未完整说明。"]}]},
 {slug:"chung-cheng-system",title:"中正系",english:"Chung Cheng System",category:["经济"],status:"已确立",summary:"蒋氏家族商业体系中的重要企业网络，涵盖多家企业；蒋氏家族全体系共75家公司。"},
 {slug:"chung-cheng-holdings",title:"中正控股",category:["经济"],status:"条目短小",summary:"中正商业体系相关企业。现有设定未提供成立时间、业务范围或上市情况。"},
 {slug:"chung-cheng-pharmaceutical",title:"中正药业",category:["经济"],status:"已确立",summary:"蒋氏家族中正体系的旗舰上市公司之一，属于体系内最成功、价值最高的三家上市企业。"},
 {slug:"chung-cheng-salt",title:"中正盐业",category:["经济"],status:"已确立",summary:"蒋氏家族中正体系的旗舰上市公司之一，属于体系内最成功、价值最高的三家上市企业。"},
 {slug:"chung-cheng-chemical",title:"中正化工",category:["经济"],status:"已确立",summary:"蒋氏家族中正体系的旗舰上市公司之一，属于体系内最成功、价值最高的三家上市企业。"},
 {slug:"victoria-institute-of-technology",title:"维多利亚理工学院",english:"Victoria Institute of Technology (VIT)",category:["教育"],status:"已确立",aliases:["VIT"],summary:"雅礼重要的技术与工程研究型大学。详细校史、院系与校址尚未提供。",sections:expanded("学术定位",["维多利亚理工学院（VIT）是雅礼主要的技术与工程研究型大学。现有设定未提供创校时间、具体校区、学科排名或院系名单。"] )},
 {slug:"malaysia-japan-russia-university",title:"亚日俄大学",category:["教育"],status:"已确立",summary:"由马来西亚、日本与俄罗斯三方联合创办的大学；中文名称来源于三国名称组合。",sections:expanded("名称与创办",["亚日俄大学由马来西亚、日本与俄罗斯三方联合创办。其中文名称取自三国名称的组合，并非外文校名的音译。现阶段没有确定的英文正式名称。"] )},
 {slug:"yarrie-royal-academy-of-sciences",title:"雅礼皇家科学院",category:["教育","王室"],status:"条目短小",summary:"雅礼的皇家科学院机构。研究领域、组织架构与创设时间尚未设定。"},
 {slug:"poke-knight",title:"国王枢密执行骑士团",english:"POKE KNIGHT",category:["军事","政治"],status:"已确立",aliases:["POKE KNIGHT"],summary:"雅礼国家机构，共有56个代号席位；其职责与组织结构尚待补充。",sections:expanded("组织",["国王枢密执行骑士团又称 POKE KNIGHT，共设56个代号席位。现有资料尚未确定席位职责、任命方式及其与其他国家机关的关系。"] )},
 {slug:"yarrie-royal-armed-forces",title:"雅礼王家武装部队",category:["军事","王室"],status:"已确立",summary:"雅礼王冠军事统帅权相关的国家武装力量。兵种构成、规模与指挥链尚未完整设定。",sections:expanded("统帅权",["雅礼王家武装部队处于王冠军事统帅权的宪制框架之内。现有设定确认君主拥有军事指挥权，未进一步说明部队编制、文官监督制度及指挥程序。"] )}
];

export const articleBySlug = (slug:string) => articles.find(a=>a.slug===slug);
export const articlePath = (slug:string) => `/wiki/${slug}`;
export const getCategory = (slug:string) => (Object.entries(categoryInfo) as [Category,{slug:string;description:string}][]).find(([,v])=>v.slug===slug)?.[0];
export const featuredSlugs=["the-crown-of-yarrie","kingdom-of-yarrie","william-v","2026-crown-restoration-crisis"];
