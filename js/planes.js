
// Recuperar los datos del celular
const cotizacion = recuperarDatos("cotizacion");

const resumenCelular = document.getElementById("resumen-celular");
const listaPlanes = document.getElementById("lista-planes");
const mensajeError = document.getElementById("mensaje-error");


// Comprobar que existan los datos del celular
if (!cotizacion) {

    window.location.href = "cotizacion.html";

} else {

    // Mostrar los datos del equipo
    resumenCelular.innerHTML = `
        <strong>Tu equipo:</strong>
        ${cotizacion.marca} ${cotizacion.modelo}
        <br>
        <strong>Valor declarado:</strong>
        ${formatearPrecio(cotizacion.valor)}
    `;

    // Cargar los planes desde el archivo JSON
    cargarPlanes();

}


// Función para mostrar precios en pesos argentinos
function formatearPrecio(valor) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(valor);

}


// Obtener los planes
async function cargarPlanes() {

    try {

        const respuesta = await fetch("data/planes.json");

        if (!respuesta.ok) {
            throw new Error("No se pudieron cargar los planes.");
        }

        const planes = await respuesta.json();

        mostrarPlanes(planes);

    } catch (error) {

        mensajeError.textContent =
            "Ocurrió un problema al cargar los planes. " +
            "Comprobá que estés utilizando Live Server.";

        console.error(error);

    }

}


// Crear las tarjetas de los planes
function mostrarPlanes(planes) {

    listaPlanes.innerHTML = "";

    planes.forEach(function(plan) {

        // Calcular el precio mensual
        const precio = cotizacion.valor *
            plan.porcentajeMensual / 100;

        // Crear la tarjeta
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("tarjeta-plan");

        tarjeta.innerHTML = `
            <h3>${plan.nombre}</h3>

            <p>${plan.descripcion}</p>

            <p class="precio-plan">
                ${formatearPrecio(precio)}
                <span>/ mes</span>
            </p>

            <p><strong>Incluye:</strong></p>

            <ul>
                ${plan.coberturas.map(function(cobertura) {
                    return `<li>${cobertura}</li>`;
                }).join("")}
            </ul>

            <button
                class="boton"
                data-plan="${plan.id}"
            >
                Elegir ${plan.nombre}
            </button>
        `;

        listaPlanes.appendChild(tarjeta);

    });


    // Detectar qué plan eligió el usuario
    const botones = document.querySelectorAll("[data-plan]");

    botones.forEach(function(boton) {

        boton.addEventListener("click", function() {

            const planElegido = planes.find(function(plan) {
                return plan.id === boton.dataset.plan;
            });

            const precio = cotizacion.valor *
                planElegido.porcentajeMensual / 100;

            // Guardar el plan seleccionado
            guardarDatos("plan", {
                id: planElegido.id,
                nombre: planElegido.nombre,
                precioMensual: precio,
                porcentajeMensual: planElegido.porcentajeMensual
            });

            // Ir a los datos del titular
            window.location.href = "titular.html";

        });

    });

}
