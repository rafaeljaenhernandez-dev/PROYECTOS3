# AforoYa

Aforo en tiempo real de gimnasios en Madrid. Prototipo en HTML, CSS y JavaScript puro, sin dependencias.

## Qué hay

- `index.html`: lista de gimnasios con semáforo. Verde (menos del 50 % del aforo), amarillo (50–79 %) y rojo (80 % o más). Se puede filtrar por estado y se ordena de menos a más lleno.
- `recepcion.html`: panel de recepción. Eliges el gimnasio y marcas entradas y salidas. No deja entrar si el aforo está completo ni salir si no hay nadie.
- `js/datos.js`: datos de ejemplo y funciones comunes (porcentaje, semáforo).

Los datos se guardan en `localStorage`. Si abres las dos páginas en pestañas distintas, la lista se actualiza sola al marcar entradas en recepción (evento `storage`).

## Cómo arrancarlo

Abre `index.html` en el navegador, o sirve la carpeta:

```
python -m http.server 5500
```

y entra en http://localhost:5500.

## Uso de IA

El prototipo inicial (estructura, estilos y lógica del semáforo y la recepción) se generó con Claude Code y lo he revisado y adaptado.
