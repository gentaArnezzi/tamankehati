export const cleanArticleExcerpt = (value?: string | null): string => {
  if (!value) return "";
  return value
    // Remove all markdown image syntax: ![alt](url) or ![alt] or ![alt](url) with any characters
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "")
    .replace(/!\[([^\]]*)\]/g, "")
    // Remove any remaining markdown image patterns (catch-all)
    .replace(/!\[[^\]]*\]/g, "")
    // Remove localhost/backend URLs
    .replace(/https?:\/\/(localhost|127\.0\.0\.1|backend)(:[0-9]+)?\S*/gi, "")
    // Clean up multiple spaces
    .replace(/\s{2,}/g, " ")
    .trim();
};
