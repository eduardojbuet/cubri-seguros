
// Recuperar los datos anteriores
const cotizacion = recuperarDatos("cotizacion");
const plan = recuperarDatos("plan");


// Obtener elementos HTML
const resumenSeguro = document.getElementById("resumen-seguro");
const formulario = document.getElementById("formulario-titular");
const mensajeError = document.getElementById("mensaje-error");


// Si faltan datos, volver a la pantalla correspondiente
if (!cotizacion) {

    window.location.href = "cotizacion.html";

} else if (!plan) {

    window.location.href = "planes.html";

} else {

    // Mostrar resumen del seguro
    resumenSeguro.textContent =
        `Celular: ${cotizacion.marca} ${cotizacion.modelo} | ` +
        `Plan: ${plan.nombre} | ` +
        `Precio mensual: ${formatearPrecioTitular(plan.precioMensual)}`;

}


// Formatear el precio
function formatearPrecioTitular(valor) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(valor);

}


// Detectar el envío del formulario
formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();


    // Obtener los datos ingresados
    const datosTitular = {

        nombre: document.getElementById("nombre").value.trim(),

        apellido: document.getElementById("apellido").value.trim(),

        dni: document.getElementById("dni").value.trim(),

        fechaNacimiento:
            document.getElementById("fecha-nacimiento").value,

        email: document.getElementById("email").value.trim(),

        telefono: document.getElementById("telefono").value.trim(),

        terminos: document.getElementById("terminos").checked

    };


    // Validar los datos
    const error = validarTitular(datosTitular);


    if (error !== "") {

        mensajeError.textContent = error;

        return;

    }


    // Guardar los datos del titular
    guardarDatos("titular", datosTitular);


    // Ir a la pantalla de pago
    window.location.href = "pago.html";

});
