import { blogDef } from './blog';
import { experienceDef } from './experience';
import { projectsDef } from './projects';
import { type ResourceDef } from './registry';
import { stackDef } from './stack';

/**
 * Every admin-managed collection, in one map.
 *
 * The dashboard, the audit log and the bulk routes are all generic, so they
 * read from here rather than importing four modules and branching on `key`.
 */
export const RESOURCES: Record<string, ResourceDef> = {
  blog: blogDef,
  projects: projectsDef,
  experience: experienceDef,
  stack: stackDef,
};

export const RESOURCE_LIST: ResourceDef[] = Object.values(RESOURCES);

export function getResource(key: string): ResourceDef | undefined {
  return RESOURCES[key];
}

export * from './registry';
export { createResource } from './factory';
export { labelFor, writeAudit } from './audit';
export type { AuditInput } from './audit';
export { blogDef, experienceDef, projectsDef, stackDef };
export { STACK_CATEGORIES, type StackCategory } from './registry';
export { PREVIEW_VARIANTS, type PreviewVariant } from './preview';
