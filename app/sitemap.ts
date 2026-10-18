import type { MetadataRoute } from "next";
import { articles, articlePath, categoryInfo } from "@/lib/data";

const siteUrl = "https://yarripedia.rayk.chatgpt.site";

export default function sitemap(): MetadataRoute.Sitemap {
  const articleUrls = articles.map((article) => ({
    url: `${siteUrl}${articlePath(article.slug)}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  const categoryUrls = Object.values(categoryInfo).map((category) => ({
    url: `${siteUrl}/category/${category.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${siteUrl}/profile`, changeFrequency: "monthly", priority: 0.2 },
    ...categoryUrls,
    ...articleUrls,
  ];
}
