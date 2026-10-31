# Cubrí Seguros

Prototipo frontend para la contratación digital de un seguro de celular. El flujo completo funciona en una sola página y simula la cotización, la carga de datos, el pago y la emisión de una póliza ficticia.

## Cómo ejecutar

El proyecto carga los planes desde `data/planes.json`, por lo que debe abrirse desde un servidor web local y no directamente como `file://`.

1. Abrí el proyecto en Visual Studio Code.
2. Iniciá un servidor local, por ejemplo con la extensión **Live Server**.
3. Abrí la dirección local que muestra la extensión.

No hay backend ni se envían datos a un servicio remoto. La solicitud se conserva en memoria durante el flujo y se descarta al volver al inicio. El único dato persistido en el navegador es un contador local para generar números de póliza ficticios; no se guardan datos de pago.

## Publicación en GitHub Pages

El workflow `.github/workflows/pages.yml` publica el sitio al hacer push a `main`. Para habilitarlo en el repositorio, configurá **Settings → Pages → Build and deployment → Source: GitHub Actions**. Después, volvé a ejecutar el workflow desde la pestaña **Actions**.

## Flujo y funcionalidades

- Cotización de celular con marca, modelo, valor y antigüedad.
- Selección dinámica de planes cargados desde JSON, con Plus preseleccionado y recomendado.
- Validaciones accesibles en blur y al enviar: mensajes junto a cada control, foco en el primer error, `aria-invalid` y `aria-describedby`.
- Navegación adelante/atrás con un único objeto de solicitud en memoria.
- Pago simulado con espera de 1,5 segundos, estado de procesamiento y conservación de la solicitud si se rechaza.
- Número de póliza ficticio con formato `POL-AAAA-NNNNNN`.
- Diseño responsive para escritorio, tablet y celular.

## Cálculo de cuota mensual

La cuota se calcula como `Math.round(valor * tasaAnual / 12 * factorAntiguedad)`, con factores 1 para menos de 1 año, 1,10 para 1 a 2 años y 1,25 para más de 2 años.

Casos de prueba que deben coincidir exactamente:

- Valor $ 600.000 · menos de 1 año → Básico $ 2.000 · Plus $ 3.000 · Premium $ 4.500
- Valor $ 600.000 · 1 a 2 años → Básico $ 2.200 · Plus $ 3.300 · Premium $ 4.950
- Valor $ 1.200.000 · más de 2 años → Básico $ 5.000 · Plus $ 7.500 · Premium $ 11.250

## Validaciones

- Equipo: marca obligatoria, modelo de 2 a 40 caracteres, valor entre $100.000 y $2.500.000 y antigüedad seleccionada.
- Titular: nombre y apellido, DNI de 7 u 8 dígitos, mayoría de edad, email y celular válidos y aceptación de términos.
- Pago: tarjeta de 16 dígitos, vencimiento vigente en formato MM/AA, CVV de 3 dígitos y nombre del titular.

## Números para la simulación

Usá exclusivamente estos números de prueba; no ingreses datos de tarjetas reales:

- `4111 1111 1111 1111`: pago aprobado.
- `4000 0000 0000 0002`: pago rechazado.
- Cualquier otro número de 16 dígitos: pago aprobado.

Los demás campos de pago también deben pasar sus validaciones. Un pago rechazado no borra los datos; se pueden corregir o reintentar.

## Estructura

```text
index.html          Página única de contratación
css/
  tokens.css        Tokens visuales
  checkout.css      Estilos responsive y componentes
js/
  app.js            Navegación, formularios y coordinación del flujo
  estado.js         Estado único de la solicitud
  cotizador.js      Cálculo de cuotas
  validaciones.js   Validaciones de formularios
  pago.js           Pago simulado y número de póliza
  render.js         Renderizado de planes, resumen y resultados
data/
  planes.json       Tasas y coberturas de los planes
```

Esta es una simulación académica: no ofrece cobertura de seguros ni procesa pagos reales.
