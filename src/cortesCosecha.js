// =========================================================================
// MÓDULO UNIFICADO: COSECHA, CORTES Y DESTINO DE CAFÉ CEREZA
// FINCA LOS ROBLES
// =========================================================================

const getJsPDF = () => (window.jspdf && window.jspdf.jsPDF) ? window.jspdf.jsPDF : window.jsPDF;
const getChart = () => window.Chart;

// 81 Registros oficiales extraídos del PDF "CORTES DE CAFÉ 2026"
export const DATOS_BASE_CORTES_2026 = [
  { id: "corte-2026-001", temporada: "2025-2026", fecha: "2025-12-04", quintal: 5.12, libras: 512, precio: 365, total: 1868.80, pago: 512.00, saldoNeto: 1356.80, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-002", temporada: "2025-2026", fecha: "2025-12-06", quintal: 0.44, libras: 44, precio: 370, total: 162.80, pago: 44.00, saldoNeto: 118.80, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-003", temporada: "2025-2026", fecha: "2025-12-06", quintal: 1.42, libras: 142, precio: 370, total: 525.40, pago: 142.00, saldoNeto: 383.40, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-004", temporada: "2025-2026", fecha: "2025-12-10", quintal: 5.55, libras: 555, precio: 380, total: 2109.00, pago: 555.00, saldoNeto: 1554.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-005", temporada: "2025-2026", fecha: "2025-12-13", quintal: 4.74, libras: 474, precio: 380, total: 1801.20, pago: 474.00, saldoNeto: 1327.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-006", temporada: "2025-2026", fecha: "2025-12-19", quintal: 7.88, libras: 788, precio: 340, total: 2679.20, pago: 788.00, saldoNeto: 1891.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-007", temporada: "2025-2026", fecha: "2025-12-29", quintal: 10.89, libras: 1089, precio: 330, total: 3593.70, pago: 1089.00, saldoNeto: 2504.70, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-008", temporada: "2025-2026", fecha: "2025-12-30", quintal: 10.42, libras: 1042, precio: 330, total: 3438.60, pago: 1042.00, saldoNeto: 2396.60, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-009", temporada: "2025-2026", fecha: "2026-01-02", quintal: 16.54, libras: 1654, precio: 335, total: 5540.90, pago: 1654.00, saldoNeto: 3886.90, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-010", temporada: "2025-2026", fecha: "2026-01-03", quintal: 6.44, libras: 644, precio: 330, total: 2125.20, pago: 644.00, saldoNeto: 1481.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-011", temporada: "2025-2026", fecha: "2026-01-05", quintal: 17.33, libras: 1733, precio: 330, total: 5718.90, pago: 1733.00, saldoNeto: 3985.90, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-012", temporada: "2025-2026", fecha: "2026-01-06", quintal: 15.88, libras: 1588, precio: 345, total: 5478.60, pago: 1588.00, saldoNeto: 3890.60, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-013", temporada: "2025-2026", fecha: "2026-01-08", quintal: 5.66, libras: 566, precio: 345, total: 1952.70, pago: 566.00, saldoNeto: 1386.70, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-014", temporada: "2025-2026", fecha: "2026-01-09", quintal: 2.94, libras: 294, precio: 345, total: 1014.30, pago: 294.00, saldoNeto: 720.30, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-015", temporada: "2025-2026", fecha: "2026-01-10", quintal: 4.02, libras: 402, precio: 345, total: 1386.90, pago: 402.00, saldoNeto: 984.90, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-016", temporada: "2025-2026", fecha: "2026-01-13", quintal: 7.23, libras: 723, precio: 350, total: 2530.50, pago: 723.00, saldoNeto: 1807.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-017", temporada: "2025-2026", fecha: "2026-01-14", quintal: 6.31, libras: 631, precio: 350, total: 2208.50, pago: 631.00, saldoNeto: 1577.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-018", temporada: "2025-2026", fecha: "2026-01-15", quintal: 6.58, libras: 658, precio: 350, total: 2303.00, pago: 658.00, saldoNeto: 1645.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-019", temporada: "2025-2026", fecha: "2026-01-26", quintal: 8.02, libras: 802, precio: 345, total: 2766.90, pago: 802.00, saldoNeto: 1964.90, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-020", temporada: "2025-2026", fecha: "2026-01-28", quintal: 7.42, libras: 742, precio: 345, total: 2559.90, pago: 742.00, saldoNeto: 1817.90, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-021", temporada: "2025-2026", fecha: "2026-01-29", quintal: 11.52, libras: 1152, precio: 340, total: 3916.80, pago: 1152.00, saldoNeto: 2764.80, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-022", temporada: "2025-2026", fecha: "2026-01-30", quintal: 10.06, libras: 1006, precio: 335, total: 3370.10, pago: 1006.00, saldoNeto: 2364.10, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-023", temporada: "2025-2026", fecha: "2026-01-31", quintal: 9.66, libras: 966, precio: 335, total: 3236.10, pago: 966.00, saldoNeto: 2270.10, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-024", temporada: "2025-2026", fecha: "2026-02-02", quintal: 6.16, libras: 616, precio: 325, total: 2002.00, pago: 616.00, saldoNeto: 1386.00, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-025", temporada: "2025-2026", fecha: "2026-02-03", quintal: 5.47, libras: 547, precio: 325, total: 1777.75, pago: 547.00, saldoNeto: 1230.75, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-026", temporada: "2025-2026", fecha: "2026-02-07", quintal: 5.14, libras: 514, precio: 325, total: 1670.50, pago: 514.00, saldoNeto: 1156.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-027", temporada: "2025-2026", fecha: "2026-02-09", quintal: 4.92, libras: 492, precio: 325, total: 1599.00, pago: 492.00, saldoNeto: 1107.00, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-028", temporada: "2025-2026", fecha: "2026-02-10", quintal: 6.37, libras: 637, precio: 325, total: 2070.25, pago: 637.00, saldoNeto: 1433.25, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-029", temporada: "2025-2026", fecha: "2026-02-11", quintal: 8.69, libras: 869, precio: 325, total: 2824.25, pago: 869.00, saldoNeto: 1955.25, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-030", temporada: "2025-2026", fecha: "2026-02-12", quintal: 7.24, libras: 724, precio: 325, total: 2353.00, pago: 724.00, saldoNeto: 1629.00, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-031", temporada: "2025-2026", fecha: "2026-02-13", quintal: 5.90, libras: 590, precio: 325, total: 1917.50, pago: 590.00, saldoNeto: 1327.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-032", temporada: "2025-2026", fecha: "2026-02-14", quintal: 9.14, libras: 914, precio: 325, total: 2970.50, pago: 914.00, saldoNeto: 2056.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-033", temporada: "2025-2026", fecha: "2026-02-17", quintal: 5.92, libras: 592, precio: 325, total: 1924.00, pago: 592.00, saldoNeto: 1332.00, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-034", temporada: "2025-2026", fecha: "2026-02-18", quintal: 9.35, libras: 935, precio: 315, total: 2945.25, pago: 935.00, saldoNeto: 2010.25, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-035", temporada: "2025-2026", fecha: "2026-02-19", quintal: 8.97, libras: 897, precio: 315, total: 2825.55, pago: 897.00, saldoNeto: 1928.55, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-036", temporada: "2025-2026", fecha: "2026-02-20", quintal: 6.07, libras: 607, precio: 315, total: 1912.05, pago: 607.00, saldoNeto: 1305.05, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-037", temporada: "2025-2026", fecha: "2026-02-21", quintal: 7.16, libras: 716, precio: 315, total: 2255.40, pago: 716.00, saldoNeto: 1539.40, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-038", temporada: "2025-2026", fecha: "2026-02-25", quintal: 4.58, libras: 458, precio: 310, total: 1419.80, pago: 458.00, saldoNeto: 961.80, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-039", temporada: "2025-2026", fecha: "2026-02-26", quintal: 5.57, libras: 557, precio: 310, total: 1726.70, pago: 557.00, saldoNeto: 1169.70, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-040", temporada: "2025-2026", fecha: "2026-02-27", quintal: 5.83, libras: 583, precio: 315, total: 1836.45, pago: 583.00, saldoNeto: 1253.45, destino: "PERGAMINO", tipoDestino: "pergamino", comprador: "Finca Los Robles", tarifaCorte: 100, boleta: "", notas: "Proceso Húmedo propio" },
  { id: "corte-2026-041", temporada: "2025-2026", fecha: "2026-02-28", quintal: 4.06, libras: 406, precio: 315, total: 1278.90, pago: 406.00, saldoNeto: 872.90, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-042", temporada: "2025-2026", fecha: "2026-03-02", quintal: 10.71, libras: 1071, precio: 310, total: 3320.10, pago: 1071.00, saldoNeto: 2249.10, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-043", temporada: "2025-2026", fecha: "2026-03-03", quintal: 9.65, libras: 965, precio: 310, total: 2991.50, pago: 965.00, saldoNeto: 2026.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-044", temporada: "2025-2026", fecha: "2026-03-04", quintal: 11.73, libras: 1173, precio: 310, total: 3636.30, pago: 1173.00, saldoNeto: 2463.30, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-045", temporada: "2025-2026", fecha: "2026-03-05", quintal: 10.62, libras: 1062, precio: 310, total: 3292.20, pago: 1062.00, saldoNeto: 2230.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-046", temporada: "2025-2026", fecha: "2026-03-06", quintal: 9.92, libras: 992, precio: 310, total: 3075.20, pago: 992.00, saldoNeto: 2083.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-047", temporada: "2025-2026", fecha: "2026-03-07", quintal: 17.45, libras: 1745, precio: 310, total: 5409.50, pago: 1745.00, saldoNeto: 3664.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-048", temporada: "2025-2026", fecha: "2026-03-09", quintal: 16.01, libras: 1601, precio: 310, total: 4963.10, pago: 1601.00, saldoNeto: 3362.10, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-049", temporada: "2025-2026", fecha: "2026-03-10", quintal: 18.10, libras: 1810, precio: 310, total: 5611.00, pago: 1810.00, saldoNeto: 3801.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-050", temporada: "2025-2026", fecha: "2026-03-11", quintal: 18.19, libras: 1819, precio: 310, total: 5638.90, pago: 1819.00, saldoNeto: 3819.90, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-051", temporada: "2025-2026", fecha: "2026-03-17", quintal: 3.28, libras: 328, precio: 300, total: 984.00, pago: 328.00, saldoNeto: 656.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-052", temporada: "2025-2026", fecha: "2026-03-19", quintal: 2.53, libras: 253, precio: 300, total: 759.00, pago: 253.00, saldoNeto: 506.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-053", temporada: "2025-2026", fecha: "2026-03-21", quintal: 3.98, libras: 398, precio: 300, total: 1194.00, pago: 398.00, saldoNeto: 796.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-054", temporada: "2025-2026", fecha: "2026-03-24", quintal: 1.70, libras: 170, precio: 175, total: 297.50, pago: 170.00, saldoNeto: 127.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-055", temporada: "2025-2026", fecha: "2026-03-24", quintal: 1.22, libras: 122, precio: 300, total: 366.00, pago: 122.00, saldoNeto: 244.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-056", temporada: "2025-2026", fecha: "2026-03-25", quintal: 1.71, libras: 171, precio: 300, total: 513.00, pago: 171.00, saldoNeto: 342.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-057", temporada: "2025-2026", fecha: "2026-03-25", quintal: 2.44, libras: 244, precio: 175, total: 427.00, pago: 244.00, saldoNeto: 183.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-058", temporada: "2025-2026", fecha: "2026-03-31", quintal: 4.14, libras: 414, precio: 300, total: 1242.00, pago: 414.00, saldoNeto: 828.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-059", temporada: "2025-2026", fecha: "2026-03-31", quintal: 5.72, libras: 572, precio: 175, total: 1001.00, pago: 572.00, saldoNeto: 429.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-060", temporada: "2025-2026", fecha: "2026-04-09", quintal: 4.35, libras: 435, precio: 175, total: 761.25, pago: 435.00, saldoNeto: 326.25, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-061", temporada: "2025-2026", fecha: "2026-04-09", quintal: 3.91, libras: 391, precio: 300, total: 1173.00, pago: 391.00, saldoNeto: 782.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-062", temporada: "2025-2026", fecha: "2026-04-10", quintal: 4.24, libras: 424, precio: 290, total: 1229.60, pago: 424.00, saldoNeto: 805.60, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-063", temporada: "2025-2026", fecha: "2026-04-10", quintal: 4.16, libras: 416, precio: 170, total: 707.20, pago: 416.00, saldoNeto: 291.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-064", temporada: "2025-2026", fecha: "2026-04-11", quintal: 1.96, libras: 196, precio: 280, total: 548.80, pago: 196.00, saldoNeto: 352.80, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-065", temporada: "2025-2026", fecha: "2026-04-11", quintal: 2.74, libras: 274, precio: 170, total: 465.80, pago: 274.00, saldoNeto: 191.80, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-066", temporada: "2025-2026", fecha: "2026-04-14", quintal: 2.35, libras: 235, precio: 280, total: 658.00, pago: 235.00, saldoNeto: 423.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-067", temporada: "2025-2026", fecha: "2026-04-14", quintal: 3.40, libras: 340, precio: 170, total: 578.00, pago: 340.00, saldoNeto: 238.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-068", temporada: "2025-2026", fecha: "2026-04-18", quintal: 1.26, libras: 126, precio: 270, total: 340.20, pago: 126.00, saldoNeto: 214.20, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-069", temporada: "2025-2026", fecha: "2026-04-18", quintal: 2.61, libras: 261, precio: 170, total: 443.70, pago: 261.00, saldoNeto: 182.70, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-070", temporada: "2025-2026", fecha: "2026-04-21", quintal: 2.98, libras: 298, precio: 270, total: 804.60, pago: 298.00, saldoNeto: 506.60, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-071", temporada: "2025-2026", fecha: "2026-04-21", quintal: 3.49, libras: 349, precio: 160, total: 558.40, pago: 349.00, saldoNeto: 209.40, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-072", temporada: "2025-2026", fecha: "2026-04-24", quintal: 3.21, libras: 321, precio: 160, total: 513.60, pago: 321.00, saldoNeto: 192.60, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-073", temporada: "2025-2026", fecha: "2026-04-24", quintal: 1.83, libras: 183, precio: 250, total: 457.50, pago: 183.00, saldoNeto: 274.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-074", temporada: "2025-2026", fecha: "2026-04-25", quintal: 1.84, libras: 184, precio: 250, total: 460.00, pago: 184.00, saldoNeto: 276.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-075", temporada: "2025-2026", fecha: "2026-04-25", quintal: 2.65, libras: 265, precio: 160, total: 424.00, pago: 265.00, saldoNeto: 159.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-076", temporada: "2025-2026", fecha: "2026-04-28", quintal: 3.50, libras: 350, precio: 160, total: 560.00, pago: 350.00, saldoNeto: 210.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-077", temporada: "2025-2026", fecha: "2026-04-28", quintal: 2.08, libras: 208, precio: 250, total: 520.00, pago: 208.00, saldoNeto: 312.00, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-078", temporada: "2025-2026", fecha: "2026-04-30", quintal: 3.61, libras: 361, precio: 250, total: 902.50, pago: 361.00, saldoNeto: 541.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-079", temporada: "2025-2026", fecha: "2026-04-30", quintal: 4.09, libras: 409, precio: 160, total: 654.40, pago: 409.00, saldoNeto: 245.40, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-080", temporada: "2025-2026", fecha: "2026-05-02", quintal: 2.96, libras: 296, precio: 160, total: 473.60, pago: 296.00, saldoNeto: 177.60, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" },
  { id: "corte-2026-081", temporada: "2025-2026", fecha: "2026-05-02", quintal: 3.35, libras: 335, precio: 250, total: 837.50, pago: 335.00, saldoNeto: 502.50, destino: "ERIKA", tipoDestino: "venta", comprador: "Erika", tarifaCorte: 100, boleta: "", notas: "" }
];

// Estado global de cortes
export let todosLosCortesDiarios = [];
export let temporadaCortesActual = "2025-2026";
let chartComparativaInstance = null;
let chartFinanzasInstance = null;
let cortesExtraidosPreview = [];

// Clave en almacenamiento local (caché offline y de acceso rápido)
const STORAGE_KEY_CORTES = "flr_cortes_diarios_v1";

// Cargar cortes desde Firestore y localStorage
export async function cargarCortesDiarios() {
  let cargadoLocal = false;

  // 1. Cargar desde localStorage para disponibilidad inmediata sin latencia
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CORTES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        todosLosCortesDiarios = parsed;
        cargadoLocal = true;
      }
    }
  } catch (e) {
    console.warn("Aviso al cargar cortes de localStorage:", e);
  }

  if (!cargadoLocal || todosLosCortesDiarios.length === 0) {
    todosLosCortesDiarios = JSON.parse(JSON.stringify(DATOS_BASE_CORTES_2026));
  }

  // Ordenar cronológicamente (fechas más recientes primero para trabajo diario)
  todosLosCortesDiarios.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

  // 2. Sincronizar en segundo plano con Firebase Firestore para compartir datos entre todos los dispositivos
  sincronizarCortesConFirestore();
}

