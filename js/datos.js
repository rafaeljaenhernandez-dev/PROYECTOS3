// Datos de la demo: barrios de Madrid, sus gimnasios y cómo se llenan a lo largo del día.
// Los gimnasios son ficticios; los barrios y las calles son reales.

const BARRIOS = [
  { id: "malasana", nombre: "Malasaña", lat: 40.4262, lng: -3.7037 },
  { id: "chamberi", nombre: "Chamberí", lat: 40.4372, lng: -3.7020 },
  { id: "moncloa", nombre: "Moncloa", lat: 40.4345, lng: -3.7180 },
  { id: "tetuan", nombre: "Tetuán", lat: 40.4600, lng: -3.6985 },
  { id: "salamanca", nombre: "Salamanca", lat: 40.4290, lng: -3.6790 },
  { id: "retiro", nombre: "Retiro", lat: 40.4165, lng: -3.6745 },
  { id: "lavapies", nombre: "Lavapiés", lat: 40.4085, lng: -3.7010 },
];

// dx y dy: separación del gimnasio respecto al centro del barrio (en milésimas de grado)
const GIMNASIOS = [
  { id: "g01", barrio: "malasana", nombre: "Distrito Fit", direccion: "C/ San Vicente Ferrer, 24", capacidad: 120, tornos: 2, perfil: "mixto", factor: 1.05, dx: -1.5, dy: 0.8 },
  { id: "g02", barrio: "malasana", nombre: "Raíz Training", direccion: "C/ Manuela Malasaña, 11", capacidad: 60, tornos: 1, perfil: "barrio", factor: 0.8, dx: 1.8, dy: 1.6 },
  { id: "g03", barrio: "malasana", nombre: "Sótano Box", direccion: "C/ del Pez, 7", capacidad: 45, tornos: 1, perfil: "mixto", factor: 1.1, dx: 0.4, dy: -2.2 },
  { id: "g04", barrio: "malasana", nombre: "Corredera Gym", direccion: "C/ Corredera Alta de San Pablo, 30", capacidad: 90, tornos: 2, perfil: "estudiantes", factor: 0.95, dx: 2.6, dy: -0.4 },
  { id: "g05", barrio: "malasana", nombre: "Fuencarral 120", direccion: "C/ Fuencarral, 120", capacidad: 150, tornos: 3, perfil: "oficina", factor: 0.9, dx: 1.2, dy: 3.4 },

  { id: "g06", barrio: "chamberi", nombre: "Bloque", direccion: "C/ Ponzano, 51", capacidad: 90, tornos: 2, perfil: "oficina", factor: 1.0, dx: -0.6, dy: 2.4 },
  { id: "g07", barrio: "chamberi", nombre: "Tracción", direccion: "C/ Santa Engracia, 98", capacidad: 110, tornos: 2, perfil: "oficina", factor: 0.85, dx: 2.4, dy: 1.0 },
  { id: "g08", barrio: "chamberi", nombre: "Eloy Studio", direccion: "C/ Eloy Gonzalo, 15", capacidad: 50, tornos: 1, perfil: "barrio", factor: 1.1, dx: 1.0, dy: -1.6 },
  { id: "g09", barrio: "chamberi", nombre: "Cuadra", direccion: "C/ Fernández de la Hoz, 40", capacidad: 75, tornos: 1, perfil: "mixto", factor: 0.7, dx: 3.6, dy: 3.0 },

  { id: "g10", barrio: "moncloa", nombre: "Campus", direccion: "C/ Princesa, 70", capacidad: 200, tornos: 4, perfil: "estudiantes", factor: 1.0, dx: -0.8, dy: -1.2 },
  { id: "g11", barrio: "moncloa", nombre: "Isaac Fit", direccion: "C/ Isaac Peral, 22", capacidad: 80, tornos: 2, perfil: "estudiantes", factor: 1.08, dx: 1.6, dy: 2.2 },
  { id: "g12", barrio: "moncloa", nombre: "Arcipreste", direccion: "C/ Arcipreste de Hita, 6", capacidad: 55, tornos: 1, perfil: "barrio", factor: 0.75, dx: 0.6, dy: -3.0 },
  { id: "g13", barrio: "moncloa", nombre: "Órbita", direccion: "C/ Fernández de los Ríos, 54", capacidad: 100, tornos: 2, perfil: "mixto", factor: 0.9, dx: 2.8, dy: 0.2 },

  { id: "g14", barrio: "tetuan", nombre: "Hangar", direccion: "C/ Bravo Murillo, 290", capacidad: 80, tornos: 1, perfil: "barrio", factor: 0.7, dx: 0.0, dy: 0.0 },
  { id: "g15", barrio: "tetuan", nombre: "Ritmo", direccion: "C/ Infanta Mercedes, 33", capacidad: 120, tornos: 3, perfil: "oficina", factor: 0.95, dx: 3.2, dy: 1.6 },
  { id: "g16", barrio: "tetuan", nombre: "Kilo", direccion: "C/ Marqués de Viana, 12", capacidad: 60, tornos: 1, perfil: "barrio", factor: 1.05, dx: -2.6, dy: 1.4 },
  { id: "g17", barrio: "tetuan", nombre: "Francos Box", direccion: "C/ Francos Rodríguez, 41", capacidad: 45, tornos: 1, perfil: "mixto", factor: 0.6, dx: -3.4, dy: -1.8 },
  { id: "g18", barrio: "tetuan", nombre: "Vértice", direccion: "C/ Capitán Haya, 60", capacidad: 160, tornos: 3, perfil: "oficina", factor: 1.0, dx: 4.0, dy: -1.2 },

  { id: "g19", barrio: "salamanca", nombre: "Forja", direccion: "C/ Goya, 88", capacidad: 110, tornos: 2, perfil: "oficina", factor: 0.95, dx: 0.4, dy: -0.8 },
  { id: "g20", barrio: "salamanca", nombre: "Velázquez Club", direccion: "C/ Velázquez, 77", capacidad: 140, tornos: 3, perfil: "oficina", factor: 1.05, dx: -2.6, dy: 1.6 },
  { id: "g21", barrio: "salamanca", nombre: "Impulso", direccion: "C/ Príncipe de Vergara, 45", capacidad: 70, tornos: 1, perfil: "mixto", factor: 0.8, dx: 1.4, dy: 2.0 },
  { id: "g22", barrio: "salamanca", nombre: "Fibra", direccion: "C/ Jorge Juan, 99", capacidad: 50, tornos: 1, perfil: "barrio", factor: 1.1, dx: 3.0, dy: -2.0 },
  { id: "g23", barrio: "salamanca", nombre: "Lista Fit", direccion: "C/ José Ortega y Gasset, 70", capacidad: 95, tornos: 2, perfil: "oficina", factor: 0.75, dx: 2.6, dy: 3.6 },

  { id: "g24", barrio: "retiro", nombre: "Pulso", direccion: "C/ Ibiza, 33", capacidad: 150, tornos: 3, perfil: "barrio", factor: 0.9, dx: 0.0, dy: 0.6 },
  { id: "g25", barrio: "retiro", nombre: "Narváez", direccion: "C/ Narváez, 50", capacidad: 70, tornos: 1, perfil: "mixto", factor: 1.0, dx: -1.2, dy: 2.4 },
  { id: "g26", barrio: "retiro", nombre: "Cumbre", direccion: "C/ Doctor Esquerdo, 120", capacidad: 120, tornos: 2, perfil: "oficina", factor: 0.8, dx: 3.4, dy: -1.6 },
  { id: "g27", barrio: "retiro", nombre: "Ola", direccion: "C/ Menéndez Pelayo, 81", capacidad: 55, tornos: 1, perfil: "barrio", factor: 0.65, dx: -2.4, dy: -1.8 },

  { id: "g28", barrio: "lavapies", nombre: "Nave", direccion: "C/ Argumosa, 9", capacidad: 70, tornos: 1, perfil: "mixto", factor: 1.08, dx: 0.4, dy: -0.6 },
  { id: "g29", barrio: "lavapies", nombre: "Embajadores 40", direccion: "C/ Embajadores, 40", capacidad: 100, tornos: 2, perfil: "estudiantes", factor: 0.95, dx: -2.0, dy: 0.4 },
  { id: "g30", barrio: "lavapies", nombre: "Patio", direccion: "C/ Ave María, 18", capacidad: 40, tornos: 1, perfil: "barrio", factor: 1.1, dx: -0.6, dy: 1.8 },
  { id: "g31", barrio: "lavapies", nombre: "Andén", direccion: "Ronda de Valencia, 6", capacidad: 85, tornos: 2, perfil: "mixto", factor: 0.8, dx: 0.6, dy: -3.2 },
];

// Posición real de cada gimnasio en el mapa
for (const g of GIMNASIOS) {
  const b = BARRIOS.find((x) => x.id === g.barrio);
  g.lat = b.lat + g.dy / 1000;
  g.lng = b.lng + g.dx / 1000;
}

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

function barrioDe(g) {
  return BARRIOS.find((b) => b.id === g.barrio);
}

function gimnasiosDe(barrioId) {
  return GIMNASIOS.filter((g) => g.barrio === barrioId);
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
