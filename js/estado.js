
function guardarDatos(clave, datos) {

    sessionStorage.setItem(
        clave,
        JSON.stringify(datos)
    );

}

function recuperarDatos(clave) {

    const datosGuardados = sessionStorage.getItem(clave);

    if (datosGuardados === null) {
        return null;
    }

    return JSON.parse(datosGuardados);

}
