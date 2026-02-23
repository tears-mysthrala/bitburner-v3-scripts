/**
 * CLEANSTART - Limpia todo y reinstala desde cero
 * 
 * BORRA todos los scripts y vuelve a descargar todo limpio.
 * Úsalo si hay problemas con archivos corruptos o versiones viejas.
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.clearLog();
	
	ns.print("╔════════════════════════════════════════════════════════╗");
	ns.print("║     🧹 CLEANSTART - Limpieza Total                     ║");
	ns.print("╚════════════════════════════════════════════════════════╝");
	ns.print("");
	
	// 1. MATAR TODOS LOS PROCESOS
	ns.print("1️⃣  Matando todos los procesos...");
	const processes = ns.ps('home');
	for (const p of processes) {
		if (p.pid !== ns.pid) {
			ns.kill(p.pid);
			ns.print(`   ✓ Matado: ${p.filename}`);
		}
	}
	await ns.sleep(1000);
	
	// 2. LISTAR ARCHIVOS A BORRAR
	ns.print("");
	ns.print("2️⃣  Archivos a borrar:");
	const allFiles = ns.ls('home');
	const toDelete = allFiles.filter(f => {
		// No borrar archivos de config ni temp
		if (f.startsWith('/Temp/')) return false;
		if (f.endsWith('.config.txt')) return false;
		if (f === 'cleanstart.js') return false; // No borrarse a sí mismo
		return f.endsWith('.js') || f.endsWith('.ns') || f.endsWith('.script');
	});
	
	ns.print(`   Encontrados ${toDelete.length} archivos .js/.ns/.script`);
	
	// 3. BORRAR ARCHIVOS
	ns.print("");
	ns.print("3️⃣  Borrando archivos...");
	let deleted = 0;
	let failed = [];
	
	for (const file of toDelete) {
		try {
			const success = ns.rm(file, 'home');
			if (success) {
				deleted++;
				ns.print(`   🗑️  ${file}`);
			} else {
				failed.push(file);
				ns.print(`   ❌ No se pudo borrar: ${file}`);
			}
		} catch (e) {
			failed.push(file);
			ns.print(`   ❌ Error borrando ${file}: ${e}`);
		}
		await ns.sleep(50);
	}
	
	ns.print("");	
	ns.print(`✅ Borrados: ${deleted}/${toDelete.length} archivos`);
	
	if (failed.length > 0) {
		ns.print(`⚠️  No se pudieron borrar: ${failed.length} archivos`);
	}
	
	// 4. LIMPIAR CARPETA TEMP
	ns.print("");
	ns.print("4️⃣  Limpiando /Temp/...");
	const tempFiles = ns.ls('home', '/Temp/');
	for (const f of tempFiles) {
		try { ns.rm(f); } catch {}
	}
	ns.print(`   🗑️  ${tempFiles.length} archivos temporales borrados`);
	
	// 5. DESCARGAR SCRIPTS FRESCOS
	ns.print("");
	ns.print("5️⃣  Descargando scripts frescos...");
	
	const baseUrl = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// Scripts esenciales en orden
	const essential = [
		'zzz.js',              // <-- SUPER ULTRA-lite launcher
		'begin.js',
		'daemon.js',
		'helpers.js',
		'autopilot.js',
		'ascend.js',
		'faction-manager.js',
		'work-for-factions.js',
		'host-manager.js',
		'hacknet-upgrade-manager.js',
		'crime.js',
		'kill-all-scripts.js',
		'cleanup.js',
		'gangs.js',
		'sleeve.js',
		'bladeburner.js',
		'stockmaster.js',
		'scan.js',
		'go.js',
		'start.js',
		'zth.js',
		'zero-to-hero.js',
		'bootstrap.js',
	];
	
	let downloaded = 0;
	
	for (const file of essential) {
		const url = baseUrl + file + '?nocache=' + Date.now();
		const ok = await ns.wget(url, file);
		
		if (ok) {
			downloaded++;
			ns.print(`   ✅ ${file}`);
		} else {
			ns.print(`   ❌ ${file}`);
		}
		await ns.sleep(100);
	}
	
	ns.print("");
	ns.print(`📥 Descargados: ${downloaded}/${essential.length}`);
	
	// 6. VERIFICAR
	ns.print("");
	ns.print("6️⃣  Verificación:");
	
	const check = ['zth.js', 'casino.js', 'daemon.js'];
	const missing = check.filter(f => !ns.fileExists(f));
	
	if (missing.length === 0) {
		ns.print("   ✅ Todos los archivos críticos presentes");
	} else {
		ns.print("   ❌ Faltan: " + missing.join(', '));
	}
	
	// 7. INICIAR
	ns.print("");
	ns.print("════════════════════════════════════════════════════════");
	ns.print("  🚀 Limpieza completa!");
	ns.print("");
	
	// Iniciar el launcher principal (prioridad: zzz.js > begin.js > auto.js > run.js)
	let launcher = 'run.js';
	if (ns.fileExists('zzz.js')) launcher = 'zzz.js';
	else if (ns.fileExists('begin.js')) launcher = 'begin.js';
	else if (ns.fileExists('auto.js')) launcher = 'auto.js';
	
	ns.print(`  Iniciando ${launcher}...`);
	ns.print("");
	ns.print("════════════════════════════════════════════════════════");
	
	await ns.sleep(2000);
	const pid = ns.run(launcher);
	if (pid > 0) {
		ns.print(`✅ ${launcher} iniciado (PID: ${pid})`);
		ns.print(`📋 Escribe: tail ${launcher}`);
	} else {
		ns.print(`❌ Error iniciando ${launcher}`);
		ns.print("  Intenta manualmente:");
		ns.print(`    run ${launcher}`);
	}
}
