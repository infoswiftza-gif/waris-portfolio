// @ts-nocheck
'use client';
// ---------------------------------------------------------------------------
// This file is the ORIGINAL vanilla interaction/Three.js script, ported as-is
// into a client component so the UI and behaviour are not rewritten — only
// relocated from a <script type=module> tag into React's lifecycle (useEffect
// runs it once after the markup in lib/markup.ts has mounted, mirroring the
// original 'script runs after body HTML is parsed' order).
//
// @ts-nocheck is intentional: this is ~2,200 lines of dense procedural WebGL
// code (materials, geometry, animation loop, DOM interaction) that was written
// as plain JS. Re-typing every THREE.* call and querySelector result would be
// weeks of work with zero behavioural benefit and real risk of introducing
// bugs into a working renderer. The rest of the app (page.tsx, layout.tsx, the
// case-study pages) is fully typed.
// ---------------------------------------------------------------------------
import { useEffect } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import Lenis from 'lenis';

export default function SiteInteractions() {
  useEffect(() => {
    let cancelled = false;


/* ============================================================
   SHARED STATE
   ============================================================ */
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer = matchMedia('(hover: none), (pointer: coarse)').matches;
const startW = innerWidth;

let scrollP = 0, smoothP = 0;
let activeLandmark = 0;

const ACCENTS = [0x64f5b0, 0x62dcff, 0x4d8dff, 0x27d889, 0xffd27a, 0x8ea8ff, 0x64f5b0];
const LANDMARKS = [
  { name: 'THE CORE',            pos: [0, 0, 0],      h: 34 },
  { name: 'FRONTEND DISTRICT',   pos: [-26, 0, -30],  h: 26 },
  { name: 'BACKEND TOWER',       pos: [24, 0, -62],   h: 30 },
  { name: 'DATA VAULT',          pos: [-24, 0, -96],  h: 22 },
  { name: 'PROJECT DISTRICT',    pos: [26, 0, -130],  h: 19 },
  { name: 'CLOUD GRID',          pos: [-20, 0, -164], h: 25 },
  { name: 'CONTACT TERMINAL',    pos: [0, 0, -200],   h: 29 },
];
const CAM_KEYS = [
    { p: 0.00, pos: [0, 5, 16],    look: [0, 9, -12] },
    { p: 0.18, pos: [0, 6, -13],   look: [0, 10, -40] },
    { p: 0.36, pos: [0, 7, -45],   look: [0, 11, -72] },
    { p: 0.52, pos: [0, 6.5, -79], look: [0, 9, -108] },
    { p: 0.68, pos: [0, 8, -113],  look: [0, 10, -142] },
    { p: 0.84, pos: [0, 7.5, -147], look: [0, 11, -176] },
    { p: 1.00, pos: [0, 6, -186],  look: [0, 10, -205] },
  ];

/* no-op city API — replaced when WebGL initializes; UI stays functional without it */
const city = {
  ok: false,
  setActive() {},
  techGroup() {},
  pulse() {},
};

function tier() {
  const w = innerWidth;
  if (w <= 380) return 0;
  if (w <= 720) return 1;
  if (w <= 980) return 2;
  if (w <= 1200) return 3;
  return 4;
}
const T = {
  buildings: [95, 125, 165, 205, 240][tier()],
  windows:   [800, 1100, 1600, 2200, 2600][tier()],
  particles: [260, 380, 550, 700, 820][tier()],
  packets:   [14, 18, 24, 27, 27][tier()],
};

/* ============================================================
   WEBGL CITY — deferred until the browser is idle so the page
   paints (LCP/TBT) before the heavy procedural city builds
   ============================================================ */
const webglAvailable = () => {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch { return false; }
};
const startCity = () => {
  if (cancelled) return;
  if (!webglAvailable()) {
    document.body.classList.add('no-webgl');
    return;
  }
  try { initCity(); }
  catch {
    // high-performance/antialias request may fail on weak GPUs — retry with safe defaults
    try { initCity({ antialias: false, powerPreference: 'default' }); }
    catch (err) {
      console.warn('Digital City disabled — falling back to static background.', err);
      document.body.classList.add('no-webgl');
    }
  }
};
if (typeof requestIdleCallback === 'function') requestIdleCallback(startCity, { timeout: 2000 });
else setTimeout(startCity, 200);

function initCity(rendererOpts: { antialias?: boolean; powerPreference?: 'high-performance' | 'default' } = {}) {
  const canvas = document.querySelector('.city-canvas');
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: rendererOpts.antialias ?? true,
    powerPreference: rendererOpts.powerPreference ?? 'high-performance',
  });
  renderer.setClearColor(0x03050b, 1);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); // capped: big FPS win on high-DPI screens, near-identical look
  renderer.toneMapping = THREE.ACESFilmicToneMapping;      // filmic response for photographic look
  renderer.toneMappingExposure = 0.95;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03050b, 0.035);

  /* ---------- built-in photographic night environment (no external HDR fetch — always loads, never blocked) ---------- */
  {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const applyEnv = tex => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = pmrem.fromEquirectangular(tex).texture;
      tex.dispose(); pmrem.dispose();
    };
    // Hand-built equirectangular night sky: sky gradient + soft moon glow + city-glow horizon band + subtle stars.
    // This gives glass/metal facades real photographic reflections without depending on any external image host.
    const ew = 512, eh = 256;
    const ec = document.createElement('canvas'); ec.width = ew; ec.height = eh;
    const eg = ec.getContext('2d');

    const sky = eg.createLinearGradient(0, 0, 0, eh);
    sky.addColorStop(0, '#050914');
    sky.addColorStop(0.35, '#0a1226');
    sky.addColorStop(0.62, '#12203f');
    sky.addColorStop(0.82, '#1a2c4d');
    sky.addColorStop(1, '#060a14');
    eg.fillStyle = sky; eg.fillRect(0, 0, ew, eh);

    // warm city-glow band near the horizon (like light pollution reflecting off low clouds)
    const horizon = eg.createLinearGradient(0, eh * 0.62, 0, eh * 0.92);
    horizon.addColorStop(0, 'rgba(120,90,60,0)');
    horizon.addColorStop(0.5, 'rgba(150,110,70,0.22)');
    horizon.addColorStop(1, 'rgba(90,70,55,0)');
    eg.fillStyle = horizon; eg.fillRect(0, eh * 0.6, ew, eh * 0.34);

    // soft moon / key-light glow (drives specular highlights on glass towers)
    const moonX = ew * 0.68, moonY = eh * 0.22;
    const moon = eg.createRadialGradient(moonX, moonY, 0, moonX, moonY, 90);
    moon.addColorStop(0, 'rgba(210,225,255,0.9)');
    moon.addColorStop(0.15, 'rgba(150,180,255,0.35)');
    moon.addColorStop(1, 'rgba(150,180,255,0)');
    eg.fillStyle = moon; eg.fillRect(0, 0, ew, eh);
    eg.fillStyle = '#eef3ff';
    eg.beginPath(); eg.arc(moonX, moonY, 7, 0, Math.PI * 2); eg.fill();

    // secondary cool rim glow, opposite side, for fill-light reflections
    const rimX = ew * 0.1, rimY = eh * 0.35;
    const rim = eg.createRadialGradient(rimX, rimY, 0, rimX, rimY, 130);
    rim.addColorStop(0, 'rgba(98,220,255,0.14)');
    rim.addColorStop(1, 'rgba(98,220,255,0)');
    eg.fillStyle = rim; eg.fillRect(0, 0, ew, eh);

    // faint stars in the upper sky
    for (let i = 0; i < 220; i++) {
      const sx = Math.random() * ew, sy = Math.random() * eh * 0.55;
      const a = Math.random() * 0.6 + 0.15;
      eg.fillStyle = `rgba(255,255,255,${a})`;
      eg.fillRect(sx, sy, 1, 1);
    }

    const envTex = new THREE.CanvasTexture(ec);
    envTex.colorSpace = THREE.SRGBColorSpace;
    applyEnv(envTex);
  }

  // Sunrise environment, baked up-front so the night → sunrise swap is instant and hitch-free:
  // violet-to-amber dawn sky, low warm sun above the horizon, stars barely holding on.
  const sunriseEnv = (() => {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const ew = 512, eh = 256;
    const ec = document.createElement('canvas'); ec.width = ew; ec.height = eh;
    const eg = ec.getContext('2d');

    const sky = eg.createLinearGradient(0, 0, 0, eh);
    sky.addColorStop(0, '#0a0f2e');
    sky.addColorStop(0.35, '#2b2252');
    sky.addColorStop(0.62, '#6b4060');
    sky.addColorStop(0.82, '#c9714c');
    sky.addColorStop(1, '#1b1126');
    eg.fillStyle = sky; eg.fillRect(0, 0, ew, eh);

    // strong warm first-light band hugging the horizon
    const band = eg.createLinearGradient(0, eh * 0.58, 0, eh * 0.95);
    band.addColorStop(0, 'rgba(255,150,80,0)');
    band.addColorStop(0.55, 'rgba(255,140,70,0.4)');
    band.addColorStop(1, 'rgba(140,70,50,0)');
    eg.fillStyle = band; eg.fillRect(0, eh * 0.56, ew, eh * 0.42);

    // low warm sun glow — sits where the key light comes from (drives warm glass reflections)
    const sunX = ew * 0.68, sunY = eh * 0.72;
    const sun = eg.createRadialGradient(sunX, sunY, 0, sunX, sunY, 110);
    sun.addColorStop(0, 'rgba(255,228,184,0.95)');
    sun.addColorStop(0.18, 'rgba(255,170,110,0.45)');
    sun.addColorStop(1, 'rgba(255,150,90,0)');
    eg.fillStyle = sun; eg.fillRect(0, 0, ew, eh);
    eg.fillStyle = '#fff2d8';
    eg.beginPath(); eg.arc(sunX, sunY, 9, 0, Math.PI * 2); eg.fill();

    // residual cool glow opposite the sun
    const rimX = ew * 0.1, rimY = eh * 0.35;
    const rim = eg.createRadialGradient(rimX, rimY, 0, rimX, rimY, 130);
    rim.addColorStop(0, 'rgba(150,170,255,0.1)');
    rim.addColorStop(1, 'rgba(150,170,255,0)');
    eg.fillStyle = rim; eg.fillRect(0, 0, ew, eh);

    // faint residual stars, upper sky only
    for (let i = 0; i < 70; i++) {
      const sx = Math.random() * ew, sy = Math.random() * eh * 0.35;
      eg.fillStyle = `rgba(255,255,255,${Math.random() * 0.25 + 0.05})`;
      eg.fillRect(sx, sy, 1, 1);
    }

    const tex = new THREE.CanvasTexture(ec);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.mapping = THREE.EquirectangularReflectionMapping;
    const env = pmrem.fromEquirectangular(tex).texture;
    tex.dispose(); pmrem.dispose();
    return env;
  })();

  /* ---------- night → sunrise state (scroll-driven: night in the hero, full sunrise once it exits) ---------- */
  const dawn = {
    p: 0, lastApplied: -1, range: 0,
    nightEnv: scene.environment,
    sunriseEnv,
    stars: null as any,
    clearNight: new THREE.Color(0x03050b), clearSun: new THREE.Color(0x2a1d42),
    fogNight: new THREE.Color(0x03050b), fogSun: new THREE.Color(0x4d3150),
    hemiNight: new THREE.Color(0x2a3a5f), hemiSun: new THREE.Color(0x9c7ba0),
    gndNight: new THREE.Color(0x05070d), gndSun: new THREE.Color(0x33222c),
    keyNight: new THREE.Color(0x4d8dff), keySun: new THREE.Color(0xffb070),
    fillNight: new THREE.Color(0x62dcff), fillSun: new THREE.Color(0x86a8ff),
    rimNight: new THREE.Color(0x8ea8ff), rimSun: new THREE.Color(0xffb088),
    _clear: new THREE.Color(0x03050b),
  };

  // Dawn is scoped to the hero: night holds for the first ~12% of the hero scroll,
  // then eases to full sunrise exactly as the hero leaves the viewport.
  const measureDawn = () => {
    const el = document.querySelector('.hero') as HTMLElement | null;
    dawn.range = el ? el.getBoundingClientRect().bottom + (window.scrollY || 0) : innerHeight;
  };
  measureDawn();
  addEventListener('resize', measureDawn, { passive: true });
  const dawnTarget = () => {
    const H = dawn.range || innerHeight;
    return Math.min(1, Math.max(0, ((window.scrollY || 0) - H * 0.12) / (H * 0.88)));
  };

  const camera = new THREE.PerspectiveCamera(innerWidth <= 560 ? 70 : innerWidth <= 980 ? 64 : 56, innerWidth / innerHeight, 0.1, 420);
  camera.position.set(0, 5, 16);
  camera.lookAt(0, 2, 0);

  const hemi = new THREE.HemisphereLight(0x2a3a5f, 0x05070d, 1.2); scene.add(hemi);
  const key = new THREE.DirectionalLight(0x4d8dff, 1.2); key.position.set(40, 70, 20); scene.add(key);
  const fill = new THREE.DirectionalLight(0x62dcff, 0.4); fill.position.set(-40, 40, -60); scene.add(fill);
  // warm low streetlight fill so brick/stone/material colors read as real, not blue-washed
  const warm = new THREE.DirectionalLight(0xffd9b0, 0.35); warm.position.set(30, 18, 8); scene.add(warm);
  // ULTRA: subtle rim light for depth
  const rim = new THREE.DirectionalLight(0x8ea8ff, 0.2); rim.position.set(0, 30, -80); scene.add(rim);

  /* ---------- real shadows (moonlight key light) ---------- */
  renderer.shadowMap.enabled = tier() >= 2;   // shadows off on phones/small screens — biggest mobile GPU win
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);              // 4x cheaper than 2048, visually equivalent with PCFSoft at this scale
  key.shadow.camera.near = 10; key.shadow.camera.far = 260;
  const SH = 60;                                   // ortho frustum half-size (follows camera in tick)
  key.shadow.camera.left = -SH; key.shadow.camera.right = SH;
  key.shadow.camera.top = SH; key.shadow.camera.bottom = -SH;
  key.shadow.bias = -0.0012; key.shadow.normalBias = 0.6;

  /* ---------- helpers ---------- */
  const glowTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)');
    gr.addColorStop(0.35, 'rgba(255,255,255,.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); return t;
  })();

  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[(Math.random() * arr.length) | 0];

  /* ---------- ULTRA HD FACADE FACTORY (8K quality, photorealistic) ---------- */
  const MAX_ANISO = renderer.capabilities.getMaxAnisotropy();
  const MAX_TEX = Math.min(4096, renderer.capabilities.maxTextureSize);   // 4K is the practical ceiling: 12 unique facade canvases at true 8192 would need ~3GB VRAM and blank the whole scene
  const TEX_S = tier() <= 0 ? 1024 : tier() <= 1 ? 2048 : tier() <= 2 ? 4096 : MAX_TEX;   // ultra-HD facade textures
  const MODULE = 2.4;                        // floor height / window bay, world units
  const CELLS = 16;                          // window cells per canvas edge
  const TILE = MODULE * CELLS;               // world units per canvas repeat
  const HI_RES = tier() >= 2;                // ultra-detailed facade extras (pilasters/cornices) on mid/desktop only

  const facadeCache = new Map();
  const litMatsAll = [];

  // REALISTIC: concrete bump map with formwork lines and surface texture
  const bumpTex = (() => {
    const S = TEX_S / 2;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    const cw = S / CELLS;

    // base concrete color
    g.fillStyle = '#808080';
    g.fillRect(0, 0, S, S);

    // formwork board marks (horizontal lines)
    for (let y = 0; y < CELLS; y++) {
      const lineY = y * cw;
      g.fillStyle = '#999999';
      g.fillRect(0, lineY, S, cw * 0.15);
      g.fillStyle = '#666666';
      g.fillRect(0, lineY + cw * 0.14, S, 2);
    }

    // surface texture variation
    for (let i = 0; i < S * 2; i++) {
      const v = 100 + Math.random() * 56;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }

    // window recesses
    for (let y = 0; y < CELLS; y++) {
      for (let x = 0; x < CELLS; x++) {
        const px = x * cw, py = y * cw;
        const margin = cw * 0.22;
        const wx = px + margin, wy = py + cw * 0.18;
        const ww = cw * 0.56, wh = cw * 0.52;
        g.fillStyle = '#404040';
        g.fillRect(wx, wy, ww, wh);
        g.strokeStyle = '#555555';
        g.lineWidth = 2;
        g.strokeRect(wx, wy, ww, wh);
      }
    }

    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = Math.min(16, MAX_ANISO);
    return t;
  })();

  function facadeMaterial(def) {
    const key = def.hex + '|' + def.lit + '|' + (def.style || 'concrete');
    if (facadeCache.has(key)) return facadeCache.get(key);

    const S = TEX_S, cw = S / CELLS;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const g = c.getContext('2d');
    g.fillStyle = '#' + new THREE.Color(def.hex).getHexString();
    g.fillRect(0, 0, S, S);

    // REALISTIC CONCRETE: base texture with aggregate speckle
    for (let i = 0; i < S * 4; i++) {
      const v = Math.random();
      if (v < 0.3) {
        g.fillStyle = `rgba(255,255,255,${Math.random() * 0.04})`;
      } else if (v < 0.6) {
        g.fillStyle = `rgba(0,0,0,${Math.random() * 0.05})`;
      } else {
        const c2 = Math.random() * 20 + 110;
        g.fillStyle = `rgba(${c2},${c2 - 5},${c2 - 10},${Math.random() * 0.03})`;
      }
      g.fillRect(Math.random() * S, Math.random() * S, 1 + Math.random() * 3, 1 + Math.random() * 3);
    }

    // REALISTIC: concrete pores and surface texture
    for (let i = 0; i < S * 0.8; i++) {
      const px = Math.random() * S, py = Math.random() * S;
      const pr = 1 + Math.random() * 3;
      const gr = g.createRadialGradient(px, py, 0, px, py, pr);
      gr.addColorStop(0, 'rgba(0,0,0,0.08)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(px - pr, py - pr, pr * 2, pr * 2);
    }

    // REALISTIC: formwork lines (horizontal board marks on concrete)
    if (def.style === 'concrete') {
      for (let y = 0; y < CELLS; y++) {
        const lineY = y * cw + cw * 0.02;
        g.fillStyle = 'rgba(0,0,0,0.06)';
        g.fillRect(0, lineY, S, 2);
        g.fillStyle = 'rgba(255,255,255,0.03)';
        g.fillRect(0, lineY + 2, S, 1);
      }
    }

    // REALISTIC: brick pattern
    if (def.style === 'brick') {
      const brickH = cw / 5;
      const brickW = cw / 3;
      for (let row = 0; row < CELLS * 5; row++) {
        const offset = (row % 2) * brickW * 0.5;
        for (let col = -1; col < CELLS * 3 + 1; col++) {
          const bx = col * brickW + offset;
          const by = row * brickH;
          // brick face
          const brickShade = 0.85 + Math.random() * 0.15;
          g.fillStyle = `rgba(${140 * brickShade},${100 * brickShade},${80 * brickShade},0.9)`;
          g.fillRect(bx + 1, by + 1, brickW - 2, brickH - 2);
          // mortar
          g.fillStyle = 'rgba(180,175,165,0.3)';
          g.fillRect(bx, by, brickW, 1);
          g.fillRect(bx, by, 1, brickH);
        }
      }
    }

    // REALISTIC: heavy weathering and stains
    for (let i = 0; i < 45; i++) {
      const x = Math.random() * S, w2 = cw * (0.15 + Math.random() * 0.4);
      const y2 = Math.random() * S, h2 = cw * (0.6 + Math.random() * 1.5);
      const gr = g.createLinearGradient(0, y2, 0, y2 + h2);
      gr.addColorStop(0, `rgba(0,0,0,${0.03 + Math.random() * 0.05})`);
      gr.addColorStop(0.3, `rgba(0,0,0,${0.02 + Math.random() * 0.02})`);
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr; g.fillRect(x, y2, w2, h2);
    }

    // REALISTIC: water damage and mineral deposits
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * S, y = Math.random() * S;
      const r = cw * (0.4 + Math.random() * 0.8);
      const gr = g.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, 'rgba(0,0,0,.07)');
      gr.addColorStop(0.5, 'rgba(0,0,0,.03)');
      gr.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = gr;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    }

    // REALISTIC: cracks on concrete
    if (def.style === 'concrete' && Math.random() < 0.4) {
      g.strokeStyle = 'rgba(0,0,0,0.12)';
      g.lineWidth = 1;
      g.beginPath();
      let cx = Math.random() * S, cy = Math.random() * S;
      g.moveTo(cx, cy);
      for (let s = 0; s < 5 + Math.random() * 8; s++) {
        cx += (Math.random() - 0.5) * cw * 0.4;
        cy += Math.random() * cw * 0.3;
        g.lineTo(cx, cy);
      }
      g.stroke();
    }

    // separate emissive canvas (lit interiors only)
    let eg = null, eTex = null;
    if (def.lit) {
      const ec = document.createElement('canvas'); ec.width = ec.height = TEX_S / 2;
      eg = ec.getContext('2d');
      eg.fillStyle = '#000'; eg.fillRect(0, 0, ec.width, ec.height);
      eTex = new THREE.CanvasTexture(ec);
      eTex.wrapS = eTex.wrapT = THREE.RepeatWrapping;
      eTex.anisotropy = Math.min(16, MAX_ANISO);
    }

    // REALISTIC: concrete building windows (smaller, with thick frames)
    for (let y = 0; y < CELLS; y++) {
      for (let x = 0; x < CELLS; x++) {
        const px = x * cw, py = y * cw;

        // concrete slab edge
        g.fillStyle = 'rgba(0,0,0,0.15)'; g.fillRect(px, py + cw * 0.13, cw, 2);
        g.fillStyle = 'rgba(255,255,255,0.04)'; g.fillRect(px, py, cw, cw * 0.13);

        // smaller window opening (realistic concrete building proportion)
        const margin = cw * 0.22;
        const wx = px + margin, wy = py + cw * 0.18;
        const ww = cw * 0.56, wh = cw * 0.52;

        const on = def.lit && Math.random() < 0.42;
        let fill;
        if (on) {
          const warm = Math.random() < 0.7;
          const bright = 0.4 + Math.random() * 0.5;
          if (warm) {
            fill = `rgba(${200 + Math.random() * 55 | 0},${150 + Math.random() * 40 | 0},${80 + Math.random() * 50 | 0},1)`;
          } else {
            fill = `rgba(${140 + Math.random() * 30 | 0},${180 + Math.random() * 30 | 0},${220 + Math.random() * 35 | 0},1)`;
          }
          if (eg) {
            const es = eg.canvas.width / S;
            const ex = wx * es, ey = wy * es;
            eg.fillStyle = warm ? `rgba(255,175,110,${0.12 * bright})` : `rgba(140,190,240,${0.1 * bright})`;
            eg.fillRect(ex - es * 2, ey - es * 2, ww * es + es * 4, wh * es + es * 4);
            eg.fillStyle = warm ? `rgba(255,190,130,${0.25 * bright})` : `rgba(155,200,245,${0.2 * bright})`;
            eg.fillRect(ex, ey, ww * es, wh * es);
          }
        } else {
          const r = Math.random();
          fill = r < 0.55 ? 'rgba(15,22,35,.95)' : r < 0.8 ? 'rgba(30,45,65,.88)' : 'rgba(50,70,100,.6)';
        }
        g.fillStyle = fill; g.fillRect(wx, wy, ww, wh);

        // window frame (thick concrete frame)
        g.strokeStyle = 'rgba(40,50,65,.7)';
        g.lineWidth = Math.max(2, cw * 0.04);
        g.strokeRect(wx, wy, ww, wh);

        // inner frame highlight
        g.strokeStyle = 'rgba(255,255,255,.06)';
        g.lineWidth = 1;
        g.strokeRect(wx + 1, wy + 1, ww - 2, wh - 2);

        // vertical mullion
        g.strokeStyle = 'rgba(40,50,65,.6)';
        g.lineWidth = Math.max(1.5, cw * 0.025);
        g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();

        // horizontal mullion (4-pane window)
        g.beginPath(); g.moveTo(wx, wy + wh / 2); g.lineTo(wx + ww, wy + wh / 2); g.stroke();

        // curtains/blinds
        if (on && Math.random() < 0.3) {
          g.fillStyle = `rgba(200,200,200,${0.1 + Math.random() * 0.1})`;
          g.fillRect(wx + 2, wy + 2, ww - 4, wh * (0.2 + Math.random() * 0.3));
        }
        if (!on && Math.random() < 0.2) {
          g.fillStyle = 'rgba(150,160,175,.08)';
          for (let sl = 0; sl < 3; sl++) {
            g.fillRect(wx + 2, wy + wh * (0.15 + sl * 0.2), ww - 4, wh * 0.04);
          }
        }
      }
    }

    const map = new THREE.CanvasTexture(c);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.colorSpace = THREE.SRGBColorSpace;
    map.anisotropy = MAX_ANISO;

    // REALISTIC: concrete/brick material (no glass)
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff, map,
      bumpMap: bumpTex, bumpScale: 0.5,
      emissive: def.lit ? 0xffffff : 0x000000, emissiveMap: eTex || null, emissiveIntensity: def.lit ? 0.5 : 0,
      roughness: def.style === 'brick' ? 0.88 : 0.82,
      metalness: 0.05,
      envMapIntensity: 0.65,
    });
    if (eTex) litMatsAll.push(mat);

    // world-tiled UVs: per-instance scale / tile span keeps every window at real size
    mat.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nuniform float uTile;')
        .replace('#include <uv_vertex>', `
          #ifdef USE_INSTANCING
            vec2 iScale = vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz));
          #else
            vec2 iScale = vec2(1.0);
          #endif
          vec2 tiledUv = uv * iScale / uTile;
          #ifdef USE_MAP
            vMapUv = ( mapTransform * vec3( tiledUv, 1 ) ).xy;
          #endif
          #ifdef USE_EMISSIVEMAP
            vEmissiveMapUv = ( emissiveMapTransform * vec3( tiledUv, 1 ) ).xy;
          #endif
          #ifdef USE_BUMPMAP
            vBumpMapUv = ( bumpMapTransform * vec3( tiledUv, 1 ) ).xy;
          #endif
        `);
      shader.uniforms.uTile = { value: TILE };
    };

    facadeCache.set(key, mat);
    return mat;
  }

  /* ---------- ULTRA: ground, grid, roads (photorealistic concrete/asphalt) ---------- */
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(700, 700),
    new THREE.MeshStandardMaterial({ color: 0x04060d, roughness: 0.92, metalness: 0.05 })
  );
  ground.rotation.x = -Math.PI / 2; ground.position.z = -100;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(560, 56, 0x1a2b4d, 0x0e1830);
  grid.material.transparent = true; grid.material.opacity = 0.12;
  grid.position.set(0, 0.02, -100);
  scene.add(grid);

  /* ---------- distant hazy skyline backdrop (photographic atmospheric depth) ---------- */
  {
    const bw = 2048, bh = 640;
    const bc = document.createElement('canvas'); bc.width = bw; bc.height = bh;
    const bg = bc.getContext('2d');
    bg.clearRect(0, 0, bw, bh);

    // three haze layers, darkest/sharpest closest, lightest/blurriest farthest — mimics real atmospheric perspective
    const layers = [
      { count: 46, hMin: 40, hMax: 260, alpha: 0.55, color: '10,16,28' },
      { count: 38, hMin: 60, hMax: 340, alpha: 0.35, color: '18,26,42' },
      { count: 30, hMin: 90, hMax: 420, alpha: 0.20, color: '30,42,64' },
    ];
    for (const layer of layers) {
      let x = -40;
      for (let i = 0; i < layer.count; i++) {
        const w = 30 + Math.random() * 70;
        const h = layer.hMin + Math.random() * (layer.hMax - layer.hMin);
        x += w * (0.55 + Math.random() * 0.4);
        bg.fillStyle = `rgba(${layer.color},${layer.alpha})`;
        bg.fillRect(x, bh - h, w, h);
        // a few lit windows as tiny specks for realism
        if (layer.alpha > 0.3 && Math.random() < 0.7) {
          for (let wI = 0; wI < h / 14; wI++) {
            if (Math.random() < 0.5) continue;
            bg.fillStyle = `rgba(255,210,150,${0.25 + Math.random() * 0.3})`;
            bg.fillRect(x + Math.random() * w, bh - h + Math.random() * h, 2, 2);
          }
        }
        if (x > bw + 40) x = -40; // wrap so the strip tiles seamlessly
      }
    }
    // ground-fade so it blends into the fog/floor instead of a hard edge
    const fade = bg.createLinearGradient(0, bh - 90, 0, bh);
    fade.addColorStop(0, 'rgba(3,5,11,0)');
    fade.addColorStop(1, 'rgba(3,5,11,0.9)');
    bg.fillStyle = fade; bg.fillRect(0, bh - 90, bw, 90);

    const skylineTex = new THREE.CanvasTexture(bc);
    skylineTex.colorSpace = THREE.SRGBColorSpace;
    skylineTex.wrapS = THREE.RepeatWrapping;

    const skylineMat = new THREE.MeshBasicMaterial({
      map: skylineTex, transparent: true, fog: true, depthWrite: false, side: THREE.DoubleSide,
    });
    // a wide shallow arc of planes so the backdrop reads correctly from most camera angles along the avenue
    const radius = 190;
    const segments = 5;
    for (let s = 0; s < segments; s++) {
      const t = s / (segments - 1) - 0.5;               // -0.5..0.5
      const ang = t * 1.1;                                // fan spread
      const cx = Math.sin(ang) * radius;
      const cz = -100 - Math.cos(ang) * radius + radius;  // curve around scene center z≈-100
      const seg = new THREE.Mesh(new THREE.PlaneGeometry(radius * 0.85, 95), skylineMat);
      seg.position.set(cx, 44, cz - 60);
      seg.rotation.y = -ang;
      seg.renderOrder = -1;
      scene.add(seg);
    }
  }

  // REALISTIC: asphalt road with texture
  const roadCanvas = document.createElement('canvas');
  roadCanvas.width = 512; roadCanvas.height = 512;
  const roadCtx = roadCanvas.getContext('2d');

  // base asphalt
  roadCtx.fillStyle = '#1a1e28';
  roadCtx.fillRect(0, 0, 512, 512);

  // aggregate texture
  for (let i = 0; i < 3000; i++) {
    const v = 15 + Math.random() * 25;
    roadCtx.fillStyle = `rgb(${v},${v + 2},${v + 5})`;
    roadCtx.fillRect(Math.random() * 512, Math.random() * 512, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }

  // cracks
  for (let i = 0; i < 8; i++) {
    roadCtx.strokeStyle = `rgba(0,0,0,${0.15 + Math.random() * 0.1})`;
    roadCtx.lineWidth = 1 + Math.random();
    roadCtx.beginPath();
    let cx = Math.random() * 512, cy = Math.random() * 512;
    roadCtx.moveTo(cx, cy);
    for (let s = 0; s < 4 + Math.random() * 6; s++) {
      cx += (Math.random() - 0.5) * 80;
      cy += Math.random() * 60;
      roadCtx.lineTo(cx, cy);
    }
    roadCtx.stroke();
  }

  // lane markings (dashed center line)
  roadCtx.strokeStyle = 'rgba(255,255,255,0.4)';
  roadCtx.lineWidth = 4;
  roadCtx.setLineDash([30, 20]);
  roadCtx.beginPath();
  roadCtx.moveTo(256, 0);
  roadCtx.lineTo(256, 512);
  roadCtx.stroke();

  // edge lines
  roadCtx.strokeStyle = 'rgba(255,255,255,0.25)';
  roadCtx.lineWidth = 3;
  roadCtx.setLineDash([]);
  roadCtx.beginPath();
  roadCtx.moveTo(50, 0); roadCtx.lineTo(50, 512);
  roadCtx.moveTo(462, 0); roadCtx.lineTo(462, 512);
  roadCtx.stroke();

  const roadTex = new THREE.CanvasTexture(roadCanvas);
  roadTex.wrapS = roadTex.wrapT = THREE.RepeatWrapping;
  roadTex.repeat.set(1, 30);
  roadTex.anisotropy = 16;

  const roadMat = new THREE.MeshStandardMaterial({
    map: roadTex,
    roughness: 0.75, metalness: 0.1,
    envMapIntensity: 0.3,
  });
  const avenue = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 300), roadMat);
  avenue.rotation.x = -Math.PI / 2; avenue.position.set(0, 0.03, -110);
  avenue.receiveShadow = true;
  scene.add(avenue);

  // REALISTIC: concrete kerb/curb
  const kerbMat = new THREE.MeshStandardMaterial({
    color: 0x7a7a72, roughness: 0.85, metalness: 0.05,
  });
  for (const x of [-2.5, 2.5]) {
    const k = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.18, 300), kerbMat);
    k.position.set(x, 0.09, -110);
    k.castShadow = true; k.receiveShadow = true;
    scene.add(k);
  }

  // REALISTIC: concrete sidewalk
  const sidewalkCanvas = document.createElement('canvas');
  sidewalkCanvas.width = 256; sidewalkCanvas.height = 256;
  const swCtx = sidewalkCanvas.getContext('2d');
  swCtx.fillStyle = '#5a5a55';
  swCtx.fillRect(0, 0, 256, 256);
  // pavement slab joints
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      swCtx.strokeStyle = 'rgba(0,0,0,0.15)';
      swCtx.lineWidth = 1;
      swCtx.strokeRect(x * 32, y * 32, 32, 32);
    }
  }
  // surface texture
  for (let i = 0; i < 800; i++) {
    const v = 80 + Math.random() * 30;
    swCtx.fillStyle = `rgba(${v},${v},${v - 5},0.4)`;
    swCtx.fillRect(Math.random() * 256, Math.random() * 256, 1 + Math.random() * 2, 1 + Math.random() * 2);
  }
  const swTex = new THREE.CanvasTexture(sidewalkCanvas);
  swTex.wrapS = swTex.wrapT = THREE.RepeatWrapping;
  swTex.repeat.set(40, 1);
  swTex.anisotropy = 16;

  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: swTex, roughness: 0.88, metalness: 0.03,
  });
  for (const xSide of [-1, 1]) {
    const sw = new THREE.Mesh(new THREE.PlaneGeometry(4, 300), sidewalkMat);
    sw.rotation.x = -Math.PI / 2;
    sw.position.set(xSide * 4.5, 0.05, -110);
    sw.receiveShadow = true;
    scene.add(sw);
  }

  // cross streets
  for (let z = 6; z >= -238; z -= 26) {
    const cross = new THREE.Mesh(new THREE.PlaneGeometry(150, 3), roadMat);
    cross.rotation.x = -Math.PI / 2; cross.position.set(0, 0.03, z);
    cross.receiveShadow = true;
    scene.add(cross);
  }

  /* ---------- horizon glow ---------- */
  const horizonTex = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 8, 128, 128, 128);
    gr.addColorStop(0, 'rgba(56,110,220,.55)');
    gr.addColorStop(0.45, 'rgba(30,60,140,.22)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    return new THREE.CanvasTexture(c);
  })();
  const horizon = new THREE.Mesh(
    new THREE.PlaneGeometry(560, 150),
    new THREE.MeshBasicMaterial({ map: horizonTex, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  horizon.position.set(0, 30, -320);
  scene.add(horizon);

  // sunrise counterpart: warm golden glow that fades in as the night → sunrise transition runs
  const sunTex = (() => {
    const c = document.createElement('canvas'); c.width = 256; c.height = 128;
    const g = c.getContext('2d');
    const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128);
    gr.addColorStop(0, 'rgba(255,236,200,.95)');
    gr.addColorStop(0.3, 'rgba(255,168,92,.55)');
    gr.addColorStop(0.65, 'rgba(255,110,70,.22)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 256, 128);
    return new THREE.CanvasTexture(c);
  })();
  const sunGlow = new THREE.Mesh(
    new THREE.PlaneGeometry(560, 150),
    new THREE.MeshBasicMaterial({ map: sunTex, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })
  );
  sunGlow.position.set(0, 30, -319);
  scene.add(sunGlow);

  /* ---------- stars ---------- */
  {
    const n = 340, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      pos[i * 3] = rand(-320, 320);
      pos[i * 3 + 1] = rand(55, 190);
      pos[i * 3 + 2] = rand(-360, 60);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0x8fa8d8, size: 1.3, sizeAttenuation: false, transparent: true, opacity: 0.5, fog: false, depthWrite: false,
    });
    scene.add(new THREE.Points(g, starsMat));
    dawn.stars = starsMat;
  }

  /* ---------- procedural buildings (instanced) ---------- */
  const plots = [];
  for (let gx = -72; gx <= 72; gx += 9.5) {
    for (let gz = 12; gz >= -234; gz -= 9.5) {
      if (Math.abs(gx) < 5) continue;                    // keep the main avenue clear
      if (Math.random() < 0.12) continue;                // density variance
      const x = gx + rand(-2.4, 2.4), z = gz + rand(-2.4, 2.4);
      let nearLandmark = false;
      for (const L of LANDMARKS) {
        const dx = x - L.pos[0], dz = z - L.pos[2];
        if (dx * dx + dz * dz < 121) { nearLandmark = true; break; }
      }
      plots.push({ x, z, nearLandmark });
    }
  }
  // shuffle so truncation to the target count stays evenly distributed
  for (let i = plots.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [plots[i], plots[j]] = [plots[j], plots[i]];
  }
  const chosen = plots.slice(0, T.buildings);

  const BODIES = {
    standard:  { hMin: 2.5, hMax: 8,  wMin: 4,   wMax: 7.5, edge: new THREE.Color(0x2a3f66) },
    corporate: { hMin: 12,  hMax: 26, wMin: 5.5, wMax: 8,   edge: new THREE.Color(0x1f4f66) },
    tech:      { hMin: 18,  hMax: 34, wMin: 2.8, wMax: 4.2, edge: new THREE.Color(0x1f6b52) },
    // ULTRA: additional building categories for urban variety
    luxury:    { hMin: 22,  hMax: 38, wMin: 4.5, wMax: 7,   edge: new THREE.Color(0x2a4a68) },
    residential: { hMin: 6, hMax: 16, wMin: 5,   wMax: 9,   edge: new THREE.Color(0x2a3850) },
  };
  // REALISTIC COLOR: real-city material palette — limestone, sandstone, terracotta,
  // brick, weathered concrete, slate. Muted earth tones so the night city reads as
  // actual buildings (not grey/green toy blocks).
  const FACADES = [
    { hex: 0xa89f8e, lit: true,  glass: false, style: 'concrete' },   // warm limestone
    { hex: 0x8f887b, lit: true,  glass: false, style: 'concrete' },   // beige sandstone
    { hex: 0x7e7c74, lit: true,  glass: false, style: 'concrete' },   // warm grey concrete
    { hex: 0x6c6f76, lit: true,  glass: false, style: 'concrete' },   // blue-grey concrete
    { hex: 0x575e66, lit: true,  glass: false, style: 'concrete' },   // charcoal slate
    { hex: 0x99906f, lit: true,  glass: false, style: 'concrete' },   // ochre sandstone
    { hex: 0x9e6a4f, lit: true,  glass: false, style: 'brick' },      // terracotta brick
    { hex: 0x8a503e, lit: true,  glass: false, style: 'brick' },      // rust brick
    { hex: 0x77503c, lit: true,  glass: false, style: 'brick' },      // warm dark brick
    { hex: 0xa79a86, lit: true,  glass: false, style: 'concrete' },   // off-white stucco
    { hex: 0x8f8374, lit: false, glass: false, style: 'concrete' },   // unlit weathered concrete
    { hex: 0x6a625c, lit: false, glass: false, style: 'concrete' },   // unlit aged concrete
  ];

  const builds = chosen.map(p => {
    let cat;
    const r = Math.random();
    if (p.nearLandmark) cat = r < 0.6 ? 'corporate' : r < 0.85 ? 'tech' : 'luxury';
    else cat = r < 0.45 ? 'standard' : r < 0.7 ? 'corporate' : r < 0.88 ? 'tech' : r < 0.95 ? 'residential' : 'luxury';
    const B = BODIES[cat];
    const glass = false; // all buildings are concrete/brick now
    const b = {
      x: p.x, z: p.z, cat, glass,
      // snap footprints to whole tiles so texture windows keep a uniform size
      w: Math.max(2, Math.round(rand(B.wMin, B.wMax))),
      d: Math.max(2, Math.round(rand(B.wMin, B.wMax))),
      h: p.nearLandmark ? rand(8, 18) : rand(B.hMin, B.hMax),
    };
    // real-tower massing: tall buildings get a narrower crown on top (setback silhouette, like NYC towers)
    b.segs = [[0, b.h, b.w, b.d]];
    if (b.h >= 10 && Math.random() < 0.62) {
      const sw = Math.max(2, Math.round(b.w * rand(0.6, 0.8)));
      const sd = Math.max(2, Math.round(b.d * rand(0.6, 0.8)));
      const ch = Math.round(b.h * rand(0.25, 0.4));
      b.segs = [[0, b.h - ch, b.w, b.d], [b.h - ch, ch, sw, sd]];   // crown carved out of the total height
      b.sw = sw; b.sd = sd;                       // rooftop items sit on the crown
    } else {
      b.sw = b.w; b.sd = b.d;
    }
    return b;
  });


  const boxGeo = new THREE.BoxGeometry(1, 1, 1);
  boxGeo.translate(0, 0.5, 0);
  // collision proxies: the camera must never clip through a building (resolved per-frame in updateCamera)
  const CITY_BOXES = builds.map(b => ({ x: b.x, z: b.z, hw: b.w / 2 + 1.1, hd: b.d / 2 + 1.1, h: b.h }));
  for (const L of LANDMARKS) CITY_BOXES.push({ x: L.pos[0], z: L.pos[2], hw: 4.4, hd: 4.4, h: L.h + 2 });
  // subtle bevel on the top edges: catches env light like real architecture
  {
    const boxPos = boxGeo.attributes.position;
    for (let i = 0; i < boxPos.count; i++) {
      if (Math.abs(boxPos.getY(i)) > 0.499) {
        boxPos.setX(i, boxPos.getX(i) * 0.995);
        boxPos.setZ(i, boxPos.getZ(i) * 0.995);
      }
    }
  }
  const dummy = new THREE.Object3D();

  // one InstancedMesh per facade style; per-instance scale bakes world-tile UVs
  const matGroups = new Map();
  builds.forEach(b => {
    const def = FACADES[Math.random() * FACADES.length | 0];
    const mat = facadeMaterial(def);
    if (!matGroups.has(mat.uuid)) matGroups.set(mat.uuid, { mat, items: [] });
    matGroups.get(mat.uuid).items.push(b);
  });
  const tmpMat4 = new THREE.Matrix4();
  // one instanced mesh per facade style; every building contributes its base + crown segments
  for (const { mat, items } of matGroups.values()) {
    const segs = [];
    for (const b of items) for (const s of b.segs) segs.push([b, s]);
    const mesh = new THREE.InstancedMesh(boxGeo, mat, segs.length);
    mesh.instanceMatrix.setUsage(THREE.StaticDrawUsage);
    segs.forEach(([b, s], i) => {
      tmpMat4.makeScale(s[2], s[1], s[3]);
      tmpMat4.setPosition(b.x, s[0], b.z);
      mesh.setMatrixAt(i, tmpMat4);
    });
    mesh.castShadow = true;                       // buildings now cast & receive real shadows
    mesh.receiveShadow = true;
    mesh.instanceMatrix.needsUpdate = true;
    scene.add(mesh);
  }

  /* ---------- ULTRA: 3D facade relief (mullion fins, floor ledges, cornices, pilasters) ---------- */
  {
    const finMat = new THREE.MeshPhysicalMaterial({
      color: 0x3d4d68, roughness: 0.28, metalness: 0.82,
      clearcoat: 0.4, clearcoatRoughness: 0.3,
      envMapIntensity: 1.4,
    });
    const finGeo = new THREE.BoxGeometry(0.08, 1, 0.14); finGeo.translate(0, 0.5, 0);
    const ledgeMat = new THREE.MeshStandardMaterial({ color: 0x2a3140, roughness: 0.82, metalness: 0.18 });
    const ledgeGeo = new THREE.BoxGeometry(1, 0.14, 0.22); ledgeGeo.translate(0, 0.5, 0);
    // ULTRA: cornice (decorative crown molding)
    const corniceMat = new THREE.MeshStandardMaterial({ color: 0x323e52, roughness: 0.6, metalness: 0.35 });
    const corniceGeo = new THREE.BoxGeometry(1, 0.2, 0.35); corniceGeo.translate(0, 0.5, 0);
    // ULTRA: pilaster (vertical decorative strip)
    const pilasterMat = new THREE.MeshStandardMaterial({ color: 0x2e3a4e, roughness: 0.7, metalness: 0.25 });
    const pilasterGeo = new THREE.BoxGeometry(0.18, 1, 0.12); pilasterGeo.translate(0, 0.5, 0);

    const fins = [], ledges = [], cornices = [], pilasters = [];
    const m = MODULE;
    for (const b of builds) {
      for (const [y0, sh, sw, sd] of b.segs) {
        const cols = Math.max(1, Math.round(sw / m)), colsD = Math.max(1, Math.round(sd / m));
        // vertical pilaster fins on all concrete facades
        for (let i = 0; i <= cols; i++) {
          const x = b.x - sw / 2 + i * m;
          fins.push({ x, z: b.z + sd / 2 + 0.06, h: sh }, { x, z: b.z - sd / 2 - 0.06, h: sh });
        }
        for (let i = 0; i <= colsD; i++) {
          const z = b.z - sd / 2 + i * m;
          fins.push({ x: b.x + sw / 2 + 0.06, z, h: sh }, { x: b.x - sw / 2 - 0.06, z, h: sh });
        }
        // floor ledges on concrete buildings
        const floors = Math.max(1, Math.floor(sh / m));
        for (let f = 1; f < floors; f++) {
          const y = y0 + f * m - 0.07;
          for (let i = 0; i < cols; i++) {
            const x = b.x - sw / 2 + (i + 0.5) * m;
            ledges.push({ x, y, z: b.z + sd / 2 + 0.11 }, { x, y, z: b.z - sd / 2 - 0.11 });
          }
          for (let i = 0; i < colsD; i++) {
            const z = b.z - sd / 2 + (i + 0.5) * m;
            ledges.push({ x: b.x + sw / 2 + 0.11, y, z }, { x: b.x - sw / 2 - 0.11, y, z });
          }
        }
        // cornice at building top (crown molding)
        if (HI_RES && sh > 6) {
          const topY = y0 + sh;
          cornices.push({ x: b.x, y: topY - 0.15, z: b.z + sd / 2 + 0.17, w: sw + 0.4 });
          cornices.push({ x: b.x, y: topY - 0.15, z: b.z - sd / 2 - 0.17, w: sw + 0.4 });
          cornices.push({ x: b.x + sw / 2 + 0.17, y: topY - 0.15, z: b.z, w: sd + 0.4 }, { x: b.x - sw / 2 - 0.17, y: topY - 0.15, z: b.z, w: sd + 0.4 });
        }
        // pilasters between windows on concrete facades
        if (HI_RES && sh > 8) {
          for (let i = 1; i < cols; i++) {
            const x = b.x - sw / 2 + i * m;
            pilasters.push({ x, z: b.z + sd / 2 + 0.12, h: sh }, { x, z: b.z - sd / 2 - 0.12, h: sh });
          }
        }
      }
    }

    const finMesh = new THREE.InstancedMesh(finGeo, finMat, Math.max(fins.length, 1));
    fins.forEach((f, i) => {
      dummy.rotation.set(0, 0, 0); dummy.position.set(f.x, 0, f.z);
      dummy.scale.set(1, f.h, 1); dummy.updateMatrix();
      finMesh.setMatrixAt(i, dummy.matrix);
    });
    finMesh.castShadow = true; finMesh.instanceMatrix.needsUpdate = true;
    scene.add(finMesh);

    const ledgeMesh = new THREE.InstancedMesh(ledgeGeo, ledgeMat, Math.max(ledges.length, 1));
    ledges.forEach((l, i) => {
      dummy.rotation.set(0, 0, 0); dummy.position.set(l.x, l.y, l.z);
      dummy.scale.set(m * 0.8, 1, 1); dummy.updateMatrix();
      ledgeMesh.setMatrixAt(i, dummy.matrix);
    });
    ledgeMesh.castShadow = true; ledgeMesh.receiveShadow = true; ledgeMesh.instanceMatrix.needsUpdate = true;
    scene.add(ledgeMesh);

    // ULTRA: cornices
    if (cornices.length > 0) {
      const corniceMesh = new THREE.InstancedMesh(corniceGeo, corniceMat, cornices.length);
      cornices.forEach((c, i) => {
        dummy.rotation.set(0, 0, 0); dummy.position.set(c.x, c.y, c.z);
        dummy.scale.set(c.w, 1, 1); dummy.updateMatrix();
        corniceMesh.setMatrixAt(i, dummy.matrix);
      });
      corniceMesh.castShadow = true; corniceMesh.receiveShadow = true;
      corniceMesh.instanceMatrix.needsUpdate = true;
      scene.add(corniceMesh);
    }

    // ULTRA: pilasters
    if (pilasters.length > 0) {
      const pilasterMesh = new THREE.InstancedMesh(pilasterGeo, pilasterMat, pilasters.length);
      pilasters.forEach((p, i) => {
        dummy.rotation.set(0, 0, 0); dummy.position.set(p.x, 0, p.z);
        dummy.scale.set(1, p.h, 1); dummy.updateMatrix();
        pilasterMesh.setMatrixAt(i, dummy.matrix);
      });
      pilasterMesh.castShadow = true; pilasterMesh.instanceMatrix.needsUpdate = true;
      scene.add(pilasterMesh);
    }
  }

  /* ---------- rooftop caps (parapet slabs for silhouette depth) ---------- */
  const capMat = new THREE.MeshStandardMaterial({ color: 0x0a0f1c, roughness: 0.95, metalness: 0.1 });
  const capCount = builds.reduce((n, b) => n + b.segs.length, 0);
  const caps = new THREE.InstancedMesh(boxGeo, capMat, capCount);
  let capIdx = 0;
  builds.forEach(b => {
    for (const [y0, sh, sw, sd] of b.segs) {
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(b.x, y0 + sh, b.z);
      dummy.scale.set(sw + 0.3, 0.24, sd + 0.3);
      dummy.updateMatrix();
      caps.setMatrixAt(capIdx++, dummy.matrix);
    }
  });
  caps.castShadow = true; caps.receiveShadow = true;
  caps.instanceMatrix.needsUpdate = true;
  scene.add(caps);

  /* ---------- ULTRA: rooftop clutter (AC units + water tanks with realistic materials) ---------- */
  {
    const acGeo = new THREE.BoxGeometry(0.9, 0.5, 0.7);
    const tankGeo = new THREE.CylinderGeometry(0.42, 0.48, 1.0, 10);
    // ULTRA: realistic AC unit material with metal grille
    const acMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2538, roughness: 0.45, metalness: 0.7,
      clearcoat: 0.3, clearcoatRoughness: 0.4,
      envMapIntensity: 0.9,
    });
    // ULTRA: realistic water tank (galvanized steel)
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e2c44, roughness: 0.35, metalness: 0.75,
      clearcoat: 0.2, clearcoatRoughness: 0.5,
      envMapIntensity: 1.0,
    });
    const acItems = [], tankItems = [];
    for (const b of builds) {
      if (b.h < 7) continue;
      const n = 1 + (Math.random() * 2.8 | 0);
      for (let i = 0; i < n; i++) {
        acItems.push({
          x: b.x + rand(-b.sw / 2 + 0.8, b.sw / 2 - 0.8),
          z: b.z + rand(-b.sd / 2 + 0.8, b.sd / 2 - 0.8),
          y: b.h + 0.24 + 0.25, ry: Math.random() * Math.PI,
        });
      }
      if (b.h > 15 && Math.random() < 0.55) {
        tankItems.push({
          x: b.x + rand(-b.sw / 2 + 0.7, b.sw / 2 - 0.7),
          z: b.z + rand(-b.sd / 2 + 0.7, b.sd / 2 - 0.7),
          y: b.h + 0.24 + 0.5,
        });
      }
    }
    const acs = new THREE.InstancedMesh(acGeo, acMat, Math.max(acItems.length, 1));
    acItems.forEach((it, i) => {
      dummy.rotation.set(0, it.ry, 0);
      dummy.position.set(it.x, it.y, it.z || 0);
      dummy.scale.set(1, 1, 1); dummy.updateMatrix();
      acs.setMatrixAt(i, dummy.matrix);
    });
    acs.castShadow = true;
    acs.instanceMatrix.needsUpdate = true;
    scene.add(acs);
    const tanks = new THREE.InstancedMesh(tankGeo, tankMat, Math.max(tankItems.length, 1));
    tankItems.forEach((it, i) => {
      dummy.rotation.set(0, 0, 0);
      dummy.position.set(it.x, it.y, it.z);
      dummy.scale.set(1, 1, 1); dummy.updateMatrix();
      tanks.setMatrixAt(i, dummy.matrix);
    });
    tanks.castShadow = true;
    tanks.instanceMatrix.needsUpdate = true;
    scene.add(tanks);
  }

  /* ---------- rooftop lights & antennas ---------- */
  const roofGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
  const roofMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const roofCandidates = builds.filter(b => b.h > 6 && Math.random() < 0.4);
  const roofs = new THREE.InstancedMesh(roofGeo, roofMat, Math.max(roofCandidates.length, 1));
  const ROOF_TINTS = [0x64f5b0, 0x62dcff, 0xffd9a0, 0xff6b7a].map(c => new THREE.Color(c));
  roofCandidates.forEach((b, i) => {
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(b.x + rand(-b.sw / 4, b.sw / 4), b.h + 0.2, b.z + rand(-b.sd / 4, b.sd / 4));
    dummy.scale.set(1, 1, 1); dummy.updateMatrix();
    roofs.setMatrixAt(i, dummy.matrix);
    roofs.setColorAt(i, pick(ROOF_TINTS));
  });
  roofs.instanceMatrix.needsUpdate = true;
  if (roofs.instanceColor) roofs.instanceColor.needsUpdate = true;
  scene.add(roofs);

  const antGeo = new THREE.BoxGeometry(0.09, 1, 0.09);
  antGeo.translate(0, 0.5, 0);
  const antMat = new THREE.MeshStandardMaterial({ color: 0x1a2440, roughness: 0.8 });
  const antCandidates = builds.filter(b => b.h > 14 && Math.random() < 0.55);
  const antennas = new THREE.InstancedMesh(antGeo, antMat, Math.max(antCandidates.length, 1));
  const beaconPos = [];
  antCandidates.forEach((b, i) => {
    const ah = rand(2, 4.5);
    dummy.rotation.set(0, 0, 0);
    dummy.position.set(b.x, b.h, b.z);
    dummy.scale.set(1, ah, 1); dummy.updateMatrix();
    antennas.setMatrixAt(i, dummy.matrix);
    beaconPos.push(b.x, b.h + ah + 0.15, b.z);
  });
  antennas.instanceMatrix.needsUpdate = true;
  scene.add(antennas);
  const beaconGeo = new THREE.BufferGeometry();
  beaconGeo.setAttribute('position', new THREE.Float32BufferAttribute(beaconPos, 3));
  const beaconMat = new THREE.PointsMaterial({
    color: 0xff6b7a, size: 1.4, map: glowTex, transparent: true, opacity: 0.8,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  });
  scene.add(new THREE.Points(beaconGeo, beaconMat));

  /* ============================================================
     REALISTIC BUILDING ENHANCEMENTS (additive — no existing code modified)
     ============================================================ */

  /* ---------- L-shaped & T-shaped building footprints ---------- */
  {
    const lShapeGeo = new THREE.BoxGeometry(1, 1, 1);
    const tShapeGeo = new THREE.BoxGeometry(1, 1, 1);
    const extMat = new THREE.MeshStandardMaterial({ color: 0x1a2538, roughness: 0.75, metalness: 0.2 });
    const extItems = [];

    for (const b of builds) {
      if (b.h < 6 || b.w < 4) continue;
      const r = Math.random();
      if (r < 0.18) {
        // L-shape: wing extending from one corner
        const wingW = Math.max(1.5, b.w * 0.4);
        const wingD = Math.max(1.5, b.d * 0.6);
        const wingH = b.h * 0.65;
        const side = Math.random() < 0.5 ? -1 : 1;
        extItems.push({
          x: b.x + side * (b.w / 2 + wingW / 2 - 0.3),
          z: b.z,
          w: wingW, d: wingD, h: wingH,
        });
      } else if (r < 0.28) {
        // T-shape: central projection
        const projW = Math.max(1.2, b.w * 0.35);
        const projD = Math.max(1.5, b.d * 0.5);
        const projH = b.h * 0.55;
        extItems.push({
          x: b.x,
          z: b.z + b.d / 2 + projD / 2 - 0.2,
          w: projW, d: projD, h: projH,
        });
      }
    }

    if (extItems.length > 0) {
      const extMesh = new THREE.InstancedMesh(lShapeGeo, extMat, extItems.length);
      extItems.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, 0, it.z);
        dummy.scale.set(it.w, it.h, it.d);
        dummy.updateMatrix();
        extMesh.setMatrixAt(i, dummy.matrix);
      });
      extMesh.castShadow = true;
      extMesh.receiveShadow = true;
      extMesh.instanceMatrix.needsUpdate = true;
      scene.add(extMesh);
    }
  }

  /* ---------- balconies (glass railings on taller buildings) ---------- */
  {
    const balconyMat = new THREE.MeshPhysicalMaterial({
      color: 0x2a3a58, roughness: 0.15, metalness: 0.8,
      transparent: true, opacity: 0.6, envMapIntensity: 1.4,
    });
    const railMat = new THREE.MeshStandardMaterial({ color: 0x3d4d68, roughness: 0.3, metalness: 0.85 });
    const balconyGeo = new THREE.BoxGeometry(1, 0.08, 1);
    const railGeo = new THREE.BoxGeometry(1, 0.35, 0.04);
    const balconies = [], rails = [];

    for (const b of builds) {
      if (b.h < 8) continue;
      const floors = Math.floor(b.h / MODULE);
      const cols = Math.max(1, Math.round(b.w / MODULE));
      for (let f = 2; f < Math.min(floors, floors - 1); f++) {
        const y = f * MODULE + 0.04;
        for (let c = 0; c < cols; c++) {
          if (Math.random() < 0.45) continue; // skip some for variety
          const wx = b.x - b.w / 2 + (c + 0.5) * MODULE;
          balconies.push({ x: wx, y, z: b.z + b.d / 2 + 0.25, w: MODULE * 0.85, d: 0.55 });
          rails.push({ x: wx, y: y + 0.17, z: b.z + b.d / 2 + 0.52, w: MODULE * 0.85 });
        }
      }
    }

    if (balconies.length > 0) {
      const bMesh = new THREE.InstancedMesh(balconyGeo, balconyMat, balconies.length);
      balconies.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, it.y, it.z);
        dummy.scale.set(it.w, 1, it.d);
        dummy.updateMatrix();
        bMesh.setMatrixAt(i, dummy.matrix);
      });
      bMesh.castShadow = true;
      bMesh.instanceMatrix.needsUpdate = true;
      scene.add(bMesh);

      const rMesh = new THREE.InstancedMesh(railGeo, railMat, rails.length);
      rails.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, it.y, it.z);
        dummy.scale.set(it.w, 1, 1);
        dummy.updateMatrix();
        rMesh.setMatrixAt(i, dummy.matrix);
      });
      rMesh.castShadow = true;
      rMesh.instanceMatrix.needsUpdate = true;
      scene.add(rMesh);
    }
  }

  /* ---------- ground-level details (entrances, canopies, awnings) ---------- */
  {
    const canopyMat = new THREE.MeshStandardMaterial({ color: 0x1e2c44, roughness: 0.4, metalness: 0.6 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x0a1420, roughness: 0.2, metalness: 0.3 });
    const canopyGeo = new THREE.BoxGeometry(1, 0.12, 1);
    const doorGeo = new THREE.BoxGeometry(1, 1, 0.1);
    const canopies = [], doors = [];

    for (const b of builds) {
      if (b.h < 4) continue;
      const side = Math.random() < 0.5 ? 1 : -1;
      // entrance canopy
      if (Math.random() < 0.6) {
        canopies.push({
          x: b.x + side * (b.w * 0.25),
          y: 3.2,
          z: b.z + b.d / 2 + 0.3,
          w: Math.min(b.w * 0.4, 2.8),
          d: 0.8,
        });
      }
      // door recess
      if (Math.random() < 0.5) {
        doors.push({
          x: b.x + side * (b.w * 0.2),
          y: 1.5,
          z: b.z + b.d / 2 + 0.06,
          w: 1.1,
          h: 2.8,
        });
      }
    }

    if (canopies.length > 0) {
      const cMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, canopies.length);
      canopies.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, it.y, it.z);
        dummy.scale.set(it.w, 1, it.d);
        dummy.updateMatrix();
        cMesh.setMatrixAt(i, dummy.matrix);
      });
      cMesh.castShadow = true;
      cMesh.receiveShadow = true;
      cMesh.instanceMatrix.needsUpdate = true;
      scene.add(cMesh);
    }

    if (doors.length > 0) {
      const dMesh = new THREE.InstancedMesh(doorGeo, doorMat, doors.length);
      doors.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, it.y, it.z);
        dummy.scale.set(it.w, it.h, 1);
        dummy.updateMatrix();
        dMesh.setMatrixAt(i, dummy.matrix);
      });
      dMesh.instanceMatrix.needsUpdate = true;
      scene.add(dMesh);
    }
  }

  /* ---------- street furniture (lampposts, bollards, benches) ---------- */
  {
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x2a3448, roughness: 0.6, metalness: 0.7 });
    const lightMat = new THREE.MeshBasicMaterial({ color: 0xffe8c0 });
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x3a2a1a, roughness: 0.9, metalness: 0.1 });

    const poleGeo = new THREE.CylinderGeometry(0.06, 0.08, 4.2, 8);
    poleGeo.translate(0, 2.1, 0);
    const lampGeo = new THREE.SphereGeometry(0.18, 8, 6);
    const armGeo = new THREE.BoxGeometry(0.8, 0.06, 0.06);
    armGeo.translate(0.4, 0, 0);
    const bollardGeo = new THREE.CylinderGeometry(0.08, 0.1, 0.7, 6);
    bollardGeo.translate(0, 0.35, 0);
    const benchSeatGeo = new THREE.BoxGeometry(1.8, 0.08, 0.5);
    const benchLegGeo = new THREE.BoxGeometry(0.08, 0.4, 0.4);
    benchLegGeo.translate(0, 0.2, 0);

    const poles = [], lamps = [], arms = [], bollards = [], benches = [], benchSeats = [], benchLegs = [];

    // lampposts along the main avenue
    for (let z = 4; z >= -236; z -= 13) {
      for (const xSide of [-3.8, 3.8]) {
        poles.push({ x: xSide, z });
        lamps.push({ x: xSide, y: 4.25, z });
        arms.push({ x: xSide, y: 4.1, z });
        // bollards nearby
        if (Math.random() < 0.5) {
          bollards.push({ x: xSide + (xSide > 0 ? 0.6 : -0.6), z: z + rand(-2, 2) });
        }
      }
    }

    // benches along sidewalks
    for (let z = 2; z >= -234; z -= 22) {
      if (Math.random() < 0.3) continue;
      const xSide = Math.random() < 0.5 ? -5.5 : 5.5;
      const ry = Math.random() < 0.5 ? 0 : Math.PI;
      benches.push({ x: xSide, y: 0, z, ry });
    }

    // instance poles
    if (poles.length > 0) {
      const pMesh = new THREE.InstancedMesh(poleGeo, poleMat, poles.length);
      poles.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, 0, it.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        pMesh.setMatrixAt(i, dummy.matrix);
      });
      pMesh.castShadow = true;
      pMesh.instanceMatrix.needsUpdate = true;
      scene.add(pMesh);
    }

    // instance lamps (glowing)
    if (lamps.length > 0) {
      const lMesh = new THREE.InstancedMesh(lampGeo, lightMat, lamps.length);
      lamps.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, it.y, it.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        lMesh.setMatrixAt(i, dummy.matrix);
      });
      lMesh.instanceMatrix.needsUpdate = true;
      scene.add(lMesh);
    }

    // instance arms
    if (arms.length > 0) {
      const aMesh = new THREE.InstancedMesh(armGeo, poleMat, arms.length);
      arms.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, it.y, it.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        aMesh.setMatrixAt(i, dummy.matrix);
      });
      aMesh.castShadow = true;
      aMesh.instanceMatrix.needsUpdate = true;
      scene.add(aMesh);
    }

    // instance bollards
    if (bollards.length > 0) {
      const bMesh = new THREE.InstancedMesh(bollardGeo, poleMat, bollards.length);
      bollards.forEach((it, i) => {
        dummy.rotation.set(0, 0, 0);
        dummy.position.set(it.x, 0, it.z);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        bMesh.setMatrixAt(i, dummy.matrix);
      });
      bMesh.castShadow = true;
      bMesh.instanceMatrix.needsUpdate = true;
      scene.add(bMesh);
    }

    // benches (individual meshes due to rotation variety)
    for (const bench of benches) {
      const group = new THREE.Group();
      const seat = new THREE.Mesh(benchSeatGeo, benchMat);
      seat.position.y = 0.45;
      seat.castShadow = true;
      group.add(seat);
      for (const lx of [-0.75, 0.75]) {
        const leg = new THREE.Mesh(benchLegGeo, benchMat);
        leg.position.set(lx, 0, 0);
        leg.castShadow = true;
        group.add(leg);
      }
      group.position.set(bench.x, bench.y, bench.z);
      group.rotation.y = bench.ry;
      scene.add(group);
    }
  }

  /* ---------- enhanced roof variety (gabled, pyramidal crowns) ---------- */
  {
    const roofMat2 = new THREE.MeshStandardMaterial({ color: 0x1a2538, roughness: 0.5, metalness: 0.55 });
    const roofItems = [];

    for (const b of builds) {
      if (b.h < 10 || Math.random() > 0.35) continue;
      const topY = b.segs[b.segs.length - 1][0] + b.segs[b.segs.length - 1][1];

      if (Math.random() < 0.5) {
        // pyramidal crown
        roofItems.push({
          type: 'pyramid',
          x: b.x, y: topY, z: b.z,
          w: b.sw * 0.7,
          h: Math.min(2.5, b.h * 0.08),
        });
      } else {
        // gabled roof (two angled planes)
        roofItems.push({
          type: 'gable',
          x: b.x, y: topY, z: b.z,
          w: b.sw,
          d: b.sd,
          h: 1.4,
        });
      }
    }

    // pyramidal roofs as cones
    const pyramids = roofItems.filter(r => r.type === 'pyramid');
    if (pyramids.length > 0) {
      const coneGeo = new THREE.ConeGeometry(0.5, 1, 4);
      const cMesh = new THREE.InstancedMesh(coneGeo, roofMat2, pyramids.length);
      pyramids.forEach((it, i) => {
        dummy.rotation.set(0, Math.PI / 4, 0);
        dummy.position.set(it.x, it.y + it.h / 2, it.z);
        dummy.scale.set(it.w, it.h, it.w);
        dummy.updateMatrix();
        cMesh.setMatrixAt(i, dummy.matrix);
      });
      cMesh.castShadow = true;
      cMesh.instanceMatrix.needsUpdate = true;
      scene.add(cMesh);
    }

    // gabled roofs as rotated boxes
    const gables = roofItems.filter(r => r.type === 'gable');
    if (gables.length > 0) {
      const gableGeo = new THREE.BoxGeometry(1, 0.2, 1);
      const gMesh = new THREE.InstancedMesh(gableGeo, roofMat2, gables.length * 2);
      let gi = 0;
      for (const it of gables) {
        // left slope
        dummy.rotation.set(0.35, 0, 0);
        dummy.position.set(it.x, it.y + it.h * 0.3, it.z - it.d * 0.22);
        dummy.scale.set(it.w, 1, it.d * 0.6);
        dummy.updateMatrix();
        gMesh.setMatrixAt(gi++, dummy.matrix);
        // right slope
        dummy.rotation.set(-0.35, 0, 0);
        dummy.position.set(it.x, it.y + it.h * 0.3, it.z + it.d * 0.22);
        dummy.scale.set(it.w, 1, it.d * 0.6);
        dummy.updateMatrix();
        gMesh.setMatrixAt(gi++, dummy.matrix);
      }
      gMesh.castShadow = true;
      gMesh.instanceMatrix.needsUpdate = true;
      scene.add(gMesh);
    }
  }

  /* ---------- ULTRA: landmarks (photorealistic architectural materials) ---------- */

  const landmarks = LANDMARKS.map((L, i) => {
    const group = new THREE.Group();
    group.position.set(L.pos[0], 0, L.pos[2]);
    const accent = new THREE.Color(ACCENTS[i]);

    // ULTRA: multi-layer architectural material
    const structMat = new THREE.MeshPhysicalMaterial({
      color: 0x151f33,
      roughness: 0.38, metalness: 0.45,
        emissive: accent, emissiveIntensity: 0.015,
      envMapIntensity: 1.3,
      clearcoat: 0.55, clearcoatRoughness: 0.3,
      reflectivity: 0.7,
    });

    // ULTRA: glass curtain wall material for upper tiers
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2845,
      roughness: 0.05, metalness: 0.95,
      clearcoat: 0.9, clearcoatRoughness: 0.08,
      envMapIntensity: 1.6,
      transparent: true, opacity: 0.92,
      reflectivity: 0.98,
    });

    // tiered tower silhouette (enhanced with glass upper tiers)
    const tiers = [
      { w: 6.4, h: L.h * 0.55, mat: structMat },
      { w: 4.4, h: L.h * 0.3, mat: glassMat },
      { w: 2.9, h: L.h * 0.18, mat: structMat },
    ];
    let y = 0;
    for (const t of tiers) {
      const geo = new THREE.BoxGeometry(t.w, t.h, t.w);
      const m = new THREE.Mesh(geo, t.mat);
      m.position.y = y + t.h / 2;
      m.castShadow = true;
      m.receiveShadow = true;
      group.add(m);
      y += t.h;
    }
    // spire
    const spireMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a2538, roughness: 0.3, metalness: 0.7,
      clearcoat: 0.6, clearcoatRoughness: 0.2,
    });
    const spire = new THREE.Mesh(new THREE.BoxGeometry(0.5, L.h * 0.16, 0.5), spireMat);
    spire.position.y = y + L.h * 0.08;
    spire.castShadow = true;
    group.add(spire);

    // aviation light on the spire
    const beacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 12, 10),
      new THREE.MeshBasicMaterial({ color: accent, fog: false })
    );
    beacon.position.y = y + L.h * 0.16 + 1.5;
    group.add(beacon);

    scene.add(group);
    return { i, group, accent, structMat, beaconMat: beacon.material, beacon, intensity: 0.35 };
  });

  /* ============================================================
     TRUE STAGING STYLE STRUCTURES (exhibition pavilions, media walls, brand activations)
     ============================================================ */

  /* ---------- TEXT HELPER: create canvas texture with text ---------- */
  function createTextTexture(text, opts = {}) {
    const {
      width = 1024, height = 256,
      fontSize = 72, fontFamily = 'Arial Black, Impact, sans-serif',
      bgColor = '#0a1420', textColor = '#ffffff',
      glowColor = '#64f5b0', glow = true,
    } = opts;

    const c = document.createElement('canvas');
    c.width = width; c.height = height;
    const g = c.getContext('2d');

    // background
    g.fillStyle = bgColor;
    g.fillRect(0, 0, width, height);

    // text with glow
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = `900 ${fontSize}px ${fontFamily}`;

    if (glow) {
      g.shadowColor = glowColor;
      g.shadowBlur = fontSize * 0.35;
    }
    g.fillStyle = textColor;
    g.fillText(text, width / 2, height / 2);

    // second pass for sharper text
    if (glow) {
      g.shadowBlur = fontSize * 0.18;
      g.fillStyle = textColor;
      g.fillText(text, width / 2, height / 2);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 16;
    return tex;
  }

  /* ---------- EXHIBITION PAVILION (large branded structure) ---------- */
  {
    const pavilionPositions = [
      { x: -18, z: -45, ry: 0.3 },
      { x: 22, z: -85, ry: -0.2 },
      { x: -20, z: -155, ry: 0.15 },
    ];

    for (const pos of pavilionPositions) {
      const group = new THREE.Group();
      group.position.set(pos.x, 0, pos.z);
      group.rotation.y = pos.ry;

      // main structure
      const bodyMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a2845, roughness: 0.3, metalness: 0.7,
        clearcoat: 0.5, clearcoatRoughness: 0.3,
        envMapIntensity: 1.5,
      });
      const body = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 8), bodyMat);
      body.position.y = 4;
      body.castShadow = true; body.receiveShadow = true;
      group.add(body);

      // roof truss
      const trussMat = new THREE.MeshStandardMaterial({ color: 0x2a3448, roughness: 0.5, metalness: 0.6 });
      const truss = new THREE.Mesh(new THREE.BoxGeometry(13, 0.4, 9), trussMat);
      truss.position.y = 8.2;
      truss.castShadow = true;
      group.add(truss);

      // glass front panel
      const glassMat = new THREE.MeshPhysicalMaterial({
        color: 0x1a2845, roughness: 0.05, metalness: 0.95,
        clearcoat: 0.9, transparent: true, opacity: 0.85,
        envMapIntensity: 1.5,
      });
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(11, 7), glassMat);
      glass.position.set(0, 4, 4.01);
      group.add(glass);

      // BRAND TEXT on top (readable)
      const brands = ['TRUE STAGING', 'EXPO 2026', 'CREATIVE HUB', 'BRAND PAVILION'];
      const brand = brands[Math.random() * brands.length | 0];
      const textTex = createTextTexture(brand, {
        width: 1024, height: 256,
        fontSize: 80, bgColor: '#0a1420',
        textColor: '#ffffff', glowColor: '#64f5b0',
      });
      const signMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true });
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(10, 2), signMat);
      sign.position.set(0, 8.5, 4.01);
      group.add(sign);

      // LED strip at base
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x64f5b0 });
      const led = new THREE.Mesh(new THREE.BoxGeometry(12, 0.15, 0.3), ledMat);
      led.position.set(0, 0.07, 4.2);
      group.add(led);

      scene.add(group);
    }
  }

  /* ---------- MEDIA WALL (illuminated backdrop with text) ---------- */
  {
    const wallPositions = [
      { x: 15, z: -30, ry: -0.4, text: 'WARIS.DEV', color: '#64f5b0' },
      { x: -16, z: -70, ry: 0.35, text: 'DIGITAL CITY', color: '#4d8dff' },
      { x: 18, z: -115, ry: -0.25, text: 'WEB DEV', color: '#62dcff' },
      { x: -15, z: -175, ry: 0.2, text: 'FULL STACK', color: '#ffd27a' },
    ];

    for (const wall of wallPositions) {
      const group = new THREE.Group();
      group.position.set(wall.x, 0, wall.z);
      group.rotation.y = wall.ry;

      // back panel
      const panelMat = new THREE.MeshPhysicalMaterial({
        color: 0x0a1420, roughness: 0.2, metalness: 0.8,
        clearcoat: 0.6, clearcoatRoughness: 0.25,
        envMapIntensity: 1.8,
      });
      const panel = new THREE.Mesh(new THREE.BoxGeometry(8, 5, 0.4), panelMat);
      panel.position.y = 2.5;
      panel.castShadow = true; panel.receiveShadow = true;
      group.add(panel);

      // text on panel
      const textTex = createTextTexture(wall.text, {
        width: 1024, height: 512,
        fontSize: 90, bgColor: '#0a1420',
        textColor: '#ffffff', glowColor: wall.color,
      });
      const textMat = new THREE.MeshBasicMaterial({ map: textTex, transparent: true });
      const textMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 4.5), textMat);
      textMesh.position.set(0, 2.5, 0.21);
      group.add(textMesh);

      // illuminated border
      const borderMat = new THREE.MeshBasicMaterial({ color: parseInt(wall.color.replace('#', '0x')) });
      const borderGeo = new THREE.BoxGeometry(8.2, 0.12, 0.15);
      const top = new THREE.Mesh(borderGeo, borderMat);
      top.position.set(0, 5.06, 0.2);
      group.add(top);
      const bottom = new THREE.Mesh(borderGeo, borderMat);
      bottom.position.set(0, -0.06, 0.2);
      group.add(bottom);

      // side accents
      const sideGeo = new THREE.BoxGeometry(0.12, 5.2, 0.15);
      const left = new THREE.Mesh(sideGeo, borderMat);
      left.position.set(-4.06, 2.5, 0.2);
      group.add(left);
      const right = new THREE.Mesh(sideGeo, borderMat);
      right.position.set(4.06, 2.5, 0.2);
      group.add(right);

      scene.add(group);
    }
  }

  /* ---------- TWO-STORY EVENT STRUCTURE (like Yahoo Hotel, Tubi Cabana) ---------- */
  {
    const eventPositions = [
      { x: -25, z: -55, ry: 0.5, name: 'YAHOO HOTEL', accent: '#62dcff' },
      { x: 28, z: -100, ry: -0.3, name: 'TUBI CABANA', accent: '#9b59b6' },
      { x: -22, z: -145, ry: 0.4, name: 'SPORT BEACH', accent: '#e74c3c' },
    ];

    for (const evt of eventPositions) {
      const group = new THREE.Group();
      group.position.set(evt.x, 0, evt.z);
      group.rotation.y = evt.ry;

      const accentColor = parseInt(evt.accent.replace('#', '0x'));

      // ground floor
      const floor1Mat = new THREE.MeshPhysicalMaterial({
        color: 0x1a2538, roughness: 0.4, metalness: 0.6,
        clearcoat: 0.4,
      });
      const floor1 = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 6), floor1Mat);
      floor1.position.y = 2;
      floor1.castShadow = true; floor1.receiveShadow = true;
      group.add(floor1);

      // upper floor
      const floor2Mat = new THREE.MeshPhysicalMaterial({
        color: 0x1e2c44, roughness: 0.35, metalness: 0.65,
        clearcoat: 0.45,
      });
      const floor2 = new THREE.Mesh(new THREE.BoxGeometry(10, 3.5, 6), floor2Mat);
      floor2.position.y = 5.75;
      floor2.castShadow = true;
      group.add(floor2);

      // deck/balcony
      const deckMat = new THREE.MeshStandardMaterial({ color: 0x2a3448, roughness: 0.7, metalness: 0.3 });
      const deck = new THREE.Mesh(new THREE.BoxGeometry(11, 0.2, 7), deckMat);
      deck.position.y = 4;
      deck.receiveShadow = true;
      group.add(deck);

      // glass railing
      const railMat = new THREE.MeshPhysicalMaterial({
        color: 0x2a3a58, roughness: 0.1, metalness: 0.8,
        transparent: true, opacity: 0.6,
      });
      const rail = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1, 0.08), railMat);
      rail.position.set(0, 4.6, 3.05);
      group.add(rail);

      // brand name on top
      const nameTex = createTextTexture(evt.name, {
        width: 1024, height: 256,
        fontSize: 72, bgColor: '#00000000',
        textColor: '#ffffff', glowColor: evt.accent,
        glow: true,
      });
      const nameMat = new THREE.MeshBasicMaterial({ map: nameTex, transparent: true });
      const nameMesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.8), nameMat);
      nameMesh.position.set(0, 7.6, 3.01);
      group.add(nameMesh);

      // accent lighting strip
      const ledMat = new THREE.MeshBasicMaterial({ color: accentColor });
      const led = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.1, 0.15), ledMat);
      led.position.set(0, 4.05, 3.1);
      group.add(led);

      scene.add(group);
    }
  }

  /* ---------- SCENIC BACKDROP (3D elevated structure with text) ---------- */
  {
    const backdropPositions = [
      { x: 20, z: -55, text: 'FRONTEND', subtext: 'DISTRICT', color: '#62dcff' },
      { x: -18, z: -95, text: 'BACKEND', subtext: 'TOWER', color: '#4d8dff' },
      { x: 16, z: -140, text: 'PROJECT', subtext: 'DISTRICT', color: '#ffd27a' },
    ];

    for (const bd of backdropPositions) {
      const group = new THREE.Group();
      group.position.set(bd.x, 0, bd.z);

      // main wall
      const wallMat = new THREE.MeshPhysicalMaterial({
        color: 0x151f33, roughness: 0.35, metalness: 0.5,
        clearcoat: 0.4,
      });
      const wall = new THREE.Mesh(new THREE.BoxGeometry(9, 7, 0.5), wallMat);
      wall.position.y = 3.5;
      wall.castShadow = true; wall.receiveShadow = true;
      group.add(wall);

      // 3D elevations (stepped panels)
      const accentMat = new THREE.MeshPhysicalMaterial({
        color: parseInt(bd.color.replace('#', '0x')),
        roughness: 0.3, metalness: 0.6,
        emissive: new THREE.Color(parseInt(bd.color.replace('#', '0x'))),
        emissiveIntensity: 0.08,
        clearcoat: 0.5,
      });

      const step1 = new THREE.Mesh(new THREE.BoxGeometry(7, 5, 0.3), accentMat);
      step1.position.set(0, 3.5, 0.4);
      group.add(step1);

      const step2 = new THREE.Mesh(new THREE.BoxGeometry(5, 3.5, 0.2), accentMat);
      step2.position.set(0, 3.5, 0.7);
      group.add(step2);

      // main text
      const mainTex = createTextTexture(bd.text, {
        width: 1024, height: 512,
        fontSize: 120, bgColor: '#00000000',
        textColor: '#ffffff', glowColor: bd.color,
      });
      const mainMat = new THREE.MeshBasicMaterial({ map: mainTex, transparent: true });
      const mainText = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), mainMat);
      mainText.position.set(0, 4, 0.91);
      group.add(mainText);

      // subtext
      const subTex = createTextTexture(bd.subtext, {
        width: 1024, height: 256,
        fontSize: 60, bgColor: '#00000000',
        textColor: bd.color, glowColor: bd.color,
        glow: false,
      });
      const subMat = new THREE.MeshBasicMaterial({ map: subTex, transparent: true });
      const subText = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.2), subMat);
      subText.position.set(0, 1.2, 0.91);
      group.add(subText);

      scene.add(group);
    }
  }



  /* ---------- intro & interaction state ---------- */
  let introT = reduced ? 1 : 0;
  let mx = 0, my = 0, smx = 0, smy = 0;
  if (!reduced && !coarsePointer) {
    addEventListener('pointermove', e => {
      mx = (e.clientX / innerWidth) * 2 - 1;
      my = (e.clientY / innerHeight) * 2 - 1;
    }, { passive: true });
  }

  let speedBoost = 1, speedBoostTarget = 1;   // kept for API compatibility (unused)

  city.ok = true;
  city.setActive = i => { activeLandmark = i; };
  city.techGroup = () => {};   // kept for API compatibility (effects removed for realism)
  city.pulse = () => {};       // kept for API compatibility (effects removed for realism)

  const camPos = new THREE.Vector3(0, 5, 16);
  const camLook = new THREE.Vector3(0, 2, 0);
  const posA = new THREE.Vector3(), posB = new THREE.Vector3(), lookA = new THREE.Vector3(), lookB = new THREE.Vector3();

  function updateCamera(t) {
    const p = smoothP;
    let seg = 0;
    while (seg < CAM_KEYS.length - 2 && p >= CAM_KEYS[seg + 1].p) seg++;
    const a = CAM_KEYS[seg], b = CAM_KEYS[seg + 1];
    let k = (p - a.p) / (b.p - a.p);
    k = Math.min(1, Math.max(0, k));
    k = k * k * (3 - 2 * k); // smoothstep
    posA.fromArray(a.pos); posB.fromArray(b.pos);
    lookA.fromArray(a.look); lookB.fromArray(b.look);
    camPos.copy(posA).lerp(posB, k);
    camLook.copy(lookA).lerp(lookB, k);

    if (!reduced) {
      // intro push-in
      const e = 1 - Math.pow(1 - introT, 3);
      camPos.z += (1 - e) * 7;
      camPos.y += (1 - e) * 2;
      // slalom along the avenue: swing the camera toward each building row as it
      // travels, so the camera passes along the sides of the buildings instead of
      // flying dead-centre down the street
      const WAVE = Math.PI * 4.5;    // more frequent side-to-side crossings
      const AMP = 5.2;               // travels right past the buildings' inner faces
      camPos.x += Math.sin(p * WAVE) * AMP;
      camLook.x += Math.sin(p * WAVE) * AMP * 1.4;   // lean the view toward whichever side we're passing
      // idle drift + mouse parallax
      camPos.y += Math.sin(t * 0.0004) * 0.25;
      smx += (mx - smx) * 0.04; smy += (my - smy) * 0.04;
      camPos.x += smx * 0.9;
      camPos.y += -smy * 0.5;
      camLook.x += smx * 1.8;
      camLook.y += -smy * 0.9;
    }
    // keep the camera near the avenue — the road is the clear corridor (|x| <= 5),
// so clamp the slalom + mouse drift so the camera hugs the buildings' sides
// without crossing into the next block; collision below still prevents clipping
const ROAD_HALF = 6.4;
    if (camPos.x > ROAD_HALF) camPos.x = ROAD_HALF;
    else if (camPos.x < -ROAD_HALF) camPos.x = -ROAD_HALF;
    // never let the camera clip inside a building — push out along the axis of least penetration
    for (let iter = 0; iter < 3; iter++) {
      let moved = false;
      for (let i = 0; i < CITY_BOXES.length; i++) {
        const bx = CITY_BOXES[i];
        if (camPos.y > bx.h + 0.6) continue;                        // already flying above it
        const ox = bx.hw - Math.abs(camPos.x - bx.x);
        if (ox <= 0) continue;
        const oz = bx.hd - Math.abs(camPos.z - bx.z);
        if (oz <= 0) continue;
        if (ox <= oz) camPos.x += (camPos.x >= bx.x ? 1 : -1) * ox;
        else camPos.z += (camPos.z >= bx.z ? 1 : -1) * oz;
        moved = true;
      }
      if (!moved) break;
    }
    camera.position.copy(camPos);
    camera.lookAt(camLook);
  }

  /* ---------- resize ---------- */
  function resize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    if (composer) composer.setSize(innerWidth, innerHeight);
  }

  /* ---------- ULTRA: post-processing (photorealistic bloom + tone mapping) ---------- */
  let composer = null;
  if (!reduced && tier() >= 2) {   // bloom off on phones/small screens — post-processing is the biggest mobile fill-rate cost
    try {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      // ULTRA: enhanced bloom for realistic light glow
      composer.addPass(new UnrealBloomPass(
        new THREE.Vector2(innerWidth / 2, innerHeight / 2),
        0.35,   // strength (dimmed for balanced glow)
        0.5,    // radius
        0.75    // threshold (higher = less bloom)
      ));
      composer.addPass(new OutputPass());
      composer.setSize(innerWidth, innerHeight);
    } catch (err) {
      console.warn('Bloom disabled — falling back to direct render.', err);
      composer = null;
    }
  }
  addEventListener('resize', resize, { passive: true });
  resize();

  /* ---------- per-frame tick ---------- */

  /* ---------- night → sunrise: applied as scroll progress advances (fully reversible) ---------- */
  function applyDawn(p: number) {
    dawn.p = p;
    renderer.setClearColor(dawn._clear.copy(dawn.clearNight).lerp(dawn.clearSun, p), 1);
    scene.fog.color.copy(dawn.fogNight).lerp(dawn.fogSun, p);
    hemi.color.copy(dawn.hemiNight).lerp(dawn.hemiSun, p);
    hemi.groundColor.copy(dawn.gndNight).lerp(dawn.gndSun, p);
    hemi.intensity = 1.2 + 0.3 * p;
    key.color.copy(dawn.keyNight).lerp(dawn.keySun, p);
    key.intensity = 1.2 + 0.8 * p;
    fill.color.copy(dawn.fillNight).lerp(dawn.fillSun, p);
    fill.intensity = 0.4 + 0.12 * p;
    warm.intensity = 0.35 + 0.3 * p;
    rim.color.copy(dawn.rimNight).lerp(dawn.rimSun, p);
    rim.intensity = 0.2 + 0.12 * p;
    renderer.toneMappingExposure = 0.95 + 0.12 * p;
    if (dawn.stars) dawn.stars.opacity = 0.5 * (1 - Math.min(1, p / 0.55));
    horizon.material.opacity = 0.85 * (1 - p);
    sunGlow.material.opacity = 0.95 * p;
    sunGlow.position.y = 30 - 18 * p;   // sun settles toward the horizon line
    sunGlow.position.x = 46 * p;        // drifts toward the key-light side
    // reversible env swap: scrolling back up returns to the moonlit night reflections
    const target = p >= 0.55 ? dawn.sunriseEnv : dawn.nightEnv;
    if (scene.environment !== target) scene.environment = target;
  }

  city.tick = (dt, now) => {
    const t = now;

    // night → sunrise: night through the hero, completes as the hero scrolls out
    {
      const target = dawnTarget();
      dawn.p += (target - dawn.p) * Math.min(1, dt * 5);   // light smoothing for jump-scrolls (Lenis already smooths wheel)
      if (Math.abs(target - dawn.p) < 0.002) dawn.p = target;
      if (Math.abs(dawn.p - dawn.lastApplied) > 0.0004) { applyDawn(dawn.p); dawn.lastApplied = dawn.p; }
    }

    // intro
    if (introT < 1) introT = Math.min(1, introT + dt / 2.6);
    scene.fog.density = 0.035 + (1 - introT) * 0.05 - 0.005 * dawn.p;

    // smooth scroll already updated externally
    updateCamera(t);

    // shadow frustum follows the camera along the avenue
    key.position.set(camPos.x + 40, 70 - 54 * dawn.p, camPos.z + 20);   // sun drops low at sunrise → long dawn shadows
    key.target.position.set(camPos.x, 0, camPos.z - 20);
    key.target.updateMatrixWorld();

    // aviation lights stay lit; the active district's light is slightly brighter (static, real)
    landmarks.forEach(L => {
      L.beaconMat.color.copy(L.accent).multiplyScalar(L.i === activeLandmark ? 1.35 : 0.85);
    });

    if (composer) composer.render(); else renderer.render(scene, camera);
  };

  // reduced motion: no animation loop — redraw on scroll/resize so dawn still follows the page (user-driven, not animated)
  if (reduced) {
    const renderStatic = () => {
      applyDawn(dawnTarget());
      updateCamera(0);
      renderer.render(scene, camera);
    };
    renderStatic();
    addEventListener('resize', renderStatic, { passive: true });
    addEventListener('scroll', renderStatic, { passive: true });
  }
}

