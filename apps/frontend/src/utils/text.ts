export const cleanArticleExcerpt = (value?: string | null): string => {
  if (!value) return "";
  return value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/https?:\/\/(localhost|127\.0\.0\.1|backend)(:[0-9]+)?\S*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();
};
