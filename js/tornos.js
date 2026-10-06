// Simulador de tornos.
// En la versión real, cada paso por el torno llega desde el control de accesos
// del gimnasio (su API o un contador en la puerta). Aquí lo inventamos para la demo:
// cada pocos cientos de milisegundos alguien entra o sale de algún gimnasio,
// y la gente tiende a acercarse a la ocupación típica de esa hora.

const estadoTornos = {};      // id del gimnasio -> { dentro, entradasHoy, ultimoPaso[] }
const oyentesTornos = [];     // funciones a las que avisamos en cada paso
const pasosRecientes = [];    // marcas de tiempo para calcular pasos por minuto
let horaFija = null;          // null = hora real del ordenador

function horaActual() {
  if (horaFija !== null) return horaFija;
  const ahora = new Date();
  return ahora.getHours() + ahora.getMinutes() / 60;
}

// Pone cada gimnasio en la ocupación típica de la hora actual
function sembrarTornos() {
  const hora = horaActual();
  for (const g of GIMNASIOS) {
    // Entradas acumuladas hoy: la gente se renueva más o menos una vez por hora
    let entradasHoy = 0;
    for (let h = HORA_APERTURA; h < Math.min(hora, HORA_CIERRE); h++) {
      entradasHoy += Math.round(ocupacionEsperada(g, h) * g.capacidad * 0.9);
    }
    estadoTornos[g.id] = {
      dentro: Math.round(ocupacionEsperada(g, hora) * g.capacidad),
      entradasHoy,
      ultimoPaso: Array.from({ length: g.tornos }, () => Date.now() - Math.random() * 20000),
    };
  }
}

// Elige un gimnasio al azar; los grandes reciben más pasos
function gimnasioAlAzar() {
  const total = GIMNASIOS.reduce((suma, g) => suma + g.capacidad, 0);
  let tirada = Math.random() * total;
  for (const g of GIMNASIOS) {
    tirada -= g.capacidad;
    if (tirada <= 0) return g;
  }
  return GIMNASIOS[0];
}

// Un paso por un torno: entrada o salida
function pasoPorTorno() {
  const g = gimnasioAlAzar();
  const e = estadoTornos[g.id];
  const objetivo = ocupacionEsperada(g, horaActual()) * g.capacidad;

  // Cuanto más lejos del objetivo, más probable moverse hacia él
  let probEntrada = 0.5 + (objetivo - e.dentro) / (g.capacidad * 0.15);
  probEntrada = Math.min(Math.max(probEntrada, 0.08), 0.92);
  if (objetivo === 0) probEntrada = 0;          // cerrado: solo salen
  if (e.dentro >= g.capacidad) probEntrada = 0; // completo: el torno no deja pasar

  let tipo = Math.random() < probEntrada ? "entrada" : "salida";
  if (tipo === "salida" && e.dentro === 0) {
    if (objetivo === 0) return;                 // cerrado y vacío: nada que hacer
    tipo = "entrada";
  }

  if (tipo === "entrada") {
    e.dentro++;
    e.entradasHoy++;
  } else {
    e.dentro--;
  }

  const torno = Math.floor(Math.random() * g.tornos);
  e.ultimoPaso[torno] = Date.now();
  pasosRecientes.push(Date.now());

  const paso = { gimnasio: g, torno: torno + 1, tipo, dentro: e.dentro, hora: horaActual() };
  oyentesTornos.forEach((fn) => fn(paso));
}

function pasosPorMinuto() {
  const haceUnMinuto = Date.now() - 60000;
  while (pasosRecientes.length && pasosRecientes[0] < haceUnMinuto) pasosRecientes.shift();
  return pasosRecientes.length;
}

function alPasarPorTorno(fn) {
  oyentesTornos.push(fn);
}

// Para la demo: ver cómo estaría Madrid a otra hora (null vuelve a la hora real)
function fijarHora(hora) {
  horaFija = hora;
  sembrarTornos();
}

function iniciarTornos() {
  sembrarTornos();
  setInterval(pasoPorTorno, 250);
}