/* ============================================================
   SMOOTH SCROLL (Lenis)
   ============================================================ */
let lenis = null;
if (!reduced && typeof Lenis !== 'undefined') {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, touchMultiplier: 1.5 });
}

/* ============================================================
   SCROLL PROGRESS
   ============================================================ */
function readScroll() {
  const doc = document.documentElement;
  const max = doc.scrollHeight - innerHeight;
  scrollP = max > 0 ? Math.min(1, Math.max(0, (window.scrollY || 0) / max)) : 0;
}
addEventListener('scroll', readScroll, { passive: true });
addEventListener('resize', readScroll, { passive: true });
readScroll();

/* ============================================================
   REVEALS
   ============================================================ */
const revealEls = [...document.querySelectorAll('[data-reveal]')];
if (reduced) {
  revealEls.forEach(el => el.classList.add('in'));
} else {
  // stagger within each section
  const groups = new Map();
  revealEls.forEach(el => {
    const sec = el.closest('section, footer') || document.body;
    const n = groups.get(sec) || 0;
    el.style.transitionDelay = `${Math.min(n * 80, 420)}ms`;
    groups.set(sec, n + 1);
  });
  const io = new IntersectionObserver(entries => {
    for (const en of entries) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    }
  }, { threshold: 0.18 });
  revealEls.forEach(el => io.observe(el));
}

