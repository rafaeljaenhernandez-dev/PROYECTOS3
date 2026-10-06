// Demo en directo: mapa, lista, detalle del gimnasio y pasos por los tornos

let seleccionado = GIMNASIOS[0].id;
const marcadores = {};      // id -> marcador de Leaflet
const filas = {};           // id -> <li> de la lista
let pendiente = false;      // para no repintar más de una vez por fotograma

// ---------- Mapa ----------
function iniciarMapa() {
  const contenedor = document.getElementById("mapa");
  if (typeof L === "undefined") {
    contenedor.classList.add("mapa-sin-conexion");
    contenedor.textContent = "El mapa necesita conexión a internet. La lista de al lado sigue en directo.";
    return;
  }
  const mapa = L.map(contenedor, { scrollWheelZoom: false, zoomControl: true }).setView([40.425, -3.695], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa);

  for (const g of GIMNASIOS) {
    const icono = L.divIcon({ className: "pin-caja", html: '<button class="pin"><span></span></button>', iconSize: [52, 52], iconAnchor: [26, 26] });
    const marcador = L.marker([g.lat, g.lng], { icon: icono, keyboard: false, title: nombreCompleto(g) }).addTo(mapa);
    marcador.on("click", () => seleccionar(g.id));
    marcadores[g.id] = marcador;
  }
  const limites = L.latLngBounds(GIMNASIOS.map((g) => [g.lat, g.lng]));
  mapa.fitBounds(limites, { padding: [28, 28] });
}

// ---------- Lista ----------
function iniciarLista() {
  const lista = document.getElementById("demo-lista");
  for (const g of GIMNASIOS) {
    const li = document.createElement("li");
    li.innerHTML = `
      <button class="fila" data-id="${g.id}">
        <span class="punto"></span>
        <span class="fila-nombre">${g.nombre} <small>${g.barrio}</small></span>
        <span class="fila-cifra"></span>
        <span class="mini-medidor"><span></span></span>
      </button>`;
    lista.appendChild(li);
    filas[g.id] = li;
  }
  lista.addEventListener("click", (e) => {
    const boton = e.target.closest(".fila");
    if (boton) seleccionar(boton.dataset.id);
  });
}

function seleccionar(id) {
  seleccionado = id;
  pintarGrafica();
  pintar();
}

// ---------- Pintar ----------
function datosDe(g) {
  const dentro = estadoTornos[g.id].dentro;
  const p = porcentaje(dentro, g.capacidad);
  return { dentro, p, s: semaforo(p) };
}

function pintar() {
  pendiente = false;
  const hora = horaActual();
  const abierto = estaAbierto(hora);

  // Lista ordenada de menos a más lleno
  const ordenados = [...GIMNASIOS].sort((a, b) => datosDe(a).p - datosDe(b).p);
  const lista = document.getElementById("demo-lista");
  ordenados.forEach((g) => {
    const { dentro, p, s } = datosDe(g);
    const li = filas[g.id];
    const boton = li.firstElementChild;
    boton.className = `fila ${s.color}`;
    boton.setAttribute("aria-pressed", g.id === seleccionado);
    boton.setAttribute("aria-label", `${nombreCompleto(g)}: ${abierto ? s.texto : "Cerrado"}, ${dentro} de ${g.capacidad} personas`);
    li.querySelector(".fila-cifra").textContent = abierto ? `${p} %` : "Cerrado";
    li.querySelector(".mini-medidor span").style.transform = `scaleX(${p / 100})`;
    lista.appendChild(li); // mover al final según el orden
  });

  // Marcadores del mapa
  for (const g of GIMNASIOS) {
    const marcador = marcadores[g.id];
    if (!marcador || !marcador.getElement()) continue;
    const { p, s } = datosDe(g);
    const pin = marcador.getElement().querySelector(".pin");
    pin.className = `pin ${abierto ? s.color : "cerrado"}${g.id === seleccionado ? " elegido" : ""}`;
    pin.firstElementChild.textContent = abierto ? `${p}%` : "—";
    marcador.setZIndexOffset(g.id === seleccionado ? 1000 : 0);
  }

  pintarDetalle(hora, abierto);
  pintarPortada(hora, abierto);
}

function pintarDetalle(hora, abierto) {
  const g = GIMNASIOS.find((x) => x.id === seleccionado);
  const { dentro, p, s } = datosDe(g);
  const e = estadoTornos[g.id];

  document.getElementById("detalle").className = `detalle ${abierto ? s.color : "cerrado"}`;
  document.getElementById("d-nombre").textContent = nombreCompleto(g);
  document.getElementById("d-direccion").textContent = g.direccion;
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

  const listaTornos = document.getElementById("d-lista-tornos");
  listaTornos.innerHTML = "";
  e.ultimoPaso.forEach((marca, i) => {
    const segundos = Math.max(0, Math.round((Date.now() - marca) / 1000));
    listaTornos.innerHTML += `<li><span class="latido" aria-hidden="true"></span>Torno ${i + 1}<span>último paso hace ${segundos} s</span></li>`;
  });

  // Marcar la hora actual en la gráfica
  document.querySelectorAll("#d-grafica .barra").forEach((barra) => {
    const h = Number(barra.dataset.hora);
    barra.classList.toggle("ahora", Math.floor(hora) === h);
    barra.classList.toggle("pasada", h < Math.floor(hora));
  });
}

// Gráfica de previsión: una barra por hora, coloreada según el semáforo
function pintarGrafica() {
  const g = GIMNASIOS.find((x) => x.id === seleccionado);
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
function pintarPortada(hora, abierto) {
  let total = 0;
  for (const g of GIMNASIOS) total += estadoTornos[g.id].dentro;
  document.getElementById("portada-total").textContent = total.toLocaleString("es-ES");
  document.getElementById("portada-reloj").textContent = formatoHora(hora);

  const lista = document.getElementById("portada-lista");
  if (!lista.children.length) {
    for (const g of GIMNASIOS.slice(0, 4)) {
      lista.innerHTML += `<li data-id="${g.id}"><span class="punto"></span><span class="pantalla-nombre">${g.nombre} <small>${g.barrio}</small></span><span class="pantalla-cifra"></span></li>`;
    }
  }
  for (const li of lista.children) {
    const g = GIMNASIOS.find((x) => x.id === li.dataset.id);
    const { dentro, s } = datosDe(g);
    li.querySelector(".punto").className = `punto ${abierto ? s.color : ""}`;
    li.querySelector(".pantalla-cifra").textContent = abierto ? `${dentro}/${g.capacidad}` : "Cerrado";
  }
}

// ---------- Pasos por los tornos ----------
function anotarPaso(paso) {
  const feed = document.getElementById("feed");
  const li = document.createElement("li");
  li.className = `paso-${paso.tipo}`;
  const reloj = new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  li.innerHTML = `<time>${reloj}</time><span class="paso-tipo">${paso.tipo === "entrada" ? "Entra" : "Sale"}</span><span>${nombreCompleto(paso.gimnasio)} · torno ${paso.torno}</span><span class="paso-dentro">${paso.dentro} dentro</span>`;
  feed.prepend(li);
  while (feed.children.length > 7) feed.lastElementChild.remove();

  document.getElementById("portada-paso").innerHTML =
    `<b>${paso.tipo === "entrada" ? "+1" : "−1"}</b> ${nombreCompleto(paso.gimnasio)}, torno ${paso.torno}`;
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
iniciarLista();
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
