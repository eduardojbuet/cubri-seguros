
function validarCotizacion(datos) {

    if (datos.marca.trim() === "") {
        return "Elegí una marca";
    }

    const modelo = datos.modelo.trim();

    if (modelo.length < 2 || modelo.length > 40) {
        return "Ingresá el modelo del equipo";
    }

    if (
        !Number.isFinite(datos.valor) ||
        datos.valor < 100000 ||
        datos.valor > 2500000
    ) {
        return "El valor debe estar entre $100.000 y $2.500.000";
    }

    if (
        !Number.isFinite(datos.antiguedad) ||
        datos.antiguedad < 0 ||
        datos.antiguedad > 20
    ) {
        return "Indicá la antigüedad";
    }

    return "";
}

function esMayorDeEdad(fechaNacimiento) {

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaNacimiento)) {
        return false;
    }

    const [anio, mes, dia] = fechaNacimiento.split("-").map(Number);
    const nacimiento = new Date(anio, mes - 1, dia);

    if (
        nacimiento.getFullYear() !== anio ||
        nacimiento.getMonth() !== mes - 1 ||
        nacimiento.getDate() !== dia
    ) {
        return false;
    }

    const hoy = new Date();
    const fechaLimite = new Date(
        hoy.getFullYear() - 18,
        hoy.getMonth(),
        hoy.getDate()
    );

    return nacimiento <= fechaLimite;
}


function validarTitular(datos) {

    const nombre = datos.nombre.trim();
    const apellido = datos.apellido.trim();
    const letrasNombre = nombre.match(/\p{L}/gu) || [];
    const letrasApellido = apellido.match(/\p{L}/gu) || [];

    if (letrasNombre.length < 2 || !/^[\p{L}\s'-]+$/u.test(nombre)) {
        return "Ingresá tu nombre / apellido";
    }

    if (letrasApellido.length < 2 || !/^[\p{L}\s'-]+$/u.test(apellido)) {
        return "Ingresá tu nombre / apellido";
    }

    if (!/^[0-9]{7,8}$/.test(datos.dni)) {
        return "El DNI debe tener 7 u 8 números";
    }

    if (!esMayorDeEdad(datos.fechaNacimiento)) {
        return "Tenés que ser mayor de edad";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.email)) {
        return "Ingresá un email válido";
    }

    const telefonoLimpio = datos.telefono.replace(/[\s-]/g, "");

    if (!/^(?!0)(?!15)[0-9]{10}$/.test(telefonoLimpio)) {
        return "Ingresá un celular válido";
    }

    if (!datos.terminos) {
        return "Tenés que aceptar los términos";
    }

    return "";
}
