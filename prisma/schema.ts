import { defineContract } from '@prisma/orm-mongo/contract-builder';

/** 
 * Waris Ali — Custom CMS Backend (MongoDB provider).
 *
 * Prisma 8 for MongoDB authors models with the contract builder (`defineContract`).
 * The generated contract emits `_id: CodecTypes['mongo/objectId@1']` for every
 * model and serialises `Date` fields as BSON UTC datetime.
 *
 * The generated client exposes one top-level key per root (`Project`,
 * `Experience`, `StackItem`, `BlogPost`, `Admin`, `AboutContent`) under
 * `db.orm`, and queries are chained exactly like Prisma's query-builder.
 */

export const contract = defineContract(
  {},
  ({ field, model }) => ({
    models: {
      Admin: model('Admin', {
        collection: 'admins',
        fields: {
          _id: field.objectId(),
          email: field.string().optional(),
          passwordHash: field.string().optional(),
          fullName: field.string().optional(),
          role: field.string().optional(),
          createdAt: field.date().optional(),
          updatedAt: field.date().optional(),
        },
      }),
      Project: model('Project', {
        collection: 'projects',
        fields: {
          _id: field.objectId(),
          title: field.string().optional(),
          slug: field.string().optional(),
          /** Short uppercase eyebrow above the title, e.g. "LUXURY WATCH COMMERCE PLATFORM". */
          category: field.string().optional(),
          /** Which decorative preview the home/project card draws: swiftza | zirconia | ev | default. */
          visual: field.string().optional(),
          description: field.string().optional(),
          liveUrl: field.string().optional(),
          caseStudyUrl: field.string().optional(),
          sourceUrl: field.string().optional(),
          tags: field.string().many().optional(),
          imageUrl: field.string().optional(),
          order: field.int32().optional(),
          published: field.bool().optional(),
          createdAt: field.date().optional(),
          updatedAt: field.date().optional(),
        },
      }),
      Experience: model('Experience', {
        collection: 'experience',
        fields: {
          _id: field.objectId(),
          year: field.int32().optional(),
          title: field.string().optional(),
          description: field.string().optional(),
          tags: field.string().many().optional(),
          order: field.int32().optional(),
          createdAt: field.date().optional(),
          updatedAt: field.date().optional(),
        },
      }),
      StackItem: model('StackItem', {
        collection: 'stack_items',
        fields: {
          _id: field.objectId(),
          category: field.string().optional(),
          name: field.string().optional(),
          order: field.int32().optional(),
          createdAt: field.date().optional(),
          updatedAt: field.date().optional(),
        },
      }),
      AboutContent: model('AboutContent', {
        collection: 'about_content',
        fields: {
          _id: field.objectId(),
          section: field.string().optional(),
          content: field.string().optional(),
          createdAt: field.date().optional(),
          updatedAt: field.date().optional(),
        },
      }),
      BlogPost: model('BlogPost', {
        collection: 'blog_posts',
        fields: {
          _id: field.objectId(),
          title: field.string().optional(),
          slug: field.string().optional(),
          excerpt: field.string().optional(),
          content: field.string().optional(),
          coverImage: field.string().optional(),
          tags: field.string().many().optional(),
          published: field.bool().optional(),
          publishedAt: field.date().optional(),
          readingTime: field.int32().optional(),
          createdAt: field.date().optional(),
          updatedAt: field.date().optional(),
        },
      }),
      /**
       * Append-only trail of every admin mutation, written by the CMS
       * handlers in `lib/cms/factory.ts` after a successful write.
       *
       * `before`/`after` hold the JSON snapshot of the fields the request
       * actually touched, so the admin audit viewer can show a real diff
       * without needing the current document to still exist (a delete keeps
       * its `before` snapshot, which is the only copy left of the record).
       */
      AuditLog: model('AuditLog', {
        collection: 'audit_log',
        fields: {
          _id: field.objectId(),
          action: field.string().optional(),
          resource: field.string().optional(),
          recordId: field.string().optional(),
          label: field.string().optional(),
          actor: field.string().optional(),
          before: field.string().optional(),
          after: field.string().optional(),
          createdAt: field.date().optional(),
        },
      }),
    },
  }),
);

// Field-level decorators (@id, @default, @map, @db) are documented in
// `@prisma/orm-mongo/contract-builder` (Prisma 8 authoring). They translate
// exactly to the storage-shape you requested without touching the database.
