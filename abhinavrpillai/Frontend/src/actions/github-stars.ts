"use server";

import { cacheLife } from "next/cache";
import { config } from "@/data/config";

// Unauthenticated GitHub API = 60 req/hr per IP; 5min cache -> ~12 req/hr
// Handled gracefully so API errors or rate-limits never crash the SSR page render.
export async function getGithubStars(): Promise<number> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 300 });

  try {
    const res = await fetch(
      `https://api.github.com/repos/${config.githubUsername}/${config.githubRepo}`,
      { headers: { Accept: "application/vnd.github+json" } },
    );
    if (!res.ok) {
      console.warn(`GitHub API Warning: responded with status ${res.status}`);
      return 0; // return fallback star count instead of throwing
    }

    const data = await res.json();
    if (typeof data.stargazers_count !== "number") {
      return 0;
    }
    return data.stargazers_count;
  } catch (err) {
    console.warn("Failed to fetch github stars:", err);
    return 0; // fallback gracefully on network errors
  }
}
