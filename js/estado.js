const CLAVE_SOLICITUD = "cubri-solicitud";

function crearSolicitud() {
    return {
        equipo: {
            marca: "",
            modelo: "",
            valor: 0,
            antiguedad: ""
        },
        plan: "plus",
        titular: {
            nombre: "",
            apellido: "",
            dni: "",
            nacimiento: "",
            email: "",
            celular: "",
            terminos: false
        },
        pago: {
            metodo: "credito",
            titular: ""
        },
        poliza: null,
        intentoRechazado: false
    };
}

function leerSolicitud() {
    const guardado = window.sessionStorage.getItem(CLAVE_SOLICITUD);
    if (!guardado) {
        return crearSolicitud();
    }

    const datos = JSON.parse(guardado);
    const inicial = crearSolicitud();
    return {
        ...inicial,
        ...datos,
        equipo: { ...inicial.equipo, ...datos.equipo },
        titular: { ...inicial.titular, ...datos.titular },
        pago: {
            ...inicial.pago,
            metodo: datos.pago?.metodo ?? inicial.pago.metodo,
            titular: datos.pago?.titular ?? ""
        }
    };
}

export const solicitud = leerSolicitud();

export function guardarSolicitud() {
    const segura = {
        ...solicitud,
        pago: {
            metodo: solicitud.pago.metodo,
            titular: solicitud.pago.titular
        }
    };
    window.sessionStorage.setItem(CLAVE_SOLICITUD, JSON.stringify(segura));
}

export function reiniciarSolicitud() {
    Object.assign(solicitud, crearSolicitud());
    window.sessionStorage.removeItem(CLAVE_SOLICITUD);
}
