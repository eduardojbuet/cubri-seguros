import { solicitud, guardarSolicitud, reiniciarSolicitud } from "./estado.js";
import { generarPoliza, simularPago } from "./pago.js";
import {
    renderPlanes,
    renderResultado,
    renderResumen,
    formatearPrecio
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

const pagina = document.body.dataset.page;
const camposTocados = new Set();
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
    tarjeta: value => validarTarjeta(value),
    vencimiento: value => validarVencimiento(value),
    cvv: value => validarCvv(value),
    pagoTitular: value => validarTitularTarjeta(value)
};

const porPagina = {
    cotizacion: {
        campos: ["marca", "modelo", "valor", "antiguedad"],
        destino: "planes.html"
    },
    titular: {
        campos: ["nombre", "apellido", "dni", "nacimiento", "email", "celular", "terminos"],
        destino: "pago.html"
    }
};

const claseDato = {
    marca: ["equipo", "marca"],
    modelo: ["equipo", "modelo"],
    valor: ["equipo", "valor"],
    antiguedad: ["equipo", "antiguedad"],
    nombre: ["titular", "nombre"],
    apellido: ["titular", "apellido"],
    dni: ["titular", "dni"],
    nacimiento: ["titular", "nacimiento"],
    email: ["titular", "email"],
    celular: ["titular", "celular"],
    terminos: ["titular", "terminos"]
};

const planesUrl = new URL("../data/planes.json", import.meta.url);
let planes = [];
let fallóCargaPlanes = false;

async function cargarPlanes() {
    try {
        const respuesta = await fetch(planesUrl);
        if (!respuesta.ok) {
            throw new Error(`No se pudieron cargar los planes (${respuesta.status}).`);
        }

        const datos = await respuesta.json();
        if (
            !Array.isArray(datos) ||
            !datos.some(plan => plan.id === "plus" && plan.recomendado) ||
            datos.some(plan =>
                !plan.id ||
                !plan.nombre ||
                !Number.isFinite(plan.tasaAnual) ||
                !Array.isArray(plan.coberturas)
            )
        ) {
            throw new Error("El archivo de planes tiene un formato inválido.");
        }
        planes = datos;
    } catch (error) {
        console.error(error);
        fallóCargaPlanes = true;
        const aviso = document.getElementById("page-error");
        if (aviso) {
            aviso.textContent =
                "No se pudieron cargar los planes. Abrí el proyecto desde un servidor local y recargá la página.";
            aviso.hidden = false;
        }
    }
}

function cargarDatosDeFormulario(campos, formulario) {
    for (const campo of campos) {
        const input = formulario.elements.namedItem(campo);
        if (!input) {
            continue;
        }
        const [grupo, propiedad] = claseDato[campo];
        if (campo === "antiguedad") {
            input.value = solicitud[grupo][propiedad];
        } else if (campo === "terminos") {
            input.checked = solicitud[grupo][propiedad];
        } else {
            input.value = campo === "valor"
                ? solicitud[grupo][propiedad] || ""
                : solicitud[grupo][propiedad] ?? "";
        }
    }
}

function guardarCampo(campo, formulario) {
    if (campo === "antiguedad") {
        solicitud.equipo.antiguedad =
            formulario.elements.namedItem("antiguedad").value;
    } else {
        const [grupo, propiedad] = claseDato[campo];
        const control = formulario.elements.namedItem(campo);
        solicitud[grupo][propiedad] = campo === "terminos"
            ? control.checked
            : control.value;
    }
    guardarSolicitud();
}

function mostrarError(campo, mensaje) {
    const controlId = campo === "pagoTitular" ? "pago-titular" : campo;
    const input = campo === "antiguedad"
        ? document.querySelector('input[name="antiguedad"]')
        : document.getElementById(controlId);
    const contenedor = document.querySelector(`[data-field="${campo}"]`);
    const texto = document.getElementById(`${campo}-error`);
    if (!input || !contenedor || !texto) {
        return;
    }

    if (mensaje) {
        input.setAttribute("aria-invalid", "true");
    } else {
        input.removeAttribute("aria-invalid");
    }
    contenedor.toggleAttribute("data-invalid", Boolean(mensaje));
    texto.textContent = mensaje ?? "";
}

function mensajeDeAyuda(campo, etiqueta) {
    const titulo = etiqueta.toLowerCase();
    return `Completá ${titulo} para continuar.`;
}

function validarCampos(campos, formulario, mostrarTodos) {
    let primerError = null;
    for (const campo of campos) {
        const control = formulario.elements.namedItem(campo);
        let mensaje;
        if (campo === "antiguedad") {
            mensaje = validarAntiguedad(solicitud.equipo.antiguedad);
        } else if (campo === "terminos") {
            mensaje = validarTerminos(control.checked);
        } else {
            const valor = campo === "nombre" || campo === "apellido" ||
                campo === "dni" || campo === "nacimiento" ||
                campo === "email" || campo === "celular"
                ? solicitud.titular[campo]
                : control.value;
            mensaje = reglas[campo](valor);
        }

        if (mostrarTodos || camposTocados.has(campo)) {
            mostrarError(campo, mensaje);
        }
        if (mensaje && !primerError) {
            primerError = campo;
        }
        if (!mostrarTodos && primerError) {
            break;
        }
    }
    return primerError;
}

