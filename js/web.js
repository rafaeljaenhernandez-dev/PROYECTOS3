// Partes "fijas" de la web: equipo, curva de valor y animación al hacer scroll

// ---------- Equipo ----------
// Roles preferidos y bloques: propuesta a confirmar por cada miembro
const EQUIPO = [
  { nombre: "Rafael Jaén", rol: "Front-end", extra: "Product Owner", bloque: "Solución y criterios de éxito" },
  { nombre: "Iván Hernández", rol: "Back-end", extra: "Scrum Master", bloque: "Equipo y planificación" },
  { nombre: "David Jaén", rol: "Full-stack", extra: "", bloque: "Demo web y tornos" },
  { nombre: "Pablo Manzanedo", rol: "Diseño digital / UX", extra: "", bloque: "Marca, logo y diseño" },
  { nombre: "Jaime González", rol: "Pruebas / QA", extra: "", bloque: "Entorno, DAFO y stakeholders" },
  { nombre: "Jorge Mergelinas", rol: "Datos / investigación", extra: "", bloque: "Mercado y competidores" },
];

function iniciales(nombre) {
  return nombre.split(" ").map((p) => p[0]).join("");
}

function pintarEquipo() {
  const lista = document.getElementById("equipo-lista");
  for (const m of EQUIPO) {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="avatar" aria-hidden="true">${iniciales(m.nombre)}</span>
      <div>
        <h3>${m.nombre}</h3>
        <p class="equipo-rol">${m.rol}${m.extra ? ` · <b>${m.extra}</b>` : ""}</p>
        <p class="equipo-bloque">${m.bloque}</p>
      </div>`;
    lista.appendChild(li);
  }
}

// ---------- Curva de valor (SVG) ----------
const CRITERIOS = ["Dato real", "Compara gimnasios", "Gimnasios de barrio", "Precio para el gimnasio", "Fácil para el usuario"];
const COMPETIDORES = [
  { nombre: "AforoYa", color: "#14965a", valores: [5, 5, 5, 4, 5] },
  { nombre: "Google Maps", color: "#3d6fd6", valores: [1, 3, 4, 5, 4] },
  { nombre: "App Basic-Fit", color: "#d9762b", valores: [5, 1, 1, 1, 4] },
  { nombre: "Software de gestión", color: "#9a5fd8", valores: [4, 1, 3, 2, 2] },
];

function pintarCurvaValor() {
  const ancho = 640, alto = 300;
  const margen = { arriba: 16, derecha: 24, abajo: 56, izquierda: 32 };
  const x = (i) => margen.izquierda + (i * (ancho - margen.izquierda - margen.derecha)) / (CRITERIOS.length - 1);
  const y = (v) => margen.arriba + ((5 - v) * (alto - margen.arriba - margen.abajo)) / 4;

  let svg = `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="Curva de valor de AforoYa frente a sus competidores">`;
  // Rejilla
  for (let v = 1; v <= 5; v++) {
    svg += `<line class="rejilla" x1="${margen.izquierda}" x2="${ancho - margen.derecha}" y1="${y(v)}" y2="${y(v)}"/>`;
    svg += `<text class="eje" x="${margen.izquierda - 12}" y="${y(v) + 4}" text-anchor="end">${v}</text>`;
  }
  CRITERIOS.forEach((c, i) => {
    const palabras = c.split(" ");
    const mitad = Math.ceil(palabras.length / 2);
    svg += `<text class="eje" x="${x(i)}" y="${alto - 30}" text-anchor="middle">${palabras.slice(0, mitad).join(" ")}</text>`;
    svg += `<text class="eje" x="${x(i)}" y="${alto - 14}" text-anchor="middle">${palabras.slice(mitad).join(" ")}</text>`;
  });
  // Una línea por competidor (AforoYa al final para que quede encima)
  for (const comp of [...COMPETIDORES].reverse()) {
    const puntos = comp.valores.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const grosor = comp.nombre === "AforoYa" ? 3 : 2;
    svg += `<polyline fill="none" stroke="${comp.color}" stroke-width="${grosor}" stroke-linejoin="round" points="${puntos}"/>`;
    comp.valores.forEach((v, i) => {
      svg += `<circle class="marca-punto" cx="${x(i)}" cy="${y(v)}" r="5" fill="${comp.color}"><title>${comp.nombre} · ${CRITERIOS[i]}: ${v} de 5</title></circle>`;
    });
  }
  svg += "</svg>";
  document.getElementById("curva-valor").innerHTML = svg;

  const leyenda = document.getElementById("curva-leyenda");
  for (const comp of COMPETIDORES) {
    leyenda.innerHTML += `<li><span style="background:${comp.color}"></span>${comp.nombre}</li>`;
  }
}

// ---------- Aparecer al hacer scroll ----------
function iniciarRevelado() {
  const elementos = document.querySelectorAll(".revela");
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    }
  }, { rootMargin: "0px 0px -10% 0px" });
  elementos.forEach((el) => observador.observe(el));
}

// ---------- Sección activa en el menú ----------
function iniciarMenu() {
  const enlaces = document.querySelectorAll(".nav a");
  const observador = new IntersectionObserver((entradas) => {
    for (const entrada of entradas) {
      if (!entrada.isIntersecting) continue;
      enlaces.forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === `#${entrada.target.id}`));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  document.querySelectorAll("main > section[id]").forEach((s) => observador.observe(s));
}

pintarEquipo();
pintarCurvaValor();
iniciarRevelado();
iniciarMenu();
