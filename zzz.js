/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	let phase = parseInt(ns.args[0]) || 0;
	let loops = 0;
	
	ns.tprint('=== ZZZ START === Phase: ' + phase);
	
	// Descargar helpers si falta
	if (!ns.fileExists('helpers.js')) {
		ns.tprint('DL: helpers.js');
		await ns.wget(URL + 'helpers.js?t=' + Date.now(), 'helpers.js');
	}
	
	while (true) {
		loops++;
		const p = ns.getPlayer();
		const m = p.money;
		
		// Log cada 15 segundos (loops % 5 con sleep 3s)
		if (loops % 5 === 0) {
			ns.tprint('P' + phase + ' | $' + Math.floor(m/1000) + 'k | H' + p.skills.hacking);
		}
		
		// === PHASE 0: Farm $200k ===
		if (phase === 0) {
			if (m >= 200000) {
				ns.tprint('P0 -> P1');
				ns.spawn('zzz.js', 1, '1');
				return;
			}
			
			// Nuke y hack n00dles
			try {
				if (!ns.hasRootAccess('n00dles')) {
					try { await ns.nuke('n00dles'); } catch(e) {}
				}
				await ns.hack('n00dles');
			} catch(e) {}
		}
		
		// === PHASE 1: Casino ===
		else if (phase === 1) {
			if (m >= 10e9) {
				ns.tprint('P1 -> P2');
				for (const x of ns.ps('home')) if (x.filename === 'casino.js') ns.kill(x.pid);
				ns.spawn('zzz.js', 1, '2');
				return;
			}
			
			if (!ns.fileExists('casino.js')) {
				await ns.wget(URL + 'casino.js?t=' + Date.now(), 'casino.js');
			}
			
			if (!ns.ps('home').find(x => x.filename === 'casino.js')) {
				ns.tprint('Start casino');
				ns.run('casino.js');
			}
		}
		
		// === PHASE 2: Download daemon ===
		else if (phase === 2) {
			ns.tprint('P2: DL tools');
			const tools = ['daemon.js', 'analyze-hack.js', 'host-manager.js'];
			for (const f of tools) {
				if (!ns.fileExists(f)) {
					ns.tprint('DL: ' + f);
					await ns.wget(URL + f + '?t=' + Date.now(), f);
					await ns.sleep(300);
				}
			}
			ns.tprint('P2 -> P3');
			ns.spawn('zzz.js', 1, '3');
			return;
		}
		
		// === PHASE 3: Run daemon ===
		else if (phase === 3) {
			if (!ns.ps('home').find(x => x.filename === 'daemon.js')) {
				ns.tprint('Start daemon');
				ns.run('daemon.js');
			}
			
			if (!ns.ps('home').find(x => x.filename === 'host-manager.js')) {
				ns.run('host-manager.js', 1, '--max-spend', '0.3');
			}
			
			if (p.skills.hacking >= 50) {
				ns.tprint('P3 -> P4');
				ns.spawn('zzz.js', 1, '4');
				return;
			}
		}
		
		// === PHASE 4: Factions ===
		else if (phase === 4) {
			if (!ns.fileExists('work-for-factions.js')) {
				await ns.wget(URL + 'work-for-factions.js?t=' + Date.now(), 'work-for-factions.js');
			}
			
			if (!ns.ps('home').find(x => x.filename === 'work-for-factions.js')) {
				ns.run('work-for-factions.js');
				ns.tprint('Start factions');
			}
			
			// Check augs cada ~50 loops (2.5 min)
			if (loops % 50 === 0) {
				try {
					const owned = ns.singularity.getOwnedAugmentations(true);
					const base = ns.singularity.getOwnedAugmentations(false);
					const newAugs = owned.length - base.length;
					ns.tprint('Augs: ' + newAugs);
					
					if (newAugs >= 6) {
						ns.tprint('P4 -> P5');
						ns.spawn('zzz.js', 1, '5');
						return;
					}
				} catch(e) {}
			}
		}
		
		// === PHASE 5: Install ===
		else if (phase === 5) {
			ns.tprint('P5: Installing');
			
			if (!ns.fileExists('ascend.js')) {
				await ns.wget(URL + 'ascend.js?t=' + Date.now(), 'ascend.js');
			}
			
			for (const x of ns.ps('home')) {
				if (x.filename !== 'zzz.js') ns.kill(x.pid);
			}
			await ns.sleep(3000);
			
			if (ns.run('ascend.js', 1, '--auto')) {
				while (ns.ps('home').find(x => x.filename === 'ascend.js')) {
					await ns.sleep(1000);
				}
				ns.tprint('Installed! P5 -> P3');
				await ns.sleep(5000);
				ns.spawn('zzz.js', 1, '3');
				return;
			}
		}
		
		// Reset si phase invalido
		else {
			ns.tprint('Invalid phase: ' + phase + ', reset to 0');
			ns.spawn('zzz.js', 1, '0');
			return;
		}
		
		await ns.sleep(3000);
	}
}
