# AforoYa · Entrena sin esperas

Web de presentación y demo de AforoYa, el proyecto Q1 de Proyectos 3 (U-tad). AforoYa muestra el aforo real de los gimnasios de Madrid. El dato sale de los tornos de cada gimnasio, sin que nadie tenga que apuntar a mano quién entra o sale.

Esto es una demo de cómo funcionaría, no el producto final. Los tornos y los gimnasios están simulados; las calles, los barrios y los datos del sector son reales y están citados en la propia web.

## Qué enseña la web

1. **Portada**: nombre, logo, eslogan y un Madrid en 3D donde cada gimnasio es una columna que sube y baja con la gente que hay dentro.
2. **Problema**: situación actual, ideal y necesidad, cifras del sector con fuente y a quién le duele.
3. **Solución**: cómo viaja el dato del torno al móvil y por qué así (preciso, sin trabajo extra, respeta el RGPD).
4. **Demo en directo**: mapa de Madrid con el porcentaje de cada barrio. Al entrar en un barrio se ve el aforo exacto de cada uno de sus gimnasios, y al elegir un gimnasio, su previsión por horas y lo que ve el propio gimnasio. Debajo, los pasos por los tornos en tiempo real. Se puede ver cómo estaría a otra hora (8:00, 14:30, 19:00...).
5. **Beneficios** para el usuario y para el gimnasio.
6. **Mercado**: tamaño de mercado, curva de valor, competidores y DAFO.
7. **Criterios de éxito** medibles por sprint.
8. **Cierre** con llamada a la acción y **fuentes**.

## Cómo está hecha

HTML, CSS y JavaScript sin frameworks. El mapa usa [Leaflet](https://leafletjs.com) con mapas de OpenStreetMap, y la portada usa [three.js](https://threejs.org).

- `js/datos.js`: 7 barrios y 31 gimnasios de ejemplo, curvas de ocupación por hora y semáforo (verde < 50 %, amarillo 50-79 %, rojo ≥ 80 %).
- `js/tornos.js`: simulador de tornos. En la versión real, estos pasos llegarían del control de accesos del gimnasio.
- `js/demo.js`: mapa por barrios, aforo de cada gimnasio, detalle y pasos en directo.
- `js/escena3d.js`: el Madrid en 3D de la portada.
- `js/web.js`: curva de valor, menú y animaciones al hacer scroll.

## Cómo arrancarla

```
python -m http.server 5500
```

y abre http://localhost:5500. El mapa necesita conexión a internet; sin ella, la lista sigue funcionando.

## Uso de IA

La estructura, los estilos y el código de la demo se generaron con Claude Code a partir de nuestra propuesta del Sprint 1, y el equipo los ha revisado. Los datos del sector salen de las fuentes citadas en la web.
