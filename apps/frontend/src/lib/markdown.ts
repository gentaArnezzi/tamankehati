export type MarkdownHeading = {
  id: string;
  text: string;
  level: number;
};

export type MarkdownNode =
  | { type: 'paragraph'; content: string[] }
  | { type: 'heading'; id: string; level: number; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'code'; language: string | null; content: string[] };

export type MarkdownParseResult = {
  nodes: MarkdownNode[];
  headings: MarkdownHeading[];
  wordCount: number;
};

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export function parseMarkdown(markdown: string): MarkdownParseResult {
  const result: MarkdownParseResult = {
    nodes: [],
    headings: [],
    wordCount: 0,
  };

  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let codeBlock: { language: string | null; content: string[] } | null = null;

  const flushParagraph = () => {
    if (paragraph.length) {
      result.nodes.push({ type: 'paragraph', content: paragraph });
      result.wordCount += paragraph.join(' ').split(/\s+/).filter(Boolean).length;
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listItems.length) {
      result.nodes.push({ type: 'list', items: listItems });
      listItems.forEach((item) => {
        result.wordCount += item.split(/\s+/).filter(Boolean).length;
      });
      listItems = [];
    }
  };

  const flushCode = () => {
    if (codeBlock) {
      result.nodes.push({ type: 'code', language: codeBlock.language, content: codeBlock.content });
      codeBlock = null;
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();

    if (codeBlock) {
      if (line.startsWith('```')) {
        flushCode();
        return;
      }
      codeBlock.content.push(rawLine);
      return;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      return;
    }

    if (line.startsWith('```')) {
      flushParagraph();
      flushList();
      codeBlock = {
        language: line.slice(3).trim() || null,
        content: [],
      };
      return;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugify(text);
      result.nodes.push({ type: 'heading', id, level, text });
      result.headings.push({ id, level, text });
      result.wordCount += text.split(/\s+/).filter(Boolean).length;
      return;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      listItems.push(line.slice(2).trim());
      return;
    }

    paragraph.push(line);
  });

  flushParagraph();
  flushList();
  flushCode();

  return result;
}
