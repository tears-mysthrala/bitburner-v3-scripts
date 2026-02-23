/** @param {NS} ns **/
export async function main(ns) {
  ns.tprint("=== WIPE TOTAL ===");
  
  // 1. Matar TODO
  ns.tprint("1. Matando todos los procesos...");
  const procs = ns.ps("home");
  for (const p of procs) {
    if (p.pid !== ns.pid) {
      ns.kill(p.pid);
      ns.tprint("  Killed: " + p.filename);
    }
  }
  await ns.sleep(2000);
  
  // 2. Borrar scripts principales (no los de setup)
  ns.tprint("2. Borrando scripts viejos...");
  const toDelete = [
    'zzz.js', 'go.js', 'run.js', 'auto.js', 'begin.js', 'start.js',
    'zero-to-hero.js', 'zth.js', 'daemon.js', 'casino.js', 'autopilot.js',
    'host-manager.js', 'work-for-factions.js', 'faction-manager.js',
    'stockmaster.js', 'hacknet-upgrade-manager.js'
  ];
  
  for (const f of toDelete) {
    if (ns.fileExists(f)) {
      ns.rm(f);
      ns.tprint("  Deleted: " + f);
    }
  }
  
  // 3. Limpiar /Temp/
  ns.tprint("3. Limpiando temp...");
  for (const f of ns.ls("home", "/Temp/")) {
    ns.rm(f);
  }
  
  // 4. Limpiar /Tasks/
  ns.tprint("4. Limpiando Tasks...");
  for (const f of ns.ls("home", "/Tasks/")) {
    ns.rm(f);
  }
  
  // 5. Limpiar /Remote/
  ns.tprint("5. Limpiando Remote...");
  for (const f of ns.ls("home", "/Remote/")) {
    ns.rm(f);
  }
  
  ns.tprint("=== WIPE COMPLETE ===");
  ns.tprint("Ahora ejecuta: run s.js");
}
