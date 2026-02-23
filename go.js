/**
 * GO - Launcher ultra-minimal
 * 
 * Solo coordina, el trabajo pesado lo hacen scripts temporales.
 * Esto evita que el juego calcule RAM basado en APIs de Singularity.
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.ui.openTail();
	await ns.sleep(100);
	if (ns.ui.moveTail) ns.ui.moveTail(50, 50);
	if (ns.ui.resizeTail) ns.ui.resizeTail(800, 400);
	
	const log = m => ns.print(`[${Math.floor(Date.now()/60000)}m] ${m}`);
	const running = s => ns.ps('home').some(p => p.filename === s);
	
	// Descargar scripts necesarios
	log('📥 Descargando scripts...');
	const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const need = ['casino.js','daemon.js','ascend.js','work-for-factions.js','host-manager.js','crime.js'];
	
	for (const f of need) {
		if (!ns.fileExists(f)) {
			await ns.wget(url + f + '?t=' + Date.now(), f);
			log(`  + ${f}`);
		}
	}
	
	log('🚀 Iniciando...');
	let phase = 0;
	
	while (true) {
		const p = ns.getPlayer();
		
		// ===== FASE 0: Casino =====
		if (phase === 0) {
			if (p.money >= 10e9) {
				// Matar casino
				if (running('casino.js')) {
					ns.run('kill-all-scripts.js');
					await ns.sleep(2000);
				}
				phase = 1;
				log('✅ Fase CASINO completada');
			}
			else if (!running('casino.js')) {
				// Iniciar casino
				if (p.money >= 200000) {
					// Viajar primero
					await runTempScript(ns, `
						try { ns.singularity.travelToCity('Aevum'); } catch {}
					`);
				}
				ns.run('casino.js');
				log('🎰 Casino iniciado');
			}
		}
		
		// ===== FASE 1: Hacking =====
		else if (phase === 1) {
			// Iniciar daemon
			if (!running('daemon.js')) {
				ns.run('daemon.js');
				log('👹 Daemon iniciado');
			}
			
			// Host manager
			if (!running('host-manager.js')) {
				ns.run('host-manager.js', 1, '--max-spend', '0.3');
			}
			
			// Pasar a facciones cuando tengamos nivel
			if (p.skills.hacking >= 50 || p.money > 100e6) {
				phase = 2;
				log('➡️ Pasando a FACTIONS');
			}
		}
		
		// ===== FASE 2: Factions =====
		else if (phase === 2) {
			// Unirse a facciones via script temporal
			await runTempScript(ns, `
				const factions = ['CyberSec','Netburners','Sector-12','Iron-Gym','The Black Hand'];
				for (const f of factions) {
					try {
						if (ns.singularity.checkFactionInvitations().includes(f)) {
							ns.singularity.joinFaction(f);
						}
					} catch {}
				}
			`);
			
			// Iniciar work-for-factions
			if (!running('work-for-factions.js')) {
				ns.run('work-for-factions.js');
				log('💼 Work-for-factions iniciado');
			}
			
			// Verificar si tenemos augmentations
			try {
				const result = await runTempScriptWithReturn(ns, `
					const owned = ns.singularity.getOwnedAugmentations(true);
					const base = ns.singularity.getOwnedAugmentations(false);
					return owned.length - base.length;
				`);
				
				if (result >= 6) {
					phase = 3;
					log('➡️ Pasando a INSTALL');
				}
			} catch {}
		}
		
		// ===== FASE 3: Install =====
		else if (phase === 3) {
			log('⬆️ Instalando augmentations...');
			
			// Matar todo
			ns.run('kill-all-scripts.js');
			await ns.sleep(3000);
			
			// Instalar
			const pid = ns.run('ascend.js', 1, '--auto');
			if (pid > 0) {
				log('Esperando instalacion...');
				while (running('ascend.js')) {
					await ns.sleep(1000);
				}
				log('✅ Instalado! Reiniciando ciclo...');
				await ns.sleep(5000);
				phase = 1; // Volver a hacking
			}
		}
		
		// Status cada ~10 segundos
		if (Date.now() % 10000 < 2000) {
			ns.clearLog();
			log('=== ZERO TO HERO ===');
			log(`Fase: ${['CASINO','HACKING','FACTIONS','INSTALL'][phase] || phase}`);
			log(`Money: ${fmt(p.money)} | Hack: ${p.skills.hacking}`);
			log(`Home RAM: ${ns.getServerMaxRam('home')}GB`);
		}
		
		await ns.sleep(2000);
	}
}

// Ejecutar código temporal sin que afecte el cálculo de RAM del script principal
async function runTempScript(ns, code) {
	const tempFile = `/Temp/run-${Date.now()}.js`;
	const script = `/** @param {NS} ns */ export async function main(ns) { ${code} }`;
	await ns.write(tempFile, script, 'w');
	const pid = ns.run(tempFile);
	if (pid > 0) {
		while (ns.isRunning(pid)) await ns.sleep(100);
	}
	try { ns.rm(tempFile); } catch {}
}

// Similar pero con retorno (usa archivo temporal)
async function runTempScriptWithReturn(ns, code) {
	const tempFile = `/Temp/run-${Date.now()}.js`;
	const outFile = `/Temp/out-${Date.now()}.txt`;
	const script = `/** @param {NS} ns */ export async function main(ns) { 
		const result = ${code}; 
		await ns.write('${outFile}', JSON.stringify(result), 'w');
	}`;
	await ns.write(tempFile, script, 'w');
	const pid = ns.run(tempFile);
	if (pid > 0) {
		while (ns.isRunning(pid)) await ns.sleep(100);
	}
	let result = null;
	try {
		const data = ns.read(outFile);
		if (data) result = JSON.parse(data);
	} catch {}
	try { ns.rm(tempFile); ns.rm(outFile); } catch {}
	return result;
}

function fmt(n) {
	if (n >= 1e12) return (n/1e12).toFixed(1) + 't';
	if (n >= 1e9) return (n/1e9).toFixed(1) + 'b';
	if (n >= 1e6) return (n/1e6).toFixed(1) + 'm';
	if (n >= 1e3) return (n/1e3).toFixed(1) + 'k';
	return '$' + Math.floor(n);
}
