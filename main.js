import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

/* ---------- palette + data (from bsanskriti.com/story) ---------- */
const BG = 0xfdf0ea;
const ERAS = [
  {
    key: 'start', title: 'Mixed media art', years: '2012', pos: -10.5, r: 1.4,
    color: 0xc8e8c9, tags: ['self-expression'], img: null,
    body: 'Where it started. Art as self-expression, before design had a name for it.',
    metric: ''
  },
  {
    key: 'era1', title: 'The Fashion Foundation', years: '2014 - 2019', pos: -5.5, r: 2.4,
    color: 0xe8b2b8, tags: ['art & identity', 'apparel'], img: 'assets/flower.jpg',
    body: 'Five years of fashion design at Pearl Academy (Nottingham Trent). Form and function became inseparable here, and so did the documentation instinct that runs through everything after.',
    metric: '2016 pattern-making process book'
  },
  {
    key: 'era2', title: 'Brand & eCommerce', years: '2019 - 2023', pos: -0.5, r: 2.9,
    color: 0xdb8f96, tags: ['branding', 'eCommerce', 'ux design'], img: 'assets/waffle.png',
    body: 'Four years of brand design, UX and eCommerce at scale for 800k people. The 2023 sales pages failure (visual redesign, no research) built the research-first principle.',
    metric: '+34% CVR · $1.2M revenue · 83+ interviews'
  },
  {
    key: 'era3', title: 'The HCI Pivot', years: '2023 - 2025', pos: 5, r: 2.6,
    color: 0xe75a72, tags: ['edtech', 'healthcare', 'content design'], img: 'assets/orbs.jpg',
    body: 'Grad school at Indiana University plus three concurrent roles. eCommerce instincts got an academic framework: HCI methods, healthcare UX, IA and a writing voice that had been waiting.',
    metric: '1.8M+ patients · +20% content efficiency'
  },
  {
    key: 'era4', title: 'The AI-Builder', years: '2025 - 2026', pos: 10.5, r: 2.4,
    color: 0xeece91, tags: ['AI reasoning', 'conversational AI'], img: null,
    body: 'The convergence era. Design craft, writing, AI skills and research discipline arriving at once. Copalm went from capstone to a registered company; now the agentic B2B AI work at Verde. You are here.',
    metric: '53+ users · 523+ build iterations',
    allImages: ['assets/flower.jpg', 'assets/waffle.png', 'assets/orbs.jpg']
  }
];

/* ---------- renderer / scene / camera ---------- */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 26, 60);

const camera = new THREE.PerspectiveCamera(46, innerWidth / innerHeight, 0.1, 200);
const OVERVIEW = { pos: new THREE.Vector3(0, 5.5, 20), target: new THREE.Vector3(0, 1.5, 0) };
camera.position.copy(OVERVIEW.pos);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.52;
controls.minDistance = 3;
controls.maxDistance = 40;

/* ---------- soft glow sprite texture ---------- */
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,255,255,0.85)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.28)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad; g.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}
const GLOW = glowTexture();

/* ---------- waffle ground (career dataset tiles, blurred) ---------- */
function waffleTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 1024;
  const g = c.getContext('2d');
  g.fillStyle = '#fdf0ea'; g.fillRect(0, 0, 1024, 1024);
  const hues = ['#f9c8d8', '#f7b26b', '#f4e07f', '#cfe97f', '#9fd8f2', '#c9a0f5', '#f2937f', '#8fd0c8'];
  const n = 14, s = 1024 / n;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    g.fillStyle = hues[(x * 7 + y * 3) % hues.length];
    g.globalAlpha = 0.16 + ((x + y) % 4) * 0.05;
    const r = s * 0.32, px = x * s + s * 0.1, py = y * s + s * 0.1, w = s * 0.8, h = s * 0.8;
    g.beginPath(); g.roundRect(px, py, w, h, r); g.fill();
  }
  g.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3);
  return t;
}
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(120, 120),
  new THREE.MeshBasicMaterial({ map: waffleTexture(), transparent: true, opacity: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.6;
scene.add(ground);

/* ---------- the single timeline line (past -> future) ---------- */
const lineMat = new THREE.LineBasicMaterial({ color: 0xb9a6ae, transparent: true, opacity: 0.8 });
const lineGeo = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(-14, 0, 0), new THREE.Vector3(14, 0, 0)
]);
scene.add(new THREE.Line(lineGeo, lineMat));

function yearLabel(text, x, color) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.font = '600 34px "Avenir Next", system-ui, sans-serif';
  g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 128, 32);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, opacity: 0.9 }));
  s.scale.set(2.2, 0.55, 1); s.position.set(x, -0.75, 0);
  scene.add(s);
}

