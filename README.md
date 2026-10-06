# AforoYa · Entrena sin esperas

Web de presentación y demo de AforoYa, el proyecto Q1 de Proyectos 3 (U-tad). AforoYa muestra el aforo real de los gimnasios de Madrid. El dato sale de los tornos de cada gimnasio, sin que nadie tenga que apuntar a mano quién entra o sale.

Esto es una demo de cómo funcionaría, no el producto final. Los tornos y los gimnasios están simulados; las calles, los barrios y los datos del sector son reales y están citados en la propia web.

## Qué enseña la web

1. **Portada**: nombre, logo, eslogan y un contador en directo.
2. **Problema**: situación actual, ideal y necesidad, cifras del sector con fuente y a quién le duele.
3. **Solución**: cómo viaja el dato del torno al móvil y por qué así (preciso, sin trabajo extra, respeta el RGPD).
4. **Demo en directo**: mapa de Madrid con el semáforo de cada gimnasio, previsión por horas, lo que ve el gimnasio y los pasos por los tornos en tiempo real. Se puede ver cómo estaría a otra hora (8:00, 14:30, 19:00...).
5. **Beneficios** para el usuario y para el gimnasio.
6. **Mercado**: tamaño de mercado, curva de valor, competidores y DAFO.
7. **Criterios de éxito** medibles por sprint.
8. **Equipo**, roles y bloque de cada uno.
9. **Plan** de los 3 sprints y metodología (fuentes y herramientas).
10. **Cierre** con llamada a la acción y **fuentes**.

## Cómo está hecha

HTML, CSS y JavaScript sin frameworks. El mapa usa [Leaflet](https://leafletjs.com) con mapas de OpenStreetMap.

- `js/datos.js`: gimnasios de ejemplo, curvas de ocupación por hora y semáforo (verde < 50 %, amarillo 50-79 %, rojo ≥ 80 %).
- `js/tornos.js`: simulador de tornos. En la versión real, estos pasos llegarían del control de accesos del gimnasio.
- `js/demo.js`: mapa, lista, detalle del gimnasio y pasos en directo.
- `js/web.js`: equipo, curva de valor y animaciones al hacer scroll.

## Cómo arrancarla

```
python -m http.server 5500
```

y abre http://localhost:5500. El mapa necesita conexión a internet; sin ella, la lista sigue funcionando.

## Uso de IA

La estructura, los estilos y el código de la demo se generaron con Claude Code a partir de nuestra propuesta del Sprint 1, y el equipo los ha revisado. Los datos del sector salen de las fuentes citadas en la web.
