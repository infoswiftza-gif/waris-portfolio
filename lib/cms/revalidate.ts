/**
 * Soft-tag registry mirroring `next/cache`'s `revalidatePath` for plain API
 * routes. Public pages are static markup today, so this is a bookkeeping no-op;
 * the next request re-reads from MongoDB. Kept in one place so the four
 * resources cannot drift apart.
 */
const revalidatedPaths = new Set<string>();

export function revalidatePublicPaths(...paths: string[]) {
  for (const path of paths) revalidatedPaths.add(path);
}

export function getRevalidatedPaths() {
  return [...revalidatedPaths];
}
