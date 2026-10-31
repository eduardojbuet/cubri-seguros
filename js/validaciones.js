const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const formatoDni = /^\d{7,8}$/;
const formatoTarjeta = /^\d{16}$/;
const formatoVencimiento = /^(0[1-9]|1[0-2])\/(\d{2})$/;
const formatoCvv = /^\d{3}$/;
const formatoNombre = /^[\p{L}\s'-]+$/u;

export function validarMarca(valor) {
    return valor ? null : "Elegí una marca";
}

export function validarModelo(valor) {
    const longitud = valor.trim().length;
    return longitud >= 2 && longitud <= 40
        ? null
        : "Ingresá el modelo del equipo";
}

export function validarValor(valor) {
    const numero = Number(valor);
    return Number.isFinite(numero) && numero >= 100000 && numero <= 2500000
        ? null
        : "El valor debe estar entre $100.000 y $2.500.000";
}

export function validarAntiguedad(valor) {
    return ["0.5", "1", "2.5"].includes(String(valor))
        ? null
        : "Indicá la antigüedad";
}

export function validarNombre(valor) {
    const nombre = valor.trim();
    const cantidadLetras = nombre.match(/\p{L}/gu)?.length ?? 0;
    return cantidadLetras >= 2 && formatoNombre.test(nombre)
        ? null
        : "Ingresá tu nombre / apellido";
}

export function validarDni(valor) {
    return formatoDni.test(valor.trim())
        ? null
        : "El DNI debe tener 7 u 8 números";
}

export function validarNacimiento(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
        return "Tenés que ser mayor de edad";
    }

    const [anio, mes, dia] = valor.split("-").map(Number);
    const nacimiento = new Date(anio, mes - 1, dia);

    if (
        nacimiento.getFullYear() !== anio ||
        nacimiento.getMonth() !== mes - 1 ||
        nacimiento.getDate() !== dia
    ) {
        return "Tenés que ser mayor de edad";
    }

    const hoy = new Date();
    const limite = new Date(
        hoy.getFullYear() - 18,
        hoy.getMonth(),
        hoy.getDate()
    );

    return nacimiento <= limite ? null : "Tenés que ser mayor de edad";
}

export function validarEmail(valor) {
    return formatoEmail.test(valor.trim())
        ? null
        : "Ingresá un email válido";
}

export function validarCelular(valor) {
    const digitos = valor.replace(/[\s-]/g, "");
    return /^(?!0)(?!15)\d{10}$/.test(digitos)
        ? null
        : "Ingresá un celular válido";
}

export function validarTerminos(valor) {
    return valor ? null : "Tenés que aceptar los términos";
}

export function validarTarjeta(valor) {
    const digitos = valor.replace(/\s/g, "");
    return formatoTarjeta.test(digitos)
        ? null
        : "Número de tarjeta inválido";
}

export function validarVencimiento(valor, hoy = new Date()) {
    const coincidencia = formatoVencimiento.exec(valor);
    if (!coincidencia) {
        return "Vencimiento inválido";
    }

    const mes = Number(coincidencia[1]);
    const anio = 2000 + Number(coincidencia[2]);
    const vigente = anio > hoy.getFullYear() ||
        (anio === hoy.getFullYear() && mes >= hoy.getMonth() + 1);

    return vigente ? null : "Vencimiento inválido";
}

export function validarCvv(valor) {
    return formatoCvv.test(valor)
        ? null
        : "CVV inválido";
}

export function validarTitularTarjeta(valor) {
    return valor.trim()
        ? null
        : "Ingresá el nombre del titular";
}
