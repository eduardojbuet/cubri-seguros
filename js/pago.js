
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


function validarVencimiento(vencimiento) {

    const coincidencia = vencimiento.match(/^(0[1-9]|1[0-2])\/([0-9]{2})$/);

    if (!coincidencia) {
        return false;
    }

    const mes = Number(coincidencia[1]);
    const anio = 2000 + Number(coincidencia[2]);
    const hoy = new Date();

    return anio > hoy.getFullYear() ||
        (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);

}


document.getElementById("vencimiento").addEventListener("input", function() {

    const digitos = this.value.replace(/\D/g, "").slice(0, 4);
    this.value = digitos.length > 2
        ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
        : digitos;

});


// Procesar el formulario
formulario.addEventListener("submit", function(evento) {

    evento.preventDefault();


    // Obtener los datos de la tarjeta
    const nombreTarjeta =
        document.getElementById("nombre-tarjeta").value.trim();

    const numeroTarjeta =
        document.getElementById("numero-tarjeta").value.replace(/\s/g, "");

    const vencimiento =
        document.getElementById("vencimiento").value.trim();

    const codigo =
        document.getElementById("codigo-seguridad").value.trim();


    // Validar nombre
    if (nombreTarjeta === "") {

        mensajeError.textContent =
            "Ingresá el nombre del titular";

        return;

    }


    // Validar número de tarjeta
    if (!/^[0-9]{16}$/.test(numeroTarjeta)) {

        mensajeError.textContent =
            "Número de tarjeta inválido";

        return;

    }


    // Validar vencimiento
    if (!validarVencimiento(vencimiento)) {

        mensajeError.textContent =
            "Vencimiento inválido";

        return;

    }


    // Validar código de seguridad
    if (!/^[0-9]{3}$/.test(codigo)) {

        mensajeError.textContent =
            "CVV inválido";

        return;

    }


    // SIMULACIÓN DEL PAGO
    // Estas tarjetas son ficticias para el trabajo práctico.

    const tarjetaAprobada = "4111111111111111";
    const tarjetaRechazada = "4000000000000002";

    let estadoPago;


    if (numeroTarjeta === tarjetaAprobada) {

        estadoPago = "aprobado";

    } else if (numeroTarjeta === tarjetaRechazada) {

        estadoPago = "rechazado";

    } else {

        estadoPago = "aprobado";

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
