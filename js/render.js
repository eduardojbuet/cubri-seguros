import { solicitud } from "./estado.js";
import { calcularCuota } from "./cotizador.js";

const moneda = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

export function formatearPrecio(valor) {
    return moneda.format(valor);
}

export function calcularPrecioPlan(plan) {
    return calcularCuota(
        Number(solicitud.equipo.valor),
        plan.tasaAnual,
        Number(solicitud.equipo.antiguedad)
    );
}

function crearPlanCard(plan) {
    const label = document.createElement("label");
    label.className = "plan-option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "plan";
    input.value = plan.id;
    input.checked = solicitud.plan === plan.id;
    input.setAttribute("aria-label", `Elegir plan ${plan.nombre}`);

    const card = document.createElement("span");
    card.className = "plan-card";

    const nameRow = document.createElement("span");
    nameRow.className = "plan-name-row";

    const name = document.createElement("h2");
    name.className = "plan-name";
    name.textContent = plan.nombre;

    nameRow.appendChild(name);
    if (plan.recomendado) {
        const badge = document.createElement("span");
        badge.className = "recommended-badge";
        badge.textContent = "Recomendado";
        nameRow.appendChild(badge);
    }

    const price = document.createElement("span");
    price.className = "plan-price";
    price.textContent = formatearPrecio(calcularPrecioPlan(plan));
    const monthly = document.createElement("small");
    monthly.textContent = " / mes";
    price.appendChild(monthly);

    const description = document.createElement("span");
    description.className = "plan-description";
    description.textContent = plan.descripcion;

    const coverageHeading = document.createElement("span");
    coverageHeading.className = "field-help";
    coverageHeading.textContent = "Coberturas";

    const coverageList = document.createElement("ul");
    coverageList.className = "coverage-list";
    for (const coverage of plan.coberturas) {
        const item = document.createElement("li");
        item.textContent = coverage;
        coverageList.appendChild(item);
    }

    card.append(nameRow, price, description, coverageHeading, coverageList);
    label.append(input, card);
    return label;
}

export function renderPlanes(planes) {
    const list = document.getElementById("plan-list");
    list.replaceChildren(...planes.map(crearPlanCard));
}

export function renderResumen(planes) {
    const equipo = solicitud.equipo;
    document.getElementById("summary-equipment").textContent =
        equipo.marca && equipo.modelo
            ? `${equipo.marca} ${equipo.modelo}`
            : "Completá los datos";
    document.getElementById("summary-value").textContent =
        Number(equipo.valor) ? formatearPrecio(Number(equipo.valor)) : "—";

    const plan = planes.find(item => item.id === solicitud.plan);
    document.getElementById("summary-plan").textContent = plan?.nombre ?? "—";
    document.getElementById("summary-holder").textContent =
        [solicitud.titular.nombre, solicitud.titular.apellido]
            .filter(Boolean)
            .join(" ") || "—";
    document.getElementById("summary-total").textContent = plan
        ? formatearPrecio(calcularPrecioPlan(plan))
        : "—";
}

export function renderStepper() {
    const active = solicitud.paso;
    const progress = document.getElementById("progress-value");

    for (let step = 1; step <= 4; step += 1) {
        const indicator = document.querySelector(`[data-step-indicator="${step}"]`);
        indicator.classList.toggle("is-active", step === active);
        indicator.classList.toggle("is-complete", step < active);

        if (step === active) {
            indicator.setAttribute("aria-current", "step");
        } else {
            indicator.removeAttribute("aria-current");
        }

        indicator.firstElementChild.textContent = step < active ? "✓" : String(step);
    }

    if (progress) {
        progress.style.width = `${Math.max(0, Math.min(active - 1, 4)) * 25}%`;
    }
}

export function renderResultado(planes) {
    const plan = planes.find(item => item.id === solicitud.plan);
    const nombre = `${solicitud.titular.nombre} ${solicitud.titular.apellido}`.trim();
    const resumen = [
        `Seguro de celular · ${solicitud.equipo.marca} ${solicitud.equipo.modelo}`,
        `Plan ${plan?.nombre ?? ""} · ${formatearPrecio(plan ? calcularPrecioPlan(plan) : 0)} por mes`,
        `Titular: ${nombre}`,
        `Email: ${solicitud.titular.email}`
    ].join("\n");

    const exito = document.getElementById("success-name");
    if (exito) {
        exito.textContent = nombre;
        document.getElementById("success-email").textContent = solicitud.titular.email;
        document.getElementById("policy-number").textContent = solicitud.poliza;
        document.getElementById("success-summary").textContent = resumen;
    }

    const rechazo = document.getElementById("failure-summary");
    if (rechazo) {
        rechazo.textContent = [
            `Equipo: ${solicitud.equipo.marca} ${solicitud.equipo.modelo}`,
            `Plan ${plan?.nombre ?? ""} · ${formatearPrecio(plan ? calcularPrecioPlan(plan) : 0)} por mes`,
            `Titular: ${nombre}`,
            `Email: ${solicitud.titular.email}`,
            "No se realizó ningún cobro."
        ].join("\n");
    }
}

export function renderVista() {
    for (const view of document.querySelectorAll("[data-step]")) {
        view.hidden = Number(view.dataset.step) !== solicitud.paso;
    }

    const esCheckout = solicitud.paso >= 1 && solicitud.paso <= 4;
    document.getElementById("stepper-wrap").hidden = !esCheckout;
    document.getElementById("summary-card").hidden =
        solicitud.paso === 0;
}
