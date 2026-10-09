/**
 * Galaxy profile generator.
 *
 * Renders every SVG panel used by README.md into ./assets.
 * No dependencies: run with Node >= 22.18 (native TypeScript support):
 *
 *   node scripts/generate.ts
 *
 * Edit the `profile` object below, re-run, commit the assets.
 *
 * GitHub shows these files through <img>, so inside them: no JavaScript, no
 * external requests, no hover. Everything is plain SVG + CSS/SMIL animation,
 * and the tech icons are inlined rather than linked.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// ───────────────────────────── content ─────────────────────────────

const C = {
  amber: '#ffc56b',
  pink: '#ff8fd0',
  violet: '#b79bff',
  blue: '#7aa8ff',
  cyan: '#67e8f9',
  mint: '#7ef0c2',
  text: '#eef1ff',
  muted: '#a3acd9',
};

const profile = {
  name: 'Thai Chi Hien',
  role: 'Software Engineer',
  location: 'Ho Chi Minh City, Vietnam',
  coords: '10.82°N 106.63°E',
  tagline: 'designing systems that hold up at scale',

  about: [
    {
      title: 'System design',
      color: C.amber,
      text: 'Designing services that stay reliable, scalable and maintainable as they grow.',
    },
    {
      title: 'Architecture',
      color: C.pink,
      text: 'How to structure services, model data and handle load without things falling apart.',
    },
    {
      title: 'Performance',
      color: C.violet,
      text: 'Performance optimization, clean code and tradeoff-driven decisions over clever hacks.',
    },
    {
      title: 'Always learning',
      color: C.blue,
      text: 'Going deeper on distributed systems, language internals and observability.',
    },
    {
      title: 'AI solutions',
      color: C.cyan,
      text: 'Integrating LLMs and AI agents into backend systems, and building faster with AI tooling.',
    },
    {
      title: "Let's talk",
      color: C.mint,
      text: 'Happy to talk architecture, scaling and the "why" behind design choices anytime.',
    },
  ],

  // One orbit per group, innermost first.
  stack: [
    {
      name: 'Languages',
      color: C.amber,
      items: [
        ['Java', 'java-original'],
        ['TypeScript', 'typescript-original'],
        ['JavaScript', 'javascript-original'],
      ],
    },
    {
      name: 'Databases & Messaging',
      color: C.mint,
      items: [
        ['PostgreSQL', 'postgresql-original'],
        ['MongoDB', 'mongodb-original'],
        ['Redis', 'redis-original'],
        ['RabbitMQ', 'rabbitmq-original'],
      ],
    },
    {
      name: 'Backend & Frameworks',
      color: C.pink,
      items: [
        ['Spring Boot', 'spring-original'],
        ['Node.js', 'nodejs-original'],
        ['NestJS', 'nestjs-original'],
        ['Express', 'express-original'],
        ['GraphQL', 'graphql-plain'],
      ],
    },
    {
      name: 'DevOps & Tools',
      color: C.blue,
      items: [
        ['Docker', 'docker-original'],
        ['GitHub Actions', 'githubactions-original'],
        ['Git', 'git-original'],
        ['Jira', 'jira-original'],
        ['VS Code', 'vscode-original'],
      ],
    },
    {
      name: 'Frontend & Mobile',
      color: C.violet,
      items: [
        ['React', 'react-original'],
        ['Angular', 'angularjs-original'],
        ['HTML5', 'html5-original'],
        ['CSS3', 'css3-original'],
        ['Flutter', 'flutter-original'],
        ['Unity', 'unity-original'],
      ],
    },
  ],

  links: [
    { file: 'link-linkedin', label: 'LinkedIn', sub: '/in/hien-thai-chi', icon: 'linkedin-plain', color: C.blue },
    { file: 'link-email', label: 'Email', sub: 'thaichihien02@gmail.com', icon: 'mail', color: C.pink },
    { file: 'link-github', label: 'GitHub', sub: '@thaichihien', icon: 'github-original', color: C.violet },
  ],
};

// ───────────────────────────── helpers ─────────────────────────────

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'assets');
const ICONS = join(ROOT, 'scripts', 'icons');
const W = 880;

/** Deterministic PRNG so regenerating does not reshuffle the sky. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const n = (v: number): string => String(Math.round(v * 10) / 10);
const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const pick = <T>(r: () => number, xs: T[]): T => xs[Math.floor(r() * xs.length)];

function wrap(text: string, max: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    if (line && (line + ' ' + word).length > max) {
      lines.push(line);
      line = word;
    } else {
      line = line ? line + ' ' + word : word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const CSS = `
.sans{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif}
.mono{font-family:ui-monospace,SFMono-Regular,'SF Mono',Menlo,Consolas,'Liberation Mono',monospace}
@keyframes tw{0%,100%{opacity:.2}50%{opacity:1}}
.t1{animation:tw 3.1s ease-in-out infinite}
.t2{animation:tw 4.3s ease-in-out -1.2s infinite}
.t3{animation:tw 5.7s ease-in-out -2.6s infinite}
.t4{animation:tw 7.3s ease-in-out -.7s infinite}
@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}
.p1{animation:pulse 3.6s ease-in-out infinite}
.p2{animation:pulse 4.8s ease-in-out -1.5s infinite}
.p3{animation:pulse 6s ease-in-out -3s infinite}
@keyframes flow{to{stroke-dashoffset:-48}}
.flow{animation:flow 3s linear infinite}
@keyframes shoot{0%{transform:translateX(0);opacity:0}1.5%{opacity:1}7%{transform:translateX(480px);opacity:0}100%{transform:translateX(480px);opacity:0}}
.s1{animation:shoot 9s linear infinite}
.s2{animation:shoot 13s linear -4s infinite}
.s3{animation:shoot 17s linear -9s infinite}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`.trim();

type Nebula = [x: number, y: number, rx: number, ry: number, color: string, opacity: number];

/** Star field + soft nebula clouds. */
function sky(w: number, h: number, seed: number, stars: number, nebulae: Nebula[] = []) {
  const r = rng(seed);
  let defs = '';
  let body = '';
  nebulae.forEach(([x, y, rx, ry, color, op], i) => {
    defs += `<radialGradient id="nb${i}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset=".55" stop-color="${color}" stop-opacity="${n(op * 0.35 * 10) / 10}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`;
    body += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#nb${i})"/>`;
  });
  const tints = ['#ffffff', '#ffffff', '#dfe6ff', '#cfe9ff', '#ffe9d1', '#e9d5ff'];
  for (let i = 0; i < stars; i++) {
    const big = r() < 0.12;
    const rad = big ? 1 + r() * 0.7 : 0.35 + r() * 0.6;
    const cls = r() < 0.4 ? ` class="t${1 + Math.floor(r() * 4)}"` : '';
    body += `<circle cx="${n(r() * w)}" cy="${n(r() * h)}" r="${n(rad)}" fill="${pick(r, tints)}" opacity="${n(0.35 + r() * 0.6)}"${cls}/>`;
  }
  return { defs, body };
}

