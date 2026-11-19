// A friendly ceramic robot that follows the page: it waits on a pedestal (intro),
// leans in for the work, shows a quote mark for strategy, turns toward the story
// in About, and hands the visitor a coffee at Contact.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const dbg = m => { if (window.__dbg) window.__dbg(m); };
dbg('3D library loaded (three r' + THREE.REVISION + ')');

const canvas = document.getElementById('bot');

function start() {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  // lights
  scene.add(new THREE.HemisphereLight(0xfff6ee, 0xd9d2c8, 0.7));
  const key = new THREE.DirectionalLight(0xfff3e6, 1.7);
  key.position.set(-3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.radius = 6;
  key.shadow.bias = -0.0005;
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 5; key.shadow.camera.bottom = -4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xfff0e6, 1.2);
  rim.position.set(4, 2, -4);
  scene.add(rim);
  const fill = new THREE.PointLight(0xe0a26a, 2.2, 6);
  fill.position.set(-3.2, 1.2, 0.6);
  scene.add(fill);

  // materials (black + tan palette)
  const ENV = 0.9;
  const shell = new THREE.MeshPhysicalMaterial({ color: 0xeeebe6, roughness: 0.38, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: ENV });
  const shellLight = new THREE.MeshPhysicalMaterial({ color: 0xf8f6f2, roughness: 0.34, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: ENV });
  const dark = new THREE.MeshStandardMaterial({ color: 0x1b1b1f, roughness: 0.55, metalness: 0.3, envMapIntensity: ENV });
  const deep = new THREE.MeshStandardMaterial({ color: 0x0f0f12, roughness: 0.6, envMapIntensity: ENV });
  const pedMat = new THREE.MeshStandardMaterial({ color: 0x2a2928, roughness: 0.9 });

  // tan "ring" texture (conic gradient)
  const rc = document.createElement('canvas'); rc.width = rc.height = 512;
  const rx = rc.getContext('2d');
  const stops = ['#E9D7B8', '#C9A97A', '#9C7140', '#7D5C36', '#9C7140', '#C9A97A', '#E9D7B8'];
  let grad;
  if (rx.createConicGradient) grad = rx.createConicGradient(200 * Math.PI / 180, 256, 256);
  else grad = rx.createLinearGradient(0, 0, 512, 512);
  stops.forEach((c, i) => grad.addColorStop(i / (stops.length - 1), c));
  rx.fillStyle = grad; rx.fillRect(0, 0, 512, 512);
  const ringTex = new THREE.CanvasTexture(rc);
  ringTex.colorSpace = THREE.SRGBColorSpace;
  const ringMat = new THREE.MeshPhysicalMaterial({ map: ringTex, emissive: 0xffffff, emissiveMap: ringTex, emissiveIntensity: 0.22, roughness: 0.5, clearcoat: 0.35, envMapIntensity: ENV });

  // face screen texture
  const fc = document.createElement('canvas'); fc.width = fc.height = 512;
  const fx = fc.getContext('2d');
  const faceTex = new THREE.CanvasTexture(fc);
  faceTex.colorSpace = THREE.SRGBColorSpace;

  const mesh = (geo, mat, cast = true) => { const m = new THREE.Mesh(geo, mat); m.castShadow = cast; m.receiveShadow = true; return m; };
  const rbox = (w, h, d, r, mat) => mesh(new RoundedBoxGeometry(w, h, d, 4, r), mat);
  const ball = (r, mat) => mesh(new THREE.SphereGeometry(r, 24, 16), mat);
  const cyl = (rt, rb, h, mat, seg = 32) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  function roundedRectShape(w, h, r) {
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    return s;
  }
  const framePath = (w, h, r) => roundedRectShape(w, h, r);
  function remapUV(geo, w, h) {
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + w / 2) / w, (pos.getY(i) + h / 2) / h);
    uv.needsUpdate = true;
  }

  // ---------- build ----------
  const robot = new THREE.Group();
  scene.add(robot);
  const body = new THREE.Group();
  robot.add(body);

  // pedestal
  const ped = mesh(new THREE.BoxGeometry(1.7, 1.6, 1.7), pedMat, false);
  ped.position.y = -2.22;
  robot.add(ped);

  // legs
  [-1, 1].forEach(s => {
    const foot = rbox(0.42, 0.18, 0.6, 0.06, shellLight); foot.position.set(s * 0.3, -1.33, 0.05); body.add(foot);
    const ankle = ball(0.1, dark); ankle.position.set(s * 0.3, -1.18, 0); body.add(ankle);
    const leg = rbox(0.36, 0.5, 0.4, 0.1, shell); leg.position.set(s * 0.3, -0.88, 0); body.add(leg);
    const hip = ball(0.14, dark); hip.position.set(s * 0.3, -0.56, 0); body.add(hip);
  });
  const pelvis = rbox(0.8, 0.2, 0.6, 0.08, dark); pelvis.position.y = -0.45; body.add(pelvis);

  // torso
  const torso = rbox(1.22, 1.12, 0.92, 0.24, shell); torso.position.y = 0.2; body.add(torso);
  const chestTop = rbox(1.0, 0.12, 0.7, 0.05, shellLight); chestTop.position.y = 0.78; body.add(chestTop);
  [0xE9D7B8, 0xC9A97A, 0x9C7140].forEach((c, i) => {
    const led = mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 1.4 }), false);
    led.position.set(-0.18 + i * 0.18, 0.42, 0.47); body.add(led);
  });
  [-1, 1].forEach(s => {
    const slot = mesh(new THREE.BoxGeometry(0.08, 0.32, 0.03), deep, false); slot.position.set(s * 0.3, 0.06, 0.46); body.add(slot);
    const lip = mesh(new THREE.TorusGeometry(0.05, 0.015, 8, 16, Math.PI), dark, false); lip.position.set(s * 0.3, 0.23, 0.46); body.add(lip);
  });

  // neck + head
  const neck = cyl(0.18, 0.2, 0.25, dark); neck.position.y = 0.92; body.add(neck);
  const head = new THREE.Group(); head.position.y = 0.98; body.add(head);
  const H = 0.78;
  const skull = rbox(1.5, 1.42, 1.3, 0.2, shell); skull.position.y = H; head.add(skull);
  const back = rbox(1.28, 1.14, 0.9, 0.12, dark); back.position.set(0, H, -0.3); head.add(back);
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 26; i++) {
    const bar = mesh(new THREE.BoxGeometry(0.06 + rnd() * 0.22, 0.03, 0.03), deep, false);
    if (i < 16) bar.position.set((rnd() - 0.5) * 1.0, H + (rnd() - 0.5) * 0.9, -0.76);
    else { bar.position.set((rnd() - 0.5) * 1.0, H + 0.58, -0.3 + (rnd() - 0.5) * 0.6); bar.rotation.y = rnd() * Math.PI; }
    head.add(bar);
  }
  // face ring
  const ringShape = roundedRectShape(1.5, 1.44, 0.3); ringShape.holes.push(framePath(1.08, 1.02, 0.2));
  const ringGeo = new THREE.ExtrudeGeometry(ringShape, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 16 });
  remapUV(ringGeo, 1.5, 1.44);
  const ring = mesh(ringGeo, ringMat); ring.position.set(0, H, 0.6); head.add(ring);
  const bezShape = roundedRectShape(1.1, 1.04, 0.21); bezShape.holes.push(framePath(0.92, 0.86, 0.16));
  const bezel = mesh(new THREE.ExtrudeGeometry(bezShape, { depth: 0.04, bevelEnabled: false, curveSegments: 16 }), shellLight); bezel.position.set(0, H, 0.62); head.add(bezel);
  const scrGeo = new THREE.ShapeGeometry(roundedRectShape(0.9, 0.84, 0.14), 16); remapUV(scrGeo, 0.9, 0.84);
  const screenMat = new THREE.MeshPhysicalMaterial({ color: 0x050506, roughness: 0.2, clearcoat: 1, emissive: 0xffffff, emissiveMap: faceTex, emissiveIntensity: 1.6 });
  const screen = mesh(scrGeo, screenMat, false); screen.position.set(0, H, 0.665); head.add(screen);
  // ears + cable
  [-1, 1].forEach(s => {
    const ear = cyl(0.22, 0.22, 0.16, shellLight); ear.rotation.z = Math.PI / 2; ear.position.set(s * 0.8, H, 0); head.add(ear);
    const cap = cyl(0.12, 0.12, 0.05, dark); cap.rotation.z = Math.PI / 2; cap.position.set(s * 0.9, H, 0); head.add(cap);
  });
  const cable = mesh(new THREE.TorusGeometry(0.32, 0.028, 10, 32, Math.PI), dark);
  cable.rotation.set(0, Math.PI / 2, Math.PI / 2); cable.position.set(0.93, H - 0.32, -0.05); head.add(cable);

  // arms
  const arms = {};
  [-1, 1].forEach(s => {
    const shoulder = new THREE.Group(); shoulder.position.set(s * 0.74, 0.58, 0); body.add(shoulder);
    shoulder.add(ball(0.16, dark));
    const upper = rbox(0.3, 0.55, 0.32, 0.1, shell); upper.position.y = -0.33; shoulder.add(upper);
    const elbow = new THREE.Group(); elbow.position.y = -0.64; shoulder.add(elbow);
    elbow.add(ball(0.12, dark));
    const fore = new THREE.Group(); elbow.add(fore);
    const hand = rbox(0.3, 0.32, 0.34, 0.1, shellLight); hand.position.y = -0.3; fore.add(hand);
    const thumb = rbox(0.1, 0.16, 0.12, 0.04, shellLight); thumb.position.set(-s * 0.1, -0.24, 0.17); fore.add(thumb);
    arms[s] = { shoulder, fore };
  });

  // coffee cup in the right hand
  const cup = new THREE.Group();
  const cupBody = cyl(0.14, 0.11, 0.3, shellLight); cup.add(cupBody);
  const sleeve = cyl(0.145, 0.13, 0.11, ringMat); sleeve.position.y = -0.01; cup.add(sleeve);
  const lid = cyl(0.155, 0.155, 0.045, dark); lid.position.y = 0.17; cup.add(lid);
  const lidTop = cyl(0.12, 0.14, 0.03, dark); lidTop.position.y = 0.205; cup.add(lidTop);
  const steamMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false });
  const steam = [];
  for (let i = 0; i < 3; i++) { const p = mesh(new THREE.SphereGeometry(0.05, 12, 8), steamMat.clone(), false); p.position.set((i - 1) * 0.05, 0.3 + i * 0.08, 0); cup.add(p); steam.push(p); }
  cup.position.set(0, -0.5, 0.18);
  cup.scale.setScalar(0.0001);
  arms[1].fore.add(cup);

  // ---------- face ----------
  let faceMode = 'eyes', drawnMode = 'eyes', fade = 1, blink = 1, nextBlink = performance.now() + 3000, blinkStart = 0;
  function drawFace() {
    fx.globalAlpha = 1; fx.fillStyle = '#000'; fx.fillRect(0, 0, 512, 512);
    fx.globalAlpha = fade;
    fx.fillStyle = '#fff'; fx.strokeStyle = '#fff'; fx.shadowColor = '#fff'; fx.shadowBlur = 18;
    if (drawnMode === 'quote') {
      fx.font = '560px "Arial Black", Arial, sans-serif'; fx.textAlign = 'center'; fx.textBaseline = 'alphabetic';
      fx.fillText('“', 256, 400);
    } else if (drawnMode === 'happy') {
      fx.lineWidth = 22; fx.lineCap = 'round';
      [[196, 280], [316, 270]].forEach(([x, y]) => { fx.beginPath(); fx.arc(x, y, 34, Math.PI * 1.1, Math.PI * 1.9); fx.stroke(); });
    } else {
      [[196, 262], [316, 252]].forEach(([x, y]) => { fx.beginPath(); fx.ellipse(x, y, 30, 38 * blink, 0, 0, Math.PI * 2); fx.fill(); });
    }
    fx.shadowBlur = 0;
    faceTex.needsUpdate = true;
  }

  // ---------- poses per section ----------
  // shift: how far right the robot sits on screen (fraction of width)
  const S = [
    { z: 13.0, y: 1.1, look: 0.4, yaw: -0.42, hy: -0.6, hp: 0.16, hr: 0.22, shift: 0.21, cup: 0, reach: 0 },    // intro
    { z: 9.0, y: 1.5, look: 1.0, yaw: 0.45, hy: 0.35, hp: 0.06, hr: 0.05, shift: 0.17, cup: 0, reach: 0 },       // about
    { z: 6.9, y: 1.95, look: 1.72, yaw: -0.2, hy: -0.06, hp: 0.04, hr: 0, shift: 0.17, cup: 0, reach: 0 },       // projects
    { z: 6.9, y: 1.95, look: 1.72, yaw: -0.28, hy: 0.12, hp: 0.04, hr: -0.04, shift: 0.15, cup: 0, reach: 0 },   // strategy
    { z: 7.8, y: 1.6, look: 1.2, yaw: 0.3, hy: 0.22, hp: 0.02, hr: 0, shift: 0.17, cup: 0, reach: 0 },           // experience
    { z: 8.6, y: 1.25, look: 0.65, yaw: -0.15, hy: -0.05, hp: 0.1, hr: 0, shift: 0.2, cup: 1, reach: 1 }         // contact
  ];
  const faceFor = ['eyes', 'eyes', 'eyes', 'quote', 'eyes', 'happy'];
  const secIds = ['intro', 'about', 'work', 'strategy', 'experience', 'contact'];
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const lerp = (a, b, t) => a + (b - a) * t;

  function scrollP() {
    const mid = window.scrollY + window.innerHeight * 0.5;
    const tops = secIds.map(id => { const el = document.getElementById(id); return el ? el.offsetTop + el.offsetHeight * 0.5 : 0; });
    if (mid <= tops[0]) return 0;
    for (let i = 0; i < tops.length - 1; i++) if (mid < tops[i + 1]) return i + (mid - tops[i]) / Math.max(1, tops[i + 1] - tops[i]);
    return tops.length - 1;
  }

  let sp = scrollP(), w = 0, h = 0;
  const ptr = { x: 0, y: 0 }, sptr = { x: 0, y: 0 };
  window.addEventListener('pointermove', e => { ptr.x = e.clientX / window.innerWidth * 2 - 1; ptr.y = e.clientY / window.innerHeight * 2 - 1; }, { passive: true });

  function resize() {
    w = window.innerWidth; h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);
  resize();

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = new THREE.Clock();

  const safeFrameRef = { fn: null };
  function frame() {
    const t = clock.getElapsedTime();
    const target = scrollP();
    sp += (target - sp) * (reduce ? 1 : 0.08);
    sptr.x += (ptr.x - sptr.x) * 0.06; sptr.y += (ptr.y - sptr.y) * 0.06;

    const i0 = Math.min(S.length - 1, Math.floor(sp)), i1 = Math.min(S.length - 1, i0 + 1), k = ease(sp - i0);
    const A = S[i0], B = S[i1], st = {};
    for (const key of Object.keys(A)) st[key] = lerp(A[key], B[key], k);

    const mobile = w < 900;
    const camZ = st.z * (mobile ? 1.25 : 1);
    camera.position.set(sptr.x * 0.25, st.y - sptr.y * 0.1, camZ);
    camera.lookAt(0, st.look, 0);
    const shift = mobile ? 0 : st.shift;
    camera.setViewOffset(w, h, -w * shift, 0, w, h);

    const idle = reduce ? 0 : 1;
    body.position.y = Math.sin(t * 1.4) * 0.02 * idle;
    robot.rotation.y = st.yaw + sptr.x * 0.12;
    head.rotation.set(st.hp + sptr.y * 0.18 + Math.sin(t * 0.9) * 0.02 * idle, st.hy + sptr.x * 0.45, st.hr + Math.sin(t * 0.7) * 0.02 * idle);

    [-1, 1].forEach(s => {
      const a = arms[s];
      const reach = s === 1 ? st.reach : 0;
      a.shoulder.rotation.z = s * 0.16 * (1 - reach) + s * 0.04 * reach + Math.sin(t * 1.4 + s) * 0.05 * idle * (1 - reach);
      a.shoulder.rotation.x = -1.25 * reach;
      a.fore.rotation.x = -0.35 * (1 - reach) - 0.15 * reach + Math.sin(t * 1.4 + s) * 0.06 * idle * (1 - reach);
    });
    const cs = Math.max(0.0001, st.cup);
    cup.scale.setScalar(cs);
    cup.rotation.x = 1.4 * st.reach; // cancels the raised arm so the cup stays upright
    steam.forEach((p, i) => {
      const ph = (t * 0.5 + i / 3) % 1;
      p.position.y = 0.26 + ph * 0.35; p.material.opacity = st.cup > 0.6 ? (1 - ph) * 0.5 : 0;
      p.scale.setScalar(0.6 + ph);
    });

    // face mode + blink
    const want = faceFor[Math.round(sp)];
    if (want !== faceMode) { faceMode = want; drawnMode = want; fade = 0; }
    if (fade < 1) fade = Math.min(1, fade + 0.05);
    const now = performance.now();
    if (!reduce && now > nextBlink) { blinkStart = now; nextBlink = now + 2500 + Math.random() * 3000; }
    const bt = (now - blinkStart) / 180;
    blink = bt < 1 ? 1 - 0.9 * Math.sin(bt * Math.PI) : 1;
    drawFace();

    renderer.render(scene, camera);
    requestAnimationFrame(safeFrameRef.fn);
  }
  drawFace();
  dbg('robot built, starting animation');
  let first = true;
  const safeFrame = safeFrameRef.fn = () => { try { frame(); if (first) { first = false; dbg('first frame rendered OK'); } } catch (e) { dbg('ERROR in animation: ' + e.message); console.error(e); } };
  requestAnimationFrame(safeFrame);
}

try { start(); } catch (err) { dbg('ERROR starting robot: ' + err.message); console.warn('3D robot unavailable:', err); if (canvas) canvas.style.display = 'none'; }
