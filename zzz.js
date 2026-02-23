/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// Detectar SF4
	let hasSF4 = false;
	try {
		ns.singularity.getOwnedAugmentations(true);
		hasSF4 = true;
	} catch(e) { hasSF4 = false; }
	
	const PHASE = { INIT: 0, EARLY: 1, CASINO: 2, UPGRADE: 3, HACK: 4 };
	let phase = parseInt(ns.args[0]) || PHASE.INIT;
	let p = ns.getPlayer();
	let money = p.money;
	let hack = p.skills.hacking;
	let ram = ns.getServerMaxRam('home');
	let usedRam = ns.getServerUsedRam('home');
	let freeRam = ram - usedRam;
	
	ns.tprint('=== ZZZ v8 === P' + phase + ' | $' + (money/1e9).toFixed(2) + 'B | H' + hack + ' | RAM:' + ram + 'GB (' + Math.floor(freeRam) + 'GB free)' + ' | SF4:' + hasSF4);
	
	// === INIT ===
	if (phase === PHASE.INIT) {
		ns.tprint('Descargando...');
		const files = ['helpers.js', 'casino.js', 'daemon.js', 'ascend.js', 'kill-all-scripts.js'];
		for (const f of files) {
			if (!ns.fileExists(f)) {
				await ns.wget(URL + f + '?t=' + Date.now(), f);
				await ns.sleep(100);
			}
		}
		
		if (money < 200000) phase = PHASE.EARLY;
		else if (money < 10e9) phase = PHASE.CASINO;
		else if (ram < 256 && money > 5e9) phase = PHASE.UPGRADE;  // Comprar RAM primero
		else phase = PHASE.HACK;
		
		ns.spawn('zzz.js', 1, String(phase));
		return;
	}
	
	// === EARLY ===
	if (phase === PHASE.EARLY) {
		if (money >= 200000) {
			ns.spawn('zzz.js', 1, String(PHASE.CASINO));
			return;
		}
		try { await ns.hack('n00dles'); } catch(e) {}
		await ns.sleep(2000);
		ns.spawn('zzz.js', 1, String(PHASE.EARLY));
		return;
	}
	
	// === CASINO ===
	if (phase === PHASE.CASINO) {
		if (money >= 10e9) {
			for (const x of ns.ps('home')) if (x.filename === 'casino.js') ns.kill(x.pid);
			ns.spawn('zzz.js', 1, String(PHASE.UPGRADE));
			return;
		}
		
		let running = false;
		for (const x of ns.ps('home')) if (x.filename === 'casino.js') running = true;
		if (!running) {
			ns.tprint('Start casino');
			ns.run('casino.js');
		}
		await ns.sleep(10000);
		ns.spawn('zzz.js', 1, String(PHASE.CASINO));
		return;
	}
	
	// === UPGRADE: Comprar RAM ===
	if (phase === PHASE.UPGRADE) {
		ns.tprint('UPGRADE: Mejorando RAM...');
		
		// Intentar comprar RAM maxima posible
		let upgrades = 0;
		while (money > 1e9) {  // Mientras tengamos mas de $1B
			try {
				const cost = ns.singularity.getUpgradeHomeRamCost();
				if (money >= cost && cost < 5e9) {  // No gastar mas de $5B por upgrade
					if (ns.singularity.upgradeHomeRam()) {
						upgrades++;
						money = ns.getPlayer().money;  // Actualizar
						await ns.sleep(100);
					} else {
						break;
					}
				} else {
					break;
				}
			} catch(e) {
				// Si no tiene singularity, no puede upgradear
				ns.tprint('No singularity, skip upgrade');
				break;
			}
		}
		
		if (upgrades > 0) {
			ns.tprint('RAM upgrades: ' + upgrades);
			ns.tprint('New RAM: ' + ns.getServerMaxRam('home') + 'GB');
		}
		
		// Ir a HACK
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// === HACK ===
	if (phase === PHASE.HACK) {
		// Verificar RAM disponible
		freeRam = ns.getServerMaxRam('home') - ns.getServerUsedRam('home');
		
		if (freeRam < 50) {
			ns.tprint('POCA RAM (' + Math.floor(freeRam) + 'GB), esperando...');
			await ns.sleep(10000);
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
			return;
		}
		
		// Modo NO-SF4: Simple
		if (!hasSF4) {
			ns.tprint('Modo NO-SF4: Daemon simple');
			
			let daemonRunning = false;
			for (const x of ns.ps('home')) if (x.filename === 'daemon.js') daemonRunning = true;
			
			if (!daemonRunning) {
				ns.tprint('Start daemon');
				ns.run('daemon.js', 1, '--no-tail-windows', '--disable-script', 'work-for-factions.js');
			}
			
			await ns.sleep(30000);
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
			return;
		}
		
		// Modo SF4: Full
		ns.tprint('Modo SF4: Full');
		
		let daemonRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'daemon.js') daemonRunning = true;
		if (!daemonRunning) ns.run('daemon.js', 1, '--no-tail-windows');
		
		await ns.sleep(15000);
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// Default
	ns.spawn('zzz.js', 1, String(PHASE.INIT));
}
