export function calcularCuota(valor, tasaAnual, antiguedad) {
    const factorAntiguedad = antiguedad < 1
        ? 1
        : antiguedad <= 2
            ? 1.1
            : 1.25;

    return Math.round(valor * tasaAnual / 12 * factorAntiguedad);
}
