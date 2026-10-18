import type { MetadataRoute } from "next";
import { config } from "@/data/config";

const routes = ["/", "/resume", "/dev-portfolio", "/blogs"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = config.site;

  return routes.map((route) => ({
    url: `${baseUrl}${route === "/" ? "" : route}`,
    lastModified: new Date(),
    changeFrequency: route === "/blogs" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}