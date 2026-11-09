/** Pesos argentinos enteros con separador de miles: `2000` → `$2.000`. */
export function formatPesos(amount: number): string {
  return `$${amount.toLocaleString('es-AR')}`;
}
