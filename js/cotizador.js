
const formulario = document.getElementById("formulario-cotizacion");

formulario.addEventListener("submit", function(evento) {

    // Evita que el formulario se envíe automáticamente
    evento.preventDefault();

    // Obtener los datos ingresados
    const datos = {

        marca: document.getElementById("marca").value,

        modelo: document.getElementById("modelo").value,

        valor: Number(document.getElementById("valor").value),

        antiguedad: document.getElementById("antiguedad").value === ""
            ? NaN
            : Number(document.getElementById("antiguedad").value)

    };


    // Validar los datos
    const error = validarCotizacion(datos);

    const mensajeError = document.getElementById("mensaje-error");


    if (error !== "") {

        mensajeError.textContent = error;

        return;

    }


    // Si todo está correcto, guardar la información
    guardarDatos("cotizacion", datos);


    // Ir a la pantalla de planes
    window.location.href = "planes.html";

});
