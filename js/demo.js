// Demo en directo: mapa por barrios, aforo exacto de cada gimnasio y pasos por los tornos

const ZOOM_GIMNASIOS = 15;   // a partir de este zoom el mapa enseña cada gimnasio

let barrioElegido = BARRIOS[0].id;
let gimnasioElegido = gimnasiosDe(barrioElegido)[0].id;
let mapa = null;
const marcadoresBarrio = {};    // id del barrio -> marcador
const marcadoresGimnasio = {};  // id del gimnasio -> marcador
let capaBarrios = null;
let capaGimnasios = null;
let pendiente = false;          // para no repintar más de una vez por fotograma

// ---------- Cálculos ----------
function datosGimnasio(g) {
  const dentro = estadoTornos[g.id].dentro;
  const p = porcentaje(dentro, g.capacidad);
  return { dentro, p, s: semaforo(p) };
}

// El porcentaje de un barrio es la gente de todos sus gimnasios entre su aforo total
function datosBarrio(b) {
  let dentro = 0;
  let capacidad = 0;
  for (const g of gimnasiosDe(b.id)) {
    dentro += estadoTornos[g.id].dentro;
    capacidad += g.capacidad;
  }
  const p = porcentaje(dentro, capacidad);
  return { dentro, capacidad, p, s: semaforo(p) };
}

// ---------- Mapa ----------
function iniciarMapa() {
  const contenedor = document.getElementById("mapa");
  if (typeof L === "undefined") {
    contenedor.classList.add("mapa-sin-conexion");
    contenedor.textContent = "El mapa necesita conexión a internet. Los barrios y gimnasios de al lado siguen en directo.";
    return;
  }
  mapa = L.map(contenedor, { scrollWheelZoom: false }).setView([40.43, -3.695], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa);

  capaBarrios = L.layerGroup().addTo(mapa);
  capaGimnasios = L.layerGroup();

  for (const b of BARRIOS) {
    const icono = L.divIcon({ className: "pin-caja", html: `<button class="pin-barrio"><b></b><span>${b.nombre}</span></button>`, iconSize: [96, 84], iconAnchor: [48, 32] });
    const m = L.marker([b.lat, b.lng], { icon: icono, keyboard: false, title: b.nombre }).addTo(capaBarrios);
    m.on("click", () => elegirBarrio(b.id, true));
    marcadoresBarrio[b.id] = m;
  }
  for (const g of GIMNASIOS) {
    const icono = L.divIcon({ className: "pin-caja", html: '<button class="pin-gim"><b></b><span></span></button>', iconSize: [76, 30], iconAnchor: [38, 15] });
    const m = L.marker([g.lat, g.lng], { icon: icono, keyboard: false, title: g.nombre }).addTo(capaGimnasios);
    m.on("click", () => elegirGimnasio(g.id));
    marcadoresGimnasio[g.id] = m;
  }

  verTodoMadrid();
  // Lejos se ven los barrios; cerca, cada gimnasio
  mapa.on("zoomend", () => {
    const cerca = mapa.getZoom() >= ZOOM_GIMNASIOS;
    if (cerca) { mapa.removeLayer(capaBarrios); capaGimnasios.addTo(mapa); }
    else { mapa.removeLayer(capaGimnasios); capaBarrios.addTo(mapa); }
    document.getElementById("ver-todo").hidden = !cerca;
    pintar();
  });
  document.getElementById("ver-todo").addEventListener("click", verTodoMadrid);
}

function verTodoMadrid() {
  if (!mapa) return;
  mapa.fitBounds(L.latLngBounds(BARRIOS.map((b) => [b.lat, b.lng])), { padding: [48, 48] });
}

// ---------- Elegir barrio y gimnasio ----------
function elegirBarrio(id, acercar) {
  barrioElegido = id;
  const enBarrio = gimnasiosDe(id);
  if (!enBarrio.some((g) => g.id === gimnasioElegido)) gimnasioElegido = enBarrio[0].id;
  if (acercar && mapa) {
    const b = BARRIOS.find((x) => x.id === id);
    mapa.flyTo([b.lat + 0.0008, b.lng + 0.0006], ZOOM_GIMNASIOS + 0.4, { duration: 0.8 });
  }
  pintarGrafica();
  pintar();
}

