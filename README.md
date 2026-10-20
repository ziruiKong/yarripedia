# Yarripedia（雅礼百科全书）

一个以雅礼王国为主题的中文百科全书网站，使用 Next.js App Router、TypeScript、Tailwind CSS 和 Lucide 图标构建。基础条目存放在本地数据文件；Google 登录为可选配置，编辑记录在本地开发时写入回退文件，部署到 Sites 后写入 Cloudflare D1 云数据库。

## 安装与运行

需要 Node.js 20 或更新版本，以及 pnpm、npm 或其他兼容包管理器。

```bash
pnpm install
pnpm dev
```

打开终端显示的本地地址（通常为 `http://localhost:3000`）。生产构建和预览：

```bash
pnpm build
pnpm start
```

## Google 登录与编辑记录

登录需要一个 Google OAuth 网页客户端。复制 `.env.example` 为 `.env.local`，填入 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`，并将 `SESSION_SECRET` 替换成至少 32 个字符的随机密钥。Google Cloud Console 中的已获授权重定向 URI 添加：

```text
http://localhost:3000/api/auth/google/callback
```

然后重启 `pnpm dev` 或 `pnpm start`。登录会通过 Google OpenID Connect 读取姓名、邮箱和头像。部署到 Sites 时，`.openai/hosting.json` 中的 `d1: "DB"` 会为 worker 注入 D1 绑定，部署迁移 `drizzle/0000_amusing_phantom_reporter.sql` 后，条目编辑和贡献记录会写入云端并可在不同实例间共享；个人主页只读取当前登录用户的记录。未连接 D1 的本地开发环境会自动使用项目 `.local-data/wiki-store.json` 作为回退，此文件已加入 `.gitignore`。

首次接入云端数据库时执行生成的迁移（部署平台会根据该文件应用）：

```text
drizzle/0000_amusing_phantom_reporter.sql
```

## 条目数据

文章数据位于 `lib/data.ts`。每个 `Article` 包含：

- `slug`：条目 URL，生成 `/wiki/[slug]`
- `title`、`english`、`aliases`：名称与搜索词
- `category`：分类标签，条目会自动进入分类索引
- `status`：已确立、草稿或条目短小
- `summary`、`sections`：摘要与正文
- `infobox`：可选的 `[字段名, 字段值]` 数组

新增条目时，在 `articles` 数组添加一个对象。搜索、相关条目列表、分类索引和随机条目会读取同一份数据。文章含有 `sections` 时，目录会根据章节自动生成。缺少正文的条目会显示条目短小说明。

## 分类

在 `lib/data.ts` 的 `categoryInfo` 中添加分类名称、路由 slug 和介绍。首页目录目前在 `components/HomeSections.tsx` 的 `categoryOrder` 中声明展示顺序；需要在该数组加入新分类，首页即显示新分类入口。分类路由会根据条目上的 `category` 自动索引文章。

## 外观与交互

- 顶部搜索支持中文名、英文名、别名、摘要和分类，并支持 `/`、方向键、Enter 与 Escape。
- 外观选项保存在浏览器 localStorage 中。
- 条目目录根据标题和滚动位置更新当前章节。
- 随机条目、分类导航、复制链接与引用操作均为本地功能。

## 内容边界

条目依据当前提供的雅礼世界观设定编写。尚未提供的事件细节、生平或组织资料被标记为未确定或条目短小，没有补写为既定事实。
