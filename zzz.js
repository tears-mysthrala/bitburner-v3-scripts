/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// Detectar SF4 real (no solo el API, sino que funcione)
	let hasSF4 = false;
	try {
		// Probar si singularity realmente funciona
		ns.singularity.getOwnedAugmentations(true);
		hasSF4 = true;
	} catch(e) {
		hasSF4 = false;
	}
	
	const PHASE = { INIT: 0, EARLY: 1, CASINO: 2, HACK: 3, END: 99 };
	let phase = parseInt(ns.args[0]) || PHASE.INIT;
	let p = ns.getPlayer();
	let money = p.money;
	let hack = p.skills.hacking;
	
	ns.tprint('=== ZZZ v7 === P' + phase + ' | $' + (money/1e9).toFixed(2) + 'B | H' + hack + ' | SF4:' + hasSF4);
	
	// === INIT: Descargar ===
	if (phase === PHASE.INIT) {
		ns.tprint('Descargando...');
		const files = [
			'helpers.js', 'casino.js', 'daemon.js',
			'host-manager.js', 'hacknet-upgrade-manager.js',
			'ascend.js', 'kill-all-scripts.js'
		];
		
		for (const f of files) {
			if (!ns.fileExists(f)) {
				await ns.wget(URL + f + '?t=' + Date.now(), f);
				await ns.sleep(100);
			}
		}
		
		if (money < 200000) phase = PHASE.EARLY;
		else if (money < 10e9) phase = PHASE.CASINO;
		else phase = PHASE.HACK;
		
		ns.spawn('zzz.js', 1, String(phase));
		return;
	}
	
	// === EARLY: Farm ===
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
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
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
	
	// === HACK: Solo lo esencial SIN SF4 ===
	if (phase === PHASE.HACK) {
		// Si NO tenemos SF4, solo daemon básico
		if (!hasSF4) {
			ns.tprint('Modo NO-SF4: Solo daemon básico');
			
			// Solo daemon, sin host-manager (da problemas)
			let daemonRunning = false;
			for (const x of ns.ps('home')) if (x.filename === 'daemon.js') daemonRunning = true;
			
			if (!daemonRunning) {
				ns.tprint('Start daemon (basic)');
				// Lanzar daemon con flags mínimas
				ns.run('daemon.js', 1, '--no-tail-windows', '--disable-script', 'work-for-factions.js');
			}
			
			// Sin SF4 no podemos hacer mucho más, solo dejar daemon farmeando
			await ns.sleep(30000);  // Check cada 30s
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
			return;
		}
		
		// Si TENEMOS SF4, modo completo
		ns.tprint('Modo SF4: Full automation');
		
		let daemonRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'daemon.js') daemonRunning = true;
		if (!daemonRunning) {
			ns.run('daemon.js', 1, '--no-tail-windows');
		}
		
		let hostRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'host-manager.js') hostRunning = true;
		if (!hostRunning) {
			ns.run('host-manager.js', 1, '-c');
		}
		
		await ns.sleep(15000);
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// Default
	ns.spawn('zzz.js', 1, String(PHASE.INIT));
}
