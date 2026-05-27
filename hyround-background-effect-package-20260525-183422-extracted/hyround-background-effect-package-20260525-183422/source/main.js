import * as THREE from "three";

const canvas = document.querySelector("#scene");

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true,
  powerPreference: "high-performance",
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(0xf3f0ea, 0);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf0ebe2, 0.034);

const camera = new THREE.PerspectiveCamera(46, 1, 0.1, 90);
camera.position.set(0, 0.12, 12.5);

const pointer = new THREE.Vector2();
const targetPointer = new THREE.Vector2();
const clock = new THREE.Clock();

let seed = 1407;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};

const palette = {
  ice: new THREE.Color("#fffdf8"),
  pearl: new THREE.Color("#f7efe1"),
  gold: new THREE.Color("#d5ad62"),
  amber: new THREE.Color("#b88942"),
  bronze: new THREE.Color("#8f6a38"),
  prismBlue: new THREE.Color("#d8f8ff"),
  prismPink: new THREE.Color("#ffe0f4"),
  prismLilac: new THREE.Color("#eee4ff"),
};

const world = new THREE.Group();
scene.add(world);

const ambientLight = new THREE.HemisphereLight(0xffffff, 0xf0dfbd, 4.2);
const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
keyLight.position.set(-4.5, 5.5, 6.5);
const prismLight = new THREE.DirectionalLight(0xf0c873, 1.55);
prismLight.position.set(4, -2, 5);
scene.add(ambientLight, keyLight, prismLight);

const tempObject = new THREE.Object3D();

const farField = createFlowField({
  count: 3600,
  spreadX: 26,
  spreadY: 14,
  spreadZ: 17,
  sizeRange: [0.55, 2.4],
  alphaRange: [0.08, 0.34],
  speedRange: [0.08, 0.28],
});

const midField = createFlowField({
  count: 1700,
  spreadX: 18,
  spreadY: 10,
  spreadZ: 10,
  sizeRange: [0.8, 3.6],
  alphaRange: [0.12, 0.52],
  speedRange: [0.18, 0.52],
});

const molecule = createMoleculeNetwork();
const rings = createSignalRings();
const glow = createHydrogenGlow();

world.add(farField.mesh, midField.mesh, molecule.group, rings, glow);
scene.add(createBackgroundVeil());

function createTriangleGeometry() {
  const geometry = new THREE.TetrahedronGeometry(1, 0);
  geometry.rotateX(Math.PI * 0.18);
  geometry.scale(1, 0.84, 0.46);
  return geometry;
}

