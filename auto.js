/**
 * AUTO - Zero to Hero Launcher v3.0
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.ui.openTail();
	
	const log = m => ns.print(m);
	const fmt = n => n >= 1e9 ? (n/1e9).toFixed(1)+'b' : n >= 1e6 ? (n/1e6).toFixed(1)+'m' : Math.floor(n);
	const running = s => ns.ps('home').some(p => p.filename === s);
	
	log('=== ZERO TO HERO v3.0 ===');
	log('Descargando scripts...');
	
	const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const need = ['casino.js','daemon.js','ascend.js','work-for-factions.js','host-manager.js','kill-all-scripts.js'];
	
	for (const f of need) {
		if (!ns.fileExists(f)) {
			await ns.wget(url + f + '?t=' + Date.now(), f);
			log('  + ' + f);
		}
	}
	
	log('Iniciando...');
	let phase = 0;
	
	while (true) {
		const p = ns.getPlayer();
		
		// FASE 0: Casino
		if (phase === 0) {
			if (p.money >= 10e9) {
				if (running('casino.js')) {
					ns.run('kill-all-scripts.js');
					await ns.sleep(2000);
				}
				phase = 1;
				log('✅ CASINO -> HACKING');
			}
			else if (!running('casino.js') && p.money >= 200000) {
				try { ns.singularity.travelToCity('Aevum'); } catch {}
				ns.run('casino.js');
				log('🎰 Casino started');
			}
		}
		
		// FASE 1: Hacking
		else if (phase === 1) {
			if (!running('daemon.js')) {
				ns.run('daemon.js');
				log('👹 Daemon started');
			}
			if (!running('host-manager.js')) {
				ns.run('host-manager.js', 1, '--max-spend', '0.3');
			}
			if (p.skills.hacking >= 50) {
				phase = 2;
				log('➡️ HACKING -> FACTIONS');
			}
		}
		
		// FASE 2: Factions
		else if (phase === 2) {
			if (!running('work-for-factions.js')) {
				ns.run('work-for-factions.js');
				log('💼 Work-for-factions started');
			}
			
			// Check augmentations
			await ns.write('/Temp/check.js', `export async function main(ns) {
				try {
					const o = ns.singularity.getOwnedAugmentations(true);
					const b = ns.singularity.getOwnedAugmentations(false);
					await ns.write('/Temp/aug.txt', (o.length-b.length).toString(), 'w');
				} catch {}
			}`, 'w');
			
			ns.run('/Temp/check.js');
			await ns.sleep(2000);
			const count = parseInt(ns.read('/Temp/aug.txt') || '0');
			
			if (count >= 6) {
				phase = 3;
				log('➡️ FACTIONS -> INSTALL');
			}
		}
		
		// FASE 3: Install
		else if (phase === 3) {
			log('⬆️ Installing...');
			ns.run('kill-all-scripts.js');
			await ns.sleep(3000);
			
			const pid = ns.run('ascend.js', 1, '--auto');
			if (pid > 0) {
				while (running('ascend.js')) await ns.sleep(1000);
				log('✅ Installed! Restarting...');
				await ns.sleep(5000);
				phase = 1;
			}
		}
		
		// Status
		if (Date.now() % 15000 < 2000) {
			ns.clearLog();
			log('=== ZERO TO HERO v3.0 ===');
			log('Fase: ' + ['CASINO','HACKING','FACTIONS','INSTALL'][phase]);
			log('Money: ' + fmt(p.money) + ' | Hack: ' + p.skills.hacking);
		}
		
		await ns.sleep(3000);
	}
}