/* ============================================================
   SECTION OBSERVER → HUD, NAV, CITY LANDMARK
   ============================================================ */
const hudName = document.getElementById('hudName');
const navLinks = [...document.querySelectorAll('.nav-links a')];
const hex = n => '#' + n.toString(16).padStart(6, '0');
let hudSwap = null;

function setDistrict(idx, hudText, sectionId) {
  if (idx !== activeLandmark) {
    activeLandmark = idx;
    city.setActive(idx);
    document.documentElement.style.setProperty('--live', hex(ACCENTS[idx]));
  }
  if (hudText && hudName.textContent !== hudText) {
    clearTimeout(hudSwap);
    hudName.style.opacity = '0';
    hudSwap = setTimeout(() => { hudName.textContent = hudText; hudName.style.opacity = '1'; }, 200);
  }
  navLinks.forEach(a => {
    if (a.getAttribute('href') === '#' + sectionId) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  });
}

const watched = [...document.querySelectorAll('section[data-landmark]')];
const secIO = new IntersectionObserver(entries => {
  for (const en of entries) {
    if (en.isIntersecting) {
      setDistrict(+en.target.dataset.landmark, en.target.dataset.hud, en.target.id);
    }
  }
}, { rootMargin: '-38% 0px -52% 0px', threshold: 0 });
watched.forEach(s => secIO.observe(s));

