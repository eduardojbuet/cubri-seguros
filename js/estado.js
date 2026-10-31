function crearSolicitud() {
    return {
        paso: 0,
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
            tarjeta: "",
            vencimiento: "",
            cvv: "",
            titular: ""
        },
        poliza: null
    };
}

export const solicitud = crearSolicitud();

export function reiniciarSolicitud() {
    Object.assign(solicitud, crearSolicitud());
}
