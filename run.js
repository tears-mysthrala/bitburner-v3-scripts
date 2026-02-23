/**
 * RUN - Launcher mínimo (usa SOLO APIs baratas)
 * 
 * Este script solo usa:
 * - ns.wget (para descargar)
 * - ns.run (para ejecutar otros)
 * - ns.sleep
 * - ns.ps (para verificar si corre)
 * - ns.getPlayer (barata)
 * - ns.getServerMaxRam (barata)
 * 
 * TODO lo demás va en scripts temporales.
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.ui.openTail();
	
	const log = m => ns.print(m);
	const fmt = n => n >= 1e9 ? (n/1e9).toFixed(1)+'b' : n >= 1e6 ? (n/1e6).toFixed(1)+'m' : Math.floor(n);
	
	// Descargar scripts base
	log('=== ZERO TO HERO ===');
	log('Descargando scripts...');
	
	const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const files = ['casino.js','daemon.js','ascend.js','work-for-factions.js','host-manager.js','kill-all-scripts.js'];
	
	for (const f of files) {
		if (!ns.fileExists(f)) {
			await ns.wget(url + f + '?t=' + Date.now(), f);
			log('  + ' + f);
		}
	}
	
	let phase = 0;
	
	while (true) {
		const p = ns.getPlayer();
		
		// FASE 0: Casino
		if (phase === 0) {
			if (p.money >= 10e9) {
				// Matar casino
				ns.run('kill-all-scripts.js');
				phase = 1;
				log('CASINO -> HACKING');
			}
			else {
				// Verificar si casino corre
				let casinoRunning = false;
				for (const proc of ns.ps('home')) {
					if (proc.filename === 'casino.js') casinoRunning = true;
				}
				
				if (!casinoRunning && p.money >= 200000) {
					ns.run('casino.js');
					log('Casino iniciado');
				}
			}
		}
		
		// FASE 1: Hacking
		else if (phase === 1) {
			let daemonRunning = false;
			for (const proc of ns.ps('home')) {
				if (proc.filename === 'daemon.js') daemonRunning = true;
			}
			
			if (!daemonRunning) {
				ns.run('daemon.js');
				log('Daemon iniciado');
			}
			
			if (p.skills.hacking >= 50) {
				phase = 2;
				log('HACKING -> FACTIONS');
			}
		}
		
		// FASE 2: Factions
		else if (phase === 2) {
			let wffRunning = false;
			for (const proc of ns.ps('home')) {
				if (proc.filename === 'work-for-factions.js') wffRunning = true;
			}
			
			if (!wffRunning) {
				ns.run('work-for-factions.js');
				log('Work-for-factions iniciado');
			}
			
			// Verificar augmentations via script temporal
			await ns.write('/Temp/check-augs.js', `
				export async function main(ns) {
					try {
						const owned = ns.singularity.getOwnedAugmentations(true);
						const base = ns.singularity.getOwnedAugmentations(false);
						await ns.write('/Temp/aug-count.txt', (owned.length - base.length).toString(), 'w');
					} catch {}
				}
			`, 'w');
			
			ns.run('/Temp/check-augs.js');
			await ns.sleep(2000);
			
			const count = parseInt(ns.read('/Temp/aug-count.txt') || '0');
			if (count >= 6) {
				phase = 3;
				log('FACTIONS -> INSTALL');
			}
		}
		
		// FASE 3: Install
		else if (phase === 3) {
			log('Instalando...');
			ns.run('kill-all-scripts.js');
			await ns.sleep(3000);
			
			const pid = ns.run('ascend.js', 1, '--auto');
			if (pid > 0) {
				// Esperar a que termine
				let running = true;
				while (running) {
					await ns.sleep(1000);
					running = false;
					for (const proc of ns.ps('home')) {
						if (proc.filename === 'ascend.js') running = true;
					}
				}
				log('Instalado! Reiniciando...');
				await ns.sleep(5000);
				phase = 1;
			}
		}
		
		// Status
		if (Date.now() % 15000 < 2000) {
			ns.clearLog();
			log('=== ZERO TO HERO ===');
			log('Fase: ' + ['CASINO','HACKING','FACTIONS','INSTALL'][phase]);
			log('Money: ' + fmt(p.money));
			log('Hack: ' + p.skills.hacking);
		}
		
		await ns.sleep(3000);
	}
}