function createLaserGlassMaterial(opacity = 0.52) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
      uOpacity: { value: opacity },
    },
    vertexShader: `
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec4 localPosition = vec4(position, 1.0);
        vec3 localNormal = normal;

        #ifdef USE_INSTANCING
          localPosition = instanceMatrix * localPosition;
          localNormal = mat3(instanceMatrix) * localNormal;
        #endif

        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(1.0, 0.96, 0.86);
        #endif

        vec4 worldPosition = modelMatrix * localPosition;
        vWorldPosition = worldPosition.xyz;
        vNormal = normalize(normalMatrix * localNormal);
        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float uOpacity;
      varying vec3 vColor;
      varying vec3 vNormal;
      varying vec3 vWorldPosition;

      void main() {
        vec3 normalDirection = normalize(vNormal);
        vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - abs(dot(normalDirection, viewDirection)), 1.55);
        float band = sin((normalDirection.x * 3.1 + normalDirection.y * 4.7 + vWorldPosition.x * 0.35) * 5.4);

        vec3 rose = vec3(1.0, 0.78, 0.92);
        vec3 blue = vec3(0.70, 0.9, 1.0);
        vec3 gold = vec3(1.0, 0.82, 0.42);
        vec3 prism = mix(rose, blue, smoothstep(-0.55, 0.65, band));
        prism = mix(prism, gold, smoothstep(0.2, 1.0, sin(band + normalDirection.z * 4.0)) * 0.45);

        vec3 glass = mix(vColor, vec3(1.0), 0.5);
        vec3 color = mix(glass, prism, 0.28 + fresnel * 0.62);
        color += vec3(1.0, 0.88, 0.58) * fresnel * 0.22;

        float alpha = uOpacity * (0.26 + fresnel * 0.7);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

function createFlowField({ count, spreadX, spreadY, spreadZ, sizeRange, alphaRange, speedRange }) {
  const base = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const alphas = new Float32Array(count);
  const speeds = new Float32Array(count);
  const phases = new Float32Array(count);
  const rotations = new Float32Array(count);
  const spin = new Float32Array(count * 3);
  const geometry = createTriangleGeometry();
  const mesh = new THREE.InstancedMesh(geometry, createLaserGlassMaterial(0.64), count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const color = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    const ribbonBias = random() < 0.44;
    const x = (random() - 0.5) * spreadX;
    const y = ribbonBias
      ? Math.sin(x * 0.72 + random() * 4) * 1.9 + (random() - 0.5) * 2.1
      : (random() - 0.5) * spreadY;
    const z = (random() - 0.5) * spreadZ;

    base[i3] = x;
    base[i3 + 1] = y;
    base[i3 + 2] = z;
    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const colorMix = Math.pow(random(), 0.9) * 0.48;
    color.copy(palette.pearl).lerp(palette.gold, colorMix);
    if (random() > 0.82) color.lerp(palette.amber, 0.08 + random() * 0.12);
    color.lerp(palette.ice, 0.18 + random() * 0.22);
    if (random() > 0.72) {
      const prismColor = random() > 0.66 ? palette.prismPink : random() > 0.5 ? palette.prismBlue : palette.prismLilac;
      color.lerp(prismColor, 0.38 + random() * 0.22);
    }
    mesh.setColorAt(i, color);

    sizes[i] = THREE.MathUtils.lerp(sizeRange[0], sizeRange[1], Math.pow(random(), 2.2));
    alphas[i] = THREE.MathUtils.lerp(alphaRange[0], alphaRange[1], random());
    speeds[i] = THREE.MathUtils.lerp(speedRange[0], speedRange[1], random());
    phases[i] = random() * Math.PI * 2;
    rotations[i] = random() * Math.PI * 2;
    spin[i3] = THREE.MathUtils.lerp(-0.2, 0.2, random());
    spin[i3 + 1] = THREE.MathUtils.lerp(-0.28, 0.28, random());
    spin[i3 + 2] = THREE.MathUtils.lerp(-0.18, 0.18, random());
  }

  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.userData = { base, positions, sizes, alphas, speeds, phases, rotations, spin, spreadX };
  updateFlowField({ mesh }, 0, 0);
  return { mesh };
}

function createMoleculeNetwork() {
  const group = new THREE.Group();
  const nodes = [
    [-3.35, -0.35, 0.45],
    [-2.32, 0.76, -0.14],
    [-1.08, 0.12, 0.62],
    [0.08, 0.94, -0.36],
    [1.28, 0.2, 0.5],
    [2.34, -0.82, -0.12],
    [3.38, 0.08, 0.42],
    [-0.1, -1.05, 0.3],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z));

  const nodeShards = new THREE.InstancedMesh(
    createTriangleGeometry(),
    createLaserGlassMaterial(0.78),
    nodes.length,
  );
  nodeShards.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  nodeShards.frustumCulled = false;
  const nodeObject = new THREE.Object3D();

  nodes.forEach((node, index) => {
    const color = index % 3 === 0 ? palette.gold : palette.ice.clone().lerp(palette.amber, 0.28);
    nodeObject.position.copy(node);
    nodeObject.rotation.set(index * 0.6, index * 0.9, index * 0.32);
    nodeObject.scale.setScalar(index % 3 === 0 ? 0.34 : 0.24);
    nodeObject.updateMatrix();
    nodeShards.setMatrixAt(index, nodeObject.matrix);
    nodeShards.setColorAt(index, color);
  });
  nodeShards.instanceMatrix.needsUpdate = true;
  if (nodeShards.instanceColor) nodeShards.instanceColor.needsUpdate = true;

  const linkPositions = [];
  const pairs = [
    [0, 1],
    [1, 2],
    [2, 3],
    [2, 7],
    [3, 4],
    [4, 5],
    [4, 6],
    [7, 5],
  ];

  pairs.forEach(([a, b]) => {
    const start = nodes[a];
    const end = nodes[b];
    for (let s = 0; s < 18; s++) {
      const t0 = s / 18;
      const t1 = (s + 0.66) / 18;
      const p0 = start.clone().lerp(end, t0);
      const p1 = start.clone().lerp(end, Math.min(t1, 1));
      linkPositions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
    }
  });

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linkPositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xd3ad67,
    transparent: true,
    opacity: 0.38,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  const links = new THREE.LineSegments(lineGeometry, lineMaterial);
  links.userData.baseOpacity = lineMaterial.opacity;
  group.add(links, nodeShards);
  group.position.set(0.65, 0.2, 0.25);
  group.rotation.set(-0.18, -0.22, 0.08);
  group.scale.setScalar(0.94);

  return { group, nodes: nodeShards, links };
}

function createSignalRings() {
  const group = new THREE.Group();
  const ringMaterial = new THREE.LineBasicMaterial({
    color: 0xc79d55,
    transparent: true,
    opacity: 0.2,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });

  for (let i = 0; i < 5; i++) {
    const points = [];
    const radius = 2.2 + i * 0.7;
    const segments = 160;
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.cos(angle) * radius * 1.9, Math.sin(angle) * radius * 0.26, 0));
    }

    const ring = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), ringMaterial.clone());
    ring.rotation.set(-0.58 + i * 0.018, 0.08, -0.025);
    ring.position.set(0.55, -0.04 + i * 0.02, -0.4 - i * 0.18);
    ring.userData.spin = 0.018 + i * 0.006;
    group.add(ring);
  }

  return group;
}

function createHydrogenGlow() {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#fff7e4") },
      uColorB: { value: new THREE.Color("#c79748") },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;

      void main() {
        vec2 uv = vUv - 0.5;
        float d = length(uv);
        float pulse = 0.88 + sin(uTime * 1.7) * 0.12;
        float core = smoothstep(0.28 * pulse, 0.0, d) * 0.14;
        float halo = smoothstep(0.5, 0.08, d) * 0.12;
        vec3 color = mix(uColorA, uColorB, smoothstep(0.0, 0.38, d));
        gl_FragColor = vec4(color, core + halo);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(9.5, 9.5), material);
  mesh.position.set(0.78, 0.05, -1.35);
  mesh.userData.material = material;
  return mesh;
}

function createBackgroundVeil() {
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      varying vec2 vUv;

      float wave(vec2 p) {
        return sin(p.x * 12.0 + uTime * 0.36) * 0.5 + sin((p.x + p.y) * 8.0 - uTime * 0.26) * 0.5;
      }

      void main() {
        vec2 uv = vUv - 0.5;
        float d = length(uv);
        float plume = smoothstep(0.52, 0.0, abs(uv.y + wave(uv) * 0.035)) * smoothstep(0.72, 0.16, d);
        float leftGlow = smoothstep(0.62, 0.0, length(uv - vec2(-0.28, 0.12))) * 0.18;
        vec3 color = mix(vec3(0.94, 0.91, 0.86), vec3(0.82, 0.66, 0.38), plume);
        gl_FragColor = vec4(color, plume * 0.14 + leftGlow * 0.55);
      }
    `,
  });

  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(24, 13.5), material);
  mesh.position.set(0, 0, -8);
  mesh.userData.material = material;
  return mesh;
}

