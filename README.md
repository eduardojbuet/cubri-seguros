# Cubrí Seguros 🛡️📱

Sistema frontend web para la contratación digital de seguros para celulares, desarrollado como Trabajo Práctico de la materia **Diseño UX/UI 2026** de la **Licenciatura en Sistemas de Información (UADER)**.

---

## 🚀 Características Principales
- **Flujo de contratación completo de extremo a extremo:**
  1. Pantalla de inicio y catálogo de seguros.
  2. Cotización interactiva del celular (marca, modelo, valor y antigüedad).
  3. Selección dinámica de planes (Básico, Plus, Premium) cargados desde un archivo JSON local. El precio mensual se calcula aplicando la tasa anual del plan al valor declarado, dividiéndola por 12 y ajustándola por antigüedad: sin recargo para menos de 1 año, 10% para 1 a 2 años y 25% para más de 2 años.
  4. Carga y validación de datos personales del titular.
  5. Simulación de pago con tarjeta con validaciones estrictas y control de errores.
  6. Pantallas de éxito (con generación y persistencia de número de póliza ficticio) y error.
- **Seguridad y Control de Acceso:** Validación de persistencia mediante `sessionStorage` para evitar saltos directos entre pantallas sin completar los pasos previos.
- **Diseño Responsive:** Adaptado para celulares (390px), tablets (768px) y computadoras (1440px).

---

## 🛠️ Tecnologías Utilizadas
- **HTML5** (Estructura semántica)
- **Tailwind CSS v4** (Utilidades de diseño)
- **Basecoat UI** (Componentes de interfaz)
- **JavaScript Vanilla** (Lógica de negocio, validaciones y manejo de estado)
- **CSS Tradicional / Tokens** (Variables de diseño y estilos personalizados)
- **Git y GitHub** (Control de versiones)

---

## 📂 Estructura del Proyecto
```text
cubri-seguros/
│
├── index.html          # Pantalla de inicio
├── cotizacion.html     # Cotización del equipo
├── planes.html         # Selección de coberturas
├── titular.html        # Datos personales del titular
├── pago.html           # Simulación de pago con tarjeta
├── exito.html          # Pantalla de contratación exitosa
├── error.html          # Pantalla de pago rechazado
│
├── css/
│   ├── estilos.css     # Estilos específicos del proyecto
│   └── tokens.css      # Variables de diseño (colores, radios, sombras)
│
├── js/
│   ├── app.js
│   ├── cotizador.js
│   ├── estado.js       # Manejo de sessionStorage
│   ├── pago.js         # Lógica de validación y simulación de pagos
│   ├── planes.js       # Carga dinámica desde JSON
│   ├── titular.js
│   ├── validaciones.js # Funciones de validación de formularios
│   └── resultado.js    # Manejo de pólizas y estados finales
│
├── data/
│   └── planes.json     # Datos de los planes disponibles
│
└── README.md           # Documentación del proyecto
```

## Casos de prueba de precios

- Valor $ 600.000 · menos de 1 año → Básico $ 2.000 · Plus $ 3.000 · Premium $ 4.500
- Valor $ 600.000 · 1 a 2 años → Básico $ 2.200 · Plus $ 3.300 · Premium $ 4.950
- Valor $ 1.200.000 · más de 2 años → Básico $ 5.000 · Plus $ 7.500 · Premium $ 11.250

## Validaciones

- Equipo: marca obligatoria, modelo de 2 a 40 caracteres y valor entre $100.000 y $2.500.000.
- Antigüedad: debe elegirse una opción (menos de 1 año, de 1 a 2 años o más de 2 años).
- Titular: nombre y apellido de al menos 2 letras, DNI de 7 u 8 números, mayoría de edad, email válido, celular de 10 dígitos y aceptación de términos.
- Pago: tarjeta de 16 dígitos, vencimiento futuro en formato MM/AA, CVV de 3 dígitos y nombre del titular obligatorio.
- Simulación: 4111 1111 1111 1111 aprueba, 4000 0000 0000 0002 rechaza y cualquier otro número de 16 dígitos válido aprueba.