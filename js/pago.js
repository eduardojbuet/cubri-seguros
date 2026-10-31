
// Recuperar los datos anteriores
const cotizacion = recuperarDatos("cotizacion");
const plan = recuperarDatos("plan");
const titular = recuperarDatos("titular");


// Obtener elementos HTML
const resumenPago = document.getElementById("resumen-pago");
const formulario = document.getElementById("formulario-pago");
const mensajeError = document.getElementById("mensaje-error");


// Comprobar que exista toda la información
if (!cotizacion) {

    window.location.href = "cotizacion.html";

} else if (!plan) {

    window.location.href = "planes.html";

} else if (!titular) {

    window.location.href = "titular.html";

} else {

    // Mostrar resumen
    resumenPago.textContent =
        `Titular: ${titular.nombre} ${titular.apellido} | ` +
        `Celular: ${cotizacion.marca} ${cotizacion.modelo} | ` +
        `Plan: ${plan.nombre} | ` +
        `Total mensual: ${formatearPrecioPago(plan.precioMensual)}`;

}


// Formatear el precio
function formatearPrecioPago(valor) {

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0
    }).format(valor);

}


// Validar vencimiento de tarjeta
function validarVencimiento(mes, anio) {

    const mesNumero = Number(mes);
    const anioNumero = Number(anio);

    if (!/^[0-9]{2}$/.test(mes) ||
        !/^[0-9]{4}$/.test(anio)) {
        return false;
    }

    if (mesNumero < 1 || mesNumero > 12) {
        return false;
    }

    const hoy = new Date();

    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth() + 1;

    if (
        anioNumero < anioActual ||
        (anioNumero === anioActual && mesNumero < mesActual)
    ) {
        return false;
    }

    return true;

}


// Procesar el formulario
formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();


    // Obtener los datos de la tarjeta
    const nombreTarjeta =
        document.getElementById("nombre-tarjeta").value.trim();

    const numeroTarjeta =
        document.getElementById("numero-tarjeta").value.replace(/\s/g, "");

    const mes =
        document.getElementById("mes-vencimiento").value.trim();

    const anio =
        document.getElementById("anio-vencimiento").value.trim();

    const codigo =
        document.getElementById("codigo-seguridad").value.trim();


    // Validar nombre
    if (nombreTarjeta === "") {

        mensajeError.textContent =
            "Ingresá el nombre del titular de la tarjeta.";

        return;

    }


    // Validar número de tarjeta
    if (!/^[0-9]{16}$/.test(numeroTarjeta)) {

        mensajeError.textContent =
            "Ingresá un número de tarjeta de 16 dígitos.";

        return;

    }


    // Validar vencimiento
    if (!validarVencimiento(mes, anio)) {

        mensajeError.textContent =
            "Ingresá una fecha de vencimiento válida.";

        return;

    }


    // Validar código de seguridad
    if (!/^[0-9]{3,4}$/.test(codigo)) {

        mensajeError.textContent =
            "El código de seguridad debe tener 3 o 4 números.";

        return;

    }


    // SIMULACIÓN DEL PAGO
    // Estas tarjetas son ficticias para el trabajo práctico.

    const tarjetaAprobada = "4242424242424242";
    const tarjetaRechazada = "4000000000000002";

    let estadoPago;


    if (numeroTarjeta === tarjetaAprobada) {

        estadoPago = "aprobado";

    } else if (numeroTarjeta === tarjetaRechazada) {

        estadoPago = "rechazado";

    } else {

        estadoPago = "rechazado";

    }


    // Guardar solamente el resultado.
    // Nunca guardamos el número ni el código de seguridad.
    guardarDatos("pago", {
        estado: estadoPago,
        fecha: new Date().toISOString()
    });


    // Redirigir según el resultado
    if (estadoPago === "aprobado") {

        window.location.href = "exito.html";

    } else {

        window.location.href = "error.html";

    }

});
