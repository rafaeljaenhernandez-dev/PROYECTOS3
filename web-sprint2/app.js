// AforoYa · one page del Sprint 2
// Una sola escena 3D fija detrás de la página. Cada sección (data-escena) es un
// fotograma clave: al deslizar se interpola la cámara, el semáforo, la gente,
// el barrio y el color de fondo. Todo en JavaScript sin frameworks.

import * as THREE from './vendor/three.module.min.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const esMovil = () => window.innerWidth < 860;

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const suave = (t) => t * t * (3 - 2 * t);
const gauss = (x, m, s) => Math.exp(-((x - m) ** 2) / (2 * s * s));

function azar(semilla) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Estado del semáforo a partir de un porcentaje (0-1)
function estadoDe(p) {
  if (p < 0.5) return { luz: 2, nombre: 'verde', texto: 'Entra, hay sitio', corto: 'Verde: entra', colorTexto: '#14532d', color: '#2fd27a' };
  if (p < 0.8) return { luz: 1, nombre: 'ambar', texto: 'Se va llenando', corto: 'Ámbar: se va llenando', colorTexto: '#8a6100', color: '#f5b700' };
  return { luz: 0, nombre: 'rojo', texto: 'Mejor luego', corto: 'Rojo: mejor luego', colorTexto: '#b42318', color: '#e5484d' };
}

// ---------------------------------------------------------------------------
// Interacción de la página (funciona aunque no haya WebGL)
// ---------------------------------------------------------------------------
const interactivo = { luzSlider: 2, luzTorno: 2 };

// Barra con fondo al bajar
const barra = document.querySelector('.barra');
const alDesplazar = () => barra.classList.toggle('con-fondo', window.scrollY > 40);
window.addEventListener('scroll', alDesplazar, { passive: true });
alDesplazar();