/* ---------- era bubbles ---------- */
const bubbles = [];
for (const era of ERAS) {
  const group = new THREE.Group();
  group.position.set(era.pos, 0, 0);

  const hex = '#' + era.color.toString(16).padStart(6, '0');
  const sphere = new THREE.Mesh(
    new THREE.SphereGeometry(era.r, 48, 48),
    new THREE.MeshPhysicalMaterial({
      color: era.color, transparent: true, opacity: 0.14, roughness: 0.15,
      metalness: 0, clearcoat: 1, clearcoatRoughness: 0.4,
      transmission: 0.6, thickness: 1.5, side: THREE.DoubleSide
    })
  );
  sphere.userData.era = era;
  group.add(sphere);

  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, color: era.color, transparent: true, opacity: 0.5, depthWrite: false }));
  halo.scale.set(era.r * 4.4, era.r * 4.4, 1);
  group.add(halo);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(era.r * 0.16, 24, 24),
    new THREE.MeshBasicMaterial({ color: era.color })
  );
  group.add(core);

  yearLabel(era.years, era.pos, hex);

  /* images scattered inside the bubble: some near the ground, some up high */
  const imgs = era.allImages || (era.img ? [era.img] : []);
  const planes = [];
  imgs.forEach((src, i) => {
    const tex = new THREE.TextureLoader().load(src);
    tex.colorSpace = THREE.SRGBColorSpace;
    const h = 1.5 + i * 0.15, w = h * 1.55;
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.95, side: THREE.DoubleSide })
    );
    const ang = (i / Math.max(imgs.length, 1)) * Math.PI * 1.6;
    m.position.set(
      Math.cos(ang) * era.r * 0.45,
      -era.r * 0.35 + i * (era.r * 0.5),
      Math.sin(ang) * era.r * 0.45
    );
    m.rotation.y = -ang + Math.PI / 2;
    m.userData.float = { base: m.position.y, phase: i * 1.7, amp: 0.12 + i * 0.05 };
    group.add(m); planes.push(m);
  });

  scene.add(group);
  bubbles.push({ era, group, sphere, core, planes });
}

/* ---------- "you are here" marker ---------- */
function markerTexture() {
  const c = document.createElement('canvas'); c.width = 320; c.height = 64;
  const g = c.getContext('2d');
  g.font = '700 30px "Avenir Next", system-ui, sans-serif';
  g.fillStyle = '#3d3439'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('you are here', 160, 32);
  return new THREE.CanvasTexture(c);
}
const marker = new THREE.Sprite(new THREE.SpriteMaterial({ map: markerTexture(), transparent: true }));
marker.scale.set(3.4, 0.68, 1); marker.position.set(10.5, 3.6, 0);
scene.add(marker);

/* ---------- camera journey: enter from the left x axis ---------- */
let active = null;
let tween = null;
function tweenCamera(toPos, toTarget, then) {
  tween = {
    t: 0, dur: 1.4,
    fromPos: camera.position.clone(), toPos: toPos.clone(),
    fromTarget: controls.target.clone(), toTarget: toTarget.clone(), then: then || null
  };
}
function enterBubble(b) {
  active = b;
  const p = b.group.position, r = b.era.r;
  /* walk in from the left along x, facing the bubble */
  tweenCamera(new THREE.Vector3(p.x - r - 0.6, 0.4, 0), new THREE.Vector3(p.x + 0.6, 0.6, 0));
  showPanel(b.era);
}
function exitBubble() {
  if (!active) return;
  active = null;
  tweenCamera(OVERVIEW.pos, OVERVIEW.target);
  hidePanel();
}

/* ---------- HUD ---------- */
const panel = document.getElementById('panel');
function showPanel(era) {
  document.getElementById('p-title').textContent = era.title;
  document.getElementById('p-years').textContent = era.years;
  const tags = document.getElementById('p-tags'); tags.innerHTML = '';
  era.tags.forEach(t => {
    const s = document.createElement('span');
    s.textContent = t; s.style.background = '#' + era.color.toString(16).padStart(6, '0');
    tags.appendChild(s);
  });
  document.getElementById('p-body').textContent = era.body;
  document.getElementById('p-metric').textContent = era.metric;
  panel.classList.add('show');
}
function hidePanel() { panel.classList.remove('show'); }

/* ---------- picking ---------- */
const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', e => { ptr.x = (e.clientX / innerWidth) * 2 - 1; ptr.y = -(e.clientY / innerHeight) * 2 + 1; });
renderer.domElement.addEventListener('pointerup', e => {
  if (active) { exitBubble(); return; }
  ray.setFromCamera(ptr, camera);
  const hits = ray.intersectObjects(bubbles.map(b => b.sphere), false);
  if (hits.length) enterBubble(bubbles.find(b => b.sphere === hits[0].object));
});
addEventListener('keydown', e => { if (e.key === 'Escape') exitBubble(); });

/* ---------- animate ---------- */
const clock = new THREE.Clock();
function tick() {
  requestAnimationFrame(tick);
  const dt = clock.getDelta(), t = clock.elapsedTime;

  if (tween) {
    tween.t = Math.min(1, tween.t + dt / tween.dur);
    const k = 1 - Math.pow(1 - tween.t, 3); /* easeOutCubic */
    camera.position.lerpVectors(tween.fromPos, tween.toPos, k);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, k);
    if (tween.t >= 1) { const then = tween.then; tween = null; if (then) then(); }
  }

  for (const b of bubbles) {
    const inside = active === b;
    b.sphere.material.opacity = inside ? 0.07 : 0.14;
    b.group.children.forEach(ch => {
      if (ch.userData.float) {
        const f = ch.userData.float;
        ch.position.y = f.base + Math.sin(t * 0.8 + f.phase) * f.amp;
        ch.lookAt(active === b ? camera.position : b.group.position);
      }
    });
    b.core.scale.setScalar(1 + Math.sin(t * 1.4 + b.era.pos) * 0.12);
  }
  marker.material.opacity = 0.75 + Math.sin(t * 2) * 0.25;

  controls.update();
  renderer.render(scene, camera);
}
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