// Guardar cortes en localStorage y en Firestore
export function guardarCortesStorage() {
  try {
    localStorage.setItem(STORAGE_KEY_CORTES, JSON.stringify(todosLosCortesDiarios));
  } catch(e) {
    console.warn("Aviso al guardar en localStorage:", e);
  }

  // Sincronizar automáticamente en la nube (Firestore)
  guardarCortesEnFirestore();
}

// Guardar en la base de datos de Firebase Firestore (colección 'cortes_cosecha')
export async function guardarCortesEnFirestore() {
  const dbInst = window.db;
  const fTools = window.firestoreTools;
  if (!dbInst || !fTools) return;

  try {
    // Agrupar cortes por temporada para almacenamiento eficiente y escalable
    const temporadasMap = {};
    todosLosCortesDiarios.forEach(c => {
      const temp = (c.temporada || "2025-2026").trim();
      if (!temporadasMap[temp]) temporadasMap[temp] = [];
      temporadasMap[temp].push(c);
    });

    const promesas = [];
    for (const [temp, cortesTemp] of Object.entries(temporadasMap)) {
      const tempDocId = temp.replace(/[\/\s]/g, '-');
      const totalQq = cortesTemp.reduce((acc, c) => acc + (parseFloat(c.quintal) || 0), 0);
      const totalPag = cortesTemp.reduce((acc, c) => acc + (parseFloat(c.total) || 0), 0);
      const totalPagoCort = cortesTemp.reduce((acc, c) => acc + (parseFloat(c.pago) || 0), 0);
      const totalSaldo = cortesTemp.reduce((acc, c) => acc + (parseFloat(c.saldoNeto) || 0), 0);

      const docData = {
        temporada: temp,
        cortes: cortesTemp,
        totalCortes: cortesTemp.length,
        totalQuintales: parseFloat(totalQq.toFixed(2)),
        totalPagado: parseFloat(totalPag.toFixed(2)),
        totalPagoCortadores: parseFloat(totalPagoCort.toFixed(2)),
        totalSaldoNeto: parseFloat(totalSaldo.toFixed(2)),
        actualizadoEn: new Date().toISOString()
      };

      promesas.push(
        fTools.setDoc(fTools.doc(dbInst, "cortes_cosecha", tempDocId), docData, { merge: true })
          .catch(err => console.warn(`Aviso guardando cosecha ${temp} en Firestore:`, err))
      );
    }

    await Promise.all(promesas);
    actualizarResumenCosechasDB();
  } catch(e) {
    console.warn("Aviso en guardarCortesEnFirestore:", e);
  }
}

