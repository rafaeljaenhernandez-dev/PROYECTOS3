// Datos compartidos entre la vista pública y la recepción.
// Se guardan en localStorage para que las dos pestañas se sincronicen
// con el evento "storage" (simula el tiempo real sin servidor).

const CLAVE = "aforoya-estado";

const GIMNASIOS_INICIALES = [
  { id: "malasana", nombre: "Distrito Fit Malasaña", barrio: "Malasaña", direccion: "C/ San Vicente Ferrer, 24", capacidad: 120, dentro: 38 },
  { id: "chamberi", nombre: "Bloque Chamberí", barrio: "Chamberí", direccion: "C/ Ponzano, 51", capacidad: 90, dentro: 61 },
  { id: "lavapies", nombre: "Nave Lavapiés", barrio: "Lavapiés", direccion: "C/ Argumosa, 9", capacidad: 70, dentro: 64 },
  { id: "retiro", nombre: "Pulso Retiro", barrio: "Retiro", direccion: "C/ Ibiza, 33", capacidad: 150, dentro: 22 },
  { id: "moncloa", nombre: "Campus Moncloa", barrio: "Moncloa", direccion: "C/ Princesa, 70", capacidad: 200, dentro: 132 },
  { id: "tetuan", nombre: "Hangar Tetuán", barrio: "Tetuán", direccion: "C/ Bravo Murillo, 290", capacidad: 80, dentro: 9 },
];

// Umbrales del semáforo (porcentaje de ocupación)
const UMBRAL_AMARILLO = 50;
const UMBRAL_ROJO = 80;

function cargarEstado() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado) return JSON.parse(guardado);
  } catch (e) {
    // Si localStorage falla, seguimos con los datos iniciales
  }
  return { gimnasios: GIMNASIOS_INICIALES, registro: [], actualizado: Date.now() };
}

function guardarEstado(estado) {
  estado.actualizado = Date.now();
  try {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
  } catch (e) {
    // Sin almacenamiento la demo sigue funcionando en esta pestaña
  }
}

function porcentaje(gimnasio) {
  return Math.round((gimnasio.dentro / gimnasio.capacidad) * 100);
}

// Devuelve el color del semáforo y su texto
function semaforo(gimnasio) {
  const p = porcentaje(gimnasio);
  if (p >= UMBRAL_ROJO) return { color: "rojo", texto: "Lleno" };
  if (p >= UMBRAL_AMARILLO) return { color: "amarillo", texto: "Moderado" };
  return { color: "verde", texto: "Tranquilo" };
}

function haceCuanto(marca) {
  const segundos = Math.round((Date.now() - marca) / 1000);
  if (segundos < 5) return "ahora mismo";
  if (segundos < 60) return `hace ${segundos} s`;
  return `hace ${Math.round(segundos / 60)} min`;
}
