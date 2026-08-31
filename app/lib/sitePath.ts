const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function sitePath(path: string) {
  if (!path.startsWith("/") || path.startsWith("//")) return path;
  if (!basePath || path === basePath || path.startsWith(`${basePath}/`)) return path;
  return `${basePath}${path}`;
}
