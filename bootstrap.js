/**
 * BOOTSTRAP - Primer script a ejecutar en save nuevo
 * 
 * Este script se ejecuta manualmente en un save completamente nuevo:
 * 1. Descarga git-pull.js
 * 2. Descarga todos los scripts del repo
 * 3. Inicia zero-to-hero.js automáticamente
 * 
 * CÓMO USAR EN SAVE NUEVO:
 * 1. nano bootstrap.js
 * 2. Copiar este contenido
 * 3. run bootstrap.js
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.tprint("╔════════════════════════════════════════════════════════╗");
	ns.tprint("║     🚀 ZERO TO HERO - Bootstrap inicial                ║");
	ns.tprint("║     Descargando scripts y iniciando automatización...  ║");
	ns.tprint("╚════════════════════════════════════════════════════════╝");

	const baseUrl = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const filesToDownload = [
		'git-pull.js',
		'helpers.js',
		'zero-to-hero.js',
		'autopilot.js',
		'daemon.js',
		'casino.js',
		'crime.js',
		'ascend.js',
		'faction-manager.js',
		'work-for-factions.js',
		'host-manager.js',
		'hacknet-upgrade-manager.js',
		'gangs.js',
		'sleeve.js',
		'bladeburner.js',
		'scan.js',
		'stockmaster.js',
		'spend-hacknet-hashes.js',
		'go.js',
		'kill-all-scripts.js',
		'cleanup.js',
		'stanek.js',
		'optimize-stanek.js',
		'reserve.js',
		'analyze-hack.js',
		'run-command.js',
		'grep.js',
		'dump-ns-namespace.js',
		'git-pull.js',
	];

	ns.tprint("📥 Descargando scripts base...");
	
	let downloaded = 0;
	let failed = [];
	
	for (const file of filesToDownload) {
		const url = baseUrl + file;
		const success = await ns.wget(url + '?t=' + Date.now(), file);
		
		if (success) {
			downloaded++;
			ns.print(`✅ ${file}`);
		} else {
			failed.push(file);
			ns.print(`❌ ${file}`);
		}
		
		// Pequeña pausa para no saturar
		await ns.sleep(100);
	}

	ns.tprint(`\n📊 Descarga completa: ${downloaded}/${filesToDownload.length} archivos`);
	
	if (failed.length > 0) {
		ns.tprint(`⚠️ Archivos fallidos: ${failed.join(', ')}`);
		ns.tprint("Intentando descarga alternativa con git-pull.js...");
		
		// Intentar usar git-pull.js si existe
		if (ns.fileExists('git-pull.js')) {
			ns.run('git-pull.js');
			await ns.sleep(10000);
		}
	}

	// Verificar que tenemos los scripts críticos
	const criticalFiles = ['helpers.js', 'zero-to-hero.js', 'autopilot.js', 'daemon.js'];
	const missing = criticalFiles.filter(f => !ns.fileExists(f));
	
	if (missing.length > 0) {
		ns.tprint(`❌ ERROR: Faltan archivos críticos: ${missing.join(', ')}`);
		ns.tprint("Intenta ejecutar: run git-pull.js");
		return;
	}

	ns.tprint("\n🎉 ¡Scripts descargados correctamente!");
	ns.tprint("\n═══════════════════════════════════════════════════════");
	ns.tprint("  INICIANDO ZERO TO HERO en 3 segundos...");
	ns.tprint("  Este script automatizará TODO el juego desde cero.");
	ns.tprint("═══════════════════════════════════════════════════════\n");
	
	await ns.sleep(3000);
	
	// Iniciar zero-to-hero
	const pid = ns.run('zero-to-hero.js', 1);
	
	if (pid > 0) {
		ns.tprint(`✅ zero-to-hero.js iniciado (PID: ${pid})`);
		ns.tprint("📋 Abre la ventana de log: tail zero-to-hero.js");
	} else {
		ns.tprint("❌ Error al iniciar zero-to-hero.js");
		ns.tprint("Intenta manualmente: run zero-to-hero.js");
	}
}
