import type { MarkdownHeading } from '../../../lib/markdown';

type TableOfContentsProps = {
  headings: MarkdownHeading[];
};

export function TableOfContents({ headings }: TableOfContentsProps) {
  if (!headings.length) {
    return null;
  }

  return (
    <nav aria-label="Daftar isi" className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-700">Daftar isi</h2>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level > 2 ? 'ml-4' : undefined}>
            <a
              href={`#${heading.id}`}
              className="inline-flex hover:text-emerald-600 focus-visible:text-emerald-600"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
