/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// Obtener fase actual (default 0)
	let phase = parseInt(ns.args[0]) || 0;
	
	ns.tprint('=== ZZZ v3.0 ===');
	ns.tprint('Phase: ' + phase);
	
	// Verificar actualizaciones (cada 5 min aprox)
	if (Date.now() % 300000 < 10000) {
		ns.tprint('Checking for updates...');
		try {
			const tempFile = 'zzz-new-temp.js';
			const ok = await ns.wget(URL + 'zzz.js?t=' + Date.now(), tempFile);
			if (ok && ns.fileExists(tempFile)) {
				const current = ns.read('zzz.js');
				const nueva = ns.read(tempFile);
				if (nueva && nueva.length > 100 && current !== nueva) {
					ns.tprint('NEW VERSION! Restarting...');
					ns.rm('zzz.js');
					await ns.write('zzz.js', nueva, 'w');
					ns.rm(tempFile);
					ns.spawn('zzz.js', 1, phase.toString());
					return;
				}
				ns.rm(tempFile);
			}
		} catch(e) {
			ns.tprint('Update check failed: ' + e);
		}
	}
	
	// Descargar helpers.js si no existe
	if (!ns.fileExists('helpers.js')) {
		ns.tprint('Downloading helpers.js...');
		await ns.wget(URL + 'helpers.js?t=' + Date.now(), 'helpers.js');
	}
	
	let loopCount = 0;
	
	while (true) {
		const p = ns.getPlayer();
		const m = p.money;
		loopCount++;
		
		// Log de status cada 10 loops
		if (loopCount % 10 === 0) {
			ns.tprint('Phase ' + phase + ' | Money: $' + Math.floor(m).toLocaleString() + ' | Hack: ' + p.skills.hacking);
		}
		
		// PHASE 0: Early money ($0 - $200k)
		if (phase === 0) {
			if (m >= 200000) {
				ns.tprint('=== PHASE 0 COMPLETE ===');
				ns.tprint('Money: $' + Math.floor(m));
				phase = 1;
				ns.spawn('zzz.js', 1, '1');
				return;
			}
			
			// Farm manual en n00dles
			try {
				if (!ns.hasRootAccess('n00dles')) {
					try { await ns.brutessh('n00dles'); } catch(e) {}
					try { await ns.ftpcrack('n00dles'); } catch(e) {}
					try { await ns.relaysmtp('n00dles'); } catch(e) {}
					try { await ns.httpworm('n00dles'); } catch(e) {}
					try { await ns.sqlinject('n00dles'); } catch(e) {}
					try { await ns.nuke('n00dles'); ns.tprint('NUKE OK'); } catch(e) {}
				}
				const earned = await ns.hack('n00dles');
				if (earned > 0) {
					ns.tprint('HACK: +$' + Math.floor(earned));
				}
			} catch(e) {
				// Si no puede hackear, esperar
			}
		}
		
		// PHASE 1: Casino ($200k - $10B)
		else if (phase === 1) {
			if (m >= 10e9) {
				ns.tprint('=== PHASE 1 COMPLETE ===');
				ns.tprint('Money: $' + (m/1e9).toFixed(2) + 'B');
				// Kill casino
				for (const x of ns.ps('home')) {
					if (x.filename === 'casino.js') ns.kill(x.pid);
				}
				phase = 2;
				ns.spawn('zzz.js', 1, '2');
				return;
			}
			
			// Descargar casino si no existe
			if (!ns.fileExists('casino.js')) {
				ns.tprint('Downloading casino.js...');
				await ns.wget(URL + 'casino.js?t=' + Date.now(), 'casino.js');
			}
			
			// Lanzar casino
			if (!ns.ps('home').find(x => x.filename === 'casino.js')) {
				ns.tprint('Starting casino.js...');
				ns.run('casino.js');
			}
		}
		
		// PHASE 2: Setup daemon ($10B+)
		else if (phase === 2) {
			ns.tprint('=== PHASE 2: SETUP ===');
			
			const tools = ['daemon.js', 'analyze-hack.js', 'host-manager.js', 'hacknet-upgrade-manager.js'];
			for (const f of tools) {
				if (!ns.fileExists(f)) {
					ns.tprint('Downloading ' + f + '...');
					await ns.wget(URL + f + '?t=' + Date.now(), f);
					await ns.sleep(200);
				}
			}
			
			phase = 3;
			ns.spawn('zzz.js', 1, '3');
			return;
		}
		
		// PHASE 3: Running daemon
		else if (phase === 3) {
			// Iniciar daemon
			if (!ns.ps('home').find(x => x.filename === 'daemon.js')) {
				ns.tprint('Starting daemon.js...');
				ns.run('daemon.js');
			}
			
			// Iniciar host-manager
			if (!ns.ps('home').find(x => x.filename === 'host-manager.js')) {
				ns.run('host-manager.js', 1, '--max-spend', '0.3');
			}
			
			// Pasar a fase 4 cuando tengamos nivel
			if (p.skills.hacking >= 50) {
				ns.tprint('=== UPGRADING TO PHASE 4 ===');
				phase = 4;
				ns.spawn('zzz.js', 1, '4');
				return;
			}
		}
		
		// PHASE 4: Factions
		else if (phase === 4) {
			// Descargar si no existe
			if (!ns.fileExists('work-for-factions.js')) {
				await ns.wget(URL + 'work-for-factions.js?t=' + Date.now(), 'work-for-factions.js');
			}
			if (!ns.fileExists('faction-manager.js')) {
				await ns.wget(URL + 'faction-manager.js?t=' + Date.now(), 'faction-manager.js');
			}
			
			// Iniciar
			if (!ns.ps('home').find(x => x.filename === 'work-for-factions.js')) {
				ns.run('work-for-factions.js');
				ns.tprint('Started work-for-factions.js');
			}
			
			// Check augmentations cada 50 loops
			if (loopCount % 50 === 0) {
				try {
					const owned = ns.singularity.getOwnedAugmentations(true);
					const base = ns.singularity.getOwnedAugmentations(false);
					const newAugs = owned.length - base.length;
					ns.tprint('New augmentations: ' + newAugs);
					
					if (newAugs >= 6) {
						ns.tprint('=== UPGRADING TO PHASE 5 ===');
						phase = 5;
						ns.spawn('zzz.js', 1, '5');
						return;
					}
				} catch(e) {}
			}
		}
		
		// PHASE 5: Install augmentations
		else if (phase === 5) {
			ns.tprint('=== PHASE 5: INSTALLING ===');
			
			if (!ns.fileExists('ascend.js')) {
				await ns.wget(URL + 'ascend.js?t=' + Date.now(), 'ascend.js');
			}
			
			// Kill all except zzz
			for (const x of ns.ps('home')) {
				if (x.filename !== 'zzz.js') ns.kill(x.pid);
			}
			await ns.sleep(3000);
			
			// Instalar
			if (ns.run('ascend.js', 1, '--auto')) {
				ns.tprint('Waiting for install...');
				while (ns.ps('home').find(x => x.filename === 'ascend.js')) {
					await ns.sleep(1000);
				}
				ns.tprint('=== INSTALL COMPLETE ===');
				ns.tprint('Restarting in phase 3...');
				await ns.sleep(5000);
				phase = 3;
				ns.spawn('zzz.js', 1, '3');
				return;
			}
		}
		
		// Si phase es invalido, resetear a 0
		else {
			ns.tprint('ERROR: Invalid phase ' + phase + ', resetting to 0');
			phase = 0;
		}
		
		await ns.sleep(2000);
	}
}
