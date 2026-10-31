
const pago = recuperarDatos("pago");
const cotizacion = recuperarDatos("cotizacion");
const plan = recuperarDatos("plan");
const titular = recuperarDatos("titular");

const tipoResultado = document.body.dataset.resultado;

// Comprobar que existan todos los datos necesarios
if (!pago || !cotizacion || !plan || !titular) {
    window.location.href = "index.html";
}

// Comprobar que el resultado coincida con el estado del pago
else if (tipoResultado === "exito" && pago.estado !== "aprobado") {
    window.location.href = "error.html";
}

else if (tipoResultado === "error" && pago.estado !== "rechazado") {
    window.location.href = "exito.html";
}

else if (tipoResultado === "exito") {
    mostrarExito();
}

else if (tipoResultado === "error") {
    mostrarError();
}


function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(valor);
}


function mostrarExito() {

    // Crear el número de póliza una sola vez
    let numeroPoliza = recuperarDatos("numeroPoliza");

    if (!numeroPoliza) {
        numeroPoliza = "CV-" + Date.now().toString().slice(-8);
        guardarDatos("numeroPoliza", numeroPoliza);
    }

    document.getElementById("numero-poliza").textContent = numeroPoliza;

    document.getElementById("resumen-exito").textContent =
        `Titular: ${titular.nombre} ${titular.apellido}. ` +
        `Celular: ${cotizacion.marca} ${cotizacion.modelo}. ` +
        `Plan: ${plan.nombre}. ` +
        `Precio mensual: ${formatearPrecio(plan.precioMensual)}.`;

    document.getElementById("fecha-contratacion").textContent =
        "Fecha de operación: " +
        new Date(pago.fecha).toLocaleDateString("es-AR");
}


function mostrarError() {

    document.getElementById("resumen-error").textContent =
        `Titular: ${titular.nombre} ${titular.apellido}. ` +
        `Plan seleccionado: ${plan.nombre}. ` +
        `No se realizó ningún cobro.`;
}
