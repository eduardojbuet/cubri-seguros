import { solicitud, reiniciarSolicitud } from "./estado.js";
import { generarPoliza, simularPago } from "./pago.js";
import {
    renderPlanes,
    renderResultado,
    renderResumen,
    renderStepper,
    renderVista
} from "./render.js";
import {
    validarAntiguedad,
    validarCelular,
    validarCvv,
    validarDni,
    validarEmail,
    validarMarca,
    validarModelo,
    validarNacimiento,
    validarNombre,
    validarTarjeta,
    validarTerminos,
    validarTitularTarjeta,
    validarValor,
    validarVencimiento
} from "./validaciones.js";

const reglas = {
    marca: () => validarMarca(solicitud.equipo.marca),
    modelo: () => validarModelo(solicitud.equipo.modelo),
    valor: () => validarValor(solicitud.equipo.valor),
    antiguedad: () => validarAntiguedad(solicitud.equipo.antiguedad),
    nombre: () => validarNombre(solicitud.titular.nombre),
    apellido: () => validarNombre(solicitud.titular.apellido),
    dni: () => validarDni(solicitud.titular.dni),
    nacimiento: () => validarNacimiento(solicitud.titular.nacimiento),
    email: () => validarEmail(solicitud.titular.email),
    celular: () => validarCelular(solicitud.titular.celular),
    terminos: () => validarTerminos(solicitud.titular.terminos),
    metodo: () => null,
    tarjeta: () => validarTarjeta(solicitud.pago.tarjeta),
    vencimiento: () => validarVencimiento(solicitud.pago.vencimiento),
    cvv: () => validarCvv(solicitud.pago.cvv),
    pagoTitular: () => validarTitularTarjeta(solicitud.pago.titular)
};

const camposPorPaso = {
    1: ["marca", "modelo", "valor", "antiguedad"],
    3: ["nombre", "apellido", "dni", "nacimiento", "email", "celular", "terminos"],
    4: ["metodo", "tarjeta", "vencimiento", "cvv", "pagoTitular"]
};

const camposPorControl = {
    pagoTitular: "pago-titular"
};

const ayudaPorPaso = {
    1: "Completá los datos requeridos para ver los planes.",
    3: "Completá tus datos y aceptá los términos para continuar.",
    4: "Se confirmará la simulación de pago."
};

const planesUrl = new URL("../data/planes.json", import.meta.url);
let planes = [];
let errorCargaPlanes = null;
try {
    const respuestaPlanes = await fetch(planesUrl);
    if (!respuestaPlanes.ok) {
        throw new Error(`No se pudieron cargar los planes (${respuestaPlanes.status}).`);
    }

    const planesCargados = await respuestaPlanes.json();
    if (
        !Array.isArray(planesCargados) ||
        !planesCargados.some(plan => plan.id === "plus" && plan.recomendado) ||
        planesCargados.some(plan =>
            !plan.id ||
            !plan.nombre ||
            !Number.isFinite(plan.tasaAnual) ||
            !Array.isArray(plan.coberturas)
        )
    ) {
        throw new Error("El archivo data/planes.json no tiene la estructura de planes esperada.");
    }
    planes = planesCargados;
} catch (error) {
    console.error(error);
    errorCargaPlanes = error;
}

const touched = new Set();
let procesandoPago = false;
let mensajeErrorPago = "";

const forms = [
    document.getElementById("equipment-form"),
    document.getElementById("holder-form"),
    document.getElementById("payment-form")
];

const botonesContinuar = {
    1: document.getElementById("equipment-next"),
    3: document.getElementById("holder-next"),
    4: document.getElementById("pay-button")
};

function control(campo) {
    return document.getElementById(camposPorControl[campo] ?? campo);
}

function leerCampo(campo) {
    switch (campo) {
        case "marca":
        case "modelo":
            solicitud.equipo[campo] = control(campo).value;
            break;
        case "valor":
            solicitud.equipo.valor = control(campo).value;
            break;
        case "antiguedad":
            solicitud.equipo.antiguedad =
                document.querySelector('input[name="antiguedad"]:checked')?.value ?? "";
            break;
        case "terminos":
            solicitud.titular.terminos = control(campo).checked;
            break;
        case "metodo":
            solicitud.pago.metodo = control(campo).value;
            break;
        case "pagoTitular":
            solicitud.pago.titular = control(campo).value;
            break;
        default:
            if (campo in solicitud.titular) {
                solicitud.titular[campo] = control(campo).value;
            } else if (campo in solicitud.pago) {
                solicitud.pago[campo] = control(campo).value;
            }
    }
}

