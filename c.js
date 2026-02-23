/** @param {NS} ns **/
export async function main(ns) {
  // Casino ultra-simple - solo usa APIs basicas
  ns.tprint("CASINO - Casino manual");
  ns.tprint("Ve a Aevum y juega blackjack");
  ns.tprint("Apuesta maximo ($10M cuando puedas)");
  
  // Intentar viajar a Aevum
  try {
    ns.singularity.travelToCity("Aevum");
    ns.tprint("Viajado a Aevum");
  } catch(e) {
    ns.tprint("ERROR: Necesitas $200k para viajar");
    return;
  }
  
  // El casino debe hacerse MANUALMENTE
  ns.tprint("=== INSTRUCCIONES ===");
  ns.tprint("1. Escribe: casino");
  ns.tprint("2. Selecciona blackjack");
  ns.tprint("3. Apuesta todo");
  ns.tprint("4. Si pierdes: Ctrl+R para recargar");
  ns.tprint("5. Repite hasta tener $10B");
}