function enlazarValidaciones(campos, formulario, boton, ayudaId) {
    const ayuda = document.getElementById(ayudaId);
    const revisar = () => {
        const primero = validarCampos(campos, formulario, false);
        boton.disabled = Boolean(primero);
        ayuda.textContent = primero
            ? mensajeDeAyuda(primero, formulario.querySelector(`[for="${primero}"]`)?.textContent ?? "los campos pendientes")
            : "";
    };

    for (const campo of campos) {
        const control = formulario.elements.namedItem(campo);
        const controles = campo === "antiguedad" ? [...control] : [control];
        for (const input of controles) {
            input.addEventListener("input", () => {
                guardarCampo(campo, formulario);
                revisar();
            });
            input.addEventListener("change", () => {
                guardarCampo(campo, formulario);
                revisar();
            });
            input.addEventListener("blur", () => {
                guardarCampo(campo, formulario);
                camposTocados.add(campo);
                validarCampos([campo], formulario, true);
                revisar();
            });
        }
    }

    revisar();
}

function prepararCotizacion() {
    const form = document.getElementById("equipment-form");
    const button = document.getElementById("equipment-next");
    const campos = porPagina.cotizacion.campos;
    cargarDatosDeFormulario(campos, form);
    enlazarValidaciones(campos, form, button, "equipment-action-help");

    form.addEventListener("submit", event => {
        event.preventDefault();
        const primerError = validarCampos(campos, form, true);
        if (primerError) {
            const input = primerError === "antiguedad"
                ? form.elements.namedItem("antiguedad")[0]
                : form.elements.namedItem(primerError);
            input.focus();
            return;
        }
        guardarSolicitud();
        window.location.assign(porPagina.cotizacion.destino);
    });
}

function prepararPlanes() {
    if (
        !solicitud.equipo.marca ||
        !solicitud.equipo.modelo ||
        validarValor(solicitud.equipo.valor) ||
        validarAntiguedad(solicitud.equipo.antiguedad)
    ) {
        window.location.replace("cotizacion.html");
        return;
    }
    if (fallóCargaPlanes) {
        document.getElementById("plans-loading").hidden = true;
        document.getElementById("plans-next").disabled = true;
        return;
    }

    document.getElementById("plans-loading").hidden = true;
    renderPlanes(planes);
    document.getElementById("plan-list").addEventListener("change", event => {
        if (event.target.name !== "plan") {
            return;
        }
        solicitud.plan = event.target.value;
        guardarSolicitud();
        actualizarResumen();
    });

    document.getElementById("plans-form").addEventListener("submit", event => {
        event.preventDefault();
        if (!planes.some(plan => plan.id === solicitud.plan)) {
            return;
        }
        guardarSolicitud();
        window.location.assign("titular.html");
    });
}

function prepararTitular() {
    if (
        !solicitud.equipo.marca ||
        !solicitud.equipo.modelo ||
        validarValor(solicitud.equipo.valor) ||
        validarAntiguedad(solicitud.equipo.antiguedad) ||
        !planes.some(plan => plan.id === solicitud.plan)
    ) {
        window.location.replace("cotizacion.html");
        return;
    }
    const form = document.getElementById("holder-form");
    const campos = porPagina.titular.campos;
    cargarDatosDeFormulario(campos, form);
    enlazarValidaciones(
        campos,
        form,
        document.getElementById("holder-next"),
        "holder-action-help"
    );

    const hoy = new Date();
    const limite = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
    form.elements.namedItem("nacimiento").max = [
        limite.getFullYear(),
        String(limite.getMonth() + 1).padStart(2, "0"),
        String(limite.getDate()).padStart(2, "0")
    ].join("-");

    form.addEventListener("submit", event => {
        event.preventDefault();
        const primerError = validarCampos(campos, form, true);
        if (primerError) {
            form.elements.namedItem(primerError).focus();
            return;
        }
        guardarSolicitud();
        window.location.assign(porPagina.titular.destino);
    });
}

