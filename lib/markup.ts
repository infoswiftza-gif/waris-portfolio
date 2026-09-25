// Ported 1:1 from the original single-file build's <body> markup.
// Kept as an HTML string (rendered via dangerouslySetInnerHTML in app/page.tsx) so every
// class name, data attribute and inline style survives the TS port unchanged — the vanilla
// interaction script in components/SiteInteractions.tsx queries this DOM exactly like the
// original querySelector-based code did, so the UI/behaviour is not rewritten, only relocated.
//
// Three regions are now CMS-driven and emitted as `<!--__HOME_*__-->` placeholders that
// `buildBodyHtml()` swaps for markup rendered from the `projects`, `experience` and
// `stack_items` collections (see `lib/cms/home.ts`). Every other byte of the document is
// still the original hand-written markup, so the WebGL city, the HUD landmark tour and
// the constellation hover graph keep working against exactly the DOM they were written for.
import type { HomeContent, HomeExperience, HomeProject, HomeStackGroup } from './cms/home';

export const BODY_HTML = `

<!-- fixed WebGL city (decorative) -->
<canvas class="city-canvas" aria-hidden="true"></canvas>

<!-- atmosphere overlays -->
<div class="fx fx-scan" aria-hidden="true"></div>
<div class="fx fx-hline" aria-hidden="true"></div>
<div class="fx fx-vignette" aria-hidden="true"></div>
<div class="cursor-glow" aria-hidden="true"></div>
<div class="veil" aria-hidden="true"></div>

<!-- district HUD -->
<div class="hud" aria-hidden="true"><span class="hud-k">DISTRICT</span><span class="hud-v" id="hudName">00 / THE CORE</span></div>

<!-- navigation -->
<header class="nav" id="nav">
  <div class="nav-inner">
    <a class="brand" href="/" aria-label="WARIS.DEV — back to home"><span class="tri">▲</span>WARIS.DEV</a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/about">ABOUT</a>
      <a href="/stack">STACK</a>
      <a href="/projects">PROJECTS</a>
      <a href="/experience">EXPERIENCE</a>
      <a href="/blog">BLOG</a>
    </nav>
    <a class="btn btn-ghost btn-sm nav-cta magnetic" href="/contact">LET'S BUILD</a>
    <button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mnav" aria-label="Open menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<!-- mobile navigation -->
<div class="mnav" id="mnav" aria-hidden="true">
  <a href="/about"><i>01</i>ABOUT</a>
  <a href="/stack"><i>02</i>STACK</a>
  <a href="/projects"><i>03</i>PROJECTS</a>
  <a href="/experience"><i>04</i>EXPERIENCE</a>
  <a href="/process"><i>05</i>PROCESS</a>
  <a href="/contact"><i>06</i>CONTACT</a>
  <a href="/blog"><i>07</i>JOURNAL</a>
</div>

<main id="top">

  <!-- ======================= HERO ======================= -->
  <section class="hero" aria-label="Introduction">
    <div class="scrim" aria-hidden="true"></div>
    <div class="wrap">
      <div class="hero-inner">
        <p class="eyebrow rise rise-1"><b>FULL STACK DEVELOPER</b></p>
        <h1 class="rise rise-2">I Build <span class="grad">Digital Systems</span> That Move Ideas Forward.</h1>
        <p class="hero-sub rise rise-3">Full Stack Developer building fast, scalable, and visually refined digital experiences from frontend to backend.</p>
        <div class="hero-actions rise rise-4">
          <a class="btn btn-primary magnetic" href="#projects">View My Work <span class="arr">→</span></a>
          <a class="btn btn-ghost magnetic" href="#contact">Start a Conversation</a>
        </div>
        <p class="status rise rise-5"><span class="dot" aria-hidden="true"></span>AVAILABLE FOR SELECT PROJECTS</p>
      </div>
    </div>
    <div class="scroll-cue rise rise-5" aria-hidden="true">
      <span>SCROLL TO ENTER THE CITY</span>
      <span class="line"></span>
    </div>
  </section>

  <!-- ================== 01 · THE CORE ================== -->
  <section class="section core-section" id="about" data-landmark="0" data-hud="01 / THE CORE">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>01</b> / THE CORE</p>
        <h2 data-reveal>More Than A Developer. I Build The System Behind The Experience.</h2>
        <p class="lede" data-reveal>I work across the full stack, connecting thoughtful interfaces with reliable backend systems, structured data, APIs, and modern deployment workflows.</p>
      </div>
      <div class="core-grid">
        <div class="core-card glass" data-reveal>
          <span class="tag">FRONTEND</span>
          <p>Interfaces that feel fast, intentional, and intuitive.</p>
        </div>
        <div class="core-card glass" data-reveal>
          <span class="tag">BACKEND</span>
          <p>Reliable APIs and application logic built to scale.</p>
        </div>
        <div class="core-card glass" data-reveal>
          <span class="tag">SYSTEMS</span>
          <p>Databases, CMS, authentication, deployment, and integrations working together.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 02 · FRONTEND DISTRICT ============== -->
  <section class="section" id="frontend" data-landmark="1" data-hud="02 / FRONTEND DISTRICT">
    <div class="wrap">
      <div class="fe-grid">
        <div>
          <p class="eyebrow" data-reveal><b>02</b> / FRONTEND DISTRICT</p>
          <h2 data-reveal>Interfaces Engineered To Feel Effortless.</h2>
          <p class="lede" data-reveal>From landing pages to complex web applications, I combine strong visual systems with clean component architecture and responsive interactions.</p>
          <div class="chips" style="margin-top:32px" data-reveal>
            <span class="chip">React</span><span class="chip">Next.js</span><span class="chip">TypeScript</span>
            <span class="chip">JavaScript</span><span class="chip">HTML</span><span class="chip">CSS</span>
            <span class="chip">Tailwind</span><span class="chip">Framer Motion</span>
          </div>
        </div>
        <div class="holo glass" data-reveal aria-label="Component system checklist">
          <div class="holo-scan" aria-hidden="true"></div>
          <div class="holo-head"><span>COMPONENT SYSTEM</span><span class="live">● LIVE</span></div>
          <div class="holo-row"><span>Navigation</span><span class="ok">✓</span></div>
          <div class="holo-row"><span>Responsive UI</span><span class="ok">✓</span></div>
          <div class="holo-row"><span>Animations</span><span class="ok">✓</span></div>
          <div class="holo-row"><span>Accessibility</span><span class="ok">✓</span></div>
          <div class="holo-row"><span>Performance</span><span class="ok">✓</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 03 · BACKEND TOWER ============== -->
  <section class="section" id="backend" data-landmark="2" data-hud="03 / BACKEND TOWER">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>03</b> / BACKEND TOWER</p>
        <h2 data-reveal>The Experience Is Only As Strong As The System Behind It.</h2>
      </div>
      <div class="be-grid">
        <div class="arch" data-reveal role="img" aria-label="Architecture flow: client, application, API, business logic, database, cloud">
          <div class="arch-step">CLIENT <i>UI / SSR</i></div><div class="arch-link" aria-hidden="true"></div>
          <div class="arch-step">APPLICATION <i>NEXT.JS</i></div><div class="arch-link" aria-hidden="true"></div>
          <div class="arch-step">API <i>REST</i></div><div class="arch-link" aria-hidden="true"></div>
          <div class="arch-step">BUSINESS LOGIC <i>NODE.JS</i></div><div class="arch-link" aria-hidden="true"></div>
          <div class="arch-step">DATABASE <i>SQL / ORM</i></div><div class="arch-link" aria-hidden="true"></div>
          <div class="arch-step">CLOUD <i>DEPLOY</i></div>
        </div>
        <div>
          <div class="chips" data-reveal>
            <span class="chip">Node.js</span><span class="chip">Express</span><span class="chip">Next.js</span>
            <span class="chip">REST APIs</span><span class="chip">Authentication</span><span class="chip">Webhooks</span>
            <span class="chip">Server Logic</span>
          </div>
          <div class="status-list" data-reveal>
            <div class="status-row"><span class="k">API STATUS</span><span class="v">ONLINE</span></div>
            <div class="status-row"><span class="k">DATABASE</span><span class="v">CONNECTED</span></div>
            <div class="status-row"><span class="k">AUTH</span><span class="v">SECURE</span></div>
            <div class="status-row"><span class="k">DEPLOYMENT</span><span class="v">ACTIVE</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 04 · DATA VAULT ============== -->
  <section class="section" id="data" data-landmark="3" data-hud="04 / DATA VAULT">
    <div class="wrap">
      <div class="dv-grid">
        <div class="db-stack" style="position:relative" data-reveal aria-hidden="true">
          <div class="db-glow"></div>
          <div class="disc"></div>
          <div class="disc"></div>
          <div class="disc"></div>
        </div>
        <div>
          <p class="eyebrow" data-reveal><b>04</b> / DATA VAULT</p>
          <h2 data-reveal>Structured Data. Reliable Systems. Clean Architecture.</h2>
          <div class="dflow" data-reveal aria-label="Query flow: query, ORM, database, result">
            <span class="packet" aria-hidden="true"></span>
            <div class="dflow-step"><span class="n">01</span><span class="t">QUERY</span><span class="d">typed requests from the app layer</span></div>
            <div class="dflow-step"><span class="n">02</span><span class="t">ORM</span><span class="d">Prisma models &amp; migrations</span></div>
            <div class="dflow-step"><span class="n">03</span><span class="t">DATABASE</span><span class="d">structured, indexed, consistent</span></div>
            <div class="dflow-step"><span class="n">04</span><span class="t">RESULT</span><span class="d">fast, predictable responses</span></div>
          </div>
          <div class="chips" style="margin-top:30px" data-reveal>
            <span class="chip">PostgreSQL</span><span class="chip">MySQL</span><span class="chip">Prisma</span>
            <span class="chip">Supabase</span><span class="chip">Neon</span><span class="chip">MongoDB</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 05 · PROJECT DISTRICT ============== -->
  <section class="section" id="projects" data-landmark="4" data-hud="05 / PROJECT DISTRICT">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>05</b> / PROJECT DISTRICT</p>
        <h2 data-reveal>Things I've Actually Built.</h2>
        <p class="lede" data-reveal>Selected projects where design, engineering, and business requirements meet.</p>
      </div>

        <!--__HOME_PROJECTS__-->
    </div>
  </section>

  <!-- ============== 06 · EXPERIENCE ============== -->
  <section class="section" id="experience" data-landmark="4" data-hud="06 / EXPERIENCE">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>06</b> / EXPERIENCE</p>
        <h2 data-reveal>A Timeline Of Systems, Projects, And Problems Solved.</h2>
      </div>
      <div class="tl">
        <!--__HOME_EXPERIENCE__-->
      </div>
    </div>
  </section>

  <!-- ============== 07 · TECHNOLOGY MAP ============== -->
  <section class="section" id="stack" data-landmark="5" data-hud="07 / THE STACK">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>07</b> / THE STACK</p>
        <h2 data-reveal>The Tools Behind The City.</h2>
        <p class="lede" data-reveal>Hover a technology to see how the systems connect.</p>
      </div>
      <div class="const-grid" id="constGrid">
        <!--__HOME_STACK__-->
      </div>
    </div>
  </section>

  <!-- ============== 08 · HOW I BUILD ============== -->
  <section class="section" id="process" data-landmark="5" data-hud="08 / THE PROCESS">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>08</b> / THE PROCESS</p>
        <h2 data-reveal>From Idea To Deployed Product.</h2>
      </div>
      <div class="proc">
        <div class="proc-rail" aria-hidden="true"></div>
        <div class="proc-step" data-reveal>
          <div class="proc-num">01</div>
          <h3>DISCOVER</h3>
          <p>Understand the problem, audience, goals, and technical requirements.</p>
        </div>
        <div class="proc-step" data-reveal>
          <div class="proc-num">02</div>
          <h3>DESIGN</h3>
          <p>Define the structure, interaction system, content hierarchy, and visual direction.</p>
        </div>
        <div class="proc-step" data-reveal>
          <div class="proc-num">03</div>
          <h3>BUILD</h3>
          <p>Develop the frontend, backend, APIs, database, CMS, and integrations.</p>
        </div>
        <div class="proc-step" data-reveal>
          <div class="proc-num">04</div>
          <h3>DEPLOY</h3>
          <p>Test, optimize, deploy, monitor, and continuously improve.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 09 · CONTACT TERMINAL ============== -->
  <section class="section" id="contact" data-landmark="6" data-hud="09 / CONTACT TERMINAL">
    <div class="wrap">
      <div class="contact-grid">
        <div>
          <p class="eyebrow" data-reveal><b>09</b> / CONTACT TERMINAL</p>
          <h2 data-reveal>Have Something Worth Building?</h2>
          <p class="lede" data-reveal>Let's turn the idea into a real digital product.</p>
          <div class="hero-actions" style="margin-top:34px" data-reveal>
            <a class="btn btn-primary magnetic" href="mailto:waris0543@gmail.com">Start a Conversation <span class="arr">→</span></a>
            <a class="btn btn-ghost magnetic" href="https://github.com/" target="_blank" rel="noopener">View GitHub <span class="arr">↗</span></a>
          </div>
          <ul class="c-status" data-reveal>
            <li>AVAILABLE</li>
            <li>REMOTE FRIENDLY</li>
            <li>OPEN TO SELECT PROJECTS</li>
          </ul>
        </div>
        <div class="term glass" data-reveal>
          <div class="term-bar"><i></i><i></i><i></i><span class="t">WARIS.DEV — TERMINAL</span></div>
          <div class="term-body" id="termBody" aria-live="polite">
            <div class="ln p" data-term>&gt; initialize_project()<span class="caret"></span></div>
            <div class="ln" data-term>&gt; loading modules … frontend ✓ &nbsp;backend ✓ &nbsp;database ✓</div>
            <div class="ln ok" data-term>PROJECT_STATUS: READY</div>
            <div class="ln ok" data-term>What are we building next?</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</main>

<!-- ======================= FOOTER ======================= -->
<footer>
  <div class="foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/"><span class="tri">▲</span>WARIS.DEV</a>
      <p>Full Stack Developer<br>Building digital systems from interface to infrastructure.</p>
    </div>
    <nav aria-label="Footer">
      <p class="foot-h">MAP</p>
      <div class="foot-links">
        <a href="/about">ABOUT</a>
        <a href="/stack">STACK</a>
        <a href="/projects">PROJECTS</a>
        <a href="/experience">EXPERIENCE</a>
        <a href="/blog">BLOG</a>
        <a href="/contact">CONTACT</a>
      </div>
    </nav>
    <div>
      <p class="foot-h">CONNECT</p>
      <div class="foot-links">
        <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:waris0543@gmail.com" rel="noopener">Email</a>
      </div>
    </div>
  </div>
  <div class="foot-base">
    <span>© <span id="year">2026</span> Waris Ali. Built in the digital city.</span>
    <span class="sys">SYS.STATUS: <span style="color:var(--accent)">OPERATIONAL</span></span>
  </div>
</footer>

<div class="tip" id="tip" role="tooltip"></div>

`;

