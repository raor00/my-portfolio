import type { MetadataRoute } from "next";
import { projects } from "@/config/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/proyectos`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/sobre-mi`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contacto`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/proyectos/${project.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: project.featured ? 0.8 : 0.6,
  }));

  return [...staticRoutes, ...projectRoutes];
}
