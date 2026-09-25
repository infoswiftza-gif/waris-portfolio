import type { PostBlock } from '@/lib/posts';

/**
 * Markdown → `PostBlock[]` for the public blog post page.
 *
 * `BlogPost.content` is authored as raw Markdown in the admin textarea, but
 * the renderer in `app/blog/[slug]/page.tsx` consumes the `PostBlock` union
 * declared in `lib/posts.ts`. This module bridges the two at render time so
 * the stored document shape stays a plain string and no contract change or
 * migration is required.
 *
 * Inline syntax is returned as a token list rather than HTML so the component
 * can render it as real React nodes — post bodies are never injected through
 * `dangerouslySetInnerHTML`.
 */

export type InlineToken =
  | { kind: 'text'; value: string }
  | { kind: 'strong'; value: string }
  | { kind: 'em'; value: string }
  | { kind: 'code'; value: string }
  | { kind: 'link'; value: string; href: string };

const FENCE = /^(?:```|~~~)\s*([\w+-]*)\s*$/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const QUOTE = /^>\s?(.*)$/;
const BULLET = /^\s*(?:[-*+]|\d+\.)\s+(.*)$/;
const INLINE =
  /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))/g;

/** Split a line of text into styled / linked / plain tokens. */
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  INLINE.lastIndex = 0;
  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > cursor) {
      tokens.push({ kind: 'text', value: text.slice(cursor, match.index) });
    }
    if (match[2] !== undefined) tokens.push({ kind: 'strong', value: match[2] });
    else if (match[4] !== undefined) tokens.push({ kind: 'em', value: match[4] });
    else if (match[6] !== undefined) tokens.push({ kind: 'code', value: match[6] });
    else if (match[8] !== undefined) tokens.push({ kind: 'link', value: match[8], href: match[9] });
    cursor = INLINE.lastIndex;
  }
  if (cursor < text.length) tokens.push({ kind: 'text', value: text.slice(cursor) });

  return tokens;
}

const isBlockStart = (line: string) =>
  FENCE.test(line.trim()) || HEADING.test(line) || QUOTE.test(line) || BULLET.test(line);

/**
 * Convert a Markdown document into the block union the post page renders.
 *
 * Headings at any level collapse to `h2` because the table of contents and the
 * anchor ids are both derived from `h2` blocks.
 */
export function markdownToBlocks(markdown: string): PostBlock[] {
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
  const blocks: PostBlock[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Fenced code block — capture everything up to the closing fence.
    const fence = FENCE.exec(line.trim());
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^(?:```|~~~)\s*$/.test(lines[i].trim())) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // consume the closing fence
      blocks.push({ type: 'code', text: body.join('\n') });
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ type: 'h2', text: heading[2].trim() });
      i += 1;
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      const body: string[] = [];
      while (i < lines.length) {
        const q = QUOTE.exec(lines[i]);
        if (!q) break;
        body.push(q[1]);
        i += 1;
      }
      blocks.push({ type: 'quote', text: body.join(' ').trim() });
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      const items: string[] = [];
      while (i < lines.length) {
        const b = BULLET.exec(lines[i]);
        if (!b) break;
        items.push(b[1].trim());
        i += 1;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    // Paragraph — consume until a blank line or the start of another block.
    const body: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) {
      body.push(lines[i].trim());
      i += 1;
    }
    // Guarantee progress on a line the while-loop above refused to consume.
    if (body.length === 0) {
      body.push(line.trim());
      i += 1;
    }
    blocks.push({ type: 'p', text: body.join(' ').trim() });
  }

  return blocks;
}
