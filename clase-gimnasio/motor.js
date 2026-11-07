// Motor de AforoYa: lee los "tornos" (móviles) y calcula el aforo en tiempo real.
// Funciona con Firebase Realtime Database o, si no hay configuración, en modo local (pestañas del mismo navegador).
// Script clásico (sin módulos) para que funcione también abriendo el HTML con doble clic.
(function () {
  const C = window.AFORO_CONFIG;
  const SALA = C.sala, AFORO_MAXIMO = C.aforoMaximo;
  const modo = C.modo || (C.firebase.apiKey.includes("PEGAR_AQUI") ? "local" : "firebase");

  // Semáforo: verde < 50 %, amarillo 50-79 %, rojo >= 80 % (el mismo criterio del Sprint 1)
  function semaforo(porcentaje) {
    if (porcentaje >= 80) return { color: "rojo", hex: "#e5484d", texto: "Lleno" };
    if (porcentaje >= 50) return { color: "amarillo", hex: "#f5b700", texto: "Bastante gente" };
    return { color: "verde", hex: "#2fd27a", texto: "Hay sitio" };
  }

  async function crearMotorFirebase() {
    const appMod = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
    const db = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js");
    const app = appMod.initializeApp(C.firebase);
    const base = db.getDatabase(app);
    const raiz = db.ref(base, "aforo/" + SALA);
    let desfase = 0;
    db.onValue(db.ref(base, ".info/serverTimeOffset"), (s) => { desfase = s.val() || 0; });
    return {
      modo: "Firebase (tiempo real)",
      ahora: () => Date.now() + desfase,
      async mover(delta, origen) {
        await db.runTransaction(db.ref(base, "aforo/" + SALA + "/dentro"), (n) => Math.max(0, (n || 0) + delta));
        await db.push(db.ref(base, "aforo/" + SALA + "/eventos"), { tipo: delta > 0 ? "entra" : "sale", origen, ts: db.serverTimestamp() });
      },
      async fijarMaximo(max) { await db.set(db.ref(base, "aforo/" + SALA + "/max"), max); },
      async reiniciar() { await db.set(raiz, { dentro: 0, max: AFORO_MAXIMO, eventos: null }); },
      escuchar(cb) {
        db.onValue(raiz, (s) => {
          const v = s.val() || {};
          const eventos = v.eventos ? Object.values(v.eventos).sort((a, b) => a.ts - b.ts) : [];
          cb({ dentro: v.dentro || 0, max: v.max || AFORO_MAXIMO, eventos });
        });
      }
    };
  }

  function crearMotorLocal() {
    const clave = "aforoya-" + SALA;
    const oyentes = [];
    let canal = null;
    try { canal = new BroadcastChannel(clave); } catch (e) { /* navegador sin BroadcastChannel */ }
    const leer = () => { try { return JSON.parse(localStorage.getItem(clave)) || null; } catch (e) { return null; } } ;
    let memoria = leer() || { dentro: 0, max: AFORO_MAXIMO, eventos: [] };
    const estado = () => leer() || memoria;
    const avisar = (e) => oyentes.forEach((cb) => cb(e));
    const guardar = (e) => {
      memoria = e;
      try { localStorage.setItem(clave, JSON.stringify(e)); } catch (err) { /* sin almacenamiento: solo esta pestaña */ }
      if (canal) canal.postMessage(e);
      avisar(e);
    };
    if (canal) canal.onmessage = (m) => { memoria = m.data; avisar(m.data); };
    // Respaldo: el evento storage también avisa a las otras pestañas
    window.addEventListener("storage", (ev) => { if (ev.key === clave && ev.newValue) { memoria = JSON.parse(ev.newValue); avisar(memoria); } });
    return {
      modo: "MODO LOCAL (falta config.js)",
      ahora: () => Date.now(),
      async mover(delta, origen) {
        const e = estado();
        e.dentro = Math.max(0, e.dentro + delta);
        e.eventos = [...e.eventos, { tipo: delta > 0 ? "entra" : "sale", origen, ts: Date.now() }].slice(-50);
        guardar(e);
      },
      async fijarMaximo(max) { const e = estado(); e.max = max; guardar(e); },
      async reiniciar() { guardar({ dentro: 0, max: AFORO_MAXIMO, eventos: [] }); },
      escuchar(cb) { oyentes.push(cb); cb(estado()); }
    };
  }


  // Modo ntfy: sin cuentas. Los móviles publican "entra"/"sale" en un canal de ntfy.sh;
  // la pantalla escucha el canal, lleva la cuenta (es el motor) y guarda el estado en su navegador.
  function crearMotorNtfy() {
    const URL_CANAL = (C.servidorNtfy || "https://ntfy.sh") + "/" + C.canal;
    const clave = "aforoya-ntfy-" + C.canal;
    let estado = (() => { try { return JSON.parse(localStorage.getItem(clave)); } catch (e) { return null; } })() || { dentro: 0, max: AFORO_MAXIMO, eventos: [] };
    const oyentes = [];
    let escuchando = false;
    const avisar = () => { try { localStorage.setItem(clave, JSON.stringify(estado)); } catch (e) {} oyentes.forEach((cb) => cb(estado)); };
    const aplicar = (tipo, origen, ts) => {
      estado.dentro = Math.max(0, estado.dentro + (tipo === "entra" ? 1 : -1));
      estado.eventos = [...estado.eventos, { tipo, origen, ts }].slice(-50);
      avisar();
    };
    function conectar() {
      const es = new EventSource(URL_CANAL + "/sse");
      es.onmessage = (m) => {
        try {
          const d = JSON.parse(m.data);
          if (d.event !== "message") return;
          const msg = JSON.parse(d.message);
          if (msg.tipo === "entra" || msg.tipo === "sale") aplicar(msg.tipo, "movil", Math.min(msg.ts || d.time * 1000, Date.now()));
        } catch (e) { /* mensaje ajeno */ }
      };
      es.onerror = () => { /* EventSource reconecta solo */ };
    }
    return {
      modo: "ntfy.sh (tiempo real, sin cuentas) · canal " + C.canal,
      ahora: () => Date.now(),
      // Desde el móvil: publica en el canal. Desde la pantalla (simulador, + y -): cuenta directamente.
      async mover(delta, origen) {
        const tipo = delta > 0 ? "entra" : "sale";
        if (origen === "movil") {
          const r = await fetch(URL_CANAL, { method: "POST", body: JSON.stringify({ tipo, ts: Date.now() }) });
          if (!r.ok) throw new Error("ntfy " + r.status);
        } else aplicar(tipo, origen, Date.now());
      },
      async fijarMaximo(max) { estado.max = max; avisar(); },
      async reiniciar() { estado = { dentro: 0, max: estado.max || AFORO_MAXIMO, eventos: [] }; avisar(); },
      // Solo la pantalla escucha (así cada móvil hace una única petición y no saturamos ntfy.sh)
      escuchar(cb) { oyentes.push(cb); if (!escuchando) { escuchando = true; conectar(); } cb(estado); }
    };
  }

  window.AforoYa = {
    semaforo,
    config: C,
    // Devuelve una promesa con el motor listo
    modo,
    listo: modo === "firebase" ? crearMotorFirebase() : Promise.resolve(modo === "ntfy" ? crearMotorNtfy() : crearMotorLocal())
  };
})();