function elegirGimnasio(id) {
  gimnasioElegido = id;
  barrioElegido = GIMNASIOS.find((g) => g.id === id).barrio;
  pintarGrafica();
  pintar();
}

// ---------- Listas ----------
function iniciarListas() {
  const barrios = document.getElementById("barrios");
  for (const b of BARRIOS) {
    barrios.innerHTML += `
      <li><button class="chip-barrio" data-id="${b.id}">
        <span class="punto"></span><span class="chip-nombre">${b.nombre}</span><span class="chip-cifra"></span>
      </button></li>`;
  }
  barrios.addEventListener("click", (e) => {
    const boton = e.target.closest(".chip-barrio");
    if (boton) elegirBarrio(boton.dataset.id, true);
  });

  document.getElementById("b-gimnasios").addEventListener("click", (e) => {
    const boton = e.target.closest(".fila-gim");
    if (boton) elegirGimnasio(boton.dataset.id);
  });
}

// ---------- Pintar ----------
function pintar() {
  pendiente = false;
  const hora = horaActual();
  const abierto = estaAbierto(hora);

  pintarBarriosMapa(abierto);
  pintarGimnasiosMapa(abierto);
  pintarChips(abierto);
  pintarBarrio(abierto);
  pintarDetalle(hora, abierto);
  pintarPortada(hora);
}

function pintarBarriosMapa(abierto) {
  for (const b of BARRIOS) {
    const m = marcadoresBarrio[b.id];
    if (!m || !m.getElement()) continue;
    const { p, s } = datosBarrio(b);
    const pin = m.getElement().querySelector(".pin-barrio");
    pin.className = `pin-barrio ${abierto ? s.color : "cerrado"}${b.id === barrioElegido ? " elegido" : ""}`;
    pin.querySelector("b").textContent = abierto ? `${p}%` : "—";
  }
}

function pintarGimnasiosMapa(abierto) {
  for (const g of GIMNASIOS) {
    const m = marcadoresGimnasio[g.id];
    if (!m || !m.getElement()) continue;
    const { dentro, s } = datosGimnasio(g);
    const pin = m.getElement().querySelector(".pin-gim");
    pin.className = `pin-gim ${abierto ? s.color : "cerrado"}${g.id === gimnasioElegido ? " elegido" : ""}`;
    pin.querySelector("b").textContent = dentro;
    pin.querySelector("span").textContent = `/${g.capacidad}`;
    m.setZIndexOffset(g.id === gimnasioElegido ? 1000 : 0);
  }
}

function pintarChips(abierto) {
  for (const boton of document.querySelectorAll(".chip-barrio")) {
    const b = BARRIOS.find((x) => x.id === boton.dataset.id);
    const { p, s } = datosBarrio(b);
    boton.className = `chip-barrio ${abierto ? s.color : ""}`;
    boton.setAttribute("aria-pressed", b.id === barrioElegido);
    boton.querySelector(".chip-cifra").textContent = abierto ? `${p} %` : "Cerrado";
  }
}