function createParticleMaterial(scale) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.NormalBlending,
    uniforms: {
      uPixelRatio: { value: 1 },
      uScale: { value: scale },
    },
    vertexShader: `
      uniform float uPixelRatio;
      uniform float uScale;
      attribute vec3 aColor;
      attribute float aSize;
      attribute float aAlpha;
      attribute float aRotation;
      varying vec3 vColor;
      varying float vAlpha;
      varying float vRotation;

      void main() {
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        gl_PointSize = aSize * uPixelRatio * (uScale / max(1.0, -mvPosition.z));
        vColor = aColor;
        vAlpha = aAlpha;
        vRotation = aRotation;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;
      varying float vRotation;

      float edge(vec2 a, vec2 b, vec2 p) {
        return (p.x - a.x) * (b.y - a.y) - (p.y - a.y) * (b.x - a.x);
      }

      void main() {
        vec2 centered = gl_PointCoord - 0.5;
        float c = cos(vRotation);
        float s = sin(vRotation);
        vec2 uv = mat2(c, -s, s, c) * centered + 0.5;

        vec2 a = vec2(0.5, 0.08);
        vec2 b = vec2(0.13, 0.84);
        vec2 cPoint = vec2(0.87, 0.84);
        float e0 = edge(a, b, uv);
        float e1 = edge(b, cPoint, uv);
        float e2 = edge(cPoint, a, uv);
        float inside = step(0.0, e0) * step(0.0, e1) * step(0.0, e2);
        float edgeDistance = min(min(e0, e1), e2);
        float border = inside * (1.0 - smoothstep(0.0, 0.028, edgeDistance));
        float centerGlow = smoothstep(0.48, 0.0, length(centered)) * 0.28;
        float alpha = (inside * 0.72 + border * 0.42 + centerGlow) * vAlpha;
        if (alpha < 0.01) discard;
        vec3 color = mix(vColor * 0.72, vColor, inside);
        gl_FragColor = vec4(color, alpha);
      }
    `,
  });
}