function prepararPago() {
    const titularValido = [
        ["nombre", solicitud.titular.nombre],
        ["apellido", solicitud.titular.apellido],
        ["dni", solicitud.titular.dni],
        ["nacimiento", solicitud.titular.nacimiento],
        ["email", solicitud.titular.email],
        ["celular", solicitud.titular.celular],
        ["terminos", solicitud.titular.terminos]
    ].every(([campo, valor]) => !reglas[campo](valor));
    if (
        !solicitud.equipo.marca ||
        validarValor(solicitud.equipo.valor) ||
        validarAntiguedad(solicitud.equipo.antiguedad) ||
        !planes.some(plan => plan.id === solicitud.plan) ||
        !titularValido
    ) {
        window.location.replace("titular.html");
        return;
    }
    if (fallóCargaPlanes) {
        return;
    }

    const form = document.getElementById("payment-form");
    const boton = document.getElementById("pay-button");
    const fields = ["tarjeta", "vencimiento", "cvv", "pagoTitular"];
    form.elements.namedItem("metodo").value = solicitud.pago.metodo;
    form.elements.namedItem("pagoTitular").value = solicitud.pago.titular;

    const revisar = () => {
        let primerError = null;
        for (const field of fields) {
            const value = form.elements.namedItem(field).value;
            const error = reglas[field](value);
            if (camposTocados.has(field)) {
                mostrarError(field, error);
            }
            if (error && !primerError) {
                primerError = field;
            }
        }
        boton.disabled = Boolean(primerError);
        document.getElementById("payment-action-help").textContent =
            primerError ? "Completá los datos de pago para continuar." : "";
    };

    form.elements.namedItem("metodo").addEventListener("change", event => {
        solicitud.pago.metodo = event.target.value;
        guardarSolicitud();
    });
    for (const field of fields) {
        const input = form.elements.namedItem(field);
        input.addEventListener("input", () => {
            if (field === "tarjeta") {
                const digits = input.value.replace(/\D/g, "").slice(0, 16);
                input.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
            } else if (field === "vencimiento") {
                const digits = input.value.replace(/\D/g, "").slice(0, 4);
                input.value = digits.length > 2
                    ? `${digits.slice(0, 2)}/${digits.slice(2)}`
                    : digits;
            } else if (field === "pagoTitular") {
                solicitud.pago.titular = input.value;
                guardarSolicitud();
            }
            if (camposTocados.has(field)) {
                mostrarError(field, reglas[field](input.value));
            }
            revisar();
        });
        input.addEventListener("blur", () => {
            camposTocados.add(field);
            mostrarError(field, reglas[field](input.value));
            revisar();
        });
    }

    revisar();
    form.addEventListener("submit", async event => {
        event.preventDefault();
        revisar();
        const invalid = fields.find(field =>
            reglas[field](form.elements.namedItem(field).value)
        );
        if (invalid) {
            form.elements.namedItem(invalid).focus();
            return;
        }

        const tarjeta = form.elements.namedItem("tarjeta").value;
        boton.disabled = true;
        boton.textContent = "Procesando…";
        document.getElementById("live-status").textContent =
            "Procesando el pago simulado.";
        const resultado = await simularPago(tarjeta);

        if (resultado.ok) {
            solicitud.poliza = generarPoliza();
            solicitud.intentoRechazado = false;
            guardarSolicitud();
            window.location.assign("exito.html");
            return;
        }

        solicitud.intentoRechazado = true;
        guardarSolicitud();
        window.location.assign("error.html");
    });
}

function prepararResultado() {
    const esExito = pagina === "exito";
    if (esExito && !solicitud.poliza) {
        window.location.replace("index.html");
        return;
    }
    if (!esExito && !solicitud.intentoRechazado) {
        window.location.replace("index.html");
        return;
    }

    if (fallóCargaPlanes) {
        return;
    }
    renderResultado(planes);
    document.querySelector("[data-retry]")?.addEventListener("click", () => {
        window.location.assign("pago.html");
    });
    document.querySelector("[data-change-method]")?.addEventListener("click", () => {
        window.location.assign("pago.html#metodo");
    });
    document.querySelector("[data-reset]")?.addEventListener("click", () => {
        reiniciarSolicitud();
        window.location.assign("index.html");
    });
}

function actualizarResumen() {
    if (planes.length > 0 && document.getElementById("summary-card")) {
        renderResumen(planes);
    }
}

async function iniciar() {
    if (pagina === "home") {
        document.querySelectorAll("[data-new-request]").forEach(link => {
            link.addEventListener("click", event => {
                event.preventDefault();
                reiniciarSolicitud();
                window.location.assign(link.href);
            });
        });
        return;
    }

    if (pagina === "planes" || pagina === "pago" ||
        pagina === "exito" || pagina === "error") {
        await cargarPlanes();
        if (!fallóCargaPlanes) {
            actualizarResumen();
        }
        if (pagina === "planes") {
            prepararPlanes();
        } else if (pagina === "pago") {
            prepararPago();
        } else {
            prepararResultado();
        }
        return;
    }

    if (pagina === "cotizacion") {
        prepararCotizacion();
    } else if (pagina === "titular") {
        await cargarPlanes();
        if (!fallóCargaPlanes) {
            actualizarResumen();
            prepararTitular();
        }
    }
}

await iniciar();
