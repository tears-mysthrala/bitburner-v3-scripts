/** @param {NS} ns **/
export async function main(ns) {
	const VERSION = '3.0';
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// Verificar si hay nueva version de zzz.js
	ns.tprint('Checking for updates...');
	const newZzz = await ns.wget(URL + 'zzz.js?t=' + Date.now(), '/Temp/zzz-new.js');
	if (newZzz) {
		const current = ns.read('zzz.js');
		const nueva = ns.read('/Temp/zzz-new.js');
		if (current !== nueva && nueva.length > 100) {
			ns.tprint('NEW VERSION FOUND! Restarting...');
			await ns.sleep(500);
			ns.rm('zzz.js');
			await ns.write('zzz.js', nueva, 'w');
			ns.spawn('zzz.js');
			return;
		}
	}
	
	// Descargar helpers.js (siempre necesario)
	if (!ns.fileExists('helpers.js')) {
		ns.tprint('Downloading helpers.js...');
		await ns.wget(URL + 'helpers.js?t=' + Date.now(), 'helpers.js');
	}
	
	let phase = ns.args[0] || 0;
	let loopCount = 0;
	ns.tprint('Starting phase: ' + phase);
	
	while (true) {
		const p = ns.getPlayer();
		const m = p.money;
		loopCount++;
		
		// Auto-update cada 5 minutos (100 loops)
		if (loopCount % 100 === 0) {
			const check = await ns.wget(URL + 'zzz.js?t=' + Date.now(), '/Temp/zzz-check.js');
			if (check) {
				const actual = ns.read('zzz.js');
				const remoto = ns.read('/Temp/zzz-check.js');
				if (actual !== remoto && remoto.length > 100) {
					ns.tprint('UPDATE AVAILABLE! Spawning new version...');
					await ns.sleep(500);
					ns.rm('zzz.js');
					await ns.write('zzz.js', remoto, 'w');
					ns.spawn('zzz.js', 1, phase.toString());
					return;
				}
			}
		}
		
		// PHASE 0: Early money ($0 - $200k)
		if (phase === 0) {
			if (m >= 200000) {
				ns.tprint('PHASE 0 COMPLETE - Downloading casino...');
				// Descargar casino y deps
				const files = ['casino.js'];
				for (const f of files) {
					if (!ns.fileExists(f)) {
						await ns.wget(URL + f + '?t=' + Date.now(), f);
						ns.tprint('  + ' + f);
					}
				}
				phase = 1;
				ns.spawn('zzz.js', 1, '1');
				return;
			}
			
			// Farm manual
			try {
				if (!ns.hasRootAccess('n00dles')) {
					try { await ns.brutessh('n00dles'); } catch(e) {}
					try { await ns.ftpcrack('n00dles'); } catch(e) {}
					try { await ns.relaysmtp('n00dles'); } catch(e) {}
					try { await ns.httpworm('n00dles'); } catch(e) {}
					try { await ns.sqlinject('n00dles'); } catch(e) {}
					try { await ns.nuke('n00dles'); } catch(e) {}
				}
				const earned = await ns.hack('n00dles');
				if (earned > 0 && loopCount % 10 === 0) {
					ns.tprint('Farm: $' + Math.floor(m) + ' (+' + Math.floor(earned) + ')');
				}
			} catch(e) {}
		}
		
		// PHASE 1: Casino ($200k - $10B)
		else if (phase === 1) {
			if (m >= 10e9) {
				ns.tprint('PHASE 1 COMPLETE - Killing casino...');
				for (const x of ns.ps('home')) {
					if (x.filename === 'casino.js') ns.kill(x.pid);
				}
				phase = 2;
				ns.spawn('zzz.js', 1, '2');
				return;
			}
			
			// Asegurar que casino.js existe
			if (!ns.fileExists('casino.js')) {
				await ns.wget(URL + 'casino.js?t=' + Date.now(), 'casino.js');
			}
			
			// Lanzar casino si no corre
			if (!ns.ps('home').find(x => x.filename === 'casino.js')) {
				ns.tprint('Starting casino.js...');
				ns.run('casino.js');
			}
			
			if (loopCount % 20 === 0) {
				ns.tprint('Casino: $' + (m / 1e9).toFixed(2) + 'B / $10B');
			}
		}
		
		// PHASE 2: Hacking setup ($10B+)
		else if (phase === 2) {
			ns.tprint('PHASE 2 - Downloading daemon tools...');
			
			// Descargar todo lo necesario para daemon
			const tools = [
				'daemon.js', 'analyze-hack.js', 'host-manager.js',
				'hacknet-upgrade-manager.js', 'spend-hacknet-hashes.js'
			];
			
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
			// Verificar daemon corre
			if (!ns.ps('home').find(x => x.filename === 'daemon.js')) {
				ns.tprint('Starting daemon.js...');
				ns.run('daemon.js');
			}
			
			// Host manager
			if (!ns.ps('home').find(x => x.filename === 'host-manager.js')) {
				ns.run('host-manager.js', 1, '--max-spend', '0.3');
			}
			
			if (p.skills.hacking >= 50) {
				phase = 4;
				ns.spawn('zzz.js', 1, '4');
				return;
			}
			
			if (loopCount % 30 === 0) {
				ns.tprint('Daemon running - Hack: ' + p.skills.hacking);
			}
		}
		
		// PHASE 4: Factions
		else if (phase === 4) {
			if (!ns.fileExists('work-for-factions.js')) {
				await ns.wget(URL + 'work-for-factions.js?t=' + Date.now(), 'work-for-factions.js');
			}
			
			if (!ns.ps('home').find(x => x.filename === 'work-for-factions.js')) {
				ns.run('work-for-factions.js');
				ns.tprint('Started work-for-factions.js');
			}
			
			if (!ns.fileExists('faction-manager.js')) {
				await ns.wget(URL + 'faction-manager.js?t=' + Date.now(), 'faction-manager.js');
			}
			
			// Check augmentations
			if (loopCount % 50 === 0) {
				try {
					const owned = ns.singularity.getOwnedAugmentations(true);
					const base = ns.singularity.getOwnedAugmentations(false);
					const newAugs = owned.length - base.length;
					ns.tprint('Augmentations: ' + newAugs + ' new');
					
					if (newAugs >= 6) {
						phase = 5;
						ns.spawn('zzz.js', 1, '5');
						return;
					}
				} catch(e) {}
			}
		}
		
		// PHASE 5: Install
		else if (phase === 5) {
			ns.tprint('PHASE 5 - Installing augmentations...');
			
			if (!ns.fileExists('ascend.js')) {
				await ns.wget(URL + 'ascend.js?t=' + Date.now(), 'ascend.js');
			}
			
			// Kill all except zzz
			for (const x of ns.ps('home')) {
				if (x.filename !== 'zzz.js') ns.kill(x.pid);
			}
			await ns.sleep(3000);
			
			if (ns.run('ascend.js', 1, '--auto')) {
				while (ns.ps('home').find(x => x.filename === 'ascend.js')) {
					await ns.sleep(1000);
				}
				ns.tprint('INSTALL COMPLETE - Restarting...');
				await ns.sleep(5000);
				phase = 3;
				ns.spawn('zzz.js', 1, '3');
				return;
			}
		}
		
		await ns.sleep(2000);
	}
}
