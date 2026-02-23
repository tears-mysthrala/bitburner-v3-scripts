export async function main(ns) {
  // Matar TODO
  for (const p of ns.ps("home")) {
    if (p.pid !== ns.pid) ns.kill(p.pid);
  }
  await ns.sleep(1000);
  
  const u = "https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/";
  
  // Borrar zzz.js viejo para forzar descarga fresca
  if (ns.fileExists("zzz.js")) {
    ns.rm("zzz.js");
  }
  
  // Descargar helpers primero
  await ns.wget(u + "helpers.js?t=" + Date.now(), "helpers.js");
  
  // Descargar zzz.js con timestamp unico (sin cache)
  const timestamp = Date.now();
  await ns.wget(u + "zzz.js?t=" + timestamp, "zzz.js");
  
  ns.tprint("Descargado zzz.js (t=" + timestamp + ")");
  
  // Verificar que se descargo
  if (ns.fileExists("zzz.js")) {
    ns.run("zzz.js");
  } else {
    ns.tprint("ERROR: No se pudo descargar zzz.js");
  }
}
