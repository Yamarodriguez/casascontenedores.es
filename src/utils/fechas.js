/**
 * Fecha en que cambió de verdad cada página (la calcula scripts/fechas.mjs).
 * Si una ruta no está, se devuelve '' y no se pone fecha: mejor ninguna que
 * una falsa.
 */
import fechas from '../data/fechas.json';

export const fechaDe = (ruta) => fechas[ruta]?.fecha || '';