function updateFlowField(field, time, depth) {
  const { base, positions, sizes, alphas, speeds, phases, rotations, spin, spreadX } = field.mesh.userData;

  for (let i = 0; i < speeds.length; i++) {
    const i3 = i * 3;
    const phase = phases[i];
    const speed = speeds[i];
    const drift = time * speed;
    let x = base[i3] + Math.sin(drift + phase) * 0.22 + depth * 0.02;
    const y = base[i3 + 1] + Math.sin(drift * 0.9 + phase * 1.7) * 0.18;
    const z = base[i3 + 2] + Math.cos(drift * 0.7 + phase) * 0.28;

    x += time * speed * 0.18;
    if (x > spreadX * 0.5) x -= spreadX;

    positions[i3] = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const scale = sizes[i] * (0.018 + alphas[i] * 0.035) * (1 + Math.sin(time * 0.8 + phase) * 0.08);
    tempObject.position.set(x, y, z);
    tempObject.rotation.set(
      rotations[i] * 0.45 + time * spin[i3] + Math.sin(time * 0.22 + phase) * 0.16,
      rotations[i] + time * spin[i3 + 1],
      rotations[i] * 0.7 + time * spin[i3 + 2],
    );
    tempObject.scale.set(scale * 1.18, scale, scale * 0.92);
    tempObject.updateMatrix();
    field.mesh.setMatrixAt(i, tempObject.matrix);
  }

  field.mesh.instanceMatrix.needsUpdate = true;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.position.z = width / height < 0.8 ? 16.5 : 12.5;
  camera.updateProjectionMatrix();

  scene.traverse((object) => {
    const material = object.material;
    if (material?.uniforms?.uPixelRatio) material.uniforms.uPixelRatio.value = dpr;
  });
}

function animate() {
  const elapsed = clock.getElapsedTime();
  pointer.lerp(targetPointer, 0.055);

  updateFlowField(farField, elapsed, -1);
  updateFlowField(midField, elapsed, 1);

  world.rotation.x = -0.035 + pointer.y * 0.055 + Math.sin(elapsed * 0.18) * 0.012;
  world.rotation.y = pointer.x * 0.09 + Math.sin(elapsed * 0.12) * 0.018;
  world.position.x = pointer.x * 0.26;
  world.position.y = -pointer.y * 0.16;

  molecule.group.rotation.y = -0.22 + elapsed * 0.045 + pointer.x * 0.08;
  molecule.group.rotation.x = -0.18 + Math.sin(elapsed * 0.36) * 0.035;
  molecule.links.material.opacity = 0.25 + Math.sin(elapsed * 1.4) * 0.065;

  rings.children.forEach((ring, index) => {
    ring.rotation.z += ring.userData.spin * 0.01;
    ring.material.opacity = 0.13 + Math.sin(elapsed * 0.7 + index) * 0.055;
  });

  scene.traverse((object) => {
    const material = object.userData?.material;
    if (material?.uniforms?.uTime) material.uniforms.uTime.value = elapsed;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  targetPointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
  targetPointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
});

resize();
animate();