function renderError(campo) {
    const error = reglas[campo]();
    const container = document.querySelector(`[data-field="${campo}"]`);
    const input = campo === "antiguedad"
        ? document.querySelector('input[name="antiguedad"]')
        : control(campo);
    const errorText = document.getElementById(`${campo}-error`);

    if (error) {
        input?.setAttribute("aria-invalid", "true");
        container?.setAttribute("data-invalid", "");
        errorText.textContent = error;
    } else {
        input?.removeAttribute("aria-invalid");
        container?.removeAttribute("data-invalid");
        errorText.textContent = "";
    }

    return error;
}

function validarPaso(paso) {
    let primerError = null;
    for (const campo of camposPorPaso[paso]) {
        touched.add(campo);
        const error = renderError(campo);
        if (!primerError && error) {
            primerError = campo;
        }
    }
    return primerError;
}

function nombreCampo(campo) {
    if (campo === "antiguedad") {
        return "la antigüedad";
    }
    const input = control(campo);
    const label = input && document.querySelector(`label[for="${input.id}"]`);
    return label?.textContent.trim().toLowerCase() ?? "los campos pendientes";
}

function actualizarPaso(paso) {
    const campos = camposPorPaso[paso];
    const primerCampoInvalido = campos.find(campo => reglas[campo]());
    const boton = botonesContinuar[paso];
    boton.disabled = Boolean(primerCampoInvalido) || (paso === 4 && procesandoPago);
    boton.textContent = paso === 1
        ? "Ver planes →"
        : paso === 3
            ? "Continuar al pago →"
            : procesandoPago
                ? "Procesando…"
                : "Pagar y emitir póliza";

    const ayuda = document.getElementById(
        `${paso === 1 ? "equipment" : paso === 3 ? "holder" : "payment"}-action-help`
    );
    ayuda.textContent = mensajeErrorPago ||
        (primerCampoInvalido
            ? `Completá ${nombreCampo(primerCampoInvalido)} para continuar.`
            : ayudaPorPaso[paso]);
}

function actualizarResumen() {
    renderResumen(planes);
}

function render() {
    renderVista();
    if (solicitud.paso >= 1 && solicitud.paso <= 4) {
        renderStepper();
    }
    if (solicitud.paso in camposPorPaso) {
        actualizarPaso(solicitud.paso);
    }
    actualizarResumen();
}

