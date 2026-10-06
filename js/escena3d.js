// Portada en 3D: un mapa de Madrid donde cada gimnasio es una columna.
// La altura de la columna es la gente que hay dentro ahora mismo (sale de los tornos)
// y su color es el del semáforo. Cada paso por un torno deja una onda en el suelo.

(function () {
  const escena = document.getElementById("escena");
  const canvas = document.getElementById("escena-3d");
  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof THREE === "undefined") {
    escena.classList.add("sin-3d");
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    escena.classList.add("sin-3d");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const COLORES = {
    verde: new THREE.Color("#3ddc84"),
    amarillo: new THREE.Color("#ffcc33"),
    rojo: new THREE.Color("#ff6b5e"),
    cerrado: new THREE.Color("#4a5a4f"),
  };
  const ALTURA_MAXIMA = 9;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0c1410, 38, 80);

  const camara = new THREE.PerspectiveCamera(32, 1, 0.1, 200);

  // Luces
  scene.add(new THREE.HemisphereLight(0xdfffea, 0x0c1410, 0.55));
  const sol = new THREE.DirectionalLight(0xffffff, 0.9);
  sol.position.set(12, 24, 10);
  scene.add(sol);

  // Proyección sencilla de latitud/longitud a coordenadas de la escena
  const centroLat = BARRIOS.reduce((s, b) => s + b.lat, 0) / BARRIOS.length;
  const centroLng = BARRIOS.reduce((s, b) => s + b.lng, 0) / BARRIOS.length;
  const ESCALA = 320;
  function posicion(lat, lng) {
    return { x: (lng - centroLng) * ESCALA, z: -(lat - centroLat) * ESCALA * 1.3 };
  }

  // Suelo con rejilla
  const rejilla = new THREE.GridHelper(80, 40, 0x26372d, 0x16231b);
  rejilla.position.y = -0.01;
  scene.add(rejilla);

  // Un disco por barrio
  const materialBarrio = new THREE.MeshStandardMaterial({ color: 0x142019, roughness: 1 });
  for (const b of BARRIOS) {
    const disco = new THREE.Mesh(new THREE.CircleGeometry(2.9, 48), materialBarrio);
    const p = posicion(b.lat, b.lng);
    disco.rotation.x = -Math.PI / 2;
    disco.position.set(p.x, 0, p.z);
    scene.add(disco);
  }

  // Una columna por gimnasio (más ancha cuanto más grande es)
  const geometria = new THREE.BoxGeometry(1, 1, 1);
  geometria.translate(0, 0.5, 0); // que crezca desde el suelo
  const columnas = {};
  GIMNASIOS.forEach((g, i) => {
    const material = new THREE.MeshStandardMaterial({ color: COLORES.verde.clone(), roughness: 0.45, metalness: 0.1, emissive: COLORES.verde.clone(), emissiveIntensity: 0.18 });
    const malla = new THREE.Mesh(geometria, material);
    const p = posicion(g.lat, g.lng);
    const lado = 0.6 + Math.sqrt(g.capacidad / 100) * 0.55;
    malla.position.set(p.x, 0, p.z);
    malla.scale.set(lado, 0.001, lado);
    scene.add(malla);
    columnas[g.id] = { malla, altura: 0, velocidad: 0, retraso: reducirMovimiento ? 0 : 0.25 + i * 0.035 };
  });


  // Ondas en el suelo cuando alguien pasa por un torno
  const ondas = [];
  const geometriaOnda = new THREE.RingGeometry(0.55, 0.7, 40);
  alPasarPorTorno((paso) => {
    if (reducirMovimiento || ondas.length > 24 || !visible) return;
    const color = paso.tipo === "entrada" ? COLORES.verde : new THREE.Color("#eaf2ec");
    const onda = new THREE.Mesh(geometriaOnda, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8, depthWrite: false }));
    const p = posicion(paso.gimnasio.lat, paso.gimnasio.lng);
    onda.rotation.x = -Math.PI / 2;
    onda.position.set(p.x, 0.02, p.z);
    scene.add(onda);
    ondas.push({ malla: onda, vida: 0 });
  });

  // Cámara: gira despacio y sigue un poco al ratón, con amortiguación
  let angulo = 0.6;
  const raton = { x: 0, y: 0 };
  const suave = { x: 0, y: 0 };
  escena.addEventListener("pointermove", (e) => {
    const caja = escena.getBoundingClientRect();
    raton.x = ((e.clientX - caja.left) / caja.width) * 2 - 1;
    raton.y = ((e.clientY - caja.top) / caja.height) * 2 - 1;
  });
  escena.addEventListener("pointerleave", () => { raton.x = 0; raton.y = 0; });

  function ajustarTamano() {
    const ancho = canvas.clientWidth;
    const alto = canvas.clientHeight;
    if (!ancho || !alto) return;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    // En pantallas estrechas alejamos la cámara para que quepa todo
    camara.userData.distancia = camara.aspect < 1.3 ? 44 : 37;
    // En escritorio subimos un poco la ciudad para dejar sitio al contador de abajo
    if (camara.aspect >= 1.3) camara.setViewOffset(ancho, alto, 0, alto * 0.14, ancho, alto);
    else camara.clearViewOffset();
    camara.updateProjectionMatrix();
  }
  new ResizeObserver(ajustarTamano).observe(canvas);
  ajustarTamano();

  // Solo animamos si la portada se ve y la pestaña está activa
  let visible = true;
  new IntersectionObserver(([entrada]) => { visible = entrada.isIntersecting; }).observe(escena);

  const reloj = new THREE.Clock();
  let tiempo = 0;
  function fotograma() {
    requestAnimationFrame(fotograma);
    if (!visible || document.hidden) { reloj.getDelta(); return; }
    const dt = Math.min(reloj.getDelta(), 0.05);
    tiempo += dt;
    const abierto = estaAbierto(horaActual());

    // Columnas: muelle hacia la altura que marcan los tornos
    for (const g of GIMNASIOS) {
      const c = columnas[g.id];
      const dentro = estadoTornos[g.id] ? estadoTornos[g.id].dentro : 0;
      const objetivo = tiempo < c.retraso ? 0.001 : Math.max((dentro / g.capacidad) * ALTURA_MAXIMA, 0.08);
      if (reducirMovimiento) {
        c.altura = objetivo;
      } else {
        c.velocidad += (objetivo - c.altura) * 60 * dt;
        c.velocidad *= Math.pow(0.0009, dt); // amortiguación
        c.altura += c.velocidad * dt;
      }
      c.malla.scale.y = Math.max(c.altura, 0.001);

      const color = abierto ? COLORES[semaforo(porcentaje(dentro, g.capacidad)).color] : COLORES.cerrado;
      c.malla.material.color.lerp(color, 0.08);
      c.malla.material.emissive.lerp(color, 0.08);
    }

    // Ondas: crecen y se desvanecen
    for (let i = ondas.length - 1; i >= 0; i--) {
      const o = ondas[i];
      o.vida += dt;
      const t = o.vida / 1.1;
      o.malla.scale.setScalar(1 + t * 2.6);
      o.malla.material.opacity = 0.8 * (1 - t);
      if (t >= 1) {
        scene.remove(o.malla);
        o.malla.material.dispose();
        ondas.splice(i, 1);
      }
    }

    if (!reducirMovimiento) angulo += dt * 0.07;
    suave.x += (raton.x - suave.x) * Math.min(dt * 3, 1);
    suave.y += (raton.y - suave.y) * Math.min(dt * 3, 1);
    const distancia = camara.userData.distancia || 40;
    const a = angulo + suave.x * 0.35;
    camara.position.set(Math.sin(a) * distancia, 15 + suave.y * 4, Math.cos(a) * distancia);
    camara.lookAt(0, 2.5, 0);

    renderer.render(scene, camara);
  }
  fotograma();
})();