// Sincronizar desde Firebase Firestore para que cualquier dispositivo tenga los mismos datos
export async function sincronizarCortesConFirestore(mostrarAlerta = false) {
  const dbInst = window.db;
  const fTools = window.firestoreTools;
  if (!dbInst || !fTools) {
    if (mostrarAlerta) alert("Base de datos no disponible para sincronización.");
    return false;
  }

  const btnSync = document.getElementById('btn-sync-cortes');
  if (btnSync && mostrarAlerta) {
    btnSync.disabled = true;
    btnSync.innerText = "⏳ Sincronizando...";
  }

  try {
    const snap = await Promise.race([
      fTools.getDocs(fTools.collection(dbInst, "cortes_cosecha")),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);

    if (snap && !snap.empty) {
      const cortesRemotos = [];
      snap.forEach(d => {
        const dData = d.data();
        if (Array.isArray(dData.cortes)) {
          cortesRemotos.push(...dData.cortes);
        }
      });

      if (cortesRemotos.length > 0) {
        // Combinar con los locales sin duplicar
        const map = new Map();
        // Primero remotos
        cortesRemotos.forEach(c => {
          const key = `${c.temporada || ''}_${c.fecha || ''}_${(c.destino || '').toUpperCase()}_${c.quintal || 0}`;
          map.set(key, c);
        });
        // Agregar locales que falten
        todosLosCortesDiarios.forEach(c => {
          const key = `${c.temporada || ''}_${c.fecha || ''}_${(c.destino || '').toUpperCase()}_${c.quintal || 0}`;
          if (!map.has(key)) map.set(key, c);
        });

        todosLosCortesDiarios = Array.from(map.values());
        todosLosCortesDiarios.sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));

        try {
          localStorage.setItem(STORAGE_KEY_CORTES, JSON.stringify(todosLosCortesDiarios));
        } catch(e){}

        renderModuloCortesDiarios();
        actualizarResumenCosechasDB();

        if (mostrarAlerta) {
          alert(`✅ Sincronización exitosa con la base de datos de Firebase:\n${todosLosCortesDiarios.length} cortes sincronizados en todos tus dispositivos.`);
        }
        return true;
      }
    } else {
      // Si Firestore está vacío, subir lo que tenemos actualmente para que otros dispositivos lo vean
      await guardarCortesEnFirestore();
      if (mostrarAlerta) {
        alert("✅ Datos de cortes guardados en la base de datos de Firebase.");
      }
      return true;
    }
  } catch(err) {
    console.warn("Aviso al sincronizar cortes con Firestore:", err);
    if (mostrarAlerta) {
      alert("❌ No se pudo sincronizar con Firebase: " + (err.message || 'Error de conexión'));
    }
    return false;
  } finally {
    if (btnSync && mostrarAlerta) {
      btnSync.disabled = false;
      btnSync.innerText = "☁️ Sincronizar Nube";
    }
  }
}