/** Wraps a panel in the shared frame: rounded dark card that reads well on light and dark GitHub themes. */
function frame(w: number, h: number, label: string, defs: string, body: string, radius = 18): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">` +
    `<title>${esc(label)}</title><style>${CSS}</style>` +
    `<defs><clipPath id="clip"><rect width="${w}" height="${h}" rx="${radius}"/></clipPath>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#080a1c"/><stop offset=".5" stop-color="#0b0e29"/><stop offset="1" stop-color="#05060f"/></linearGradient>` +
    `<linearGradient id="trail" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
    `${defs}</defs>` +
    `<g clip-path="url(#clip)"><rect width="${w}" height="${h}" fill="url(#bg)"/>${body}</g>` +
    `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${radius - 0.5}" fill="none" stroke="#8b93ff" stroke-opacity=".25"/></svg>`
  );
}

function shootingStar(x: number, y: number, cls: string, len = 110): string {
  return `<g transform="rotate(24 ${x} ${y})"><rect class="${cls}" x="${x}" y="${y}" width="${len}" height="1.6" rx=".8" fill="url(#trail)" opacity="0"/></g>`;
}

function sparkle(x: number, y: number, color: string, size = 9, cls = 'p1'): string {
  const s = size;
  const k = n(s * 0.14);
  return (
    `<g transform="translate(${x} ${y})"><circle r="${n(s * 1.7)}" fill="${color}" opacity=".16" class="${cls}"/>` +
    `<path d="M0,${-s}Q${k},-${k} ${s},0Q${k},${k} 0,${s}Q-${k},${k} ${-s},0Q-${k},-${k} 0,${-s}Z" fill="${color}"/>` +
    `<circle r="${n(s * 0.22)}" fill="#fff"/></g>`
  );
}

