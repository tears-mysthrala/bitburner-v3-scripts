/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.clearLog();
	
	ns.print("=== CLEAN & RESTART ===");
	
	// 1. Matar procesos
	ns.print("1. Matando procesos...");
	for (const p of ns.ps('home')) {
		if (p.pid !== ns.pid) {
			ns.kill(p.pid);
			ns.print("  Killed: " + p.filename);
		}
	}
	await ns.sleep(1000);
	
	// 2. Borrar scripts
	ns.print("2. Borrando scripts...");
	const files = ns.ls('home');
	let count = 0;
	for (const f of files) {
		if (f.endsWith('.js') && f !== 'clean.js') {
			if (ns.rm(f)) count++;
		}
	}
	ns.print("  Borrados: " + count);
	
	// 3. Descargar scripts frescos
	ns.print("3. Descargando scripts...");
	const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const need = ['zzz.js','casino.js','daemon.js','ascend.js','work-for-factions.js'];
	
	for (const f of need) {
		if (await ns.wget(url + f + '?t=' + Date.now(), f)) {
			ns.print("  + " + f);
		}
	}
	
	// 4. Iniciar
	ns.print("4. Iniciando zzz.js...");
	await ns.sleep(1000);
	const pid = ns.run('zzz.js');
	
	if (pid > 0) {
		ns.print("✅ Iniciado! PID: " + pid);
		ns.print("Escribe: tail zzz.js");
	} else {
		ns.print("❌ Error al iniciar");
		ns.print("Intenta: run zzz.js");
	}
}
