'use client';
import { useEffect } from 'react';
import { animate } from 'motion/react';

// Behavior + animation layer for sub-pages (mounted once per page render).
// Data/content is revealed instantly (no blur/entrance animation). Motion.dev
// is used only for hover micro-interactions (magnetic buttons, chips, cards).
// The stack constellation + contact terminal logic is kept as-is.
export default function SiteBehaviors() {
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = !matchMedia('(hover: none), (pointer: coarse)').matches;
    const play: any[] = [];
    const ios: IntersectionObserver[] = [];

    const stopAll = () => {
      while (play.length) play.pop().stop();
    };
    const cleanupIO = () => {
      while (ios.length) ios.pop().disconnect();
    };

    /* ---------- text reveal (scroll-triggered fade-up, no blur) ---------- */
    const revealEls = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
    if (reduced) {
      revealEls.forEach((el) => el.classList.add('in'));
    } else {
      const groups = new Map<Element, number>();
      revealEls.forEach((el) => {
        const sec = el.closest('section, footer') || document.body;
        const n = groups.get(sec) || 0;
        groups.set(sec, n + 1);
        el.style.transitionDelay = `${Math.min(n * 80, 420)}ms`;

        const io = new IntersectionObserver(
          (entries) => {
            if (!entries.some((en) => en.isIntersecting)) return;
            io.disconnect();
            el.classList.add('in');
            el.style.transitionDelay = '';
          },
          { threshold: 0.18 }
        );
        ios.push(io);
        io.observe(el);
      });
      // fail-safe: never strand content hidden
      setTimeout(() => {
        revealEls.forEach((el) => {
          if (!el.classList.contains('in')) el.classList.add('in');
        });
      }, 8000);
    }

    /* ---------- magnetic buttons + spring hovers (fine pointers only) ---------- */
    if (!reduced && fine) {
      try {
        const fly = (el: HTMLElement, kv: any, opts: any, map: Map<HTMLElement, any>) => {
          const prev = map.get(el);
          if (prev) prev.stop();
          const c = animate(el, kv, opts);
          map.set(el, c);
          return c;
        };
        const springs = new Map<HTMLElement, any>();

        document.querySelectorAll<HTMLElement>('.btn, .magnetic').forEach((el) => {
          const move = (tx: number, ty: number, s: number) =>
            fly(
              el,
              { x: tx, y: ty, scale: s },
              { type: 'spring', stiffness: 220, damping: 18 },
              springs
            );
          el.addEventListener('pointerenter', () => move(0, 0, 1.045));
          el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            move(
              (e.clientX - (r.left + r.width / 2)) * 0.18,
              (e.clientY - (r.top + r.height / 2)) * 0.22,
              1.045
            );
          });
          el.addEventListener('pointerleave', () => move(0, 0, 1));
        });

        document.querySelectorAll<HTMLElement>('.chip').forEach((el) => {
          const pop = (s: number) =>
            fly(el, { scale: s }, { type: 'spring', stiffness: 340, damping: 18 }, springs);
          el.addEventListener('pointerenter', () => pop(1.12));
          el.addEventListener('pointerleave', () => pop(1));
        });

        document
          .querySelectorAll<HTMLElement>(
            '.core-card, .const-panel, .tl-item, .proc-step, .link-card, .term, .pv-card, .pv'
          )
          .forEach((el) => {
            const lift = (y: number, s: number, glow: string) =>
              fly(
                el,
                { y, scale: s, boxShadow: glow },
                { type: 'spring', stiffness: 280, damping: 20 },
                springs
              );
            el.addEventListener('pointerenter', () =>
              lift(-5, 1.018, '0 26px 60px -26px rgba(100,245,176,.5)')
            );
            el.addEventListener('pointerleave', () => lift(0, 1, '0 0 0 rgba(100,245,176,0)'));
          });
      } catch (e) {}
    }

    /* ---------- technology constellation (stack page) ---------- */
    const panels = [...document.querySelectorAll<HTMLElement>('.const-panel')];
    if (panels.length) {
      const LINKS: Record<string, [string, string][]> = {
        FRONTEND: [['React', 'Next.js'], ['React', 'TypeScript'], ['JavaScript', 'TypeScript'], ['HTML', 'CSS'], ['CSS', 'Tailwind'], ['Next.js', 'Tailwind'], ['React', 'JavaScript']],
        BACKEND: [['Node.js', 'Express'], ['Node.js', 'REST APIs']],
        DATABASE: [['PostgreSQL', 'Prisma'], ['Prisma', 'Supabase'], ['Supabase', 'Neon'], ['PostgreSQL', 'Neon'], ['MySQL', 'Prisma']],
        CMS: [],
        DEPLOYMENT: [['Git', 'GitHub'], ['Vercel', 'Git'], ['Vercel', 'GitHub']],
        OTHER: [['API Integration', 'Automation'], ['AI Integration', 'Automation']],
      };
      const BLURB: Record<string, string> = {
        React: 'Component architecture for interactive UIs',
        'Next.js': 'SSR, routing, and full-stack React',
        TypeScript: 'Type-safe application code',
        JavaScript: 'The language of the web',
        HTML: 'Semantic structure',
        CSS: 'Layout, motion, and design systems',
        Tailwind: 'Utility-first styling',
        'Node.js': 'Server-side JavaScript runtime',
        Express: 'Lightweight API framework',
        'REST APIs': 'Structured client–server contracts',
        PostgreSQL: 'Relational source of truth',
        MySQL: 'Proven relational storage',
        Prisma: 'Type-safe ORM & migrations',
        Supabase: 'Postgres + realtime + auth',
        Neon: 'Serverless Postgres',
        Sanity: 'Structured content platform',
        Vercel: 'Edge deploys & previews',
        Git: 'Version control',
        GitHub: 'Collaboration & CI',
        SEO: 'Search-friendly architecture',
        'API Integration': 'Third-party systems, wired in',
        Automation: 'Workflows that run themselves',
        'AI Integration': 'AI features inside real products',
      };

      const tip = document.getElementById('tip');

      const draw = () => {
        for (const panel of panels) {
          const svg = panel.querySelector('.const-lines') as SVGSVGElement;
          const group = panel.dataset.group || '';
          const links = LINKS[group] || [];
          svg.innerHTML = '';
          const pr = panel.getBoundingClientRect();
          for (const [aName, bName] of links) {
            const a = panel.querySelector(`[data-tech="${CSS.escape(aName)}"]`);
            const b = panel.querySelector(`[data-tech="${CSS.escape(bName)}"]`);
            if (!a || !b) continue;
            const ra = a.getBoundingClientRect();
            const rb = b.getBoundingClientRect();
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(ra.left + ra.width / 2 - pr.left));
            line.setAttribute('y1', String(ra.top + ra.height / 2 - pr.top));
            line.setAttribute('x2', String(rb.left + rb.width / 2 - pr.left));
            line.setAttribute('y2', String(rb.top + rb.height / 2 - pr.top));
            line.dataset.a = aName;
            line.dataset.b = bName;
            svg.appendChild(line);
          }
        }
      };
      if (!reduced) {
        draw();
        addEventListener('resize', draw, { passive: true });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
      }

      const deactivateAll = () => {
        if (tip) tip.classList.remove('on');
        panels.forEach((p) => p.classList.remove('lit'));
        document.querySelectorAll('.tnode.lit').forEach((n) => n.classList.remove('lit'));
        document.querySelectorAll('.const-lines line.lit').forEach((l) => l.classList.remove('lit'));
      };

      document.querySelectorAll<HTMLElement>('.tnode').forEach((node) => {
        const activate = () => {
          const panel = node.closest('.const-panel') as HTMLElement;
          const name = node.dataset.tech || '';
          const group = panel.dataset.group || '';
          const related = new Set<string>([name]);
          for (const [a, b] of LINKS[group] || []) {
            if (a === name) related.add(b);
            if (b === name) related.add(a);
          }
          panel.classList.add('lit');
          panel.querySelectorAll<HTMLElement>('.tnode').forEach((n) => {
            if (related.has(n.dataset.tech || '')) n.classList.add('lit');
          });
          panel.querySelectorAll<SVGLineElement>('line').forEach((l) => {
            if (l.dataset.a === name || l.dataset.b === name) l.classList.add('lit');
          });
          if (tip) {
            tip.innerHTML = `<b>${name}</b><span>${BLURB[name] || group}</span>`;
            tip.classList.add('on');
          }
        };
        node.addEventListener('pointerenter', activate);
        node.addEventListener('focus', activate);
        node.addEventListener('pointerleave', deactivateAll);
        node.addEventListener('blur', deactivateAll);
        node.addEventListener('pointermove', (e) => {
          if (tip) {
            tip.style.left = `${e.clientX}px`;
            tip.style.top = `${e.clientY - 8}px`;
          }
        });
        node.addEventListener('focus', (e) => {
          const r = node.getBoundingClientRect();
          if (tip) {
            tip.style.left = `${r.left + r.width / 2}px`;
            tip.style.top = `${r.top}px`;
          }
        });
      });
    }

    /* ---------- contact terminal typing (contact page) ---------- */
    const termLines = [...document.querySelectorAll<HTMLElement>('[data-term]')];
    if (termLines.length) {
      if (reduced) {
        termLines.forEach((l) => l.classList.add('show'));
      } else {
        const termBody = document.getElementById('termBody');
        if (termBody) {
          const termIO = new IntersectionObserver(
            (entries) => {
              if (entries.some((en) => en.isIntersecting)) {
                termIO.disconnect();
                let delay = 300;
                termLines.forEach((line, i) => {
                  setTimeout(() => {
                    line.classList.add('show');
                    if (i === 0) {
                      const text = (line.firstChild?.textContent || '').slice();
                      line.firstChild.textContent = '';
                      let ci = 0;
                      const type = () => {
                        line.firstChild.textContent = text.slice(0, ++ci);
                        if (ci < text.length) setTimeout(type, 42);
                      };
                      type();
                    }
                  }, delay);
                  delay += i === 0 ? 1500 : 650;
                });
              }
            },
            { threshold: 0.4 }
          );
          termIO.observe(termBody);
          ios.push(termIO);
        }
      }
    }

    return () => {
      stopAll();
      cleanupIO();
      document.body.style.overflow = '';
    };
  }, []);

  return null;
}