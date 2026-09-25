import { cmsDb } from '@/prisma/db';
import homeDefaults from '@/lib/home-defaults.json';
import { PREVIEW_VARIANTS, type PreviewVariant } from './preview';
import type { ExperienceRow, ProjectRow, StackItemRow } from './types';

/**
 * Home page data loader.
 *
 * The home page (`app/page.tsx`) renders through `lib/markup.ts`, which needs
 * the three CMS-backed collections as plain row arrays: published projects, the
 * full experience timeline, and the technology constellation.
 *
 * Unlike the dedicated `/projects`, `/experience` and `/stack` pages, this one
 * is read once per request and injected into an HTML string, so it also has to
 * do the category grouping for the constellation grid (one `.const-panel` per
 * category, one `.tnode` per technology) and pick the decorative preview
 * variant for each project card.
 *
 * Every collection falls back to `lib/home-defaults.json` while it is still
 * empty, so a fresh database (or one that has not been seeded yet) still shows
 * the original hand-written home page instead of three empty sections.
 */

/** Categories are stored as free strings; this is the display order. */
const CATEGORY_ORDER = ['FRONTEND', 'BACKEND', 'DATABASE', 'CMS', 'DEPLOYMENT', 'OTHER'];

export type HomeProject = {
  title: string;
  slug: string;
  category: string;
  visual: PreviewVariant;
  description: string;
  liveUrl: string;
  caseStudyUrl: string;
  tags: string[];
};

export type HomeExperience = {
  year: string;
  title: string;
  description: string;
  tags: string[];
};

export type HomeStackGroup = {
  category: string;
  items: string[];
};

export type HomeContent = {
  projects: HomeProject[];
  experience: HomeExperience[];
  stack: HomeStackGroup[];
};

const toPreviewVariant = (value: unknown): PreviewVariant =>
  PREVIEW_VARIANTS.includes(value as PreviewVariant) ? (value as PreviewVariant) : 'default';

const text = (value: unknown) => (value === null || value === undefined ? '' : String(value).trim());

const toProject = (row: ProjectRow): HomeProject => ({
  title: text(row.title) || 'Untitled project',
  slug: text(row.slug),
  category: text(row.category),
  visual: toPreviewVariant(row.visual),
  description: text(row.description),
  liveUrl: text(row.liveUrl),
  caseStudyUrl: text(row.caseStudyUrl),
  tags: (row.tags ?? []).map((tag) => String(tag)),
});

const toExperience = (row: ExperienceRow): HomeExperience => ({
  year: text(row.year) || '—',
  title: text(row.title),
  description: text(row.description),
  tags: (row.tags ?? []).map((tag) => String(tag)),
});

/** Collapse a flat `order`-sorted stack list into one entry per category. */
const toStackGroups = (rows: StackItemRow[]): HomeStackGroup[] => {
  const groups = new Map<string, string[]>();

  for (const row of rows) {
    const category = text(row.category).toUpperCase() || 'OTHER';
    const name = text(row.name);
    if (!name) continue;
    const items = groups.get(category) ?? [];
    items.push(name);
    groups.set(category, items);
  }

  return [...groups.entries()]
    .map(([category, items]) => ({ category, items }))
    .sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a.category);
      const bi = CATEGORY_ORDER.indexOf(b.category);
      return (ai === -1 ? CATEGORY_ORDER.length : ai) - (bi === -1 ? CATEGORY_ORDER.length : bi);
    });
};

export async function loadHomeContent(): Promise<HomeContent> {
  const db = await cmsDb();

  // The generated client's `.all()` resolves to an `AsyncIterableResult`, so
  // the `Promise.all` below would not await it — each query is awaited first and
  // then cast to its row type.
  const projectRows = (await db.orm.projects.orderBy({ order: 1 }).limit(99).all()) as unknown as ProjectRow[];
  const experienceRows = (await db.orm.experience.orderBy({ order: 1 }).limit(50).all()) as unknown as ExperienceRow[];
  const stackRows = (await db.orm.stack_items.orderBy({ order: 1 }).limit(99).all()) as unknown as StackItemRow[];

  const published = projectRows.filter((row) => row.published === true);

  const projects = (published.length ? published : homeDefaults.projects.map((row) => row as ProjectRow)).map(toProject);
  const experience = (
    experienceRows.length ? experienceRows : homeDefaults.experience.map((row) => row as ExperienceRow)
  ).map(toExperience);
  const stack = toStackGroups(
    stackRows.length ? stackRows : homeDefaults.stack.map((row) => row as StackItemRow),
  );

  return { projects, experience, stack };
}
