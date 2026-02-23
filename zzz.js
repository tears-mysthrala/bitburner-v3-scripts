/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	let phase = parseInt(ns.args[0]) || 0;
	let loops = 0;
	
	ns.tprint('=== ZZZ START === Phase: ' + phase);
	
	while (true) {
		loops++;
		const p = ns.getPlayer();
		const m = p.money;
		
		// Log cada 5 loops
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
			
			// Solo hack - NO singularity
			try {
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
		
		// === PHASE 2: Setup tools ===
		else if (phase === 2) {
			ns.tprint('P2: DL tools');
			const tools = ['daemon.js', 'analyze-hack.js', 'host-manager.js', 'autopilot.js'];
			for (const f of tools) {
				if (!ns.fileExists(f)) {
					await ns.wget(URL + f + '?t=' + Date.now(), f);
					await ns.sleep(200);
				}
			}
			ns.tprint('P2 -> P3');
			ns.spawn('zzz.js', 1, '3');
			return;
		}
		
		// === PHASE 3: Run tools ===
		else if (phase === 3) {
			// Usar autopilot en lugar de daemon (mas estable)
			if (!ns.ps('home').find(x => x.filename === 'autopilot.js')) {
				ns.tprint('Start autopilot');
				ns.run('autopilot.js');
			}
			
			if (p.skills.hacking >= 100) {
				ns.tprint('P3 -> P4');
				ns.spawn('zzz.js', 1, '4');
				return;
			}
		}
		
		// === PHASE 4: Factions (sin singularity) ===
		else if (phase === 4) {
			if (!ns.fileExists('work-for-factions.js')) {
				await ns.wget(URL + 'work-for-factions.js?t=' + Date.now(), 'work-for-factions.js');
			}
			
			if (!ns.ps('home').find(x => x.filename === 'work-for-factions.js')) {
				ns.run('work-for-factions.js');
				ns.tprint('Start factions');
			}
			
			// Check simple: mucho dinero = pasar a install
			if (m > 50e9 && loops > 1000) {
				ns.tprint('P4 -> P5');
				ns.spawn('zzz.js', 1, '5');
				return;
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
		
		// Reset
		else {
			ns.tprint('Invalid phase: ' + phase + ', reset');
			ns.spawn('zzz.js', 1, '0');
			return;
		}
		
		await ns.sleep(3000);
	}
}
