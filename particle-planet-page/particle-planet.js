import * as THREE from "three";

const canvas = document.querySelector("#particle-planet");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCoarse = window.matchMedia("(pointer: coarse)").matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: !isCoarse,
  powerPreference: "high-performance",
});

renderer.setClearColor(0xffffff, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#f3eee5");
scene.fog = new THREE.FogExp2(0xf3eadc, 0.036);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 90);
camera.position.set(0, 0.05, 12);

const clock = new THREE.Clock();
const pointer = new THREE.Vector2();
const targetPointer = new THREE.Vector2();

let seed = 91357;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const particleTexture = createParticleTexture();
const palette = {
  white: new THREE.Color("#fffdf8"),
  pearl: new THREE.Color("#f6ead6"),
  champagne: new THREE.Color("#d9b46d"),
  gold: new THREE.Color("#b8843e"),
};

const world = new THREE.Group();
world.rotation.x = -0.05;
scene.add(world);

const halo = createHalo();
const planet = createParticleSphere(isCoarse ? 5800 : 9200);
const innerMist = createParticleSphere(isCoarse ? 1800 : 3200, {
  radius: 1.62,
  size: 0.052,
  opacity: 0.32,
  jitter: 0.46,
  colorA: "#fffaf0",
  colorB: "#c89a48",
});
const rings = createOrbitSystem();
const farDust = createDustField(isCoarse ? 900 : 1600, 17, 10, 13, 0.022, 0.22);
const nearBokeh = createDustField(isCoarse ? 180 : 320, 23, 10, 8, 0.09, 0.38, true);

world.add(halo, rings, planet.points, innerMist.points, farDust.points, nearBokeh.points);

function createParticleTexture() {
  const size = 96;
  const particleCanvas = document.createElement("canvas");
  const ctx = particleCanvas.getContext("2d");
  particleCanvas.width = size;
  particleCanvas.height = size;

  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.26, "rgba(255,250,236,0.92)");
  gradient.addColorStop(0.62, "rgba(223,181,100,0.34)");
  gradient.addColorStop(1, "rgba(223,181,100,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(particleCanvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createPointsMaterial({
  size,
  opacity,
  color = "#fff8e8",
  depthWrite = false,
  blending = THREE.NormalBlending,
}) {
  return new THREE.PointsMaterial({
    color,
    size,
    map: particleTexture,
    transparent: true,
    opacity,
    blending,
    depthWrite,
    depthTest: true,
    sizeAttenuation: true,
  });
}

function createParticleSphere(
  count,
  {
    radius = 1.95,
    size = 0.064,
    opacity = 0.92,
    jitter = 0.08,
    colorA = "#f4d59a",
    colorB = "#aa7430",
  } = {},
) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const color = new THREE.Color();
  const a = new THREE.Color(colorA);
  const b = new THREE.Color(colorB);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const u = random();
    const v = random();
    const theta = Math.PI * 2 * u;
    const phi = Math.acos(2 * v - 1);
    const surface = radius + (random() - 0.5) * jitter;
    const noise = 0.06 * Math.sin(theta * 7) * Math.cos(phi * 5);
    const r = surface + noise;
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.sin(theta);

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    base[i3] = x;
    base[i3 + 1] = y;
    base[i3 + 2] = z;

    const latitudeGlow = 1 - Math.abs(y / radius);
    color.copy(a).lerp(b, 0.28 + latitudeGlow * 0.54 + random() * 0.18);
    color.lerp(palette.white, random() * 0.12);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
    phases[i] = random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = createPointsMaterial({ size, opacity, color: "#dfb467" });
  material.vertexColors = true;

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.userData = { base, phases, radius, drift: 0.018 + jitter * 0.012 };
  return { points };
}

