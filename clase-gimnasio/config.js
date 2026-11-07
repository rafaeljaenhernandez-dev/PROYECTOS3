// Configuración de AforoYa · «La clase es el gimnasio»
// modo "ntfy": funciona SIN cuentas ni configuración (usa el servicio público ntfy.sh para pasar los mensajes).
// modo "firebase": rellena firebase con tu proyecto (opcional, más robusto).
// modo "local": solo pestañas del mismo navegador, sin internet (para ensayar).
window.AFORO_CONFIG = {
  modo: "ntfy",
  // Canal privado de la demo: cambiadlo si queréis empezar de cero (letras y números, difícil de adivinar)
  canal: "aforoya-utad-h15rlbunzj",
  firebase: {
    apiKey: "PEGAR_AQUI",
    authDomain: "PEGAR_AQUI.firebaseapp.com",
    databaseURL: "https://PEGAR_AQUI-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "PEGAR_AQUI",
    appId: "PEGAR_AQUI"
  },
  sala: "aula-pro3",
  nombreGimnasio: "Gimnasio U-tad",
  aforoMaximo: 25
};