/* ============================================================
   NAV — scrolled state, anchors, mobile menu
   ============================================================ */
const nav = document.getElementById('nav');
function navState() { nav.classList.toggle('scrolled', (window.scrollY || 0) > 30); }
addEventListener('scroll', navState, { passive: true });
navState();

const menuBtn = document.getElementById('menuBtn');
const mnav = document.getElementById('mnav');
function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  mnav.classList.toggle('open', open);
  mnav.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}
menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
mnav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// smooth anchor scrolling (Lenis-aware)
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = document.querySelector(id);
  if (!target) return;
  e.preventDefault();
  if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
  else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
});

/* ============================================================
   CURSOR GLOW + MAGNETIC BUTTONS (fine pointers only)
   ============================================================ */
if (!reduced && !coarsePointer) {
  const glow = document.querySelector('.cursor-glow');
  let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, shown = false;
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    if (!shown) { shown = true; glow.classList.add('on'); }
  }, { passive: true });

  const magnets = [...document.querySelectorAll('.magnetic')];
  magnets.forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${dx * 0.18}px, ${dy * 0.22}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });

  (function glowLoop() {
    gx += (tx - gx) * 0.12; gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx - 170}px, ${gy - 170}px)`;
    requestAnimationFrame(glowLoop);
  })();
} else {
  document.body.classList.add('no-cursor');
}

/* ============================================================
   TECHNOLOGY CONSTELLATION
   ============================================================ */
const TECH_LINKS = {
  'FRONTEND': [['React', 'Next.js'], ['React', 'TypeScript'], ['JavaScript', 'TypeScript'], ['HTML', 'CSS'], ['CSS', 'Tailwind'], ['Next.js', 'Tailwind'], ['React', 'JavaScript']],
  'BACKEND': [['Node.js', 'Express'], ['Node.js', 'REST APIs']],
  'DATABASE': [['PostgreSQL', 'Prisma'], ['Prisma', 'Supabase'], ['Supabase', 'Neon'], ['PostgreSQL', 'Neon'], ['MySQL', 'Prisma']],
  'CMS': [],
  'DEPLOYMENT': [['Git', 'GitHub'], ['Vercel', 'Git'], ['Vercel', 'GitHub']],
  'OTHER': [['API Integration', 'Automation'], ['AI Integration', 'Automation']],
};
const GROUP_LANDMARK = { FRONTEND: 1, BACKEND: 2, DATABASE: 3, CMS: 3, DEPLOYMENT: 5, OTHER: 4 };
const TECH_BLURB = {
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
const panels = [...document.querySelectorAll('.const-panel')];

function drawConstellations() {
  for (const panel of panels) {
    const svg = panel.querySelector('.const-lines');
    const group = panel.dataset.group;
    const links = TECH_LINKS[group] || [];
    svg.innerHTML = '';
    const pr = panel.getBoundingClientRect();
    for (const [aName, bName] of links) {
      const a = panel.querySelector(`[data-tech="${CSS.escape(aName)}"]`);
      const b = panel.querySelector(`[data-tech="${CSS.escape(bName)}"]`);
      if (!a || !b) continue;
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', ra.left + ra.width / 2 - pr.left);
      line.setAttribute('y1', ra.top + ra.height / 2 - pr.top);
      line.setAttribute('x2', rb.left + rb.width / 2 - pr.left);
      line.setAttribute('y2', rb.top + rb.height / 2 - pr.top);
      line.dataset.a = aName; line.dataset.b = bName;
      svg.appendChild(line);
    }
  }
}
if (!reduced) {
  drawConstellations();
  addEventListener('resize', drawConstellations, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawConstellations);
}

function techActivate(node) {
  const panel = node.closest('.const-panel');
  const name = node.dataset.tech;
  const group = panel.dataset.group;
  const links = TECH_LINKS[group] || [];
  const related = new Set([name]);
  for (const [a, b] of links) {
    if (a === name) related.add(b);
    if (b === name) related.add(a);
  }
  panel.classList.add('lit');
  panel.querySelectorAll('.tnode').forEach(n => {
    if (related.has(n.dataset.tech)) n.classList.add('lit');
  });
  panel.querySelectorAll('.const-lines line').forEach(l => {
    if (l.dataset.a === name || l.dataset.b === name) l.classList.add('lit');
  });
  city.techGroup(GROUP_LANDMARK[group] ?? 0);
  tip.innerHTML = `<b>${name}</b><span>${TECH_BLURB[name] || group}</span>`;
  tip.classList.add('on');
}
function techDeactivate() {
  tip.classList.remove('on');
  document.querySelectorAll('.const-panel.lit').forEach(p => p.classList.remove('lit'));
  document.querySelectorAll('.tnode.lit').forEach(n => n.classList.remove('lit'));
  document.querySelectorAll('.const-lines line.lit').forEach(l => l.classList.remove('lit'));
}
document.querySelectorAll('.tnode').forEach(node => {
  node.addEventListener('pointerenter', () => techActivate(node));
  node.addEventListener('focus', () => techActivate(node));
  node.addEventListener('pointermove', e => {
    tip.style.left = e.clientX + 'px';
    tip.style.top = (e.clientY - 8) + 'px';
  });
  node.addEventListener('focus', e => {
    const r = node.getBoundingClientRect();
    tip.style.left = (r.left + r.width / 2) + 'px';
    tip.style.top = r.top + 'px';
  });
  node.addEventListener('pointerleave', techDeactivate);
  node.addEventListener('blur', techDeactivate);
});

/* ============================================================
   PROJECT HOVER → CITY REACTION
   ============================================================ */
document.querySelectorAll('[data-project]').forEach(card => {
  card.addEventListener('pointerenter', () => { if (!coarsePointer) city.pulse(); });
});

/* subtle parallax inside project visuals */
if (!reduced && !coarsePointer) {
  document.querySelectorAll('[data-project]').forEach(card => {
    const visual = card.querySelector('.pv');
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      visual.style.translate = `${px * 8}px ${py * 6}px`;
    });
    card.addEventListener('pointerleave', () => { visual.style.translate = '0px 0px'; });
  });
}

/* ============================================================
   CONTACT TERMINAL — typed sequence
   ============================================================ */
const termLines = [...document.querySelectorAll('[data-term]')];
if (reduced) {
  termLines.forEach(l => l.classList.add('show'));
} else {
  const termIO = new IntersectionObserver(entries => {
    if (entries.some(en => en.isIntersecting)) {
      termIO.disconnect();
      let delay = 300;
      termLines.forEach((line, i) => {
        setTimeout(() => {
          line.classList.add('show');
          if (i === 0) { // typewriter for the first line
            const text = line.firstChild.textContent;
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
  }, { threshold: 0.4 });
  termIO.observe(document.getElementById('termBody'));
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
document.getElementById('year').textContent = new Date().getFullYear();

/* ============================================================
   MASTER LOOP
   ============================================================ */
let last = performance.now();
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (document.hidden) return;

  if (lenis) lenis.raf(now);

  smoothP += (scrollP - smoothP) * Math.min(1, dt * 3.4);
  if (Math.abs(scrollP - smoothP) < 0.0004) smoothP = scrollP;

  if (city.ok && !reduced) city.tick(dt, now);
}
requestAnimationFrame(loop);

/* remove the intro veil once the first frames are in */
requestAnimationFrame(() => requestAnimationFrame(() => {
  document.querySelector('.veil').classList.add('gone');
}));

    return () => { cancelled = true; };
  }, []);

  return null;
}
