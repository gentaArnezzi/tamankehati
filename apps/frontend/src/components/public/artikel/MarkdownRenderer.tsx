'use client';

import { useEffect, useMemo, Fragment, createElement, type ReactNode } from 'react';
import Link from 'next/link';
import { parseMarkdown, type MarkdownHeading, type MarkdownNode } from '../../../lib/markdown';
import { cn } from '../../ui/utils';
import { JSX } from 'react';

type MarkdownRendererProps = {
  markdown: string;
  className?: string;
  onHeadings?: (headings: MarkdownHeading[]) => void;
};

const renderInline = (text: string, keyPrefix: string) => {
  const pattern = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\))/g;
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      nodes.push(
        <strong key={`${keyPrefix}-bold-${index}`}>{match[2]}</strong>
      );
    } else if (match[3]) {
      nodes.push(
        <em key={`${keyPrefix}-italic-${index}`}>{match[3]}</em>
      );
    } else if (match[4]) {
      nodes.push(
        <code key={`${keyPrefix}-code-${index}`} className="rounded bg-slate-100 px-1 py-0.5 text-sm">
          {match[4]}
        </code>
      );
    } else if (match[5] && match[6]) {
      nodes.push(
        <Link
          key={`${keyPrefix}-link-${index}`}
          href={match[6]}
          className="text-emerald-600 underline decoration-emerald-200 underline-offset-4 hover:text-emerald-500"
        >
          {match[5]}
        </Link>
      );
    }
    lastIndex = pattern.lastIndex;
    index += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

const renderNode = (node: MarkdownNode, index: number) => {
  switch (node.type) {
      case 'heading': {
      const level = Math.min(node.level, 4);
      const tag = `h${level}` as const;
      return createElement(tag, { key: `heading-${node.id}-${index}`, id: node.id, className: 'scroll-mt-32' }, renderInline(node.text, `heading-${index}`));
    }
    case 'paragraph':
      return (
        <p key={`paragraph-${index}`}>
          {node.content.map((line, lineIndex) => (
            <Fragment key={`paragraph-${index}-${lineIndex}`}>
              {lineIndex > 0 && <br />}
              {renderInline(line, `paragraph-${index}-${lineIndex}`)}
            </Fragment>
          ))}
        </p>
      );
    case 'list':
      return (
        <ul key={`list-${index}`}>
          {node.items.map((item, itemIndex) => (
            <li key={`list-${index}-${itemIndex}`}>{renderInline(item, `list-${index}-${itemIndex}`)}</li>
          ))}
        </ul>
      );
    case 'code':
      return (
        <pre key={`code-${index}`} className="overflow-x-auto rounded-xl bg-slate-900/95 p-4 text-sm text-slate-100">
          {node.content.join('\n')}
        </pre>
      );
    default:
      return null;
  }
};

export function MarkdownRenderer({ markdown, className, onHeadings }: MarkdownRendererProps) {
  const parsed = useMemo(() => parseMarkdown(markdown), [markdown]);

  useEffect(() => {
    onHeadings?.(parsed.headings);
  }, [parsed.headings, onHeadings]);

  return (
    <div className={cn('prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-emerald-600', className)}>
      {parsed.nodes.map((node, index) => renderNode(node, index))}
    </div>
  );
}

export { parseMarkdown };
