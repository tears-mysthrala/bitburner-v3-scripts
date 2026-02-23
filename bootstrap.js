/**
 * BOOTSTRAP - Ultra Lite Edition (8GB RAM compatible)
 * 
 * Primer script a ejecutar en save nuevo.
 * Descarga todo e inicia zero-to-hero.js
 * 
 * CÓMO USAR:
 * 1. nano bootstrap.js
 * 2. Copiar este contenido  
 * 3. run bootstrap.js
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.clearLog();
	
	ns.print("╔════════════════════════════════════════════════════════╗");
	ns.print("║     🚀 ZERO TO HERO - Bootstrap                        ║");
	ns.print("║     Descargando scripts...                             ║");
	ns.print("╚════════════════════════════════════════════════════════╝");
	ns.print("");

	const baseUrl = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// Lista priorizada (los más importantes primero)
	const files = [
		// Críticos - primero
		'zero-to-hero.js',
		'casino.js',
		'crime.js', 
		'kill-all-scripts.js',
		
		// Core
		'helpers.js',
		'autopilot.js',
		'daemon.js',
		'ascend.js',
		
		// Factions
		'faction-manager.js',
		'work-for-factions.js',
		
		// Infraestructura
		'host-manager.js',
		'hacknet-upgrade-manager.js',
		'spend-hacknet-hashes.js',
		
		// Features extra
		'gangs.js',
		'sleeve.js',
		'bladeburner.js',
		'stockmaster.js',
		'stanek.js',
		'optimize-stanek.js',
		'go.js',
		
		// Utilidades
		'cleanup.js',
		'scan.js',
		'analyze-hack.js',
		'reserve.js',
		'stats.js',
		'grep.js',
		'run-command.js',
		'dump-ns-namespace.js',
		'farm-intelligence.js',
		'dev-console.js',
		
		// Git pull también
		'git-pull.js'
	];

	let downloaded = 0;
	let failed = [];
	
	ns.print(`📥 Descargando ${files.length} archivos...`);
	ns.print("");
	
	for (const file of files) {
		// Verificar si ya existe
		if (ns.fileExists(file)) {
			ns.print(`  ✓ ${file} (ya existe)`);
			downloaded++;
			continue;
		}
		
		// Intentar descargar
		const url = baseUrl + file + '?t=' + Date.now();
		const success = await ns.wget(url, file);
		
		if (success) {
			ns.print(`  ✅ ${file}`);
			downloaded++;
		} else {
			ns.print(`  ❌ ${file}`);
			failed.push(file);
		}
		
		// Pausa para no saturar
		await ns.sleep(150);
	}
	
	ns.print("");	
	ns.print(`📊 Resultado: ${downloaded}/${files.length} archivos descargados`);
	
	if (failed.length > 0) {
		ns.print(`⚠️ Fallidos: ${failed.length} archivos`);
		ns.print("  " + failed.join(", "));
	}
	
	// Verificar archivos críticos
	const critical = ['zero-to-hero.js', 'casino.js', 'daemon.js'];
	const missing = critical.filter(f => !ns.fileExists(f));
	
	if (missing.length > 0) {
		ns.print("");
		ns.print("❌ ERROR: Faltan archivos críticos:");
		for (const f of missing) ns.print(`   - ${f}`);
		ns.print("");
		ns.print("Intenta ejecutar de nuevo: run bootstrap.js");
		return;
	}
	
	ns.print("");
	ns.print("🎉 ¡Todos los scripts descargados!");
	ns.print("");
	ns.print("════════════════════════════════════════════════════════");
	ns.print("  Iniciando ZERO TO HERO en 3 segundos...");
	ns.print("  Este script automatizará TODO el juego.");
	ns.print("════════════════════════════════════════════════════════");
	ns.print("");
	ns.print("💡 Tip: Abre el log con 'tail zero-to-hero.js'");
	ns.print("");
	
	await ns.sleep(3000);
	
	// Iniciar zero-to-hero
	const pid = ns.run('zero-to-hero.js');
	
	if (pid > 0) {
		ns.print(`✅ zero-to-hero.js iniciado (PID: ${pid})`);
		ns.print("📋 Escribe: tail zero-to-hero.js");
	} else {
		ns.print("❌ Error al iniciar zero-to-hero.js");
		ns.print("Intenta manualmente: run zero-to-hero.js");
		
		// Diagnóstico
		const ram = ns.getServerMaxRam('home');
		const used = ns.getServerUsedRam('home');
		const avail = ram - used;
		ns.print(`RAM: ${used}GB / ${ram}GB usado (${avail}GB libre)`);
		
		// Intentar con run con 1 thread explícito
		ns.print("Intentando con thread=1...");
		const pid2 = ns.run('zero-to-hero.js', 1);
		if (pid2 > 0) {
			ns.print(`✅ Iniciado con PID: ${pid2}`);
		}
	}
}
