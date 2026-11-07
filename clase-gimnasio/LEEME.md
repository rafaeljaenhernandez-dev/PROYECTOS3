# AforoYa · «La clase es el gimnasio» (WOW del Sprint 2)

La clase entera hace de torno: cada compañero escanea el QR, pulsa **Entrar** en su móvil y el widget de AforoYa en la pantalla grande sube en tiempo real (verde < 50 %, amarillo 50-79 %, rojo ≥ 80 %), con el tiempo que tarda cada entrada en verse.

## Ficheros
- `pantalla.html`: lo que se proyecta (widget, QR, latencia y últimas entradas).
- `torno.html`: lo que abre cada móvil al escanear el QR (botón Entrar / Salir, anónimo).
- `motor.js`: el "motor" de AforoYa (ntfy.sh sin cuentas, Firebase opcional, o modo local para ensayar). Scripts clásicos, sin módulos, para que funcione también con doble clic.
- `config.js`: configuración de Firebase, nombre del gimnasio y aforo máximo.
- `qrcode.js`: librería del QR (MIT, Kazuhiko Arase), local para no depender de internet.

## 1. Cómo se comunican los móviles con la pantalla (sin cuentas)
Por defecto (`modo: "ntfy"` en `config.js`) no hay que configurar nada: cada móvil manda «entra» o «sale» a un canal privado del servicio público y gratuito ntfy.sh, y la pantalla lo escucha y lleva la cuenta. El nombre del canal está en `config.js` (`canal`); cambiadlo si queréis empezar de cero.
- La cuenta vive en el navegador de la pantalla: no cerréis esa pestaña durante la demo (si se recarga, conserva el número).
- Para ensayar sin internet: `modo: "local"` y abrir `pantalla.html` y `torno.html` en dos pestañas del mismo navegador.

## 2. Opcional: Firebase
Si preferís una base de datos propia: crear un proyecto en https://console.firebase.google.com con una Realtime Database (europe-west1, modo de prueba), pegar su `firebaseConfig` en `config.js` y poner `modo: "firebase"`.

## 3. Publicarlo en internet (necesario para que el QR funcione en los móviles)
1. Sube la carpeta al repositorio (por ejemplo `PROYECTOS3/clase-gimnasio/`).
2. GitHub › Settings › Pages › Deploy from a branch › `main` / root.
3. La pantalla queda en `https://<usuario>.github.io/PROYECTOS3/clase-gimnasio/pantalla.html`; el QR se genera solo con la URL del torno.
También vale Vercel o Netlify arrastrando la carpeta. No abráis `pantalla.html` como archivo (`file://`): el QR no funcionaría.

## 4. En clase
- Abrir `pantalla.html?max=NN` con NN = personas que hay en el aula (o tecla **M**).
- Antes de empezar, tecla **R** para poner el aforo a 0.
- **Plan B** si la wifi falla: tecla **S** arranca el simulador de tornos (vuelve a pulsar S para pararlo). Teclas **+** y **−** para mover a mano.
- Probarlo el lunes con 3-4 móviles con datos móviles, no solo con wifi.

## Guion del momento WOW (unos 60 s)
1. «Esto ya no es un aula. Es el Gimnasio U-tad, con aforo para NN personas. Y esto es su torno.» (QR en pantalla)
2. «Sacad el móvil, escanead y entrad.» Silencio y dejar que suba: verde, amarillo… rojo.
3. Señalar la latencia: «Cada entrada ha tardado menos de un segundo en llegar. Nuestro objetivo era menos de cinco.»
4. «Ahora imaginad que sois Lucía y esto lo veis desde casa a las siete menos cinco.»
5. Que alguien del equipo pulse Salir: el semáforo baja. «Eso es AforoYa: el mismo motor dentro de la app de una cadena o en la web de vuestro gimnasio de barrio.»
