// Vista pública: lista de gimnasios con su semáforo

const lista = document.getElementById("lista");
const vacio = document.getElementById("vacio");
const actualizado = document.getElementById("actualizado");
const filtros = document.querySelectorAll(".filtro");

let estado = cargarEstado();
let filtroActivo = "todos";

function pintar() {
  // Ordenamos de menos a más lleno: lo primero que ves es dónde cabes
  const gimnasios = [...estado.gimnasios]
    .sort((a, b) => porcentaje(a) - porcentaje(b))
    .filter((g) => filtroActivo === "todos" || semaforo(g).color === filtroActivo);

  lista.innerHTML = "";
  for (const g of gimnasios) {
    const s = semaforo(g);
    const p = porcentaje(g);
    const item = document.createElement("li");
    item.className = `gimnasio ${s.color}`;
    item.innerHTML = `
      <div class="gimnasio-info">
        <h2>${g.nombre}</h2>
        <p class="direccion">${g.direccion} · ${g.barrio}</p>
      </div>
      <div class="gimnasio-aforo">
        <p class="estado"><span class="punto ${s.color}"></span>${s.texto}</p>
        <p class="cifra"><strong>${g.dentro}</strong> / ${g.capacidad} personas</p>
        <div class="medidor" role="meter" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p}" aria-label="Ocupación ${p}%">
          <div class="medidor-relleno" style="transform: scaleX(${Math.min(p, 100) / 100})"></div>
        </div>
      </div>`;
    lista.appendChild(item);
  }
  vacio.hidden = gimnasios.length > 0;
  pintarHora();
}

function pintarHora() {
  actualizado.textContent = `Actualizado ${haceCuanto(estado.actualizado)}`;
}

// Filtros (delegamos en el contenedor)
document.querySelector(".filtros").addEventListener("click", (e) => {
  const boton = e.target.closest(".filtro");
  if (!boton) return;
  filtroActivo = boton.dataset.filtro;
  filtros.forEach((f) => f.setAttribute("aria-pressed", f === boton));
  pintar();
});

// Cuando la recepción cambia el aforo en otra pestaña, repintamos
window.addEventListener("storage", (e) => {
  if (e.key !== CLAVE) return;
  estado = cargarEstado();
  pintar();
});

setInterval(pintarHora, 5000);
pintar();
