// Datos de la demo: gimnasios de ejemplo en Madrid y cómo se llenan a lo largo del día.
// Los gimnasios son ficticios; las calles y los barrios son reales.

const GIMNASIOS = [
  { id: "malasana", nombre: "Distrito Fit", barrio: "Malasaña", direccion: "C/ San Vicente Ferrer, 24", lat: 40.4262, lng: -3.7037, capacidad: 120, tornos: 2, perfil: "mixto", factor: 1.02 },
  { id: "chamberi", nombre: "Bloque", barrio: "Chamberí", direccion: "C/ Ponzano, 51", lat: 40.4419, lng: -3.7016, capacidad: 90, tornos: 2, perfil: "oficina", factor: 1.0 },
  { id: "lavapies", nombre: "Nave", barrio: "Lavapiés", direccion: "C/ Argumosa, 9", lat: 40.4079, lng: -3.6985, capacidad: 70, tornos: 1, perfil: "mixto", factor: 1.08 },
  { id: "retiro", nombre: "Pulso", barrio: "Retiro", direccion: "C/ Ibiza, 33", lat: 40.4186, lng: -3.6735, capacidad: 150, tornos: 3, perfil: "barrio", factor: 0.9 },
  { id: "moncloa", nombre: "Campus", barrio: "Moncloa", direccion: "C/ Princesa, 70", lat: 40.4327, lng: -3.7183, capacidad: 200, tornos: 4, perfil: "estudiantes", factor: 1.0 },
  { id: "tetuan", nombre: "Hangar", barrio: "Tetuán", direccion: "C/ Bravo Murillo, 290", lat: 40.4598, lng: -3.6981, capacidad: 80, tornos: 1, perfil: "barrio", factor: 0.7 },
  { id: "salamanca", nombre: "Forja", barrio: "Salamanca", direccion: "C/ Goya, 88", lat: 40.4248, lng: -3.6728, capacidad: 110, tornos: 2, perfil: "oficina", factor: 0.95 },
  { id: "arganzuela", nombre: "Andén", barrio: "Arganzuela", direccion: "Paseo de las Delicias, 61", lat: 40.399, lng: -3.6935, capacidad: 100, tornos: 2, perfil: "mixto", factor: 0.85 },
];

// Ocupación típica (fracción del aforo) de 7:00 a 22:00, una por hora.
// Abren a las 7:00 y cierran a las 23:00.
const HORA_APERTURA = 7;
const HORA_CIERRE = 23;
const CURVAS = {
  oficina:     [0.55, 0.62, 0.38, 0.25, 0.22, 0.30, 0.52, 0.58, 0.30, 0.32, 0.55, 0.86, 0.93, 0.78, 0.45, 0.20],
  estudiantes: [0.18, 0.25, 0.32, 0.40, 0.46, 0.52, 0.50, 0.56, 0.72, 0.86, 0.95, 0.90, 0.72, 0.52, 0.32, 0.12],
  barrio:      [0.30, 0.45, 0.55, 0.48, 0.40, 0.32, 0.28, 0.30, 0.35, 0.48, 0.66, 0.80, 0.84, 0.66, 0.40, 0.15],
  mixto:       [0.35, 0.50, 0.42, 0.34, 0.30, 0.36, 0.42, 0.45, 0.48, 0.60, 0.78, 0.90, 0.88, 0.70, 0.42, 0.18],
};

// Umbrales del semáforo (porcentaje de ocupación)
const UMBRAL_AMARILLO = 50;
const UMBRAL_ROJO = 80;

function nombreCompleto(g) {
  return `${g.nombre} ${g.barrio}`;
}

function estaAbierto(hora) {
  return hora >= HORA_APERTURA && hora < HORA_CIERRE;
}

// Fracción del aforo que se espera a una hora (con decimales: 18.5 = 18:30)
function ocupacionEsperada(g, hora) {
  if (!estaAbierto(hora)) return 0;
  const curva = CURVAS[g.perfil];
  const i = Math.floor(hora) - HORA_APERTURA;
  const siguiente = curva[Math.min(i + 1, curva.length - 1)];
  const resto = hora - Math.floor(hora);
  const valor = curva[i] + (siguiente - curva[i]) * resto;
  return Math.min(valor * g.factor, 1);
}

function porcentaje(dentro, capacidad) {
  return Math.round((dentro / capacidad) * 100);
}

// Color del semáforo y su texto a partir de un porcentaje
function semaforo(p) {
  if (p >= UMBRAL_ROJO) return { color: "rojo", texto: "Lleno" };
  if (p >= UMBRAL_AMARILLO) return { color: "amarillo", texto: "Moderado" };
  return { color: "verde", texto: "Tranquilo" };
}

// Hora más tranquila desde ahora hasta el cierre
function mejorHora(g, desde) {
  let mejor = null;
  for (let h = Math.max(Math.ceil(desde), HORA_APERTURA); h < HORA_CIERRE - 1; h++) {
    if (mejor === null || ocupacionEsperada(g, h) < ocupacionEsperada(g, mejor)) mejor = h;
  }
  return mejor;
}

function formatoHora(hora) {
  const h = Math.floor(hora);
  const m = Math.round((hora - h) * 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
