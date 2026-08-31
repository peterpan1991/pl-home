import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = isGitHubPages ? "/pl-home" : "";

const nextConfig: NextConfig = {
  output: isGitHubPages ? "export" : undefined,
  basePath: githubPagesBasePath,
  assetPrefix: githubPagesBasePath || undefined,
  trailingSlash: isGitHubPages,
  images: {
    unoptimized: isGitHubPages,
  },
};

export default nextConfig;
