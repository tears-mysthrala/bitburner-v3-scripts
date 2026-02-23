export async function main(ns) {
  for (const p of ns.ps("home")) if (p.pid != ns.pid) ns.kill(p.pid);
  await ns.sleep(1000);
  const u = "https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/";
  // Descargar helpers.js primero
  await ns.wget(u + "helpers.js?t=" + Date.now(), "helpers.js");
  // Descargar ultima version de zzz.js
  await ns.wget(u + "zzz.js?t=" + Date.now(), "zzz.js");
  ns.run("zzz.js");
}
