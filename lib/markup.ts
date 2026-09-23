// Ported 1:1 from the original single-file build's <body> markup.
// Kept as an HTML string (rendered via dangerouslySetInnerHTML in app/page.tsx) so every
// class name, data attribute and inline style survives the TS port unchanged — the vanilla
// interaction script in components/SiteInteractions.tsx queries this DOM exactly like the
// original querySelector-based code did, so the UI/behaviour is not rewritten, only relocated.
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
        <h2 data-reveal>More than a developer. I build the system behind the experience.</h2>
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
          <h2 data-reveal>Interfaces engineered to feel effortless.</h2>
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
        <h2 data-reveal>The experience is only as strong as the system behind it.</h2>
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
          <h2 data-reveal>Structured data. Reliable systems. Clean architecture.</h2>
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
        <h2 data-reveal>Things I've actually built.</h2>
        <p class="lede" data-reveal>Selected projects where design, engineering, and business requirements meet.</p>
      </div>

      <!-- PROJECT 01 · Swiftza -->
      <article class="project glass" data-reveal data-project>
        <span class="p-index" aria-hidden="true">01</span>
        <div class="p-visual">
          <div class="pv pv-swiftza" role="img" aria-label="Swiftza interface preview — luxury watch commerce platform">
            <div class="pv-chrome"><i></i><i></i><i></i><span class="url">swiftza.store</span>
              <div class="pv-badges"><span class="b-live">LIVE</span><span>CASE STUDY</span><span>SOURCE</span></div>
            </div>
            <div class="pv-body">
              <div class="pv-hero"><span class="wm">SWIFTZA</span><span class="sk tl"></span></div>
              <div class="pv-watch">
                <div class="pv-card"><span class="face"></span><span class="lines"><span class="sk"></span><span class="sk dim"></span></span><span class="price"></span></div>
                <div class="pv-card"><span class="face"></span><span class="lines"><span class="sk"></span><span class="sk dim"></span></span><span class="price"></span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-info">
          <span class="cat">LUXURY WATCH COMMERCE PLATFORM</span>
          <h3>Swiftza</h3>
          <p>A premium e-commerce ecosystem designed for luxury watch discovery, product management, content, and conversion-focused shopping experiences.</p>
          <div class="p-actions">
            <a class="btn btn-primary btn-sm magnetic" href="https://swiftza.store" target="_blank" rel="noopener" aria-label="View Swiftza project">View Project <span class="arr">→</span></a>
            <a class="btn btn-ghost btn-sm magnetic" href="/projects/swiftza" aria-label="Open Swiftza case study">Case Study <span class="arr">↗</span></a>
          </div>
          <div class="chips p-tech">
            <span class="chip">Next.js</span><span class="chip">TypeScript</span><span class="chip">Sanity</span>
            <span class="chip">Database</span><span class="chip">API</span><span class="chip">E-commerce</span>
          </div>
        </div>
      </article>

      <!-- PROJECT 02 · Zirconia Express -->
      <article class="project glass" data-reveal data-project>
        <span class="p-index" aria-hidden="true">02</span>
        <div class="p-visual">
          <div class="pv pv-zirconia" role="img" aria-label="Zirconia Express interface preview — dental e-commerce platform">
            <div class="pv-chrome"><i></i><i></i><i></i><span class="url">zirconiaexpress.com</span>
              <div class="pv-badges"><span class="b-live">LIVE</span><span>CASE STUDY</span><span>SOURCE</span></div>
            </div>
            <div class="pv-body">
              <div class="side"><span class="sk" style="width:70%"></span><span class="sk dim"></span><span class="sk dim"></span><span class="sk dim"></span><span class="sk dim"></span></div>
              <div class="cat">
                <div class="zc"><i></i></div><div class="zc"><i></i></div>
                <div class="zc"><i></i></div><div class="zc"><i></i></div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-info">
          <span class="cat">DENTAL E-COMMERCE PLATFORM</span>
          <h3>Zirconia Express</h3>
          <p>A specialized digital platform focused on presenting dental zirconia products through a structured, search-friendly and conversion-focused experience.</p>
          <div class="p-actions">
            <a class="btn btn-primary btn-sm magnetic" href="https://zirconiaexpress.com" target="_blank" rel="noopener" aria-label="View Zirconia Express project">View Project <span class="arr">→</span></a>
            <a class="btn btn-ghost btn-sm magnetic" href="/projects/zirconia-express" aria-label="Open Zirconia Express case study">Case Study <span class="arr">↗</span></a>
          </div>
          <div class="chips p-tech">
            <span class="chip">Web</span><span class="chip">SEO</span><span class="chip">CMS</span>
            <span class="chip">E-commerce</span><span class="chip">Content</span>
          </div>
        </div>
      </article>

      <!-- PROJECT 03 · Zhongfa EV -->
      <article class="project glass" data-reveal data-project>
        <span class="p-index" aria-hidden="true">03</span>
        <div class="p-visual">
          <div class="pv pv-ev" role="img" aria-label="Zhongfa EV interface preview — electric mobility platform">
            <div class="pv-chrome"><i></i><i></i><i></i><span class="url">zhongfa-ev.com</span>
              <div class="pv-badges"><span class="b-live">LIVE</span><span>CASE STUDY</span><span>SOURCE</span></div>
            </div>
            <div class="pv-body">
              <div class="stage"><span class="beam"></span><span class="car"></span></div>
              <div class="pv-specs">
                <div class="row"><span class="lb">RANGE</span><span class="bar" style="--w:78%"></span></div>
                <div class="row"><span class="lb">CHARGE</span><span class="bar" style="--w:56%"></span></div>
                <div class="row"><span class="lb">MOTOR</span><span class="bar" style="--w:66%"></span></div>
                <div class="row"><span class="lb">CONNECT</span><span class="bar" style="--w:44%"></span></div>
              </div>
            </div>
          </div>
        </div>
        <div class="p-info">
          <span class="cat">ELECTRIC MOBILITY PLATFORM</span>
          <h3>Zhongfa EV</h3>
          <p>A modern digital experience for electric mobility products, combining product presentation, content, SEO, and conversion-focused UX.</p>
          <div class="p-actions">
            <a class="btn btn-primary btn-sm magnetic" href="https://zhongfa-ev.com" target="_blank" rel="noopener" aria-label="View Zhongfa EV project">View Project <span class="arr">→</span></a>
            <a class="btn btn-ghost btn-sm magnetic" href="/projects/zhongfa-ev" aria-label="Open Zhongfa EV case study">Case Study <span class="arr">↗</span></a>
          </div>
          <div class="chips p-tech">
            <span class="chip">Frontend</span><span class="chip">CMS</span><span class="chip">SEO</span>
            <span class="chip">Responsive UI</span><span class="chip">Content</span>
          </div>
        </div>
      </article>
    </div>
  </section>

  <!-- ============== 06 · EXPERIENCE ============== -->
  <section class="section" id="experience" data-landmark="4" data-hud="06 / EXPERIENCE">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>06</b> / EXPERIENCE</p>
        <h2 data-reveal>A timeline of systems, projects, and problems solved.</h2>
      </div>
      <div class="tl">
        <div class="tl-item" data-reveal>
          <span class="tl-dot" aria-hidden="true"></span>
          <p class="tl-year">2024</p>
          <h3 class="tl-role">WEB DEVELOPMENT</h3>
          <p class="tl-desc">Built responsive websites and front-end interfaces — turning design intent into clean, working code and learning the craft end to end.</p>
          <div class="chips"><span class="chip">HTML</span><span class="chip">CSS</span><span class="chip">JavaScript</span></div>
        </div>
        <div class="tl-item" data-reveal>
          <span class="tl-dot" aria-hidden="true"></span>
          <p class="tl-year">2025</p>
          <h3 class="tl-role">SEO + DIGITAL PRODUCTS</h3>
          <p class="tl-desc">Shipped content-driven platforms with structured data, search-friendly architecture, and CMS-powered publishing workflows.</p>
          <div class="chips"><span class="chip">Next.js</span><span class="chip">Sanity</span><span class="chip">SEO</span><span class="chip">CMS</span></div>
        </div>
        <div class="tl-item" data-reveal>
          <span class="tl-dot" aria-hidden="true"></span>
          <p class="tl-year">2026</p>
          <h3 class="tl-role">FULL STACK DEVELOPMENT</h3>
          <p class="tl-desc">Designing and building complete systems end to end — interfaces, APIs, databases, authentication, and deployment working as one product.</p>
          <div class="chips"><span class="chip">TypeScript</span><span class="chip">Node.js</span><span class="chip">PostgreSQL</span><span class="chip">Prisma</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 07 · TECHNOLOGY MAP ============== -->
  <section class="section" id="stack" data-landmark="5" data-hud="07 / THE STACK">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>07</b> / THE STACK</p>
        <h2 data-reveal>The tools behind the city.</h2>
        <p class="lede" data-reveal>Hover a technology to see how the systems connect.</p>
      </div>
      <div class="const-grid" id="constGrid">
        <div class="const-panel glass" data-group="FRONTEND" data-reveal>
          <h3>FRONTEND</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            <button type="button" class="tnode" data-tech="React">React</button>
            <button type="button" class="tnode" data-tech="Next.js">Next.js</button>
            <button type="button" class="tnode" data-tech="TypeScript">TypeScript</button>
            <button type="button" class="tnode" data-tech="JavaScript">JavaScript</button>
            <button type="button" class="tnode" data-tech="HTML">HTML</button>
            <button type="button" class="tnode" data-tech="CSS">CSS</button>
            <button type="button" class="tnode" data-tech="Tailwind">Tailwind</button>
          </div>
        </div>
        <div class="const-panel glass" data-group="BACKEND" data-reveal>
          <h3>BACKEND</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            <button type="button" class="tnode" data-tech="Node.js">Node.js</button>
            <button type="button" class="tnode" data-tech="Express">Express</button>
            <button type="button" class="tnode" data-tech="REST APIs">REST APIs</button>
          </div>
        </div>
        <div class="const-panel glass" data-group="DATABASE" data-reveal>
          <h3>DATABASE</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            <button type="button" class="tnode" data-tech="PostgreSQL">PostgreSQL</button>
            <button type="button" class="tnode" data-tech="MySQL">MySQL</button>
            <button type="button" class="tnode" data-tech="Prisma">Prisma</button>
            <button type="button" class="tnode" data-tech="Supabase">Supabase</button>
            <button type="button" class="tnode" data-tech="Neon">Neon</button>
          </div>
        </div>
        <div class="const-panel glass" data-group="CMS" data-reveal>
          <h3>CMS</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            <button type="button" class="tnode" data-tech="Sanity">Sanity</button>
          </div>
        </div>
        <div class="const-panel glass" data-group="DEPLOYMENT" data-reveal>
          <h3>DEPLOYMENT</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            <button type="button" class="tnode" data-tech="Vercel">Vercel</button>
            <button type="button" class="tnode" data-tech="Git">Git</button>
            <button type="button" class="tnode" data-tech="GitHub">GitHub</button>
          </div>
        </div>
        <div class="const-panel glass" data-group="OTHER" data-reveal>
          <h3>OTHER</h3>
          <svg class="const-lines" aria-hidden="true"></svg>
          <div class="tnodes">
            <button type="button" class="tnode" data-tech="SEO">SEO</button>
            <button type="button" class="tnode" data-tech="API Integration">API Integration</button>
            <button type="button" class="tnode" data-tech="Automation">Automation</button>
            <button type="button" class="tnode" data-tech="AI Integration">AI Integration</button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============== 08 · HOW I BUILD ============== -->
  <section class="section" id="process" data-landmark="5" data-hud="08 / THE PROCESS">
    <div class="wrap">
      <div class="section-head">
        <p class="eyebrow" data-reveal><b>08</b> / THE PROCESS</p>
        <h2 data-reveal>From idea to deployed product.</h2>
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
          <h2 data-reveal>Have something worth building?</h2>
          <p class="lede" data-reveal>Let's turn the idea into a real digital product.</p>
          <div class="hero-actions" style="margin-top:34px" data-reveal>
            <a class="btn btn-primary magnetic" href="mailto:hello@waris.dev">Start a Conversation <span class="arr">→</span></a>
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
        <a href="/contact">CONTACT</a>
      </div>
    </nav>
    <div>
      <p class="foot-h">CONNECT</p>
      <div class="foot-links">
        <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
        <a href="https://www.linkedin.com/" target="_blank" rel="noopener">LinkedIn</a>
        <a href="mailto:hello@waris.dev" rel="noopener">Email</a>
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