function pintarBarrio(abierto) {
  const b = BARRIOS.find((x) => x.id === barrioElegido);
  const { dentro, capacidad, p, s } = datosBarrio(b);
  const gimnasios = gimnasiosDe(b.id);

  document.getElementById("barrio-caja").className = `barrio-caja ${abierto ? s.color : "cerrado"}`;
  document.getElementById("b-nombre").textContent = b.nombre;
  document.getElementById("b-resumen").textContent = `${gimnasios.length} gimnasios · ${dentro} de ${capacidad} personas`;
  document.getElementById("b-porcentaje").textContent = abierto ? `${p} %` : "Cerrado";
  document.getElementById("b-relleno").style.transform = `scaleX(${p / 100})`;

  // Una fila por gimnasio, de menos a más lleno, con su aforo exacto
  const lista = document.getElementById("b-gimnasios");
  const ordenados = [...gimnasios].sort((a, c) => datosGimnasio(a).p - datosGimnasio(c).p);
  const ids = ordenados.map((g) => g.id).join();
  if (lista.dataset.ids !== ids) {
    lista.dataset.ids = ids;
    lista.innerHTML = ordenados.map((g) => `
      <li><button class="fila-gim" data-id="${g.id}">
        <span class="punto"></span>
        <span class="fila-texto"><span class="fila-nombre">${g.nombre}</span><small>${g.direccion}</small></span>
        <span class="fila-aforo"><b></b>/${g.capacidad}</span>
        <span class="mini-medidor"><span></span></span>
      </button></li>`).join("");
  }
  for (const boton of lista.querySelectorAll(".fila-gim")) {
    const g = GIMNASIOS.find((x) => x.id === boton.dataset.id);
    const { dentro, p, s } = datosGimnasio(g);
    boton.className = `fila-gim ${abierto ? s.color : ""}`;
    boton.setAttribute("aria-pressed", g.id === gimnasioElegido);
    boton.setAttribute("aria-label", `${g.nombre}: ${dentro} de ${g.capacidad} personas, ${p} %`);
    boton.querySelector(".fila-aforo b").textContent = dentro;
    boton.querySelector(".mini-medidor span").style.transform = `scaleX(${p / 100})`;
  }
}

function pintarDetalle(hora, abierto) {
  const g = GIMNASIOS.find((x) => x.id === gimnasioElegido);
  const { dentro, p, s } = datosGimnasio(g);
  const e = estadoTornos[g.id];

  document.getElementById("detalle").className = `detalle ${abierto ? s.color : "cerrado"}`;
  document.getElementById("d-nombre").textContent = g.nombre;
  document.getElementById("d-direccion").textContent = `${g.direccion} · ${barrioDe(g).nombre}`;
  const estado = document.getElementById("d-estado");
  estado.querySelector(".punto").className = `punto ${s.color}`;
  estado.lastElementChild.textContent = abierto ? s.texto : "Cerrado";
  document.getElementById("d-dentro").textContent = dentro;
  document.getElementById("d-capacidad").textContent = `/ ${g.capacidad}`;
  document.getElementById("d-porcentaje").textContent = p;
  document.getElementById("d-medidor").setAttribute("aria-valuenow", p);
  document.getElementById("d-relleno").style.transform = `scaleX(${p / 100})`;

  const mejor = mejorHora(g, hora);
  document.getElementById("d-mejor").textContent = mejor === null
    ? "abre mañana a las 07:00"
    : `mejor hora: ${formatoHora(mejor)} (${Math.round(ocupacionEsperada(g, mejor) * 100)} %)`;

  // Datos para el gimnasio
  document.getElementById("d-entradas").textContent = e.entradasHoy.toLocaleString("es-ES");
  let pico = HORA_APERTURA;
  for (let h = HORA_APERTURA; h < HORA_CIERRE; h++) if (ocupacionEsperada(g, h) > ocupacionEsperada(g, pico)) pico = h;
  document.getElementById("d-pico").textContent = formatoHora(pico);
  document.getElementById("d-tornos").textContent = `${g.tornos} de ${g.tornos}`;

  document.getElementById("d-lista-tornos").innerHTML = e.ultimoPaso.map((marca, i) => {
    const segundos = Math.max(0, Math.round((Date.now() - marca) / 1000));
    return `<li><span class="latido" aria-hidden="true"></span>Torno ${i + 1}<span>último paso hace ${segundos} s</span></li>`;
  }).join("");

  // Marcar la hora actual en la gráfica
  document.querySelectorAll("#d-grafica .barra").forEach((barra) => {
    const h = Number(barra.dataset.hora);
    barra.classList.toggle("ahora", Math.floor(hora) === h);
    barra.classList.toggle("pasada", h < Math.floor(hora));
  });
}

