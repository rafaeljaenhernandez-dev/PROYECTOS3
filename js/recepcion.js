// Panel de recepción: marcar entradas y salidas de un gimnasio

const selector = document.getElementById("gimnasio");
const botonEntrada = document.getElementById("entrada");
const botonSalida = document.getElementById("salida");
const aviso = document.getElementById("aviso");
const registro = document.getElementById("registro");
const registroVacio = document.getElementById("registro-vacio");

let estado = cargarEstado();

// Rellenamos el desplegable con los gimnasios
for (const g of estado.gimnasios) {
  const opcion = document.createElement("option");
  opcion.value = g.id;
  opcion.textContent = `${g.nombre} (${g.barrio})`;
  selector.appendChild(opcion);
}

function gimnasioActual() {
  return estado.gimnasios.find((g) => g.id === selector.value);
}

function pintar() {
  const g = gimnasioActual();
  const s = semaforo(g);
  const p = porcentaje(g);

  document.getElementById("panel").className = `panel ${s.color}`;
  document.getElementById("punto").className = `punto ${s.color}`;
  document.getElementById("estado-texto").textContent = s.texto;
  document.getElementById("dentro").textContent = g.dentro;
  document.getElementById("capacidad").textContent = `/ ${g.capacidad}`;
  document.getElementById("porcentaje").textContent = p;
  document.getElementById("medidor").setAttribute("aria-valuenow", p);
  document.getElementById("relleno").style.transform = `scaleX(${Math.min(p, 100) / 100})`;

  // No se puede salir si no hay nadie, ni entrar si está completo
  botonSalida.disabled = g.dentro === 0;
  botonEntrada.disabled = g.dentro >= g.capacidad;
  if (botonEntrada.disabled) {
    aviso.textContent = "Aforo completo. Espera a que salga alguien para dejar pasar.";
    aviso.hidden = false;
  } else {
    aviso.hidden = true;
  }

  pintarRegistro(g);
}

function pintarRegistro(g) {
  const movimientos = estado.registro.filter((m) => m.id === g.id).slice(0, 8);
  registro.innerHTML = "";
  for (const m of movimientos) {
    const li = document.createElement("li");
    li.className = `mov-${m.tipo}`;
    const hora = new Date(m.hora).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    li.innerHTML = `<span>${m.tipo === "entrada" ? "Entrada" : "Salida"}</span><span>${m.dentro} dentro</span><time>${hora}</time>`;
    registro.appendChild(li);
  }
  registroVacio.hidden = movimientos.length > 0;
}

function mover(tipo) {
  const g = gimnasioActual();
  if (tipo === "entrada" && g.dentro < g.capacidad) g.dentro++;
  else if (tipo === "salida" && g.dentro > 0) g.dentro--;
  else return;

  estado.registro.unshift({ id: g.id, tipo, dentro: g.dentro, hora: Date.now() });
  estado.registro = estado.registro.slice(0, 100);
  guardarEstado(estado);
  pintar();
}

botonEntrada.addEventListener("click", () => mover("entrada"));
botonSalida.addEventListener("click", () => mover("salida"));
selector.addEventListener("change", pintar);

// Si otra recepción cambia datos, nos sincronizamos
window.addEventListener("storage", (e) => {
  if (e.key !== CLAVE) return;
  estado = cargarEstado();
  pintar();
});

pintar();