function createOrbitSystem() {
  const group = new THREE.Group();
  const configs = [
    { radiusX: 4.55, radiusZ: 1.17, count: isCoarse ? 900 : 1450, size: 0.046, opacity: 0.68, tilt: 0.36, spin: 0.045 },
    { radiusX: 3.75, radiusZ: 0.92, count: isCoarse ? 640 : 980, size: 0.04, opacity: 0.54, tilt: -0.68, spin: -0.036 },
    { radiusX: 5.25, radiusZ: 1.38, count: isCoarse ? 740 : 1160, size: 0.037, opacity: 0.42, tilt: 0.92, spin: 0.026 },
  ];

  configs.forEach((config, index) => {
    const positions = new Float32Array(config.count * 3);
    const colors = new Float32Array(config.count * 3);
    const phases = new Float32Array(config.count);
    const color = new THREE.Color();

    for (let i = 0; i < config.count; i++) {
      const i3 = i * 3;
      const angle = (i / config.count) * Math.PI * 2 + random() * 0.026;
      const band = (random() - 0.5) * 0.11;
      const x = Math.cos(angle) * (config.radiusX + band);
      const y = (random() - 0.5) * 0.06;
      const z = Math.sin(angle) * (config.radiusZ + band * 0.5);

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      color.copy(index === 0 ? palette.white : palette.pearl).lerp(palette.champagne, 0.24 + random() * 0.34);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;
      phases[i] = random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = createPointsMaterial({
      size: config.size,
      opacity: config.opacity,
      color: "#d0a15a",
    });
    material.vertexColors = true;

    const ring = new THREE.Points(geometry, material);
    ring.rotation.x = config.tilt;
    ring.rotation.z = -0.18 + index * 0.18;
    ring.frustumCulled = false;
    ring.userData = { spin: config.spin, phases };
    group.add(ring);
  });

  return group;
}

function createDustField(count, spreadX, spreadY, spreadZ, size, opacity, foreground = false) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const x = (random() - 0.5) * spreadX;
    const bottomBias = foreground ? Math.pow(random(), 2.2) * -4.0 : 0;
    const y = (random() - 0.5) * spreadY + bottomBias;
    const z = foreground ? 2.4 + random() * spreadZ : (random() - 0.5) * spreadZ - 0.8;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;
    base[i3] = x;
    base[i3 + 1] = y;
    base[i3 + 2] = z;
    phases[i] = random() * Math.PI * 2;

    color.copy(foreground ? palette.white : palette.pearl).lerp(palette.gold, random() * 0.46);
    colors[i3] = color.r;
    colors[i3 + 1] = color.g;
    colors[i3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = createPointsMaterial({
    size,
    opacity,
    color: foreground ? "#fff7df" : "#c99545",
    depthWrite: false,
    blending: foreground ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  material.vertexColors = true;

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.userData = { base, phases, foreground };
  return { points };
}

function createHalo() {
  const group = new THREE.Group();
  const softHalo = new THREE.Mesh(
    new THREE.SphereGeometry(2.16, 64, 32),
    new THREE.MeshBasicMaterial({
      color: 0xfff3d5,
      transparent: true,
      opacity: 0.115,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const rim = new THREE.Mesh(
    new THREE.SphereGeometry(2.01, 64, 32),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.08,
      wireframe: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  group.add(softHalo, rim);
  return group;
}

function animateSphere(points, time, speed) {
  const position = points.geometry.attributes.position;
  const { base, phases, drift } = points.userData;

  for (let i = 0; i < position.count; i++) {
    const i3 = i * 3;
    const wave = Math.sin(time * speed + phases[i]) * drift;
    position.array[i3] = base[i3] * (1 + wave);
    position.array[i3 + 1] = base[i3 + 1] * (1 + wave * 0.7);
    position.array[i3 + 2] = base[i3 + 2] * (1 + wave);
  }

  position.needsUpdate = true;
}

function animateDust(points, time, speed) {
  const position = points.geometry.attributes.position;
  const { base, phases, foreground } = points.userData;

  for (let i = 0; i < position.count; i++) {
    const i3 = i * 3;
    const phase = phases[i];
    const scale = foreground ? 0.18 : 0.08;
    position.array[i3] = base[i3] + Math.sin(time * speed + phase) * scale;
    position.array[i3 + 1] = base[i3 + 1] + Math.cos(time * speed * 0.84 + phase) * scale * 0.7;
    position.array[i3 + 2] = base[i3 + 2] + Math.sin(time * speed * 0.62 + phase) * scale;
  }

  position.needsUpdate = true;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, isCoarse ? 1.35 : 1.75);

  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = width < 760 ? 14.2 : 12;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

resize();

function tick() {
  const elapsed = clock.getElapsedTime();
  const motion = prefersReducedMotion ? 0.18 : 1;
  const time = elapsed * motion;

  pointer.lerp(targetPointer, 0.035);
  world.rotation.y = pointer.x * 0.045;
  world.rotation.x = -0.05 - pointer.y * 0.026;

  planet.points.rotation.y = time * 0.07;
  planet.points.rotation.x = Math.sin(time * 0.16) * 0.035;
  innerMist.points.rotation.y = -time * 0.045;
  innerMist.points.rotation.z = time * 0.025;
  halo.rotation.y = time * 0.025;
  halo.rotation.x = Math.sin(time * 0.11) * 0.04;

  rings.children.forEach((ring, index) => {
    ring.rotation.y += ring.userData.spin * 0.012 * motion;
    ring.rotation.z += (index % 2 ? -1 : 1) * 0.00045 * motion;
  });

  animateSphere(planet.points, time, 0.9);
  animateSphere(innerMist.points, time, 0.74);
  animateDust(farDust.points, time, 0.5);
  animateDust(nearBokeh.points, time, 0.32);

  farDust.points.rotation.y = time * 0.012;
  nearBokeh.points.rotation.y = -time * 0.009;

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

tick();