function heading(label: string, title: string, y = 50): string {
  return (
    `<text x="56" y="${y}" class="mono" font-size="11.5" letter-spacing="3" fill="${C.cyan}">${esc(label)}</text>` +
    `<text x="56" y="${y + 34}" class="sans" font-size="27" font-weight="700" fill="${C.text}">${esc(title)}</text>`
  );
}

let iconSeq = 0;
/** Inlines an icon centred on the origin. Ids are prefixed so icons cannot clash inside one panel. */
function icon(name: string, size: number): string {
  if (name === 'mail') {
    const k = size / 20;
    return `<g transform="scale(${n(k)})"><rect x="-9.5" y="-7" width="19" height="14" rx="2.4" fill="#ea4335"/><path d="M-8.5,-5.2L0,1.6L8.5,-5.2" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
  }
  const src = readFileSync(join(ICONS, `${name}.svg`), 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(src)?.[1] ?? '0 0 128 128';
  const open = src.indexOf('<svg');
  let inner = src.slice(src.indexOf('>', open) + 1, src.lastIndexOf('</svg>'));
  const p = `i${iconSeq++}-`;
  inner = inner
    .replace(/\sid="([^"]+)"/g, (_m, id) => ` id="${p}${id}"`)
    .replace(/url\(#([^)]+)\)/g, (_m, id) => `url(#${p}${id})`)
    .replace(/href="#([^"]+)"/g, (_m, id) => `href="#${p}${id}"`);
  return `<svg x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}" viewBox="${viewBox}">${inner}</svg>`;
}

// ───────────────────────────── panels ─────────────────────────────

function header(): string {
  const H = 360;
  const { defs: skyDefs, body: skyBody } = sky(W, H, 7, 190, [
    [650, 180, 360, 240, '#7c3aed', 0.42],
    [830, 50, 240, 170, '#22d3ee', 0.2],
    [470, 320, 280, 170, '#e879f9', 0.17],
    [110, 40, 280, 190, '#3b82f6', 0.16],
  ]);

  // Spiral galaxy: two logarithmic-ish arms plus diffuse dust, drawn flat then tilted.
  const r = rng(42);
  const R = 205;
  let dots = '';
  const dot = (t: number, ang: number, dim: number) => {
    const rad = 10 + t * R;
    const x = Math.cos(ang) * rad + (r() - 0.5) * 6;
    const y = Math.sin(ang) * rad + (r() - 0.5) * 6;
    const color =
      t < 0.2
        ? '#fff3d6'
        : t < 0.48
          ? pick(r, ['#ffc4f0', '#f0a6ff', '#ffd9a8'])
          : t < 0.78
            ? pick(r, ['#b79bff', '#8fb4ff', '#e6a8ff'])
            : pick(r, ['#7fd6ff', '#8fb4ff', '#6f8cff']);
    const size = (0.7 + r() * 1.5) * (1 - t * 0.45);
    dots += `<circle cx="${n(x)}" cy="${n(y)}" r="${n(size)}" fill="${color}" opacity="${n((0.95 - t * 0.5) * dim)}"/>`;
  };
  for (let i = 0; i < 980; i++) {
    const t = Math.pow(r(), 0.75);
    const jitter = (r() + r() + r() - 1.5) * 0.6 * (0.35 + t * 0.65);
    dot(t, (i % 2) * Math.PI + t * Math.PI * 2.15 + jitter, 1);
  }
  for (let i = 0; i < 170; i++) dot(Math.pow(r(), 0.6), r() * Math.PI * 2, 0.4);

  const galaxy =
    `<g transform="translate(648 182) rotate(-20) scale(1 .5)">` +
    `<circle r="255" fill="url(#halo)"/>` +
    `<g>${dots}<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="150s" repeatCount="indefinite"/></g>` +
    `<circle r="54" fill="url(#core)" class="p3"/><circle r="24" fill="url(#core)"/></g>`;

  // Typed tagline: a clip rect grows one character at a time.
  const line = `> ${profile.tagline}`;
  const fs = 14;
  const cw = fs * 0.6;
  const steps = Array.from({ length: line.length + 1 }, (_, i) => n(i * cw));
  const times = steps.map((_, i) => (i / line.length) * 0.32);
  const widths = [...steps, '0'].join(';');
  const keyTimes = [...times, 0.95].map((t) => t.toFixed(4)).join(';');
  const ty = 296;
  const typed =
    `<clipPath id="type"><rect x="56" y="${ty - 16}" width="0" height="24"><animate attributeName="width" calcMode="discrete" dur="11s" repeatCount="indefinite" values="${widths}" keyTimes="${keyTimes}"/></rect></clipPath>` +
    `<text x="56" y="${ty}" class="mono" font-size="${fs}" fill="${C.text}" textLength="${n(line.length * cw)}" lengthAdjust="spacing" clip-path="url(#type)" xml:space="preserve"><tspan fill="${C.cyan}">&gt;</tspan>${esc(line.slice(1))}</text>` +
    `<rect x="56" y="${ty - 13}" width="8" height="17" fill="${C.cyan}" class="p1"><animate attributeName="x" calcMode="discrete" dur="11s" repeatCount="indefinite" values="${[...steps.map((s) => n(56 + Number(s) + 3)), '59'].join(';')}" keyTimes="${keyTimes}"/></rect>`;

  const defs =
    skyDefs +
    `<radialGradient id="core"><stop offset="0" stop-color="#fffdf2"/><stop offset=".3" stop-color="#ffe2a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffb86b" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="halo"><stop offset="0" stop-color="#c4a6ff" stop-opacity=".4"/><stop offset=".5" stop-color="#7c5cff" stop-opacity=".14"/><stop offset="1" stop-color="#7c5cff" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="title" x1="0" x2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#d6c9ff"/><stop offset="1" stop-color="#8fdcff"/></linearGradient>` +
    `<linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#070818" stop-opacity=".75"/><stop offset="1" stop-color="#070818" stop-opacity="0"/></linearGradient>`;

  const body =
    skyBody +
    galaxy +
    `<rect width="520" height="${H}" fill="url(#fade)"/>` +
    shootingStar(330, 24, 's1') +
    shootingStar(60, 150, 's2', 90) +
    shootingStar(540, -10, 's3', 130) +
    `<circle cx="61" cy="104" r="4" fill="${C.cyan}" class="p1"/><circle cx="61" cy="104" r="8" fill="none" stroke="${C.cyan}" stroke-opacity=".4" class="p2"/>` +
    `<text x="78" y="108" class="mono" font-size="12" letter-spacing="3.2" fill="${C.cyan}">WELCOME TO MY UNIVERSE</text>` +
    `<text x="54" y="176" class="sans" font-size="56" font-weight="800" letter-spacing="-1" fill="url(#title)">${esc(profile.name)}</text>` +
    `<text x="56" y="216" class="sans" font-size="20" font-weight="500" fill="#dfe4ff">${esc(profile.role)}</text>` +
    `<text x="56" y="243" class="mono" font-size="12.5" fill="${C.muted}">${esc(profile.location)}  ·  ${esc(profile.coords)}</text>` +
    typed;

  return frame(W, H, `${profile.name}, ${profile.role} based in ${profile.location}`, defs, body);
}

function about(): string {
  const rowsY = [146, 242, 338];
  const H = 420;
  const { defs: skyDefs, body: skyBody } = sky(W, H, 21, 120, [
    [780, 60, 300, 200, '#7c3aed', 0.3],
    [120, 400, 300, 180, '#22d3ee', 0.13],
  ]);

  const cols = [
    { text: 98, nodes: [66, 50, 72] },
    { text: 512, nodes: [480, 464, 486] },
  ];
  let body = skyBody + heading('MISSION LOG // 01', 'About me');

  // A ringed planet in the corner.
  body +=
    `<g transform="translate(792 74) rotate(-18)"><ellipse rx="58" ry="13" fill="none" stroke="#c9b8ff" stroke-opacity=".35" stroke-width="5"/>` +
    `<circle r="30" fill="url(#planet)"/><path d="M-58,0A58,13 0 0 0 58,0" fill="none" stroke="#e6dcff" stroke-opacity=".75" stroke-width="5"/></g>`;

  cols.forEach((col, c) => {
    const pts = rowsY.map((y, i) => `${col.nodes[i]},${y - 6}`);
    body += `<polyline points="${pts.join(' ')}" fill="none" stroke="#9aa4ff" stroke-opacity=".55" stroke-width="1.2" stroke-dasharray="2 6" stroke-linecap="round" class="flow"/>`;
    rowsY.forEach((y, i) => {
      const item = profile.about[c * 3 + i];
      body += sparkle(col.nodes[i], y - 6, item.color, 9, `p${1 + ((c + i) % 3)}`);
      body += `<text x="${col.text}" y="${y}" class="sans" font-size="16.5" font-weight="650" fill="${C.text}">${esc(item.title)}</text>`;
      wrap(item.text, 44).forEach((ln, k) => {
        body += `<text x="${col.text}" y="${y + 23 + k * 18}" class="mono" font-size="12.3" fill="${C.muted}">${esc(ln)}</text>`;
      });
    });
  });

  const defs =
    skyDefs +
    `<radialGradient id="planet" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e3d4ff"/><stop offset=".5" stop-color="#8f6bff"/><stop offset="1" stop-color="#2a1a6b"/></radialGradient>`;
  const label = 'About me: ' + profile.about.map((a) => `${a.title}. ${a.text}`).join(' ');
  return frame(W, H, label, defs, body);
}

function stack(): string {
  const H = 614;
  const cx = 440;
  const cy = 276;
  const TILT = 0.56;
  const { defs: skyDefs, body: skyBody } = sky(W, H, 33, 170, [
    [cx, cy, 420, 260, '#5b3fd6', 0.3],
    [90, 560, 280, 160, '#e879f9', 0.12],
    [820, 40, 240, 160, '#22d3ee', 0.14],
  ]);

  let orbits = '';
  let planets = '';
  let legend = '';
  const colW = (W - 112) / profile.stack.length;

  profile.stack.forEach((group, g) => {
    const rx = 100 + g * 70;
    const ry = rx * TILT;
    const dur = 38 + g * 17;
    const path = `M${cx + rx},${cy}A${rx},${n(ry)} 0 1 1 ${cx - rx},${cy}A${rx},${n(ry)} 0 1 1 ${cx + rx},${cy}`;
    orbits += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${n(ry)}" fill="none" stroke="${group.color}" stroke-opacity=".38" stroke-width="1" stroke-dasharray="1 5" stroke-linecap="round"/>`;

    group.items.forEach(([name, file], k) => {
      const begin = -((k + g * 0.37) / group.items.length) * dur;
      planets +=
        `<g><animateMotion dur="${dur}s" begin="${n(begin)}s" repeatCount="indefinite" path="${path}"/>` +
        `<title>${esc(name)}</title><circle r="23" fill="${group.color}" opacity=".16"/>` +
        `<circle r="18.5" fill="#f3f5ff" stroke="${group.color}" stroke-width="1.6"/>${icon(file, 23)}</g>`;
    });

    const lx = 56 + g * colW;
    legend += `<circle cx="${n(lx + 4)}" cy="542" r="4" fill="${group.color}"/><text x="${n(lx + 15)}" y="546" class="sans" font-size="10.8" font-weight="650" fill="${C.text}"${group.name.length >= 20 ? ` textLength="${n(colW - 26)}" lengthAdjust="spacingAndGlyphs"` : ''}>${esc(group.name)}</text>`;
    let line = '';
    const lines: string[] = [];
    for (const [name] of group.items) {
      const next = line ? `${line} · ${name}` : name;
      if (line && next.length > 22) {
        lines.push(line);
        line = name;
      } else line = next;
    }
    lines.push(line);
    lines.forEach((ln, i) => {
      legend += `<text x="${n(lx)}" y="${565 + i * 15}" class="mono" font-size="10.4" fill="${C.muted}">${esc(ln)}</text>`;
    });
  });

  const sun =
    `<circle cx="${cx}" cy="${cy}" r="74" fill="url(#corona)" class="p3"/><circle cx="${cx}" cy="${cy}" r="29" fill="url(#sun)"/>` +
    `<text x="${cx}" y="${cy + 5}" text-anchor="middle" class="mono" font-size="14" font-weight="700" fill="#7a3b00">{ }</text>`;

  const defs =
    skyDefs +
    `<radialGradient id="sun" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fffbe6"/><stop offset=".55" stop-color="#ffc56b"/><stop offset="1" stop-color="#ff8a3d"/></radialGradient>` +
    `<radialGradient id="corona"><stop offset="0" stop-color="#ffb347" stop-opacity=".55"/><stop offset=".45" stop-color="#ff8a3d" stop-opacity=".16"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>`;

  const body =
    skyBody +
    heading('ORBITAL VIEW // 02', 'Tech stack') +
    shootingStar(520, 10, 's2', 100) +
    orbits +
    sun +
    planets +
    `<line x1="56" y1="518" x2="${W - 56}" y2="518" stroke="#8b93ff" stroke-opacity=".18"/>` +
    legend;

  const label =
    'Tech stack: ' + profile.stack.map((s) => `${s.name}: ${s.items.map((i) => i[0]).join(', ')}`).join('. ');
  return frame(W, H, label, defs, body);
}

/** Thin title bar for README sections whose content cannot live inside one image (links, external cards). */
function sectionBar(label: string, title: string, seed: number): string {
  const H = 76;
  const { defs, body: skyBody } = sky(W, H, seed, 46, [[760, 38, 260, 90, '#7c3aed', 0.3]]);
  const body =
    skyBody +
    `<text x="56" y="30" class="mono" font-size="11.5" letter-spacing="3" fill="${C.cyan}">${esc(label)}</text>` +
    `<text x="56" y="57" class="sans" font-size="22" font-weight="700" fill="${C.text}">${esc(title)}</text>` +
    `<line x1="420" y1="40" x2="790" y2="40" stroke="#9aa4ff" stroke-opacity=".6" stroke-width="1.2" stroke-dasharray="2 6" stroke-linecap="round" class="flow"/>` +
    sparkle(812, 40, C.amber, 8);
  return frame(W, H, title, defs, body, 16);
}

function linkButton(link: (typeof profile.links)[number], seed: number): string {
  const w = 252;
  const h = 68;
  const { defs: skyDefs, body: skyBody } = sky(w, h, seed, 22, [[40, 34, 110, 60, link.color, 0.28]]);
  const body =
    skyBody +
    `<g transform="translate(38 34)"><circle r="26" fill="none" stroke="${link.color}" stroke-opacity=".4" stroke-dasharray="1 4" stroke-linecap="round"/>` +
    `<circle r="18.5" fill="#f3f5ff" stroke="${link.color}" stroke-width="1.6"/>${icon(link.icon, 22)}` +
    `<circle r="2.6" fill="${link.color}"><animateMotion dur="6s" repeatCount="indefinite" path="M26,0A26,26 0 1 1 -26,0A26,26 0 1 1 26,0"/></circle></g>` +
    `<text x="76" y="31" class="sans" font-size="16" font-weight="700" fill="${C.text}">${esc(link.label)}</text>` +
    `<text x="76" y="49" class="mono" font-size="10.6" fill="${C.muted}">${esc(link.sub)}</text>`;
  return frame(w, h, `${link.label}: ${link.sub}`, skyDefs, body, 34);
}

function footer(): string {
  const H = 132;
  const { defs: skyDefs, body: skyBody } = sky(W, H, 77, 90, [[440, 150, 460, 120, '#7c3aed', 0.4]]);
  const defs =
    skyDefs +
    `<linearGradient id="land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a2a8f"/><stop offset=".12" stop-color="#17123f"/><stop offset="1" stop-color="#05060f"/></linearGradient>`;
  const body =
    skyBody +
    shootingStar(600, -6, 's1', 100) +
    `<circle cx="440" cy="1196" r="1104" fill="#8f7bff" opacity=".18"/>` +
    `<circle cx="440" cy="1198" r="1100" fill="url(#land)" stroke="#b9a8ff" stroke-opacity=".8" stroke-width="1.2"/>` +
    `<text x="440" y="46" text-anchor="middle" class="mono" font-size="12" letter-spacing="4" fill="${C.cyan}">END OF TRANSMISSION</text>` +
    `<text x="440" y="70" text-anchor="middle" class="sans" font-size="14" fill="${C.muted}">Thanks for stopping by. Safe travels.</text>`;
  return frame(W, H, 'End of transmission. Thanks for stopping by.', defs, body);
}

// ───────────────────────────── output ─────────────────────────────

mkdirSync(OUT, { recursive: true });
const files: Record<string, string> = {
  header: header(),
  about: about(),
  stack: stack(),
  'bar-connect': sectionBar('OPEN A CHANNEL // 03', 'Connect with me', 51),
  'bar-jokes': sectionBar('INCOMING SIGNAL // 04', 'Some jokes', 63),
  footer: footer(),
};
profile.links.forEach((link, i) => (files[link.file] = linkButton(link, 90 + i)));

for (const [name, svg] of Object.entries(files)) {
  writeFileSync(join(OUT, `${name}.svg`), svg);
  console.log(`${name}.svg`.padEnd(22), `${(svg.length / 1024).toFixed(1)} KB`);
}