// Gráfica de previsión: una barra por hora, coloreada según el semáforo
function pintarGrafica() {
  const g = GIMNASIOS.find((x) => x.id === gimnasioElegido);
  const grafica = document.getElementById("d-grafica");
  grafica.innerHTML = "";
  for (let h = HORA_APERTURA; h < HORA_CIERRE; h++) {
    const p = Math.round(ocupacionEsperada(g, h) * 100);
    const s = semaforo(p);
    const barra = document.createElement("div");
    barra.className = `barra ${s.color}`;
    barra.dataset.hora = h;
    barra.dataset.tip = `${formatoHora(h)} · ${p} % · ${s.texto}`;
    barra.tabIndex = 0;
    barra.setAttribute("aria-label", barra.dataset.tip);
    barra.innerHTML = `<span class="barra-relleno" style="transform: scaleY(${Math.max(p, 3) / 100})"></span><span class="barra-hora">${h % 3 === 1 ? h : ""}</span>`;
    grafica.appendChild(barra);
  }
}

function iniciarTooltip() {
  const grafica = document.getElementById("d-grafica");
  const tooltip = document.getElementById("tooltip");
  function mostrar(barra) {
    tooltip.textContent = barra.dataset.tip;
    tooltip.hidden = false;
    const caja = barra.getBoundingClientRect();
    const padre = grafica.parentElement.getBoundingClientRect();
    tooltip.style.left = `${caja.left - padre.left + caja.width / 2}px`;
    tooltip.style.top = `${caja.top - padre.top - 8}px`;
  }
  grafica.addEventListener("pointerover", (e) => { const b = e.target.closest(".barra"); if (b) mostrar(b); });
  grafica.addEventListener("focusin", (e) => { const b = e.target.closest(".barra"); if (b) mostrar(b); });
  grafica.addEventListener("pointerleave", () => { tooltip.hidden = true; });
  grafica.addEventListener("focusout", () => { tooltip.hidden = true; });
}

// ---------- Portada ----------
function pintarPortada(hora) {
  let total = 0;
  for (const g of GIMNASIOS) total += estadoTornos[g.id].dentro;
  document.getElementById("portada-total").textContent = total.toLocaleString("es-ES");
  document.getElementById("portada-gimnasios").textContent = GIMNASIOS.length;
  document.getElementById("portada-reloj").textContent = formatoHora(hora);
}

// ---------- Pasos por los tornos ----------
let ultimoApunte = 0;
function anotarPaso(paso) {
  document.getElementById("portada-paso").innerHTML =
    `<b>${paso.tipo === "entrada" ? "+1" : "−1"}</b> ${paso.gimnasio.nombre} · ${barrioDe(paso.gimnasio).nombre}, torno ${paso.torno}`;

  // En la lista apuntamos como mucho un paso cada 400 ms para que se pueda leer
  if (Date.now() - ultimoApunte < 400) return;
  ultimoApunte = Date.now();
  const feed = document.getElementById("feed");
  const li = document.createElement("li");
  li.className = `paso-${paso.tipo}`;
  const reloj = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  li.innerHTML = `<time>${reloj}</time><span class="paso-tipo">${paso.tipo === "entrada" ? "Entra" : "Sale"}</span><span>${paso.gimnasio.nombre} · ${barrioDe(paso.gimnasio).nombre} · torno ${paso.torno}</span><span class="paso-dentro">${paso.dentro}/${paso.gimnasio.capacidad}</span>`;
  feed.prepend(li);
  while (feed.children.length > 7) feed.lastElementChild.remove();
}

// ---------- Selector de hora ----------
function iniciarHoras() {
  const grupo = document.querySelector(".horas");
  grupo.addEventListener("click", (e) => {
    const boton = e.target.closest(".hora");
    if (!boton) return;
    grupo.querySelectorAll(".hora").forEach((b) => b.setAttribute("aria-pressed", b === boton));
    fijarHora(boton.dataset.hora === "ahora" ? null : Number(boton.dataset.hora));
    pintar();
  });
}

// ---------- Arranque ----------
iniciarTornos();
iniciarMapa();
iniciarListas();
iniciarTooltip();
iniciarHoras();
pintarGrafica();
pintar();

alPasarPorTorno((paso) => {
  anotarPaso(paso);
  if (!pendiente) {
    pendiente = true;
    requestAnimationFrame(pintar);
  }
});

setInterval(() => {
  document.getElementById("demo-ritmo").textContent = pasosPorMinuto();
}, 1000);