// Portada fija: al deslizar pasa la tarde, sube el aforo y cambia el semáforo
const hero = { el: document.getElementById('inicio'), p: 0, pct: 0.22 };
const hLineas = hero.el.querySelectorAll('.linea');
const hHora = document.getElementById('h-hora');
const hPct = document.getElementById('h-pct');
const hBarra = document.getElementById('h-barra');
function pintarHero() {
  const recorrido = hero.el.offsetHeight - window.innerHeight;
  const p = clamp(-hero.el.getBoundingClientRect().top / recorrido, 0, 1);
  hero.p = p;
  hero.pct = 0.22 + 0.74 * suave(p);
  const est = estadoDe(hero.pct);
  if (hero.el.dataset.estado !== est.nombre) hero.el.dataset.estado = est.nombre;
  hero.el.classList.toggle('avanzada', p > 0.04);
  const min = 17 * 60 + 30 + Math.round(p * 90);
  hHora.textContent = `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
  hPct.textContent = `${Math.round(hero.pct * 100)} %`;
  hBarra.style.transform = `scaleX(${p.toFixed(4)})`;
  if (!reducido) {
    // Cada palabra se desplaza a un lado distinto, como gente que se aparta
    hLineas.forEach((l, i) => {
      const dir = [1, -1, 1][i];
      l.style.transform = `translate3d(${(dir * p * (2 + i * 2.5) * (esMovil() ? 0.25 : 1)).toFixed(2)}vw, 0, 0)`;
    });
  }
}
window.addEventListener('scroll', pintarHero, { passive: true });
window.addEventListener('resize', pintarHero);
pintarHero();

// Apariciones al hacer scroll
const aAparecer = document.querySelectorAll(
  '.titular-m, .seccion:not(.apertura) .entradilla, .giro-previo, .titular-giro, .leyenda, .widget, .paso, .prueba, .linea-negocio, .privacidad, .movil, .formulario, .demo-vivo, .contador-ciudad, .titular-final, .fuente'
);
aAparecer.forEach((el) => {
  el.classList.add('aparece');
  const hermanos = el.parentElement ? [...el.parentElement.children].filter((h) => h.classList.contains('paso') || h.classList.contains('linea-negocio')) : [];
  const i = hermanos.indexOf(el);
  if (i > 0) el.style.transitionDelay = `${i * 90}ms`;
});
const obsAparece = new IntersectionObserver(
  (entradas) => entradas.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      obsAparece.unobserve(e.target);
    }
  }),
  { rootMargin: '0px 0px -12% 0px' }
);
aAparecer.forEach((el) => obsAparece.observe(el));

// Cifras que cuentan hacia arriba
const obsCifras = new IntersectionObserver(
  (entradas) => entradas.forEach((e) => {
    if (!e.isIntersecting) return;
    const caja = e.target;
    obsCifras.unobserve(caja);
    caja.classList.add('visible');
    const n = caja.querySelector('.n');
    const fin = Number(caja.dataset.valor);
    if (reducido) { n.textContent = fin; return; }
    const t0 = performance.now();
    const dur = 1300;
    const paso = (t) => {
      const k = clamp((t - t0) / dur, 0, 1);
      n.textContent = Math.round(fin * (1 - Math.pow(1 - k, 4)));
      if (k < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }),
  { threshold: 0.55 }
);
document.querySelectorAll('.cifra').forEach((c) => obsCifras.observe(c));

// Widget con la hora del día (datos simulados)
const curva = (h) => clamp(0.08 + 0.42 * gauss(h, 7.9, 0.9) + 0.22 * gauss(h, 13.8, 1.3) + 0.82 * gauss(h, 19.4, 1.35), 0.04, 0.97);
const hora = document.getElementById('hora');
const horaTxt = document.getElementById('hora-txt');
const wPct = document.getElementById('w-pct');
const wEstado = document.getElementById('w-estado');
const wPersonas = document.getElementById('w-personas');
const widget = document.querySelector('.widget');
const barras = document.getElementById('barras');
const leyenda = document.querySelectorAll('.leyenda li');
for (let h = 6; h < 24; h++) {
  const b = document.createElement('span');
  b.style.height = `${Math.round(curva(h + 0.5) * 100)}%`;
  b.dataset.h = h;
  barras.appendChild(b);
}
function pintarHora() {
  const h = Number(hora.value);
  const p = curva(h);
  const est = estadoDe(p);
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  horaTxt.textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  hora.setAttribute('aria-valuetext', `${horaTxt.textContent}, ${Math.round(p * 100)} % de aforo, ${est.texto}`);
  wPct.textContent = Math.round(p * 100);
  wPersonas.textContent = Math.round(p * 200);
  wEstado.textContent = est.texto;
  widget.style.setProperty('--color', est.color);
  widget.style.setProperty('--color-texto', est.colorTexto);
  barras.querySelectorAll('span').forEach((b) => b.classList.toggle('ahora', Number(b.dataset.h) === Math.min(hh, 23)));
  leyenda.forEach((li) => li.classList.toggle('activo', li.dataset.estado === est.nombre));
  interactivo.luzSlider = est.luz;
}
hora.addEventListener('input', pintarHora);
pintarHora();

// "Eres el torno"
const AFORO_TORNO = 40;
let dentro = 12;
const mRelleno = document.getElementById('m-relleno');
const mCuenta = document.getElementById('m-cuenta');
const mEstado = document.getElementById('m-estado');
const mLat = document.getElementById('m-lat');
const bEntra = document.getElementById('b-entra');
const bSale = document.getElementById('b-sale');
function pintarTorno(t0) {
  const p = dentro / AFORO_TORNO;
  const est = estadoDe(p);
  mRelleno.style.transform = `scaleX(${Math.max(0.02, p)})`;
  mRelleno.style.backgroundColor = est.color;
  mCuenta.textContent = dentro;
  mEstado.textContent = est.corto;
  bEntra.disabled = dentro >= AFORO_TORNO;
  bSale.disabled = dentro <= 0;
  interactivo.luzTorno = est.luz;
  if (t0) {
    requestAnimationFrame(() => {
      const ms = Math.max(1, Math.round(performance.now() - t0));
      mLat.textContent = `semáforo actualizado en ${ms} ms`;
    });
  }
}
bEntra.addEventListener('click', () => { dentro = Math.min(AFORO_TORNO, dentro + 3); pintarTorno(performance.now()); empujon(); });
bSale.addEventListener('click', () => { dentro = Math.max(0, dentro - 3); pintarTorno(performance.now()); });
pintarTorno();

// Vídeo: empieza en silencio al verse; el botón lo pone desde el principio con sonido
const video = document.getElementById('video');
const bSonido = document.getElementById('b-sonido');
let videoTocado = false;
new IntersectionObserver(
  (entradas) => entradas.forEach((e) => {
    if (e.isIntersecting) { if (!reducido && !videoTocado) video.play().catch(() => {}); }
    else video.pause();
  }),
  { threshold: 0.35 }
).observe(video);
video.addEventListener('play', () => { if (!video.muted) videoTocado = true; });
video.addEventListener('volumechange', () => { if (!video.muted) videoTocado = true; });
bSonido.addEventListener('click', () => {
  videoTocado = true;
  video.currentTime = 0;
  video.muted = false;
  video.volume = 1;
  video.play().catch(() => {});
});
const movil = document.querySelector('.movil');
if (!reducido && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  movil.addEventListener('pointermove', (e) => {
    const r = movil.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    movil.style.setProperty('--giro-y', `${-14 + x * 16}deg`);
    movil.style.setProperty('--giro-x', `${4 - y * 10}deg`);
  });
  movil.addEventListener('pointerleave', () => {
    movil.style.setProperty('--giro-y', '-14deg');
    movil.style.setProperty('--giro-x', '4deg');
  });
}

// Formulario (back-end simulado: se guarda solo en este navegador)
const form = document.getElementById('formulario');
const formMsg = document.getElementById('form-msg');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const gym = form.gimnasio.value.trim();
  const mail = form.email.value.trim();
  form.gimnasio.setAttribute('aria-invalid', String(!gym));
  const mailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail);
  form.email.setAttribute('aria-invalid', String(!mailOk));
  formMsg.className = 'form-msg';
  if (!gym) { formMsg.textContent = 'Falta el nombre del gimnasio.'; formMsg.classList.add('error'); form.gimnasio.focus(); return; }
  if (!mailOk) { formMsg.textContent = 'Revisa el email: debe tener la forma nombre@dominio.es.'; formMsg.classList.add('error'); form.email.focus(); return; }
  const lista = JSON.parse(localStorage.getItem('aforoya-demos') || '[]');
  lista.push({ gym, mail, tipo: form.tipo.value, fecha: new Date().toISOString() });
  localStorage.setItem('aforoya-demos', JSON.stringify(lista));
  formMsg.textContent = `Hecho, ${gym}. Esto es un prototipo: tu solicitud se ha guardado solo en este navegador.`;
  formMsg.classList.add('ok');
  form.reset();
});

// ---------------------------------------------------------------------------
// Escena 3D
// ---------------------------------------------------------------------------
const lienzo = document.getElementById('escena');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas: lienzo, antialias: true, powerPreference: 'high-performance' });
} catch (err) {
  renderer = null;
}

let empujon = () => {};

if (!renderer) {
  document.body.classList.add('sin-3d', 'listo');
  lienzo.remove();
} else {
  iniciar3D();
}

function iniciar3D() {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, esMovil() ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const escena = new THREE.Scene();
  const fondo = new THREE.Color('#14532d');
  escena.background = fondo;
  escena.fog = new THREE.Fog(fondo, 16, 46);

  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  escena.environmentIntensity = 0.55;

  const camara = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.1, 120);
  camara.position.set(0, 3.2, 12);

  // Luces
  const hemi = new THREE.HemisphereLight('#f7f8f5', '#0f2a1c', 0.9);
  escena.add(hemi);
  const sol = new THREE.DirectionalLight('#fff3ea', 2.2);
  sol.position.set(-6, 12, 8);
  sol.castShadow = true;
  sol.shadow.mapSize.set(1024, 1024);
  sol.shadow.camera.left = -16; sol.shadow.camera.right = 16;
  sol.shadow.camera.top = 16; sol.shadow.camera.bottom = -16;
  sol.shadow.camera.far = 50;
  sol.shadow.bias = -0.0004;
  sol.shadow.radius = 6;
  escena.add(sol);

  // Suelo
  const sueloMat = new THREE.MeshStandardMaterial({ color: '#1b6a3a', roughness: 0.95 });
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), sueloMat);
  suelo.rotation.x = -Math.PI / 2;
  suelo.receiveShadow = true;
  escena.add(suelo);

  // --- Semáforo -------------------------------------------------------------
  const semaforo = new THREE.Group();
  escena.add(semaforo);
  const plasticoNegro = new THREE.MeshPhysicalMaterial({ color: '#0d0d0f', roughness: 0.28, metalness: 0.0, clearcoat: 1, clearcoatRoughness: 0.12 });
  const cuerpo = new THREE.Mesh(new RoundedBoxGeometry(1.45, 3.6, 1.05, 6, 0.32), plasticoNegro);
  cuerpo.position.y = 3.35;
  cuerpo.castShadow = true;
  semaforo.add(cuerpo);
  const poste = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 1.6, 20), plasticoNegro);
  poste.position.y = 0.8;
  poste.castShadow = true;
  semaforo.add(poste);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 32), plasticoNegro);
  base.position.y = 0.06;
  base.receiveShadow = true;
  semaforo.add(base);

  const coloresLuz = [new THREE.Color('#e5484d'), new THREE.Color('#f5b700'), new THREE.Color('#2fd27a')];
  const apagados = [new THREE.Color('#2a1213'), new THREE.Color('#2e2508'), new THREE.Color('#0c2416')];
  const lamparas = [];
  const brillos = [];
  const texBrillo = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    r.addColorStop(0, 'rgba(255,255,255,0.55)');
    r.addColorStop(0.3, 'rgba(255,255,255,0.28)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  [1.1, 0, -1.1].forEach((y, i) => {
    const mat = new THREE.MeshPhysicalMaterial({ color: apagados[i], emissive: coloresLuz[i], emissiveIntensity: 0, roughness: 0.15, clearcoat: 1, transmission: 0 });
    const lampara = new THREE.Mesh(new THREE.SphereGeometry(0.4, 40, 24), mat);
    lampara.position.set(0, 3.35 + y, 0.36);
    lampara.scale.z = 0.7;
    semaforo.add(lampara);
    lamparas.push(lampara);
    const visera = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.42, 32, 1, true, -Math.PI / 2, Math.PI), plasticoNegro);
    visera.material = plasticoNegro.clone();
    visera.material.side = THREE.DoubleSide;
    visera.rotation.x = Math.PI / 2;
    visera.rotation.y = Math.PI;
    visera.position.set(0, 3.35 + y + 0.04, 0.62);
    visera.castShadow = true;
    semaforo.add(visera);
    const brillo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrillo, color: coloresLuz[i], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
    brillo.position.set(0, 3.35 + y, 0.75);
    brillo.scale.setScalar(2.6);
    semaforo.add(brillo);
    brillos.push(brillo);
  });
  const luzPuntual = new THREE.PointLight('#e5484d', 0, 14, 1.6);
  luzPuntual.position.set(0, 3.4, 1.6);
  semaforo.add(luzPuntual);

  // --- Gente (muñecos de plastilina, como en el anuncio) -------------------
  const N = esMovil() ? 34 : 56;
  const rnd = azar(7);
  const cuerpoGeo = new THREE.CapsuleGeometry(0.24, 0.55, 6, 14);
  cuerpoGeo.translate(0, 0.52, 0);
  const cabezaGeo = new THREE.SphereGeometry(0.21, 24, 16);
  const matCuerpo = new THREE.MeshStandardMaterial({ roughness: 0.55 });
  const matCabeza = new THREE.MeshStandardMaterial({ color: '#e6b08a', roughness: 0.6 });
  const cuerpos = new THREE.InstancedMesh(cuerpoGeo, matCuerpo, N);
  const cabezas = new THREE.InstancedMesh(cabezaGeo, matCabeza, N);
  cuerpos.castShadow = cabezas.castShadow = true;
  cuerpos.receiveShadow = true;
  escena.add(cuerpos, cabezas);
  const rojos = ['#e5484d', '#b42318', '#c7363b', '#8f1d1f', '#d9575b'].map((c) => new THREE.Color(c));
  const verdes = ['#2fd27a', '#14532d', '#f7f8f5', '#9fd9b4', '#1f8f52'].map((c) => new THREE.Color(c));
  const gente = [];
  for (let i = 0; i < N; i++) {
    // Cola: amontonados alrededor del semáforo
    let ax, az;
    do {
      const ang = rnd() * Math.PI * 2;
      const rad = 1.4 + Math.sqrt(rnd()) * 4.6;
      ax = Math.cos(ang) * rad * 1.25;
      az = Math.sin(ang) * rad * 0.8 - 0.6;
    } while (Math.hypot(ax, az + 0.6) < 1.3);
    // Reparto: espaciados por todo el suelo
    const col = i % 8;
    const fila = Math.floor(i / 8);
    const bx = (col - 3.5) * 3.4 + (rnd() - 0.5) * 1.2;
    const bz = -fila * 2.6 + 1.5 + (rnd() - 0.5) * 1.0;
    gente.push({
      a: new THREE.Vector3(ax, 0, az),
      b: new THREE.Vector3(bx, 0, bz),
      retraso: rnd() * 0.35,
      fase: rnd() * Math.PI * 2,
      escala: 0.9 + rnd() * 0.25,
      rojo: rojos[i % rojos.length],
      verde: verdes[i % verdes.length],
      rango: i / N,
    });
  }
  const tmp = new THREE.Object3D();
  const tmpColor = new THREE.Color();

  // --- Barrio de gimnasios (bloques blancos, como en el anuncio) ------------
  const barrio = new THREE.Group();
  escena.add(barrio);
  const COLS = esMovil() ? 9 : 14;
  const FILAS = esMovil() ? 9 : 10;
  const bloqueGeo = new RoundedBoxGeometry(1, 1, 1, 3, 0.12);
  bloqueGeo.translate(0, 0.5, 0);
  const bloques = new THREE.InstancedMesh(bloqueGeo, new THREE.MeshStandardMaterial({ color: '#f7f8f5', roughness: 0.7 }), COLS * FILAS);
  bloques.castShadow = bloques.receiveShadow = true;
  barrio.add(bloques);
  const datosBloques = [];
  const rb = azar(42);
  const nombresGym = ['FitZone Lavapiés', 'Gimnasio Centro', 'Box Malasaña', 'Club Chamberí', 'Energy Retiro', 'Barrio Fit Usera', 'Gym Arganzuela', 'Forma Tetuán', 'Pulso Salamanca', 'Núcleo Latina', 'Vértice Moncloa', 'Ritmo Carabanchel'];
  const gyms = [];
  for (let f = 0; f < FILAS; f++) {
    for (let c = 0; c < COLS; c++) {
      const x = (c - (COLS - 1) / 2) * 1.55;
      const z = (f - (FILAS - 1) / 2) * 1.55;
      const h = 0.35 + rb() * 1.1;
      datosBloques.push({ x, z, h, retraso: Math.hypot(x, z) / 18 + rb() * 0.12 });
      if (gyms.length < nombresGym.length && rb() < 0.12) gyms.push({ x, z });
    }
  }
  while (gyms.length < nombresGym.length) {
    const d = datosBloques[Math.floor(rb() * datosBloques.length)];
    if (!gyms.some((g) => g.x === d.x && g.z === d.z)) gyms.push({ x: d.x, z: d.z });
  }
  const gymGeo = new RoundedBoxGeometry(1.15, 1, 1.15, 3, 0.14);
  gymGeo.translate(0, 0.5, 0);
  const gymMesh = new THREE.InstancedMesh(gymGeo, new THREE.MeshPhysicalMaterial({ roughness: 0.35, clearcoat: 0.6 }), gyms.length);
  gymMesh.castShadow = true;
  barrio.add(gymMesh);
  const hazGeo = new THREE.CylinderGeometry(0.25, 0.7, 6, 24, 1, true);
  hazGeo.translate(0, 3, 0);
  const haces = [];
  gyms.forEach((g, i) => {
    g.nombre = nombresGym[i];
    g.cap = 120 + Math.round(rb() * 160);
    g.p = 0.2 + rb() * 0.75;
    g.objetivo = g.p;
    g.vis = g.p;
    const haz = new THREE.Mesh(hazGeo, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
    haz.position.set(g.x, 0, g.z);
    barrio.add(haz);
    haces.push(haz);
  });
  const cTotal = document.getElementById('c-total');

  // --- Fotogramas clave por sección -----------------------------------------
  const C = (h) => new THREE.Color(h);
  const claves = {
    cola:      { cam: [0, 3.0, 12.5], mira: [0, 2.7, 0], lx: 2.7, ly: 0, luz: 0, mezcla: 0, apretar: 0, gente: 1, barrio: 0, fondo: C('#0f2a1c'), suelo: C('#123a24'), velo: 'izq' },
    agobio:    { cam: [-1.5, 7.5, 10.5], mira: [1.2, 1.2, 0], lx: 4.4, ly: 0, luz: 0, mezcla: 0, apretar: 1, gente: 1, barrio: 0, fondo: C('#0b1f15'), suelo: C('#0f2a1c'), velo: 'izq' },
    giro:      { cam: [0, 3.2, 11.5], mira: [0, 2.9, 0], lx: 0, ly: 0, luz: 2, mezcla: 1, apretar: 0, gente: 1, barrio: 0, fondo: C('#14532d'), suelo: C('#1b6a3a'), velo: 'centro' },
    semaforo:  { cam: [0, 3.0, 11], mira: [0, 2.9, 0], lx: 3.1, ly: 0, luz: 'slider', mezcla: 1, apretar: 0, gente: 0.7, barrio: 0, fondo: C('#12482a'), suelo: C('#175c35'), velo: 'off' },
    torno:     { cam: [1, 4.0, 12], mira: [1.5, 2.6, 0], lx: 6.2, ly: -0.6, luz: 'torno', mezcla: 1, apretar: 0, gente: 0.7, barrio: 0, fondo: C('#0f3d24'), suelo: C('#134a2c'), velo: 'izq' },
    ciudad:    { cam: [11, 13, 16], mira: [1.5, 0, 0], lx: 0, ly: -9, luz: 2, mezcla: 1, apretar: 0, gente: 0, barrio: 1, fondo: C('#14532d'), suelo: C('#1b6a3a'), velo: 'izq' },
    negocio:   { cam: [2, 24, 10], mira: [0, 0, -1], lx: 0, ly: -9, luz: 2, mezcla: 1, apretar: 0, gente: 0, barrio: 1, fondo: C('#0f2a1c'), suelo: C('#14532d'), velo: 'fuerte' },
    anuncio:   { cam: [0, 3.4, 13], mira: [0, 2.8, 0], lx: 1.3, ly: -9, luz: 2, mezcla: 1, apretar: 0, gente: 0.6, barrio: 0, fondo: C('#11452a'), suelo: C('#155232'), velo: 'izq' },
    final:     { cam: [0, 2.6, 15], mira: [0, 3.4, 0], lx: 7.6, ly: -0.4, luz: 2, mezcla: 1, apretar: 0, gente: 1, barrio: 0, fondo: C('#14532d'), suelo: C('#1b6a3a'), velo: 'centro' },
  };
  const secciones = [...document.querySelectorAll('[data-escena]')];

  // Valores actuales (se suavizan hacia el objetivo en cada fotograma)
  const actual = {
    cam: new THREE.Vector3(0, 3.0, 12.5), mira: new THREE.Vector3(0, 2.7, 0),
    lx: 2.7, ly: 0, luz: 2, mezcla: 0, apretar: 0, gente: 1, barrio: 0, cuantos: 0.25, giro: 0,
    fondo: new THREE.Color('#14532d'), suelo: new THREE.Color('#1b6a3a'),
  };
  const fondoVacio = new THREE.Color('#14532d');
  const sueloVacio = new THREE.Color('#1b6a3a');
  const objetivo = { cam: new THREE.Vector3(), mira: new THREE.Vector3(), fondo: new THREE.Color(), suelo: new THREE.Color() };

  function resolverLuz(v) {
    if (v === 'slider') return interactivo.luzSlider;
    if (v === 'torno') return interactivo.luzTorno;
    return v;
  }
  function ajustarMovil(k) {
    // En móvil el texto ocupa todo el ancho: el semáforo va al centro y más atrás
    if (!esMovil()) return k;
    return { ...k, lx: Math.abs(k.lx) > 1 ? 0 : k.lx, ly: k.ly - 0.8, cam: [k.cam[0] * 0.6, k.cam[1] + 0.6, k.cam[2] + 5] };
  }

  let veloActual = '';
  function calcularObjetivo() {
    const centro = window.scrollY + window.innerHeight / 2;
    let i = 0;
    const centros = secciones.map((s) => ('fija' in s.dataset ? s.offsetTop + s.offsetHeight - window.innerHeight / 2 : s.offsetTop + s.offsetHeight / 2));
    while (i < centros.length - 1 && centros[i + 1] <= centro) i++;
    const j = Math.min(i + 1, centros.length - 1);
    let t = j === i ? 0 : clamp((centro - centros[i]) / (centros[j] - centros[i]), 0, 1);
    if (centro < centros[0]) t = 0;
    t = suave(t);
    const A = ajustarMovil(claves[secciones[i].dataset.escena]);
    const B = ajustarMovil(claves[secciones[j].dataset.escena]);
    objetivo.cam.set(lerp(A.cam[0], B.cam[0], t), lerp(A.cam[1], B.cam[1], t), lerp(A.cam[2], B.cam[2], t));
    objetivo.mira.set(lerp(A.mira[0], B.mira[0], t), lerp(A.mira[1], B.mira[1], t), lerp(A.mira[2], B.mira[2], t));
    for (const k of ['lx', 'ly', 'mezcla', 'apretar', 'gente', 'barrio']) objetivo[k] = lerp(A[k], B[k], t);
    objetivo.luz = lerp(resolverLuz(A.luz), resolverLuz(B.luz), t);
    objetivo.fondo.copy(A.fondo).lerp(B.fondo, t);
    objetivo.suelo.copy(A.suelo).lerp(B.suelo, t);
    // Portada: mientras está fija, el scroll es la tarde que pasa (ver pintarHero)
    objetivo.cuantos = 1;
    objetivo.giro = Math.sin(suave(hero.p) * Math.PI * 2) * 0.45;
    if (i === 0) {
      const h = 1 - t;
      const lleno = suave(hero.p);
      objetivo.luz = lerp(objetivo.luz, estadoDe(hero.pct).luz, h);
      objetivo.cuantos = lerp(1, 0.22 + 0.78 * lleno, h);
      objetivo.apretar = lerp(objetivo.apretar, lleno * 0.8, h);
      objetivo.cam.x += Math.sin(lleno * Math.PI) * -2.6 * h;
      objetivo.cam.y += lleno * 1.2 * h;
      objetivo.cam.z -= lleno * 1.6 * h;
      objetivo.fondo.lerp(fondoVacio, (1 - lleno) * h);
      objetivo.suelo.lerp(sueloVacio, (1 - lleno) * h);
    }
    const velo = t < 0.5 ? A.velo : B.velo;
    if (velo !== veloActual) {
      document.body.classList.remove('velo-centro', 'velo-off', 'velo-fuerte');
      if (velo === 'centro') document.body.classList.add('velo-centro');
      if (velo === 'fuerte') document.body.classList.add('velo-fuerte');
      if (velo === 'off' && !esMovil()) document.body.classList.add('velo-off');
      veloActual = velo;
    }
  }

  // Ratón: pequeño paralaje con muelle
  const raton = { x: 0, y: 0, sx: 0, sy: 0 };
  window.addEventListener('pointermove', (e) => {
    raton.x = e.clientX / window.innerWidth - 0.5;
    raton.y = e.clientY / window.innerHeight - 0.5;
    puntero.x = (e.clientX / window.innerWidth) * 2 - 1;
    puntero.y = -(e.clientY / window.innerHeight) * 2 + 1;
    punteroPx.x = e.clientX;
    punteroPx.y = e.clientY;
  }, { passive: true });

  // Empujón al semáforo cuando alguien "entra" por el torno
  let sacudida = 0;
  empujon = () => { if (!reducido) sacudida = 1; };

  // Etiquetas al pasar sobre un gimnasio
  const rayo = new THREE.Raycaster();
  const puntero = new THREE.Vector2(9, 9);
  const punteroPx = { x: 0, y: 0 };
  const etiqueta = document.getElementById('etiqueta');
  let gymSeñalado = -1;
  lienzo.style.pointerEvents = 'none';
  // El lienzo está detrás del texto: escuchamos en la sección y lanzamos el rayo
  const secCiudad = document.getElementById('ciudad');
  secCiudad.addEventListener('click', (e) => {
    puntero.x = (e.clientX / window.innerWidth) * 2 - 1;
    puntero.y = -(e.clientY / window.innerHeight) * 2 + 1;
    punteroPx.x = e.clientX;
    punteroPx.y = e.clientY;
  });

  function actualizarEtiqueta() {
    if (actual.barrio < 0.9) {
      if (gymSeñalado !== -1) { etiqueta.classList.remove('visible'); gymSeñalado = -1; }
      return;
    }
    rayo.setFromCamera(puntero, camara);
    const golpe = rayo.intersectObject(gymMesh, false)[0];
    const id = golpe ? golpe.instanceId : -1;
    if (id !== gymSeñalado) {
      gymSeñalado = id;
      if (id >= 0) {
        etiqueta.hidden = false;
        requestAnimationFrame(() => etiqueta.classList.add('visible'));
      } else {
        etiqueta.classList.remove('visible');
      }
    }
    if (id >= 0) {
      const g = gyms[id];
      const est = estadoDe(g.vis);
      etiqueta.innerHTML = `<i style="background:${est.color}"></i>${g.nombre} · ${Math.round(g.vis * 100)} %`;
      etiqueta.style.left = `${punteroPx.x}px`;
      etiqueta.style.top = `${punteroPx.y}px`;
    }
  }

  // Datos simulados del barrio: cambian un poco cada pocos segundos
  setInterval(() => {
    gyms.forEach((g) => { g.objetivo = clamp(g.objetivo + (Math.random() - 0.5) * 0.16, 0.12, 0.96); });
  }, 2600);

  // Redimensionar
  function alRedimensionar() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h;
    camara.fov = w < h ? 46 : 34;
    camara.updateProjectionMatrix();
  }
  window.addEventListener('resize', alRedimensionar);
  alRedimensionar();

  // --- Bucle ----------------------------------------------------------------
  const reloj = new THREE.Clock();
  const colorLuz = new THREE.Color();
  let primerFotograma = true;

  function fotograma() {
    const dt = Math.min(reloj.getDelta(), 0.05);
    const t = reloj.elapsedTime;
    calcularObjetivo();

    const k = reducido ? 1 : 1 - Math.exp(-dt * 4.2);
    const kLuz = reducido ? 1 : 1 - Math.exp(-dt * 6);
    actual.cam.lerp(objetivo.cam, k);
    actual.mira.lerp(objetivo.mira, k);
    for (const key of ['lx', 'ly', 'mezcla', 'apretar', 'gente', 'barrio', 'cuantos', 'giro']) actual[key] = lerp(actual[key], objetivo[key], k);
    actual.luz = lerp(actual.luz, objetivo.luz, kLuz);
    actual.fondo.lerp(objetivo.fondo, k);
    actual.suelo.lerp(objetivo.suelo, k);
    raton.sx = lerp(raton.sx, raton.x, reducido ? 0 : 1 - Math.exp(-dt * 3));
    raton.sy = lerp(raton.sy, raton.y, reducido ? 0 : 1 - Math.exp(-dt * 3));

    // Fondo, niebla y suelo
    escena.background.copy(actual.fondo);
    escena.fog.color.copy(actual.fondo);
    sueloMat.color.copy(actual.suelo);
    hemi.groundColor.copy(actual.fondo);

    // Cámara
    camara.position.set(actual.cam.x + raton.sx * 1.4, actual.cam.y - raton.sy * 0.7, actual.cam.z);
    camara.lookAt(actual.mira);

    // Semáforo
    sacudida = Math.max(0, sacudida - dt * 2.5);
    semaforo.position.set(actual.lx, actual.ly, 0);
    semaforo.rotation.y = actual.giro - raton.sx * 0.35 + Math.sin(t * 0.6) * 0.04 + Math.sin(t * 40) * 0.05 * sacudida;
    semaforo.rotation.z = Math.sin(t * 34) * 0.02 * sacudida;
    let intensMax = 0;
    lamparas.forEach((l, i) => {
      // índice de luz: 0 rojo (arriba), 1 ámbar, 2 verde (abajo)
      const on = clamp(1 - Math.abs(actual.luz - i) * 1.6, 0, 1);
      l.material.emissiveIntensity = on * 0.9;
      l.material.color.copy(apagados[i]).lerp(coloresLuz[i], on * 0.55);
      brillos[i].material.opacity = on * 0.85;
      brillos[i].scale.setScalar(2.2 + on * 0.8 + Math.sin(t * 2.2) * 0.08 * on);
      intensMax = Math.max(intensMax, on);
    });
    const li = clamp(actual.luz, 0, 2);
    if (li <= 1) colorLuz.copy(coloresLuz[0]).lerp(coloresLuz[1], li);
    else colorLuz.copy(coloresLuz[1]).lerp(coloresLuz[2], li - 1);
    luzPuntual.color.copy(colorLuz);
    luzPuntual.intensity = 22 * intensMax;
    const luzRedondeada = Math.round(actual.luz);
    const nombreLuz = ['rojo', 'ambar', 'verde'][luzRedondeada];
    if (document.body.dataset.luz !== nombreLuz) document.body.dataset.luz = nombreLuz;

    // Gente
    const visible = actual.gente;
    for (let i = 0; i < N; i++) {
      const p = gente[i];
      const m = clamp((actual.mezcla * 1.35 - p.retraso), 0, 1);
      const me = suave(m);
      const apretar = 1 - actual.apretar * 0.3;
      const x = lerp(p.a.x * apretar, p.b.x, me) + actual.lx * (1 - me) * 0.85;
      const z = lerp(p.a.z * apretar, p.b.z, me);
      const salto = Math.sin(me * Math.PI) * 1.1;
      const balanceo = reducido ? 0 : Math.sin(t * 2 + p.fase) * 0.035;
      const esc = p.escala * clamp(visible * 1.2 - p.retraso * 0.6, 0.001, 1) * Math.max(0.001, suave(clamp((actual.cuantos - p.rango) * 8, 0, 1)));
      tmp.position.set(x, salto, z);
      tmp.rotation.set(0, Math.atan2(actual.lx - x, 0 - z) * (1 - me), balanceo + (1 - me) * actual.apretar * Math.sin(t * 6 + p.fase) * 0.05);
      tmp.scale.setScalar(esc);
      tmp.updateMatrix();
      cuerpos.setMatrixAt(i, tmp.matrix);
      tmp.position.y = salto + (0.52 + 0.55 / 2 + 0.24 + 0.2) * esc;
      tmp.updateMatrix();
      cabezas.setMatrixAt(i, tmp.matrix);
      tmpColor.copy(p.rojo).lerp(p.verde, me);
      cuerpos.setColorAt(i, tmpColor);
    }
    cuerpos.instanceMatrix.needsUpdate = true;
    cabezas.instanceMatrix.needsUpdate = true;
    cuerpos.instanceColor.needsUpdate = true;
    const hayGente = visible > 0.01;
    cuerpos.visible = cabezas.visible = hayGente;

    // Barrio: los bloques salen del suelo en ola desde el centro
    const b = actual.barrio;
    barrio.visible = b > 0.005;
    if (barrio.visible) {
      datosBloques.forEach((d, i) => {
        const s = suave(clamp(b * 1.6 - d.retraso, 0, 1));
        tmp.position.set(d.x, 0, d.z);
        tmp.rotation.set(0, 0, 0);
        tmp.scale.set(1, Math.max(0.001, d.h * s), 1);
        tmp.updateMatrix();
        bloques.setMatrixAt(i, tmp.matrix);
      });
      bloques.instanceMatrix.needsUpdate = true;
      let total = 0;
      gyms.forEach((g, i) => {
        g.vis = lerp(g.vis, g.objetivo, 1 - Math.exp(-dt * 1.5));
        const s = suave(clamp(b * 1.5 - 0.15, 0, 1));
        const alto = (1 + g.vis * 3.2) * s;
        tmp.position.set(g.x, 0, g.z);
        tmp.scale.set(1, Math.max(0.001, alto), 1);
        tmp.updateMatrix();
        gymMesh.setMatrixAt(i, tmp.matrix);
        const est = estadoDe(g.vis);
        tmpColor.set(est.color);
        if (i === gymSeñalado) tmpColor.offsetHSL(0, 0, 0.12);
        gymMesh.setColorAt(i, tmpColor);
        haces[i].material.color.set(est.color);
        haces[i].material.opacity = 0.16 * s;
        haces[i].scale.y = s;
        haces[i].position.y = alto * 0.95;
        total += Math.round(g.vis * g.cap);
      });
      gymMesh.instanceMatrix.needsUpdate = true;
      if (gymMesh.instanceColor) gymMesh.instanceColor.needsUpdate = true;
      const txt = String(total);
      if (cTotal.textContent !== txt) cTotal.textContent = txt;
      actualizarEtiqueta();
    }

    renderer.render(escena, camara);
    if (primerFotograma) {
      primerFotograma = false;
      document.body.classList.add('listo');
    }
    requestAnimationFrame(fotograma);
  }

  // Raycast necesita la sección por encima del lienzo: escuchamos el movimiento global
  requestAnimationFrame(fotograma);
}

// Si las fuentes tardan, mostramos el titular igualmente
setTimeout(() => document.body.classList.add('listo'), 1200);
