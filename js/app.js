import { solicitud, actualizar, irAPaso, reiniciar } from "./estado.js";
import { validar } from "./validaciones.js";
import { renderStepper, renderPlanes, renderResumen, renderResultado } from "./render.js";
import { simularPago, generarPoliza } from "./pago.js";
import { calcularCuota } from "./cotizador.js";

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
let planes = [];
try {
  const respuesta = await fetch("./data/planes.json");
  if (!respuesta.ok) throw new Error("No se pudo cargar data/planes.json");
  planes = await respuesta.json();
} catch (error) {
  console.error(error);
  alert("No se pudieron cargar los planes. Abrí el proyecto con Live Server o con un servidor local, no con file://.");
}
const valorLimpio = v => Number(String(v).replace(/\D/g, ""));
function setError(campo, mensaje) {
  const input = $(`#${campo}`);
  const error = $(`#${campo}-error`);
  if (input) {
    if (mensaje) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
  }
  const field = input?.closest(".field");
  if (field) field.toggleAttribute("data-invalid", Boolean(mensaje));
  if (error) error.textContent = mensaje || "";
}
function validarCampo(campo) {
  const el = $(`#${campo}`);
  const valor = campo === "antiguedad" ? $('input[name="antiguedad"]:checked')?.value || "" : campo === "terminos" ? $("#terminos").checked : el?.value || "";
  const error = validar(campo, valor, solicitud);
  setError(campo, error);
  return !error;
}
function campoBlur(campo) {
  const el = $(`#${campo}`);
  if (el) el.addEventListener("blur", () => validarCampo(campo));
}
function formValido(campos) {
  let valido = true;
  for (const c of campos) if (!validarCampo(c)) valido = false;
  if (!valido) $("[aria-invalid=true]")?.focus();
  return valido;
}
function actualizarBoton(id, campos) {
  const btn = $(`#${id}`);
  const revisar = () => btn.disabled = !campos.every(c => {
    const el = $(`#${c}`);
    const v = c === "antiguedad" ? $('input[name="antiguedad"]:checked')?.value || "" : c === "terminos" ? $("#terminos").checked : el?.value || "";
    return !validar(c, v, solicitud);
  });
  campos.forEach(c => {
    const el = c === "antiguedad" ? $$('input[name="antiguedad"]') : [ $(`#${c}`) ].filter(Boolean);
    el.forEach(e => { e.addEventListener("input", revisar); e.addEventListener("change", revisar); });
  });
  revisar();
}
const camposEquipo = ["marca","modelo","valor","antiguedad"];
const camposTitular = ["nombre","apellido","dni","nacimiento","email","celular","terminos"];
const camposPago = ["tarjeta","vencimiento","cvv","pago-titular"];
[...camposEquipo,...camposTitular,...camposPago].forEach(campoBlur);

$("#valor").addEventListener("input", e => {
  const clean = e.target.value.replace(/\D/g, "");
  if (e.target.value !== clean) e.target.value = clean;
});
$("#equipo-form").addEventListener("submit", e => {
  e.preventDefault();
  if (!formValido(camposEquipo)) return;
  solicitud.equipo = { marca: $("#marca").value, modelo: $("#modelo").value.trim(), valor: valorLimpio($("#valor").value), antiguedad: $('input[name="antiguedad"]:checked').value };
  renderStepper(); renderPlanes(planes); irAPaso(2);
});
actualizarBoton("ver-planes", camposEquipo);
$("#ir-datos").addEventListener("click", () => { renderResumen(planes); irAPaso(3); renderStepper(); });
$("#titular-form").addEventListener("submit", e => {
  e.preventDefault();
  if (!formValido(camposTitular)) return;
  solicitud.titular = { nombre: $("#nombre").value.trim(), apellido: $("#apellido").value.trim(), dni: $("#dni").value, nacimiento: $("#nacimiento").value, email: $("#email").value.trim(), celular: $("#celular").value.replace(/[\s-]/g, ""), terminos: $("#terminos").checked };
  renderResumen(planes); renderStepper(); irAPaso(4);
});
actualizarBoton("continuar-pago", camposTitular);
$("#tarjeta").addEventListener("input", e => {
  const digits = e.target.value.replace(/\D/g, "").slice(0,16);
  e.target.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
});
$("#vencimiento").addEventListener("input", e => {
  let d = e.target.value.replace(/\D/g, "").slice(0,4);
  if (d.length > 2) d = d.slice(0,2) + "/" + d.slice(2);
  e.target.value = d;
});
$("#pago-form").addEventListener("submit", async e => {
  e.preventDefault();
  if (!formValido(camposPago)) return;
  solicitud.pago = { metodo: $("#metodo").value, tarjeta: $("#tarjeta").value, vencimiento: $("#vencimiento").value, cvv: $("#cvv").value, titular: $("#pago-titular").value.trim() };
  const boton = $("#pagar");
  boton.disabled = true; boton.textContent = "Procesando…";
  const resultado = await simularPago(solicitud.pago.tarjeta);
  boton.disabled = false; boton.textContent = "Pagar y emitir póliza";
  if (resultado.ok) {
    solicitud.poliza = generarPoliza();
    renderResultado(planes); irAPaso(5);
  } else {
    irAPaso(6);
  }
});
$("#reintentar").addEventListener("click", () => { irAPaso(4); renderStepper(); renderResumen(planes); });
$("[data-cambiar-pago]").addEventListener("click", () => { $("#tarjeta").focus(); irAPaso(4); });
$$("[data-volver]").forEach(btn => btn.addEventListener("click", () => {
  const n = Number(btn.dataset.volver);
  irAPaso(n);
  renderStepper();
  if (n === 2 || n === 3 || n === 4) renderResumen(planes);
}));
$$("[data-ir]").forEach(btn => btn.addEventListener("click", () => { irAPaso(Number(btn.dataset.ir)); renderStepper(); }));
$("#brand-home").addEventListener("click", e => { e.preventDefault(); reiniciar(); });
$$("[data-reiniciar]").forEach(btn => btn.addEventListener("click", reiniciar));
renderStepper();