function cambiarPaso(paso, enfocar = true) {
    solicitud.paso = paso;
    render();
    if (enfocar) {
        document.querySelector(`[data-step="${paso}"] h1`)?.focus();
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function alCambiarCampo(campo) {
    leerCampo(campo);
    if (touched.has(campo)) {
        renderError(campo);
    }
    if (solicitud.paso in camposPorPaso) {
        actualizarPaso(solicitud.paso);
    }
    actualizarResumen();
}

function vincularCampo(campo, selector = `#${camposPorControl[campo] ?? campo}`) {
    const inputs = [...document.querySelectorAll(selector)];
    if (inputs.length === 0) {
        throw new Error(`No se encontró el control para el campo "${campo}".`);
    }

    inputs.forEach(input => {
        if (campo === "antiguedad") {
            input.setAttribute("aria-describedby", "antiguedad-error");
        }
        for (const eventName of ["input", "change"]) {
            input.addEventListener(eventName, () => alCambiarCampo(campo));
        }

        input.addEventListener("blur", () => {
            leerCampo(campo);
            touched.add(campo);
            renderError(campo);
            if (solicitud.paso in camposPorPaso) {
                actualizarPaso(solicitud.paso);
            }
        });
    });
}

function restaurarFormulario() {
    document.getElementById("marca").value = solicitud.equipo.marca;
    document.getElementById("modelo").value = solicitud.equipo.modelo;
    document.getElementById("valor").value = solicitud.equipo.valor || "";
    document.querySelectorAll('input[name="antiguedad"]').forEach(radio => {
        radio.checked = radio.value === solicitud.equipo.antiguedad;
    });

    for (const campo of ["nombre", "apellido", "dni", "nacimiento", "email", "celular"]) {
        control(campo).value = solicitud.titular[campo];
    }
    control("terminos").checked = solicitud.titular.terminos;

    for (const campo of ["metodo", "tarjeta", "vencimiento", "cvv"]) {
        control(campo).value = solicitud.pago[campo];
    }
    control("pagoTitular").value = solicitud.pago.titular;
}

for (const campo of camposPorPaso[1]) {
    vincularCampo(campo, campo === "antiguedad"
        ? 'input[name="antiguedad"]'
        : `#${campo}`);
}

for (const campo of camposPorPaso[3]) {
    vincularCampo(campo);
}

for (const campo of camposPorPaso[4]) {
    vincularCampo(campo);
}

document.getElementById("tarjeta").addEventListener("input", event => {
    const digitos = event.currentTarget.value.replace(/\D/g, "").slice(0, 16);
    event.currentTarget.value = digitos.replace(/(\d{4})(?=\d)/g, "$1 ");
    alCambiarCampo("tarjeta");
});

document.getElementById("vencimiento").addEventListener("input", event => {
    const digitos = event.currentTarget.value.replace(/\D/g, "").slice(0, 4);
    event.currentTarget.value = digitos.length > 2
        ? `${digitos.slice(0, 2)}/${digitos.slice(2)}`
        : digitos;
    alCambiarCampo("vencimiento");
});

document.getElementById("plan-list").addEventListener("change", event => {
    if (event.target.name !== "plan") {
        return;
    }
    solicitud.plan = event.target.value;
    actualizarResumen();
});

document.getElementById("equipment-form").addEventListener("submit", event => {
    event.preventDefault();
    const primerError = validarPaso(1);
    actualizarPaso(1);
    if (primerError) {
        (primerError === "antiguedad"
            ? document.querySelector('input[name="antiguedad"]')
            : control(primerError))?.focus();
        return;
    }

    solicitud.plan = "plus";
    renderPlanes(planes);
    cambiarPaso(2);
});

document.getElementById("plans-form").addEventListener("submit", event => {
    event.preventDefault();
    if (!errorCargaPlanes && planes.some(plan => plan.id === solicitud.plan)) {
        cambiarPaso(3);
    }
});

document.getElementById("holder-form").addEventListener("submit", event => {
    event.preventDefault();
    const primerError = validarPaso(3);
    actualizarPaso(3);
    if (primerError) {
        control(primerError)?.focus();
        return;
    }
    cambiarPaso(4);
});

document.getElementById("payment-form").addEventListener("submit", async event => {
    event.preventDefault();
    if (procesandoPago) {
        return;
    }

    const primerError = validarPaso(4);
    actualizarPaso(4);
    if (primerError) {
        control(primerError)?.focus();
        return;
    }

    procesandoPago = true;
    mensajeErrorPago = "";
    actualizarPaso(4);
    document.getElementById("live-status").textContent = "Procesando el pago simulado.";

    const resultado = await simularPago(solicitud.pago.tarjeta);
    procesandoPago = false;

    if (resultado.ok) {
        solicitud.poliza = generarPoliza();
        renderResultado(planes);
        document.getElementById("live-status").textContent =
            "Pago aprobado. Tu póliza fue emitida.";
        cambiarPaso(5);
        return;
    }

    mensajeErrorPago = resultado.motivo;
    renderResultado(planes);
    document.getElementById("live-status").textContent =
        "Pago rechazado. Podés cambiar el medio de pago o reintentar.";
    cambiarPaso(6);
});

document.querySelectorAll("[data-back]").forEach(button => {
    button.addEventListener("click", () => cambiarPaso(Math.max(0, solicitud.paso - 1)));
});

document.querySelectorAll("[data-go-step]").forEach(button => {
    button.addEventListener("click", () => cambiarPaso(Number(button.dataset.goStep)));
});

document.querySelectorAll("[data-go-home]").forEach(link => {
    link.addEventListener("click", event => {
        event.preventDefault();
        reiniciar();
    });
});

document.querySelector("[data-retry]").addEventListener("click", () => {
    mensajeErrorPago = "";
    cambiarPaso(4);
});

document.querySelector("[data-change-method]").addEventListener("click", () => {
    mensajeErrorPago = "";
    cambiarPaso(4, false);
    control("metodo").focus();
});

document.querySelector("[data-reset]").addEventListener("click", reiniciar);

function reiniciar() {
    reiniciarSolicitud();
    touched.clear();
    mensajeErrorPago = "";
    procesandoPago = false;
    for (const form of forms) {
        form.reset();
    }
    renderPlanes(planes);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

const hoy = new Date();
const limiteNacimiento = new Date(
    hoy.getFullYear() - 18,
    hoy.getMonth(),
    hoy.getDate()
);
control("nacimiento").max = [
    limiteNacimiento.getFullYear(),
    String(limiteNacimiento.getMonth() + 1).padStart(2, "0"),
    String(limiteNacimiento.getDate()).padStart(2, "0")
].join("-");

if (errorCargaPlanes) {
    document.getElementById("plans-error").textContent =
        "No se pudieron cargar los planes. Abrí el proyecto desde un servidor local y recargá la página.";
    document.getElementById("plans-error").hidden = false;
    document.getElementById("plans-next").disabled = true;
} else {
    renderPlanes(planes);
}
document.getElementById("plans-loading").hidden = true;
restaurarFormulario();
render();
