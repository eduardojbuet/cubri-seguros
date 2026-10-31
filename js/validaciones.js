
function validarCotizacion(datos) {

    if (datos.marca.trim() === "") {
        return "Ingresá la marca del celular.";
    }

    if (datos.modelo.trim() === "") {
        return "Ingresá el modelo del celular.";
    }

    if (datos.valor <= 0 || !Number.isFinite(datos.valor)) {
        return "Ingresá un valor válido para el celular.";
    }

    if (
        !Number.isFinite(datos.antiguedad) ||
        datos.antiguedad < 0 ||
        datos.antiguedad > 20
    ) {
        return "Ingresá una antigüedad válida, entre 0 y 20 años.";
    }

    return "";
}


function validarTitular(datos) {

    if (datos.nombre.trim() === "") {
        return "Ingresá tu nombre.";
    }

    if (datos.apellido.trim() === "") {
        return "Ingresá tu apellido.";
    }

    if (!/^[0-9]{7,8}$/.test(datos.dni)) {
        return "El DNI debe tener 7 u 8 números.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        return "Ingresá un correo electrónico válido.";
    }

    const telefonoLimpio = datos.telefono.replace(/[\s\-+()]/g, "");

    if (!/^[0-9]{8,15}$/.test(telefonoLimpio)) {
        return "Ingresá un teléfono válido.";
    }

    if (datos.domicilio.trim() === "") {
        return "Ingresá tu domicilio.";
    }

    return "";
}
