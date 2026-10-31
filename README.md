# Cubrí Seguros 🛡️📱

Sistema frontend web para la contratación digital de seguros para celulares, desarrollado como Trabajo Práctico de la materia **Diseño UX/UI 2026** de la **Licenciatura en Sistemas de Información (UADER)**.

---

## 🚀 Características Principales
- **Flujo de contratación completo de extremo a extremo:**
  1. Pantalla de inicio y catálogo de seguros.
  2. Cotización interactiva del celular (marca, modelo, valor y antigüedad).
  3. Selección dinámica de planes (Básico, Plus, Premium) cargados desde un archivo JSON local.
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