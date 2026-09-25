export type PostBlock =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'quote'; text: string }
  | { type: 'code'; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  tags: string[];
  blocks: PostBlock[];
};

export const CAT_STYLE: Record<string, string> = {
  PERFORMANCE: 'var(--accent)',
  'THREE.JS': 'var(--accent-cyan)',
  ARCHITECTURE: 'var(--accent-blue)',
  FRONTEND: 'var(--accent-2)',
  REACT: 'var(--warning)',
};

export const POSTS: Post[] = [
  {
    slug: 'nextjs-portfolio-performance',
    title: 'How I Got This Portfolio to a 100 Lighthouse Score',
    excerpt:
      'A real breakdown of the decisions behind the speed here — dynamic imports, self-hosted fonts, a deferred WebGL city, and performance budgets instead of guesswork.',
    category: 'PERFORMANCE',
    date: '2026-01-18',
    readTime: '6 min read',
    tags: ['Next.js', 'WebGL', 'Performance'],
    blocks: [
      { type: 'p', text: 'Speed is rarely the result of one clever trick. This site scores in the high 90s on Lighthouse because of a dozen boring, deliberate decisions that compound. Here is the breakdown of the ones that mattered most.' },
      { type: 'h2', text: 'Start with the bundle, not the browser' },
      { type: 'p', text: 'The single biggest win was deciding what ships on the initial load. The whole site is static HTML, so server rendering cost nothing to baseline. The Three.js city — the heavy part — is loaded as an async, client-only chunk that mounts only after hydration. Users see a painted page immediately; the city fades in over the first frames.' },
      { type: 'code', text: 'const City = dynamic(() => import("@/components/SiteInteractions"), { ssr: false });' },
      { type: 'h2', text: 'Self-host your fonts' },
      { type: 'p', text: 'External font <link> tags are render-blocking and leak a request to a third party. next/font downloads the font at build time, subsets it to the glyphs actually used, and serves it from the same origin with correct preloading. This site uses two families with carefully limited weights.' },
      { type: 'h2', text: 'Tier the expensive work by device' },
      { type: 'p', text: 'Not every device needs the full city. A small performance tier map picks building counts, window counts, and particle budgets based on viewport size. Mobile gets a lighter scene; large desktop monitors get everything. The rendering loop respects prefers-reduced-motion and stops entirely when the tab is hidden.' },
      { type: 'list', items: [
        'Small screens get fewer buildings, windows and particles — the scene is still alive, just cheaper.',
        'Global event listeners are passive where the browser allows it.',
        'IntersectionObserver drives reveals instead of scroll handlers computing geometry every frame.',
      ] },
      { type: 'h2', text: 'Set budgets, then measure' },
      { type: 'p', text: 'The important habit: every change is measured against the same targets. Main-thread time, LCP, and first-load JS stay watched during development, not just after launch. Pages that stay under budget stay fast — performance becomes a constraint of the design instead of an afterthought.' },
      { type: 'quote', text: 'A fast site is the cheapest feature you can ship. It improves every metric that matters, and it never needs a redesign.' },
    ],
  },
  {
    slug: 'procedural-city-webgl',
    title: 'Building a Procedural City in WebGL',
    excerpt:
      'How the interactive city on this site was built — instanced geometry, procedural textures, a scroll-driven camera tour, and the tricks that keep 90fps on modest laptops.',
    category: 'THREE.JS',
    date: '2025-11-02',
    readTime: '8 min read',
    tags: ['Three.js', 'WebGL', 'Canvas'],
    blocks: [
      { type: 'p', text: 'The city behind this portfolio is not a model someone made in Blender. It is generated at runtime from about two thousand lines of procedural code — every block, window, road and light computed rather than modeled. Building it that way made the whole thing endless and cheap.' },
      { type: 'h2', text: 'Instancing beats a thousand meshes' },
      { type: 'p', text: 'A city of a few hundred buildings, each with a few dozen window planes, would destroy the draw-call budget if every piece was its own mesh. Instead everything shareable is instanced: one building geometry drawn hundreds of times, one window texture stamped across every facade, all moved with a single draw call via matrix attributes.' },
      { type: 'code', text: 'const instanced = new THREE.InstancedMesh(geo, mat, COUNT);' },
      { type: 'h2', text: 'Textures at runtime, not in a folder' },
      { type: 'p', text: 'Building textures are painted onto off-screen canvases at startup — concrete with formwork lines, brick with staggered courses, windows that glow in different colors per district. No image assets to ship, no network weight, and every district can carry its own palette.' },
      { type: 'h2', text: 'The camera rides the scrollbar' },
      { type: 'p', text: 'Scroll position maps onto a path through the city. Keyframes along the road network describe where the camera should be and look at every ten percent of the page, and a smooth eased value interpolates between them. Lenis handles the smoothing, so the camera never feels steppy even on fast scrolls.' },
      { type: 'h2', text: 'Respect the device' },
      { type: 'p', text: 'The scene probes WebGL support before starting, falls back to a static background if the browser answers no, and retries with conservative settings if the first renderer fails. A lost context adds a class that swaps in the fallback instead of showing a dead canvas. Reduced-motion users never see the tour at all.' },
      { type: 'quote', text: 'Procedural generation is a performance strategy as much as a design one — you trade a little compute at startup for a world that costs almost nothing to keep alive.' },
    ],
  },
  {
    slug: 'full-stack-architecture-principles',
    title: "The Full-Stack Developer's Golden Rules",
    excerpt:
      'Shaping interfaces, APIs, databases and deployments into one system — the principles behind shipping products that stay maintainable past the launch day.',
    category: 'ARCHITECTURE',
    date: '2025-08-14',
    readTime: '5 min read',
    tags: ['Architecture', 'APIs', 'Database'],
    blocks: [
      { type: 'p', text: 'Full-stack work is really systems work. The frontend, API, database and deployment are not four jobs — they are four layers of one product. These are the rules I keep coming back to when that product starts to grow.' },
      { type: 'h2', text: 'The API is a contract, not an implementation detail' },
      { type: 'p', text: 'Once a response shape ships, changing it costs other people time. So contracts get designed at the boundary: typed request and response models, explicit status semantics, and versioning decided before the first consumer exists. A typed API layer means the frontend and backend can evolve without renegotiating every field.' },
      { type: 'list', items: [
        'Model inputs and outputs explicitly — untyped JSON is where drift begins.',
        'Keep database schema close to the API shape, but not identical; the boundary exists for a reason.',
        'Make breaking changes a deliberate, versioned event, never a silent side effect.',
      ] },
      { type: 'h2', text: 'Data decides the architecture' },
      { type: 'p', text: 'Most application complexity is data complexity. Normalized tables, typed ORM models, and migrations that run forward without fear keep a system honest. When data is structured and indexed, new features stop being archaeology.' },
      { type: 'h2', text: 'Deploy early, deploy often' },
      { type: 'p', text: 'The least-maintainable system is the one nobody can ship. Continuous deployment, preview environments, and monitoring wired in from day one make every change small and reversible. Deployments that stay out of the way let the team spend its energy on the product instead of the pipeline.' },
      { type: 'h2', text: 'Optimize for the next developer' },
      { type: 'p', text: 'Someone will maintain this after you — sometimes it will be you, six months from now, with no memory of the clever bit you wrote. Clear structure, honest naming, and code that reads like prose are not polish; they are the cheapest insurance a system can have.' },
      { type: 'quote', text: 'A system is maintainable when every layer can change without every layer changing.' },
    ],
  },
  {
    slug: 'custom-tailwind-design-systems',
    title: 'Systems, Not Pages: Building a Design System With Tailwind',
    excerpt:
      'Utility-first CSS is a trap when it stays at the class level. How tokens, components, and constraint-driven design keep a UI coherent as it grows.',
    category: 'FRONTEND',
    date: '2025-05-09',
    readTime: '5 min read',
    tags: ['Tailwind', 'CSS', 'Design Systems'],
    blocks: [
      { type: 'p', text: 'Tailwind solves a real problem — shipping UI fast without writing bespoke CSS for every component. But a codebase full of long utility strings is not a design system; it is a pile of one-off decisions. The unlock is treating the utility layer as the raw material for reusable system parts.' },
      { type: 'h2', text: 'Tokens before twins' },
      { type: 'p', text: 'Every design decision that repeats — spacing, radius, shadow, color, type scale — becomes a token with a name and a reason. When the spacing scale lives in one place, consistent layout stops being a care, and an audit stops being a scavenger hunt.' },
      { type: 'list', items: [
        'Name tokens by intent (space-section, radius-card) not by pixels.',
        'Clamp the scale. Ten spacing steps, five radii, one type ramp — constraint is what makes it a system.',
        'Reference tokens in every component; inline magic values are how drift starts.',
      ] },
      { type: 'h2', text: 'Components are the vocabulary' },
      { type: 'p', text: 'Buttons, cards, chips, inputs — these are the words the product speaks. Each one is a small, typed component with a narrow set of variants. Consuming teams pick a variant, not a color. The design stays recognisable because the components are all speaking the same dialect.' },
      { type: 'h2', text: 'The feedback loop' },
      { type: 'p', text: 'Systems only survive when they are cheap to use. If the abstraction makes the common case harder than raw utilities, developers will route around it. Every component earns its place by being praised, not tolerated.' },
      { type: 'quote', text: 'A design system is not a rulebook; it is a set of defaults so good that going off-script feels like extra work.' },
    ],
  },
  {
    slug: 'nextjs-data-fetching-patterns',
    title: 'Data Fetching in Next.js: Picking the Right Pattern',
    excerpt:
      'Server components, client fetching, ISR and caching — a practical map for deciding where data should load, so pages stay fast without becoming stale.',
    category: 'REACT',
    date: '2024-12-20',
    readTime: '7 min read',
    tags: ['Next.js', 'React', 'Data'],
    blocks: [
      { type: 'p', text: 'The single most confusing part of modern Next.js is where your data should load. The good news is the framework has converged on a clear default: load as much as possible on the server, as close to your data as possible, and only move work client-side when there is a real reason.' },
      { type: 'h2', text: 'Server-first by default' },
      { type: 'p', text: 'A server component can query the database directly and stream rendered HTML to the client. That is less JavaScript, less round-trip overhead, and no loading-state dance for content that can be static. If the page can be built once and served everywhere, that wins.' },
      { type: 'h2', text: 'When to bring it to the client' },
      { type: 'list', items: [
        'Live data that changes faster than a sensible cache — dashboards, feeds, search-as-you-type.',
        'User-specific data that should never be cached globally.',
        'Interactions that mutate then refetch — optimistic UI, forms, inline actions.',
      ] },
      { type: 'h2', text: 'Caching is the mental model' },
      { type: 'p', text: 'Next.js Next caching looks like a feature list, but it is really a question: how stale is too stale? Static everything, revalidate on an interval, revalidate on demand, or never cache — each tier trades freshness for speed. Pick the tier that matches the content, and document the choice next to the query.' },
      { type: 'quote', text: 'The right data pattern is the one that makes the page fast today and the code simple next month.' },
    ],
  },
];

export function getAllPosts(): Post[] {
  return [...POSTS].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(slug: string): Post | undefined {
  return POSTS.find((post) => post.slug === slug);
}

export function getHeadings(post: Post): { text: string; id: string }[] {
  let order = 0;
  return post.blocks
    .filter((block): block is Extract<PostBlock, { type: 'h2' }> => block.type === 'h2')
    .map((block) => ({ text: block.text, id: headingId(block.text, order++) }));
}

export function headingId(text: string, index: number): string {
  const base = text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return `${base || 'section'}-${index}`;
}

export function getRelated(post: Post, count = 2): Post[] {
  return getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aSame = a.category === post.category ? 1 : 0;
      const bSame = b.category === post.category ? 1 : 0;
      if (aSame !== bSame) return bSame - aSame;
      return a.date < b.date ? 1 : -1;
    })
    .slice(0, count);
}

export function getAdjacent(post: Post): { prev: Post | null; next: Post | null } {
  const sorted = getAllPosts();
  const idx = sorted.findIndex((p) => p.slug === post.slug);
  return {
    prev: idx > 0 ? sorted[idx - 1] : null,
    next: idx < sorted.length - 1 ? sorted[idx + 1] : null,
  };
}