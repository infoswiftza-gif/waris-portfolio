/**
 * Read shapes for the public pages.
 *
 * The generated Prisma 8 contract types every collection field as `unknown`
 * under this project's `strict: false` tsconfig, so each public query result
 * is cast to one of these row types to make property access well-typed again.
 * The field names mirror `prisma/contract.json`.
 */

export type StackItemRow = {
  _id?: unknown;
  category?: string | null;
  name?: string | null;
  order?: number | null;
};

export type ExperienceRow = {
  _id?: unknown;
  year?: number | null;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  order?: number | null;
};

export type ProjectRow = {
  _id?: unknown;
  title?: string | null;
  slug?: string | null;
  category?: string | null;
  visual?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  liveUrl?: string | null;
  caseStudyUrl?: string | null;
  sourceUrl?: string | null;
  tags?: string[] | null;
  order?: number | null;
  published?: boolean | null;
};

export type BlogPostRow = {
  _id?: unknown;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  coverImage?: string | null;
  tags?: string[] | null;
  readingTime?: number | null;
  published?: boolean | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
};
