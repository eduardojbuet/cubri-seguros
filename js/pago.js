const TARJETA_RECHAZADA = "4000000000000002";

export function simularPago(numero) {
    const limpio = numero.replace(/\s/g, "");

    return new Promise(resolve => {
        window.setTimeout(() => {
            resolve(limpio === TARJETA_RECHAZADA
                ? { ok: false, motivo: "Tarjeta rechazada" }
                : { ok: true });
        }, 1500);
    });
}

export function generarPoliza() {
    const clave = "cubri-contador-polizas";
    const guardado = Number(window.localStorage.getItem(clave) || 0);
    const contador = Number.isSafeInteger(guardado) && guardado >= 0
        ? guardado + 1
        : 1;

    window.localStorage.setItem(clave, String(contador));

    return `POL-${new Date().getFullYear()}-${String(contador).padStart(6, "0")}`;
}