// ---------------------------------------------------------------------------
// CMS-driven regions
// ---------------------------------------------------------------------------

/**
 * Every value here originates in MongoDB and is injected through
 * `dangerouslySetInnerHTML`, so it is escaped before it reaches the document.
 * `&` goes first, otherwise the ampersands introduced by the later rules
 * would be escaped twice.
 */
const esc = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Only http(s) and root-relative hrefs are allowed through, so a CMS field can never inject `javascript:`. */
const safeHref = (value: string) =>
  /^(https?:\/\/|\/(?!\/)|#|mailto:)/i.test(value) ? esc(value) : '';

/** Hostname without `www.` for the fake browser chrome in the project preview. */
const hostLabel = (liveUrl: string) => {
  const match = liveUrl.match(/^https?:\/\/(?:www\.)?([^/?#]+)/i);
  return match ? match[1] : '';
};

const pad2 = (index: number) => String(index + 1).padStart(2, '0');

const EMPTY_ARTICLE = '<p class="lede" data-reveal>Nothing published here yet — add content in the admin panel.</p>';

/**
 * Decorative browser-window mock for a project card.
 *
 * The three `visual` variants are the original hand-drawn previews; `default`
 * reuses the watch-card layout that `app/projects/page.tsx` already ships, so a
 * project added in the CMS without picking a variant still looks intentional.
 */
const renderPreview = (project: HomeProject) => {
  const label = esc(project.title);
  const url = esc(hostLabel(project.liveUrl));

  const chrome = `<div class="pv-chrome"><i></i><i></i><i></i><span class="url">${url}</span>
              <div class="pv-badges"><span class="b-live">LIVE</span><span>CASE STUDY</span><span>SOURCE</span></div>
            </div>`;

  const bodies: Record<string, string> = {
    swiftza: `<div class="pv-hero"><span class="wm">${label}</span><span class="sk tl"></span></div>
              <div class="pv-watch">
                <div class="pv-card"><span class="face"></span><span class="lines"><span class="sk"></span><span class="sk dim"></span></span><span class="price"></span></div>
                <div class="pv-card"><span class="face"></span><span class="lines"><span class="sk"></span><span class="sk dim"></span></span><span class="price"></span></div>
              </div>`,
    zirconia: `<div class="side"><span class="sk" style="width:70%"></span><span class="sk dim"></span><span class="sk dim"></span><span class="sk dim"></span><span class="sk dim"></span></div>
              <div class="cat">
                <div class="zc"><i></i></div><div class="zc"><i></i></div>
                <div class="zc"><i></i></div><div class="zc"><i></i></div>
              </div>`,
    ev: `<div class="stage"><span class="beam"></span><span class="car"></span></div>
              <div class="pv-specs">
                <div class="row"><span class="lb">RANGE</span><span class="bar" style="--w:78%"></span></div>
                <div class="row"><span class="lb">CHARGE</span><span class="bar" style="--w:56%"></span></div>
                <div class="row"><span class="lb">MOTOR</span><span class="bar" style="--w:66%"></span></div>
                <div class="row"><span class="lb">CONNECT</span><span class="bar" style="--w:44%"></span></div>
              </div>`,
    default: `<div class="pv-hero"><span class="wm">${label}</span><span class="sk tl"></span></div>
              <div class="pv-watch">
                <div class="pv-card"><span class="face"></span><span class="lines"><span class="sk"></span><span class="sk dim"></span></span><span class="price"></span></div>
                <div class="pv-card"><span class="face"></span><span class="lines"><span class="sk"></span><span class="sk dim"></span></span><span class="price"></span></div>
              </div>`,
  };

  return `<div class="pv pv-${project.visual}" role="img" aria-label="${label} interface preview">
            ${chrome}
            <div class="pv-body">
              ${bodies[project.visual]}
            </div>
          </div>`;
};

/** One `<article class="project">` per published project, in the editor's `order`. */
const renderProjects = (projects: HomeProject[]) => {
  if (projects.length === 0) return EMPTY_ARTICLE;

  return projects
    .map((project, index) => {
      const liveHref = safeHref(project.liveUrl);
      const caseStudyHref = safeHref(project.caseStudyUrl);

      const actions = [
        liveHref
          ? `<a class="btn btn-primary btn-sm magnetic" href="${liveHref}" target="_blank" rel="noopener" aria-label="View ${esc(project.title)} project">View Project <span class="arr">→</span></a>`
          : '',
        caseStudyHref
          ? `<a class="btn btn-ghost btn-sm magnetic" href="${caseStudyHref}" aria-label="Open ${esc(project.title)} case study">Case Study <span class="arr">↗</span></a>`
          : '',
      ].join('');

      const chips = project.tags
        .map((tag) => `<span class="chip">${esc(tag)}</span>`)
        .join('');

      return `<article class="project glass" data-reveal data-project>
        <span class="p-index" aria-hidden="true">${pad2(index)}</span>
        <div class="p-visual">
          ${renderPreview(project)}
        </div>
        <div class="p-info">
          <span class="cat">${esc(project.category)}</span>
          <h3>${esc(project.title)}</h3>
          <p>${esc(project.description)}</p>
          <div class="p-actions">
            ${actions}
          </div>
          <div class="chips p-tech">
            ${chips}
          </div>
        </div>
      </article>`;
    })
    .join('\n');
};

/** One `<div class="tl-item">` per timeline entry, in the editor's `order`. */
const renderExperience = (entries: HomeExperience[]) => {
  if (entries.length === 0) return EMPTY_ARTICLE;

  return entries
    .map(
      (entry) => `<div class="tl-item" data-reveal>
          <span class="tl-dot" aria-hidden="true"></span>
          <p class="tl-year">${esc(entry.year)}</p>
          <h3 class="tl-role">${esc(entry.title)}</h3>
          <p class="tl-desc">${esc(entry.description)}</p>
          <div class="chips">${entry.tags.map((tag) => `<span class="chip">${esc(tag)}</span>`).join('')}</div>
        </div>`,
    )
    .join('\n');
};

/**
 * One `<div class="const-panel">` per category with a `.tnode` per technology.
 * The hover/connection graph in SiteInteractions queries `[data-tech]` inside
 * `[data-group]`, so the category has to stay on the panel and the technology
 * name on the button for the constellation to light up.
 */
const renderStack = (groups: HomeStackGroup[]) => {
  if (groups.length === 0) return EMPTY_ARTICLE;

  return groups
    .map(
      (group) => `<div class="const-panel glass" data-group="${esc(group.category)}" data-reveal>
          <h3>${esc(group.category)}</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            ${group.items
              .map((item) => `<button type="button" class="tnode" data-tech="${esc(item)}">${esc(item)}</button>`)
              .join('\n            ')}
          </div>
        </div>`,
    )
    .join('\n');
};

/**
 * `BODY_HTML` with the three CMS-driven regions filled in.
 *
 * The `<!--__HOME_*__-->` placeholders each occur exactly once, so `replace`
 * swaps them without needing a global regex. Anything the loader could not
 * produce still renders a readable empty state rather than a blank section.
 */
export function buildBodyHtml(home: HomeContent): string {
  return BODY_HTML.replace('<!--__HOME_PROJECTS__-->', renderProjects(home.projects))
    .replace('<!--__HOME_EXPERIENCE__-->', renderExperience(home.experience))
    .replace('<!--__HOME_STACK__-->', renderStack(home.stack));
}