// Renderizar resumen de cosechas presentes en la base de datos
export function actualizarResumenCosechasDB() {
  const cont = document.getElementById("cortes-resumen-cosechas-db");
  if (!cont) return;

  const temporadas = [...new Set(todosLosCortesDiarios.map(c => c.temporada || "2025-2026"))].sort().reverse();
  if (temporadas.length === 0) {
    cont.innerHTML = `<div style="text-align:center; color:#64748b; font-size:0.85rem;">No hay cosechas registradas todavía.</div>`;
    return;
  }

  cont.innerHTML = `
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:12px;">
      ${temporadas.map(t => {
        const delTemp = todosLosCortesDiarios.filter(c => c.temporada === t);
        const qq = delTemp.reduce((acc, c) => acc + (parseFloat(c.quintal) || 0), 0);
        const saldo = delTemp.reduce((acc, c) => acc + (parseFloat(c.saldoNeto) || 0), 0);
        const totalPag = delTemp.reduce((acc, c) => acc + (parseFloat(c.total) || 0), 0);
        return `
          <div style="background:#ffffff; border:1px solid #cbd5e1; border-radius:8px; padding:12px 14px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <strong style="color:var(--primary); font-size:0.95rem;">Cosecha ${t}</strong>
              <span style="background:#ecfdf5; color:#065f46; font-size:0.7rem; font-weight:bold; padding:2px 8px; border-radius:10px; border:1px solid #a7f3d0;">☁️ En Firebase</span>
            </div>
            <div style="font-size:0.82rem; color:#475569; display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>Cortes registrados:</span>
              <strong style="color:#1e293b;">${delTemp.length} cortes</strong>
            </div>
            <div style="font-size:0.82rem; color:#475569; display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>Quintales recolectados:</span>
              <strong style="color:#0284c7;">${qq.toFixed(2)} qq</strong>
            </div>
            <div style="font-size:0.82rem; color:#475569; display:flex; justify-content:space-between; margin-bottom:3px;">
              <span>Total valor cortes:</span>
              <strong style="color:#1e293b;">Q ${totalPag.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>
            </div>
            <div style="font-size:0.82rem; color:#475569; display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:4px; margin-top:4px;">
              <span style="font-weight:bold;">Saldo Neto:</span>
              <strong style="color:#15803d; font-size:0.9rem;">Q ${saldo.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</strong>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

window.sincronizarCortesConFirestore = () => sincronizarCortesConFirestore(true);
window.guardarCortesEnFirestore = guardarCortesEnFirestore;
window.actualizarResumenCosechasDB = actualizarResumenCosechasDB;

// Inicializar el módulo unificado de cortes
export function inicializarModuloCortesDiarios() {
  cargarCortesDiarios();

  // Fecha de hoy por defecto en formulario de cortes diarios
  const hoy = new Date().toISOString().split("T")[0];
  const inpFecha = document.getElementById("corte-diario-fecha");
  if (inpFecha && !inpFecha.value) inpFecha.value = hoy;

  // Actualizar cálculo inicial del formulario si estuviera vacío
  actualizarCalculoNuevoCorteDiario("qq");

  renderModuloCortesDiarios();
}

// Cambiar temporada activa
window.cambiarTemporadaCortes = (temporada) => {
  temporadaCortesActual = temporada;
  renderModuloCortesDiarios();
};

// Renderizar tabla y KPIs de cortes diarios
export function renderModuloCortesDiarios() {
  const tbody = document.getElementById("tbody-cortes-diarios");
  const selTemporada = document.getElementById("cortes-filtro-temporada");
  const selDestino = document.getElementById("cortes-filtro-destino");
  const inpBusq = document.getElementById("cortes-filtro-busqueda");
  const badgeContador = document.getElementById("badge-contador-cortes");

  if (!tbody) return;

  // Poblar selector de temporadas dinámicamente
  const temporadasDisponibles = [...new Set(todosLosCortesDiarios.map(c => c.temporada || "2025-2026"))].sort().reverse();
  if (temporadasDisponibles.length === 0) temporadasDisponibles.push("2025-2026");

  if (selTemporada) {
    const valorSeleccionado = selTemporada.value || temporadaCortesActual;
    selTemporada.innerHTML = temporadasDisponibles.map(t =>
      `<option value="${t}" ${t === valorSeleccionado ? "selected" : ""}>Cosecha ${t}</option>`
    ).join("") + `<option value="todas" ${valorSeleccionado === "todas" ? "selected" : ""}>Todas las Cosechas</option>`;
  }

  const filtroDestino = selDestino ? selDestino.value : "todos";
  const filtroBusqueda = (inpBusq ? inpBusq.value : "").toLowerCase().trim();

  // Filtrado de registros
  let cortesFiltrados = todosLosCortesDiarios.filter(c => {
    // Filtro por temporada
    if (temporadaCortesActual !== "todas" && c.temporada !== temporadaCortesActual) {
      return false;
    }
    // Filtro por destino
    if (filtroDestino === "venta" && c.tipoDestino !== "venta") return false;
    if (filtroDestino === "pergamino" && c.tipoDestino !== "pergamino") return false;

    // Filtro por búsqueda
    if (filtroBusqueda) {
      const matchFecha = (c.fecha || "").includes(filtroBusqueda);
      const matchDestino = (c.destino || "").toLowerCase().includes(filtroBusqueda);
      const matchComp = (c.comprador || "").toLowerCase().includes(filtroBusqueda);
      const matchNotas = (c.notas || "").toLowerCase().includes(filtroBusqueda);
      const matchBoleta = (c.boleta || "").toLowerCase().includes(filtroBusqueda);
      if (!matchFecha && !matchDestino && !matchComp && !matchNotas && !matchBoleta) return false;
    }

    return true;
  });

  // KPIs de la temporada filtrada (o general si es 'todas')
  let totalQq = 0;
  let totalLbs = 0;
  let ventaQq = 0;
  let ventaMonto = 0;
  let pergaminoQq = 0;
  let pergaminoMonto = 0;
  let totalPago = 0;
  let totalCobrado = 0;
  let totalSaldo = 0;

  cortesFiltrados.forEach(c => {
    const qq = parseFloat(c.quintal) || 0;
    const lbs = parseFloat(c.libras) || (qq * 100);
    const tot = parseFloat(c.total) || 0;
    const pag = parseFloat(c.pago) || (qq * (parseFloat(c.tarifaCorte) || 100));
    const sal = parseFloat(c.saldoNeto) || (tot - pag);

    totalQq += qq;
    totalLbs += lbs;
    totalPago += pag;
    totalCobrado += tot;
    totalSaldo += sal;

    if (c.tipoDestino === "pergamino" || (c.destino || "").toUpperCase().includes("PERGAMINO")) {
      pergaminoQq += qq;
      pergaminoMonto += tot;
    } else {
      ventaQq += qq;
      ventaMonto += tot;
    }
  });

  const pctVenta = totalQq > 0 ? ((ventaQq / totalQq) * 100).toFixed(1) : "0.0";
  const pctPerg = totalQq > 0 ? ((pergaminoQq / totalQq) * 100).toFixed(1) : "0.0";
  const tarifaProm = totalQq > 0 ? (totalPago / totalQq).toFixed(2) : "100.00";
  const margenPct = totalCobrado > 0 ? ((totalSaldo / totalCobrado) * 100).toFixed(1) : "0.0";

  // Actualizar tarjetas de KPI
  const elCosechadoQq = document.getElementById("kpi-cortes-cosechado-qq");
  if (elCosechadoQq) elCosechadoQq.innerText = `${totalQq.toFixed(2)} qq`;

  const elCosechadoLbs = document.getElementById("kpi-cortes-cosechado-lbs");
  if (elCosechadoLbs) elCosechadoLbs.innerText = `${Math.round(totalLbs).toLocaleString("es-GT")} lbs recolectadas`;

  const elVendidoQq = document.getElementById("kpi-cortes-vendido-qq");
  if (elVendidoQq) elVendidoQq.innerText = `${ventaQq.toFixed(2)} qq (${pctVenta}%)`;

  const elVendidoMonto = document.getElementById("kpi-cortes-vendido-monto");
  if (elVendidoMonto) elVendidoMonto.innerText = `Q ${ventaMonto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elPergaminoQq = document.getElementById("kpi-cortes-pergamino-qq");
  if (elPergaminoQq) elPergaminoQq.innerText = `${pergaminoQq.toFixed(2)} qq (${pctPerg}%)`;

  const elPergaminoMonto = document.getElementById("kpi-cortes-pergamino-monto");
  if (elPergaminoMonto) elPergaminoMonto.innerText = `Q ${pergaminoMonto.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elPagoGente = document.getElementById("kpi-cortes-pago-gente");
  if (elPagoGente) elPagoGente.innerText = `Q ${totalPago.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elTarifaProm = document.getElementById("kpi-cortes-tarifa-promedio");
  if (elTarifaProm) elTarifaProm.innerText = `Q ${tarifaProm} / qq pagado a cortador`;

  const elSaldoNeto = document.getElementById("kpi-cortes-saldo-neto");
  if (elSaldoNeto) elSaldoNeto.innerText = `Q ${totalSaldo.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const elMargenPct = document.getElementById("kpi-cortes-margen-pct");
  if (elMargenPct) elMargenPct.innerText = `${margenPct}% margen neto sobre total`;

  if (badgeContador) {
    badgeContador.innerText = `${cortesFiltrados.length} cortes (${totalQq.toFixed(2)} qq)`;
  }

  // Renderizar filas de tabla
  if (cortesFiltrados.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align:center; padding:2rem; color:#64748b;">
          No hay cortes registrados para la temporada y filtros seleccionados. Usa el formulario arriba para ingresar el primer corte.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = cortesFiltrados.map((c, idx) => {
      const qq = parseFloat(c.quintal) || 0;
      const lbs = parseFloat(c.libras) || (qq * 100);
      const prec = parseFloat(c.precio) || 0;
      const tot = parseFloat(c.total) || (qq * prec);
      const pag = parseFloat(c.pago) || (qq * (parseFloat(c.tarifaCorte) || 100));
      const sal = parseFloat(c.saldoNeto) || (tot - pag);

      const esPergamino = c.tipoDestino === "pergamino" || (c.destino || "").toUpperCase().includes("PERGAMINO");
      const badgeDestino = esPergamino
        ? `<span style="background:#dcfce7; color:#15803d; border:1px solid #86efac; font-weight:800; font-size:0.75rem; padding:3px 8px; border-radius:12px; display:inline-block;">🏠 PERGAMINO (${c.tipoProceso || 'Finca'})</span>`
        : `<span style="background:#dbeafe; color:#1d4ed8; border:1px solid #93c5fd; font-weight:800; font-size:0.75rem; padding:3px 8px; border-radius:12px; display:inline-block;">🚚 ${c.comprador || c.destino || 'ERIKA'}</span>`;

      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="font-weight:600; text-align:center;">${c.fecha}</td>
          <td style="text-align:center; font-size:0.8rem; color:#64748b;">${c.temporada || '2025-2026'}</td>
          <td style="text-align:right; font-weight:bold; color:#1e293b;">${qq.toFixed(2)}</td>
          <td style="text-align:right; color:#64748b; font-size:0.85rem;">${Math.round(lbs)}</td>
          <td style="text-align:center;">${badgeDestino}</td>
          <td style="text-align:right; font-weight:600;">Q ${prec.toFixed(2)}</td>
          <td style="text-align:right; font-weight:bold; color:#0369a1;">Q ${tot.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="text-align:right; font-weight:bold; color:#b91c1c;">Q ${pag.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="text-align:right; font-weight:900; color:#15803d; background:#f0fdf4;">Q ${sal.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="text-align:center; white-space:nowrap;">
            <button type="button" class="btn btn-xs" style="background:#0284c7; color:white; padding:3px 7px;" onclick="abrirModalEditarCorteDiario('${c.id}')" title="Editar">✏️</button>
            <button type="button" class="btn btn-xs btn-danger" style="padding:3px 7px;" onclick="eliminarCorteDiario('${c.id}')" title="Eliminar">🗑️</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Actualizar pie de tabla
  const tfQq = document.getElementById("tfoot-cortes-qq");
  if (tfQq) tfQq.innerText = `${totalQq.toFixed(2)} qq`;

  const tfLbs = document.getElementById("tfoot-cortes-lbs");
  if (tfLbs) tfLbs.innerText = `${Math.round(totalLbs).toLocaleString("es-GT")} lbs`;

  const tfResumen = document.getElementById("tfoot-cortes-resumen-destinos");
  if (tfResumen) tfResumen.innerText = `${ventaQq.toFixed(1)} qq Venta | ${pergaminoQq.toFixed(1)} qq Pergamino`;

  const tfPrecioProm = document.getElementById("tfoot-cortes-precio-prom");
  if (tfPrecioProm) tfPrecioProm.innerText = totalQq > 0 ? `Q ${(totalCobrado / totalQq).toFixed(2)} / qq` : "-";

  const tfTot = document.getElementById("tfoot-cortes-total");
  if (tfTot) tfTot.innerText = `Q ${totalCobrado.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const tfPag = document.getElementById("tfoot-cortes-pago");
  if (tfPag) tfPag.innerText = `Q ${totalPago.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const tfSal = document.getElementById("tfoot-cortes-saldo");
  if (tfSal) tfSal.innerText = `Q ${totalSaldo.toLocaleString("es-GT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Interacción con formulario de nuevo corte diario
window.cambiarTipoDestinoNuevoCorte = (tipo) => {
  const camposVenta = document.getElementById("corte-campos-venta");
  const camposPergamino = document.getElementById("corte-campos-pergamino");
  const labelVenta = document.getElementById("label-destino-venta");
  const labelPergamino = document.getElementById("label-destino-pergamino");

  if (tipo === "pergamino") {
    if (camposVenta) camposVenta.style.display = "none";
    if (camposPergamino) camposPergamino.style.display = "grid";
    if (labelVenta) labelVenta.style.borderColor = "#cbd5e1";
    if (labelPergamino) labelPergamino.style.borderColor = "#15803d";
  } else {
    if (camposVenta) camposVenta.style.display = "grid";
    if (camposPergamino) camposPergamino.style.display = "none";
    if (labelVenta) labelVenta.style.borderColor = "#3b82f6";
    if (labelPergamino) labelPergamino.style.borderColor = "#cbd5e1";
  }
  actualizarCalculoNuevoCorteDiario("tipo");
};

window.actualizarCalculoNuevoCorteDiario = (origen) => {
  const inpQq = document.getElementById("corte-diario-quintal");
  const inpLbs = document.getElementById("corte-diario-libras");
  const inpPrecio = document.getElementById("corte-diario-precio-qq");
  const inpPrecioRef = document.getElementById("corte-diario-precio-ref");
  const inpTarifa = document.getElementById("corte-diario-tarifa-corte");

  let qq = parseFloat(inpQq?.value) || 0;
  let lbs = parseFloat(inpLbs?.value) || 0;

  if (origen === "qq") {
    lbs = qq * 100;
    if (inpLbs) inpLbs.value = lbs > 0 ? Math.round(lbs) : "";
  } else if (origen === "lbs") {
    qq = lbs / 100;
    if (inpQq) inpQq.value = qq > 0 ? qq.toFixed(2) : "";
  }

  // Saber qué destino está activo
  const radios = document.getElementsByName("corte-diario-destino-tipo");
  let tipoDestino = "venta";
  for (const r of radios) {
    if (r.checked) { tipoDestino = r.value; break; }
  }

  let precio = 0;
  if (tipoDestino === "pergamino") {
    precio = parseFloat(inpPrecioRef?.value) || 325.00;
  } else {
    precio = parseFloat(inpPrecio?.value) || 0;
  }

  const tarifaCorte = parseFloat(inpTarifa?.value) || 100.00;
  const total = qq * precio;
  const pago = qq * tarifaCorte;
  const saldo = total - pago;

  const prevTot = document.getElementById("corte-diario-total-preview");
  const prevPag = document.getElementById("corte-diario-pago-preview");
  const prevSal = document.getElementById("corte-diario-saldo-preview");

  if (prevTot) prevTot.innerText = `Q ${total.toFixed(2)}`;
  if (prevPag) prevPag.innerText = `Q ${pago.toFixed(2)}`;
  if (prevSal) prevSal.innerText = `Q ${saldo.toFixed(2)}`;
};

window.enfocarFormCorteDiario = () => {
  setTimeout(() => {
    const el = document.getElementById("corte-diario-quintal");
    if (el) el.focus();
  }, 100);
};

// Guardar nuevo corte diario
window.guardarNuevoCorteDiario = () => {
  const fecha = document.getElementById("corte-diario-fecha")?.value;
  const temporada = document.getElementById("corte-diario-temporada")?.value.trim() || "2025-2026";
  const qq = parseFloat(document.getElementById("corte-diario-quintal")?.value) || 0;
  const lbs = parseFloat(document.getElementById("corte-diario-libras")?.value) || (qq * 100);

  if (!fecha) return alert("⚠️ Selecciona la fecha del corte.");
  if (qq <= 0) return alert("⚠️ Ingresa una cantidad de quintales mayor a 0.");

  const radios = document.getElementsByName("corte-diario-destino-tipo");
  let tipoDestino = "venta";
  for (const r of radios) {
    if (r.checked) { tipoDestino = r.value; break; }
  }

  let destino = "ERIKA";
  let comprador = "Erika";
  let precio = 0;
  let tipoProceso = "";
  let lote = "";
  let boleta = "";
  let estadoCobro = "cobrado";

  if (tipoDestino === "pergamino") {
    destino = "PERGAMINO";
    comprador = "Finca Los Robles";
    precio = parseFloat(document.getElementById("corte-diario-precio-ref")?.value) || 325;
    tipoProceso = document.getElementById("corte-diario-proc-tipo")?.value || "Lavado";
    lote = document.getElementById("corte-diario-proc-lote")?.value.trim() || "";
  } else {
    comprador = document.getElementById("corte-diario-comprador")?.value.trim() || "Erika";
    destino = comprador.toUpperCase();
    precio = parseFloat(document.getElementById("corte-diario-precio-qq")?.value) || 0;
    boleta = document.getElementById("corte-diario-boleta")?.value.trim() || "";
    estadoCobro = document.getElementById("corte-diario-estado-cobro")?.value || "cobrado";
  }

  const tarifaCorte = parseFloat(document.getElementById("corte-diario-tarifa-corte")?.value) || 100;
  const total = qq * precio;
  const pago = qq * tarifaCorte;
  const saldoNeto = total - pago;
  const notas = document.getElementById("corte-diario-notas")?.value.trim() || "";

  const nuevoCorte = {
    id: "corte-" + Date.now(),
    temporada,
    fecha,
    quintal: qq,
    libras: lbs,
    precio,
    total,
    pago,
    saldoNeto,
    destino,
    tipoDestino,
    comprador,
    tipoProceso,
    lote,
    boleta,
    estadoCobro,
    tarifaCorte,
    notas
  };

  todosLosCortesDiarios.unshift(nuevoCorte);
  guardarCortesStorage();

  // Cambiar la temporada actual si fue agregada para otra temporada
  temporadaCortesActual = temporada;

  // Limpiar campos para la siguiente entrada
  const inQq = document.getElementById("corte-diario-quintal");
  const inLbs = document.getElementById("corte-diario-libras");
  const inNotas = document.getElementById("corte-diario-notas");
  if (inQq) inQq.value = "";
  if (inLbs) inLbs.value = "";
  if (inNotas) inNotas.value = "";

  actualizarCalculoNuevoCorteDiario("qq");
  renderModuloCortesDiarios();

  alert(`✅ Corte de ${qq.toFixed(2)} qq guardado con éxito (${destino} - Saldo: Q ${saldoNeto.toFixed(2)}).`);
};

// Eliminar corte individual
window.eliminarCorteDiario = (id) => {
  const item = todosLosCortesDiarios.find(c => c.id === id);
  if (!item) return;

  const desc = `${item.fecha} (${item.quintal} qq - ${item.destino})`;
  if (!confirm(`¿Eliminar este registro de corte de café?\n${desc}`)) return;

  todosLosCortesDiarios = todosLosCortesDiarios.filter(c => c.id !== id);
  guardarCortesStorage();
  renderModuloCortesDiarios();
};

// Modal de edición de corte
window.abrirModalEditarCorteDiario = (id) => {
  const item = todosLosCortesDiarios.find(c => c.id === id);
  if (!item) return;

  document.getElementById("edit-corte-id").value = id;
  document.getElementById("edit-corte-fecha").value = item.fecha || "";
  document.getElementById("edit-corte-temporada").value = item.temporada || "2025-2026";
  document.getElementById("edit-corte-quintal").value = item.quintal || "";
  document.getElementById("edit-corte-libras").value = item.libras || (item.quintal * 100);
  document.getElementById("edit-corte-destino-tipo").value = item.tipoDestino || "venta";
  document.getElementById("edit-corte-comprador").value = item.comprador || item.destino || "Erika";
  document.getElementById("edit-corte-precio-qq").value = item.precio || 0;
  document.getElementById("edit-corte-tarifa-qq").value = item.tarifaCorte || 100;
  document.getElementById("edit-corte-boleta").value = item.boleta || "";
  document.getElementById("edit-corte-notas").value = item.notas || "";

  document.getElementById("edit-corte-total").value = (item.total || 0).toFixed(2);
  document.getElementById("edit-corte-pago").value = (item.pago || 0).toFixed(2);
  document.getElementById("edit-corte-saldo").value = (item.saldoNeto || 0).toFixed(2);

  const modal = document.getElementById("modal-editar-corte-diario");
  if (modal) modal.style.display = "flex";
};

window.actualizarEdicionCalculoCorte = (origen) => {
  const inpQq = document.getElementById("edit-corte-quintal");
  const inpLbs = document.getElementById("edit-corte-libras");
  const inpPrecio = document.getElementById("edit-corte-precio-qq");
  const inpTarifa = document.getElementById("edit-corte-tarifa-qq");

  let qq = parseFloat(inpQq?.value) || 0;
  let lbs = parseFloat(inpLbs?.value) || 0;

  if (origen === "qq") {
    lbs = qq * 100;
    if (inpLbs) inpLbs.value = lbs > 0 ? Math.round(lbs) : "";
  } else if (origen === "lbs") {
    qq = lbs / 100;
    if (inpQq) inpQq.value = qq > 0 ? qq.toFixed(2) : "";
  }

  const precio = parseFloat(inpPrecio?.value) || 0;
  const tarifa = parseFloat(inpTarifa?.value) || 100;
  const total = qq * precio;
  const pago = qq * tarifa;
  const saldo = total - pago;

  const inTot = document.getElementById("edit-corte-total");
  const inPag = document.getElementById("edit-corte-pago");
  const inSal = document.getElementById("edit-corte-saldo");

  if (inTot) inTot.value = total.toFixed(2);
  if (inPag) inPag.value = pago.toFixed(2);
  if (inSal) inSal.value = saldo.toFixed(2);
};

window.actualizarEdicionTipoDestino = (tipo) => {
  const comp = document.getElementById("edit-corte-comprador");
  if (comp) {
    if (tipo === "pergamino" && comp.value.toLowerCase() === "erika") {
      comp.value = "Finca Los Robles (Pergamino)";
    } else if (tipo === "venta" && comp.value.includes("Pergamino")) {
      comp.value = "Erika";
    }
  }
};

window.guardarEdicionCorteDiario = () => {
  const id = document.getElementById("edit-corte-id")?.value;
  const item = todosLosCortesDiarios.find(c => c.id === id);
  if (!item) return;

  const fecha = document.getElementById("edit-corte-fecha")?.value;
  const temporada = document.getElementById("edit-corte-temporada")?.value.trim() || item.temporada;
  const qq = parseFloat(document.getElementById("edit-corte-quintal")?.value) || 0;
  const lbs = parseFloat(document.getElementById("edit-corte-libras")?.value) || (qq * 100);
  const tipoDestino = document.getElementById("edit-corte-destino-tipo")?.value || "venta";
  const comprador = document.getElementById("edit-corte-comprador")?.value.trim() || "Erika";
  const precio = parseFloat(document.getElementById("edit-corte-precio-qq")?.value) || 0;
  const tarifa = parseFloat(document.getElementById("edit-corte-tarifa-qq")?.value) || 100;
  const boleta = document.getElementById("edit-corte-boleta")?.value.trim() || "";
  const notas = document.getElementById("edit-corte-notas")?.value.trim() || "";

  const total = qq * precio;
  const pago = qq * tarifa;
  const saldoNeto = total - pago;

  item.fecha = fecha;
  item.temporada = temporada;
  item.quintal = qq;
  item.libras = lbs;
  item.tipoDestino = tipoDestino;
  item.comprador = comprador;
  item.destino = tipoDestino === "pergamino" ? "PERGAMINO" : comprador.toUpperCase();
  item.precio = precio;
  item.tarifaCorte = tarifa;
  item.total = total;
  item.pago = pago;
  item.saldoNeto = saldoNeto;
  item.boleta = boleta;
  item.notas = notas;

  guardarCortesStorage();
  window.cerrarModal("modal-editar-corte-diario");
  renderModuloCortesDiarios();

  alert("✅ Corte actualizado.");
};

// Limpieza de duplicados
window.limpiarDuplicadosCortes = () => {
  const mapa = new Map();
  const unicos = [];
  let duplicadosCont = 0;

  // Analizar de forma que se conserve el corte más reciente
  for (const c of todosLosCortesDiarios) {
    const key = `${c.temporada || '2025-2026'}_${c.fecha}_${(parseFloat(c.quintal)||0).toFixed(2)}_${(c.destino||'').toUpperCase()}`;
    if (!mapa.has(key)) {
      mapa.set(key, true);
      unicos.push(c);
    } else {
      duplicadosCont++;
    }
  }

  if (duplicadosCont === 0) {
    return alert("✨ No se encontraron cortes duplicados en la base de datos.");
  }

  if (confirm(`Se encontraron ${duplicadosCont} corte(s) duplicado(s) con la misma fecha, quintales y destino.\n\n¿Deseas limpiarlos y conservar un solo registro de cada uno?`)) {
    todosLosCortesDiarios = unicos;
    guardarCortesStorage();
    renderModuloCortesDiarios();
    alert(`🧹 Se eliminaron ${duplicadosCont} registros duplicados con éxito.`);
  }
};

// Restaurar los 81 registros oficiales del PDF 2025-2026
window.restaurarCortes2026Oficiales = () => {
  if (!confirm("¿Deseas recargar los 81 cortes oficiales del informe PDF 2025-2026?\n(514.28 quintales totales, Q 158,389.80 total, Q 51,428.00 pago, Q 106,961.80 saldo neto)")) return;

  // Reemplazar la temporada 2025-2026 con los datos base
  todosLosCortesDiarios = [
    ...todosLosCortesDiarios.filter(c => c.temporada !== "2025-2026"),
    ...JSON.parse(JSON.stringify(DATOS_BASE_CORTES_2026))
  ];

  guardarCortesStorage();
  temporadaCortesActual = "2025-2026";
  renderModuloCortesDiarios();
  alert("✅ Cosecha 2025-2026 restaurada con los 81 registros del PDF oficial.");
};

// =========================================================================
// COMPARATIVA ANUAL (AÑO CON AÑO)
// =========================================================================

export function renderGraficasComparativaCortes() {
  const Chart = getChart();
  if (!Chart) return;

  // Agrupar métricas por temporada
  const grupos = {};
  todosLosCortesDiarios.forEach(c => {
    const temp = c.temporada || "2025-2026";
    if (!grupos[temp]) {
      grupos[temp] = {
        temporada: temp,
        cortesCount: 0,
        totalQq: 0,
        ventaQq: 0,
        pergaminoQq: 0,
        totalTotal: 0,
        totalPago: 0,
        totalSaldo: 0
      };
    }
    const qq = parseFloat(c.quintal) || 0;
    const tot = parseFloat(c.total) || 0;
    const pag = parseFloat(c.pago) || 0;
    const sal = parseFloat(c.saldoNeto) || (tot - pag);

    grupos[temp].cortesCount++;
    grupos[temp].totalQq += qq;
    grupos[temp].totalTotal += tot;
    grupos[temp].totalPago += pag;
    grupos[temp].totalSaldo += sal;

    if (c.tipoDestino === "pergamino" || (c.destino || "").toUpperCase().includes("PERGAMINO")) {
      grupos[temp].pergaminoQq += qq;
    } else {
      grupos[temp].ventaQq += qq;
    }
  });

  const temporadasOrdenadas = Object.keys(grupos).sort();
  const labels = temporadasOrdenadas;
  const dataTotalQq = labels.map(t => grupos[t].totalQq.toFixed(2));
  const dataVentaQq = labels.map(t => grupos[t].ventaQq.toFixed(2));
  const dataPergaminoQq = labels.map(t => grupos[t].pergaminoQq.toFixed(2));

  const dataTotal = labels.map(t => grupos[t].totalTotal);
  const dataPago = labels.map(t => grupos[t].totalPago);
  const dataSaldo = labels.map(t => grupos[t].totalSaldo);

  // 1. Gráfica de Quintales (Venta vs Pergamino)
  const ctxQq = document.getElementById("chartComparativaCortes")?.getContext("2d");
  if (ctxQq) {
    if (chartComparativaInstance) chartComparativaInstance.destroy();
    chartComparativaInstance = new Chart(ctxQq, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Vendido en Cereza (qq)",
            data: dataVentaQq,
            backgroundColor: "#2563eb",
            borderRadius: 6
          },
          {
            label: "Pergamino en Finca (qq)",
            data: dataPergaminoQq,
            backgroundColor: "#059669",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              footer: (items) => {
                let sum = 0;
                items.forEach(i => { sum += parseFloat(i.raw) || 0; });
                return `Total Cosecha: ${sum.toFixed(2)} qq`;
              }
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: "Quintales (qq)" },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 2. Gráfica Financiera (Ingresos, Pagos y Saldo)
  const ctxFin = document.getElementById("chartFinanzasCortes")?.getContext("2d");
  if (ctxFin) {
    if (chartFinanzasInstance) chartFinanzasInstance.destroy();
    chartFinanzasInstance = new Chart(ctxFin, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Total Ingreso (Q)",
            data: dataTotal,
            backgroundColor: "#0284c7",
            borderRadius: 6
          },
          {
            label: "Pago a Cortadores (Q)",
            data: dataPago,
            backgroundColor: "#ef4444",
            borderRadius: 6
          },
          {
            label: "Saldo Neto Cosecha (Q)",
            data: dataSaldo,
            backgroundColor: "#16a34a",
            borderRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: (item) => `${item.dataset.label}: Q ${(item.raw || 0).toLocaleString("es-GT", { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: "Quetzales (Q)" },
            beginAtZero: true
          }
        }
      }
    });
  }

  // 3. Tabla Resumen Comparativa
  const tbodyComp = document.getElementById("tbody-comparativa-anual");
  if (tbodyComp) {
    tbodyComp.innerHTML = temporadasOrdenadas.map(t => {
      const g = grupos[t];
      const pctVenta = g.totalQq > 0 ? ((g.ventaQq / g.totalQq) * 100).toFixed(1) : "0";
      const pctPerg = g.totalQq > 0 ? ((g.pergaminoQq / g.totalQq) * 100).toFixed(1) : "0";
      const precioProm = g.totalQq > 0 ? (g.totalTotal / g.totalQq).toFixed(2) : "0.00";

      return `
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="font-weight:bold; color:var(--primary);">Cosecha ${t}</td>
          <td style="text-align:right;">${g.cortesCount} cortes</td>
          <td style="text-align:right; font-weight:bold; font-size:1.05rem;">${g.totalQq.toFixed(2)} qq</td>
          <td style="text-align:right; color:#1d4ed8;">${g.ventaQq.toFixed(2)} qq (${pctVenta}%)</td>
          <td style="text-align:right; color:#15803d;">${g.pergaminoQq.toFixed(2)} qq (${pctPerg}%)</td>
          <td style="text-align:right; font-weight:bold; color:#0369a1;">Q ${g.totalTotal.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="text-align:right; font-weight:bold; color:#b91c1c;">Q ${g.totalPago.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="text-align:right; font-weight:900; color:#15803d; background:#f0fdf4;">Q ${g.totalSaldo.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
          <td style="text-align:right; font-weight:600;">Q ${precioProm}</td>
        </tr>
      `;
    }).join("");
  }
}

// =========================================================================
// GENERACIÓN DE INFORME PDF OFICIAL Y EXPORTACIÓN EXCEL CSV
// =========================================================================

window.descargarPDFInformeCortes = () => {
  const jsPDF = getJsPDF();
  if (!jsPDF) return alert("Biblioteca jsPDF no cargada.");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });

  const temporada = temporadaCortesActual;
  const lista = todosLosCortesDiarios.filter(c => temporada === "todas" ? true : c.temporada === temporada);

  let totalQq = 0;
  let totalLbs = 0;
  let ventaQq = 0;
  let ventaMonto = 0;
  let pergaminoQq = 0;
  let pergaminoMonto = 0;
  let totalTotal = 0;
  let totalPago = 0;
  let totalSaldo = 0;

  lista.forEach(c => {
    const qq = parseFloat(c.quintal) || 0;
    const lbs = parseFloat(c.libras) || (qq * 100);
    const tot = parseFloat(c.total) || 0;
    const pag = parseFloat(c.pago) || 0;
    const sal = parseFloat(c.saldoNeto) || (tot - pag);

    totalQq += qq;
    totalLbs += lbs;
    totalTotal += tot;
    totalPago += pag;
    totalSaldo += sal;

    if (c.tipoDestino === "pergamino" || (c.destino || "").toUpperCase().includes("PERGAMINO")) {
      pergaminoQq += qq;
      pergaminoMonto += tot;
    } else {
      ventaQq += qq;
      ventaMonto += tot;
    }
  });

  // Membrete Superior
  doc.setFillColor(44, 94, 46);
  doc.rect(0, 0, 216, 25, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("FINCA LOS ROBLES", 108, 10, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`INFORME GENERAL DE COSECHA, CORTES Y DESTINO • TEMPORADA ${temporada.toUpperCase()}`, 108, 17, { align: "center" });

  // Tarjeta de Resumen Ejecutivo
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, 29, 188, 25, "FD");

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  doc.text(`Cosecha: ${temporada}`, 18, 35);
  doc.text(`Emisión: ${new Date().toLocaleDateString("es-GT")}`, 145, 35);

  doc.setFont("helvetica", "normal");
  doc.text(`Total Cosechado: ${totalQq.toFixed(2)} qq (${Math.round(totalLbs).toLocaleString("es-GT")} lbs en ${lista.length} cortes)`, 18, 41);
  doc.text(`Destino: ${ventaQq.toFixed(2)} qq Venta Cereza (${totalQq > 0 ? ((ventaQq/totalQq)*100).toFixed(1) : 0}%) | ${pergaminoQq.toFixed(2)} qq Pergamino Propio`, 18, 47);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(3, 105, 161);
  doc.text(`Total Valor: Q ${totalTotal.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}`, 130, 41);

  doc.setTextColor(185, 28, 28);
  doc.text(`Pago Cortadores: Q ${totalPago.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}`, 130, 46);

  doc.setTextColor(21, 128, 61);
  doc.setFontSize(10);
  doc.text(`SALDO NETO: Q ${totalSaldo.toLocaleString('es-GT', {minimumFractionDigits:2, maximumFractionDigits:2})}`, 130, 51);

  let y = 60;

  const dibujarHeaderTabla = (currY) => {
    doc.setFillColor(30, 70, 32);
    doc.rect(14, currY, 188, 7, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text("#", 16, currY + 4.8);
    doc.text("FECHA", 24, currY + 4.8);
    doc.text("QUINTALES", 48, currY + 4.8, { align: "right" });
    doc.text("PRECIO", 70, currY + 4.8, { align: "right" });
    doc.text("TOTAL PAGADO", 98, currY + 4.8, { align: "right" });
    doc.text("PAGO CORTE", 126, currY + 4.8, { align: "right" });
    doc.text("SALDO NETO", 158, currY + 4.8, { align: "right" });
    doc.text("DESTINO / REFERENCIA", 168, currY + 4.8);
    return currY + 7;
  };

  y = dibujarHeaderTabla(y);

  lista.forEach((c, idx) => {
    if (y > 250) {
      doc.addPage();
      doc.setFillColor(44, 94, 46);
      doc.rect(0, 0, 216, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "bold");
      doc.text(`FINCA LOS ROBLES - Informe de Cortes Cosecha ${temporada} (Continuación)`, 108, 8, { align: "center" });
      y = 18;
      y = dibujarHeaderTabla(y);
    }

    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 248);
      doc.rect(14, y, 188, 5.5, "F");
    }

    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 5.5, 202, y + 5.5);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");

    doc.text(String(idx + 1), 16, y + 3.8);
    doc.text(c.fecha || "", 24, y + 3.8);

    doc.setFont("helvetica", "bold");
    doc.text((parseFloat(c.quintal) || 0).toFixed(2), 48, y + 3.8, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.text(`Q ${(parseFloat(c.precio) || 0).toFixed(2)}`, 70, y + 3.8, { align: "right" });

    doc.setTextColor(3, 105, 161);
    doc.text(`Q ${(parseFloat(c.total) || 0).toFixed(2)}`, 98, y + 3.8, { align: "right" });

    doc.setTextColor(185, 28, 28);
    doc.text(`Q ${(parseFloat(c.pago) || 0).toFixed(2)}`, 126, y + 3.8, { align: "right" });

    doc.setTextColor(21, 128, 61);
    doc.setFont("helvetica", "bold");
    doc.text(`Q ${(parseFloat(c.saldoNeto) || 0).toFixed(2)}`, 158, y + 3.8, { align: "right" });

    doc.setFont("helvetica", "normal");
    const esPerg = c.tipoDestino === "pergamino" || (c.destino || "").toUpperCase().includes("PERGAMINO");
    doc.setTextColor(esPerg ? 21 : 30, esPerg ? 128 : 64, esPerg ? 61 : 175);
    doc.text(c.comprador || c.destino || "ERIKA", 168, y + 3.8);

    y += 5.5;
  });

  // Cuadro de Totales al pie
  y += 4;
  if (y > 235) {
    doc.addPage();
    y = 20;
  }

  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(134, 239, 172);
  doc.rect(14, y, 188, 16, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(21, 128, 61);
  doc.text(`TOTALES GENERALES (${lista.length} cortes):`, 18, y + 6);
  doc.text(`${totalQq.toFixed(2)} qq`, 48, y + 6, { align: "right" });
  doc.text(`Q ${totalTotal.toFixed(2)}`, 98, y + 6, { align: "right" });
  doc.text(`Q ${totalPago.toFixed(2)}`, 126, y + 6, { align: "right" });
  doc.text(`Q ${totalSaldo.toFixed(2)}`, 158, y + 6, { align: "right" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text(`Rendimiento Neto de Cosecha: Q ${(totalQq > 0 ? (totalSaldo / totalQq).toFixed(2) : 0)} por quintal recolectado`, 18, y + 12);

  // Firmas
  y += 24;
  doc.setDrawColor(160, 160, 160);
  doc.line(30, y + 10, 85, y + 10);
  doc.line(130, y + 10, 185, y + 10);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text("Firma Administrador / Finca Los Robles", 35, y + 14);
  doc.text("Firma Mayordomo / Control Báscula", 136, y + 14);

  doc.save(`Informe_Cortes_Cosecha_${temporada}.pdf`);
  alert("✅ Informe de Cortes PDF descargado con éxito.");
};

window.exportarCSVCortes = () => {
  const temporada = temporadaCortesActual;
  const lista = todosLosCortesDiarios.filter(c => temporada === "todas" ? true : c.temporada === temporada);

  if (lista.length === 0) return alert("No hay cortes para exportar con los filtros actuales.");

  const headers = ["Fecha", "Temporada", "Quintales", "Libras", "Destino", "Comprador", "Precio_qq_Q", "Total_Q", "Pago_Corte_Q", "Saldo_Neto_Q", "Boleta", "Notas"];
  const rows = lista.map(c => [
    `"${c.fecha || ''}"`,
    `"${c.temporada || ''}"`,
    (parseFloat(c.quintal) || 0).toFixed(2),
    Math.round(parseFloat(c.libras) || (c.quintal * 100)),
    `"${c.destino || ''}"`,
    `"${c.comprador || ''}"`,
    (parseFloat(c.precio) || 0).toFixed(2),
    (parseFloat(c.total) || 0).toFixed(2),
    (parseFloat(c.pago) || 0).toFixed(2),
    (parseFloat(c.saldoNeto) || 0).toFixed(2),
    `"${c.boleta || ''}"`,
    `"${(c.notas || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Cortes_Cafe_${temporada}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// =========================================================================
// SUBIDA Y EXTRACCIÓN DE PDF DE CORTES (IA + LOCAL PDF.JS FALLBACK)
// =========================================================================

window.abrirModalSubirPDFCortes = () => {
  cortesExtraidosPreview = [];
  const modal = document.getElementById("modal-subir-pdf-cortes");
  const previewSec = document.getElementById("pdf-cortes-preview-seccion");
  const btnGuardar = document.getElementById("btn-confirmar-guardar-pdf-cortes");
  const lblNombre = document.getElementById("pdf-cortes-nombre-archivo");
  const loading = document.getElementById("pdf-cortes-loading");

  if (previewSec) previewSec.style.display = "none";
  if (btnGuardar) btnGuardar.style.display = "none";
  if (lblNombre) lblNombre.innerText = "";
  if (loading) loading.style.display = "none";

  const tempInp = document.getElementById("pdf-cortes-temporada-in");
  if (tempInp) tempInp.value = temporadaCortesActual !== "todas" ? temporadaCortesActual : "2025-2026";

  if (modal) modal.style.display = "flex";
};

window.alSeleccionarArchivoPDFCortes = async (file) => {
  if (!file) return;

  const lblNombre = document.getElementById("pdf-cortes-nombre-archivo");
  if (lblNombre) lblNombre.innerText = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

  const loading = document.getElementById("pdf-cortes-loading");
  if (loading) loading.style.display = "block";

  const temporada = document.getElementById("pdf-cortes-temporada-in")?.value.trim() || "2025-2026";

  try {
    // 1. Leer como base64
    const reader = new FileReader();
    const base64Promise = new Promise((resolve) => {
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    const base64Data = await base64Promise;

    // Intentar primero con backend API si estamos en entorno con servidor Node
    let extraidos = null;
    const isGitHubPages = window.location.hostname.includes("github.io");

    if (!isGitHubPages) {
      try {
        const resp = await fetch("/api/cortes/extraer-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64: base64Data,
            temporadaSugerida: temporada,
            nombreArchivo: file.name
          })
        });
        if (resp.ok) {
          const json = await resp.json();
          if (json.success && json.datos && Array.isArray(json.datos.cortes)) {
            extraidos = json.datos.cortes;
          }
        }
      } catch (backendErr) {
        console.warn("Backend /api/cortes/extraer-pdf falló o inaccesible, usando parser cliente:", backendErr.message);
      }
    }

    // 2. Si no se pudo obtener por API, procesar con pdf.js cliente
    if (!extraidos || extraidos.length === 0) {
      extraidos = await extraerCortesConPdfJsCliente(file, temporada);
    }

    if (!extraidos || extraidos.length === 0) {
      throw new Error("No se detectaron filas de cortes en el documento. Asegúrate de que el PDF contenga columnas con fecha, quintales y destino.");
    }

    cortesExtraidosPreview = extraidos;
    mostrarPreviewCortesExtraidos(cortesExtraidosPreview);
  } catch (err) {
    alert("Error al extraer cortes del PDF: " + err.message);
  } finally {
    if (loading) loading.style.display = "none";
  }
};

// Extractor cliente con pdf.js para GitHub Pages y máxima fiabilidad
async function extraerCortesConPdfJsCliente(file, temporadaDefecto) {
  if (!window.pdfjsLib) {
    throw new Error("La biblioteca pdf.js no está disponible en este momento.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdfDoc.numPages;

  let lineasTextos = [];
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const textContent = await page.getTextContent();
    const items = textContent.items.map(it => it.str);
    lineasTextos.push(items.join(" "));
  }

  const fullText = lineasTextos.join("\n");
  const lineas = fullText.split(/\r?\n|Q\s*-\s*Q/);

  const cortesEncontrados = [];
  const regexFecha = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/;

  // Procesar todo el texto buscando patrones de cortes
  // Ejemplo: "4/12/2025 5.12 365 Q 1,868.80 Q 512.00 Q 1,356.80 ERIKA"
  const tokens = fullText.split(/\s+/);
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    if (regexFecha.test(tok) && !tok.toLowerCase().includes("total")) {
      const fechaRaw = tok.match(regexFecha)[1];
      // Normalizar fecha YYYY-MM-DD
      const partes = fechaRaw.split(/[\/\-]/);
      let fechaNorm = fechaRaw;
      if (partes.length === 3) {
        let dia = partes[0].padStart(2, "0");
        let mes = partes[1].padStart(2, "0");
        let anio = partes[2];
        // En algunos casos año de 2 dígitos
        if (anio.length === 2) anio = "20" + anio;
        fechaNorm = `${anio}-${mes}-${dia}`;
      }

      // Buscar los números siguientes
      const numTokens = [];
      let destinoToken = "ERIKA";
      let cursor = i + 1;
      while (cursor < tokens.length && cursor < i + 14) {
        const next = tokens[cursor].replace(/,/g, "").replace(/Q/g, "").trim();
        if (next.toUpperCase() === "ERIKA" || next.toUpperCase() === "PERGAMINO") {
          destinoToken = next.toUpperCase();
          break;
        }
        if (!isNaN(parseFloat(next)) && isFinite(next) && next !== "") {
          numTokens.push(parseFloat(next));
        }
        cursor++;
      }

      if (numTokens.length >= 2) {
        const qq = numTokens[0];
        const precio = numTokens[1];
        const total = numTokens[2] || (qq * precio);
        const pago = numTokens[3] || (qq * 100);
        const saldo = numTokens[4] || (total - pago);

        const esPerg = destinoToken.includes("PERGAMINO");
        cortesEncontrados.push({
          id: `corte-pdf-${Date.now()}-${cortesEncontrados.length}`,
          temporada: temporadaDefecto || "2025-2026",
          fecha: fechaNorm,
          quintal: qq,
          libras: Math.round(qq * 100),
          precio,
          total,
          pago,
          saldoNeto: saldo,
          destino: destinoToken,
          tipoDestino: esPerg ? "pergamino" : "venta",
          comprador: esPerg ? "Finca Los Robles" : destinoToken,
          tarifaCorte: 100,
          boleta: "",
          notas: "Extraído automáticamente de PDF"
        });
      }
    }
  }

  return cortesEncontrados;
}

function mostrarPreviewCortesExtraidos(cortes) {
  const tbody = document.getElementById("pdf-cortes-preview-tbody");
  const countEl = document.getElementById("pdf-cortes-preview-count");
  const totalesEl = document.getElementById("pdf-cortes-preview-totales");
  const seccion = document.getElementById("pdf-cortes-preview-seccion");
  const btnGuardar = document.getElementById("btn-confirmar-guardar-pdf-cortes");

  if (!tbody || !seccion) return;

  let totalQq = 0;
  let totalTot = 0;
  let totalSal = 0;

  cortes.forEach(c => {
    totalQq += parseFloat(c.quintal) || 0;
    totalTot += parseFloat(c.total) || 0;
    totalSal += parseFloat(c.saldoNeto) || 0;
  });

  if (countEl) countEl.innerText = cortes.length;
  if (totalesEl) {
    totalesEl.innerText = `${totalQq.toFixed(2)} qq | Q ${totalTot.toLocaleString('es-GT', {minimumFractionDigits:2})} Total | Q ${totalSal.toLocaleString('es-GT', {minimumFractionDigits:2})} Saldo`;
  }

  tbody.innerHTML = cortes.map(c => `
    <tr style="border-bottom:1px solid #e2e8f0;">
      <td style="padding:5px; text-align:center;">${c.fecha}</td>
      <td style="padding:5px; text-align:right; font-weight:bold;">${(parseFloat(c.quintal)||0).toFixed(2)} qq</td>
      <td style="padding:5px; text-align:right;">Q ${(parseFloat(c.precio)||0).toFixed(2)}</td>
      <td style="padding:5px; text-align:right; color:#0369a1; font-weight:600;">Q ${(parseFloat(c.total)||0).toFixed(2)}</td>
      <td style="padding:5px; text-align:right; color:#b91c1c;">Q ${(parseFloat(c.pago)||0).toFixed(2)}</td>
      <td style="padding:5px; text-align:right; color:#15803d; font-weight:bold;">Q ${(parseFloat(c.saldoNeto)||0).toFixed(2)}</td>
      <td style="padding:5px; text-align:center; font-weight:bold;">${c.destino}</td>
    </tr>
  `).join("");

  seccion.style.display = "block";
  if (btnGuardar) btnGuardar.style.display = "inline-block";
}

window.confirmarGuardarCortesPDFExtraidos = () => {
  if (!cortesExtraidosPreview || cortesExtraidosPreview.length === 0) {
    return alert("No hay datos de cortes extraídos para guardar.");
  }

  const reemplazarDuplicados = document.getElementById("pdf-cortes-check-reemplazar")?.checked;
  const temporada = document.getElementById("pdf-cortes-temporada-in")?.value.trim() || "2025-2026";

  let agregados = 0;
  let reemplazados = 0;

  cortesExtraidosPreview.forEach(c => {
    c.temporada = temporada;
    const idxExistente = todosLosCortesDiarios.findIndex(existente =>
      existente.temporada === temporada &&
      existente.fecha === c.fecha &&
      (existente.destino || "").toUpperCase() === (c.destino || "").toUpperCase()
    );

    if (idxExistente !== -1 && reemplazarDuplicados) {
      todosLosCortesDiarios[idxExistente] = { ...todosLosCortesDiarios[idxExistente], ...c };
      reemplazados++;
    } else {
      todosLosCortesDiarios.push(c);
      agregados++;
    }
  });

  guardarCortesStorage();
  temporadaCortesActual = temporada;

  window.cerrarModal("modal-subir-pdf-cortes");
  renderModuloCortesDiarios();

  alert(`✅ Extracción procesada con éxito:\n• ${agregados} cortes nuevos agregados\n• ${reemplazados} cortes actualizados\nTemporada: Cosecha ${temporada}.`);
};
