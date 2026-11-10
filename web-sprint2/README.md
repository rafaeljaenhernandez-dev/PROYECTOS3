# AforoYa · web one page del Sprint 2

Web nueva para el Sprint 2 de Proyectos III (U-tad, 2026-27). Cuenta la misma historia que el anuncio: la hora punta en rojo, el giro a verde cuando aparece AforoYa, el semáforo, el torno, el barrio de gimnasios y las dos líneas de negocio.

## Cómo abrirla
Doble clic en `index.html`. Funciona sin servidor: el JavaScript va empaquetado en `app.bundle.js` y la letra va incrustada en `fonts/fuentes.css`.
Para publicarla basta con subir esta carpeta tal cual a GitHub Pages.

## Qué hay
- `index.html`: contenido (9 secciones).
- `styles.css`: diseño con los colores de nuestra app (los de `clase-gimnasio/pantalla.html` y `torno.html`). Letra Archivo (fuente libre, en `fonts/`).
- `app.js`: código fuente. Portada fija en la que, al deslizar, pasa la tarde de 17:30 a 19:00, sube el aforo y el semáforo pasa de verde a rojo; escena 3D con three.js (incluida en `vendor/`, licencia MIT) que cambia al deslizar, widget con la hora del día, simulador "eres el torno", barrio de gimnasios con etiquetas al pasar el ratón, vídeo y formulario.
- `app.bundle.js`: `app.js` y three.js juntos en un solo fichero (generado con esbuild) para que funcione con doble clic. Si se cambia `app.js` hay que regenerarlo: `npx esbuild app.js --bundle --format=iife --outfile=app.bundle.js`.
- `media/`: el anuncio entero (`aforoya-anuncio.mp4`, 56 s, es `AforoYa_Lucia_y_Andres_v3.mp4`) y su portada. Se reproduce en silencio al llegar; el botón lo pone desde el principio con sonido.

## Datos
- Las cifras del problema (85 %, 80 %, 65 %) son de nuestra encuesta del Sprint 1 a 20 personas.
- Los aforos del widget, del torno y del barrio son simulados, y la página lo dice.
- El formulario no envía nada: guarda la solicitud solo en el navegador (back-end simulado, como permite el enunciado).
- El enlace "Abre la demo en directo" va a la demo de clase ya publicada: https://rafaeljaenhernandez-dev.github.io/PROYECTOS3/clase-gimnasio/pantalla.html

## Uso de IA
Web hecha con Claude (proyecto ClaudeBrain) a partir del vídeo, las notas del Sprint 2 y el feedback del Sprint 1. Hay que revisar los textos antes de presentarla.
