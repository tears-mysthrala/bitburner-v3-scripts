/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	const PHASE = { INIT: 0, EARLY: 1, CASINO: 2, HACK: 3, FACTION: 4, INSTALL: 5 };
	let phase = parseInt(ns.args[0]) || PHASE.INIT;
	let p = ns.getPlayer();
	let money = p.money;
	let hack = p.skills.hacking;
	
	// Detectar si tenemos SF4 (singularity)
	let hasSF4 = false;
	try {
		// Si podemos acceder a singularity, tenemos SF4
		hasSF4 = (p.bitNodeN === 4) || (ns.singularity && typeof ns.singularity.getOwnedAugmentations === 'function');
	} catch(e) {}
	
	ns.tprint('=== ZZZ v6 === P' + phase + ' | $' + (money/1e9).toFixed(2) + 'B | H' + hack + ' | SF4:' + hasSF4);
	
	// === PHASE INIT ===
	if (phase === PHASE.INIT) {
		ns.tprint('Descargando repo...');
		const files = [
			'helpers.js', 'casino.js', 'daemon.js', 'autopilot.js',
			'host-manager.js', 'hacknet-upgrade-manager.js', 'stockmaster.js',
			'work-for-factions.js', 'faction-manager.js', 'ascend.js',
			'kill-all-scripts.js', 'cleanup.js', 'scan.js', 'analyze-hack.js',
			'stats.js', 'go.js', 'sleeve.js', 'bladeburner.js', 'gangs.js',
			'/Tasks/crack-host.js', '/Tasks/grow-host.js', '/Tasks/hack-host.js', 
			'/Tasks/weaken-host.js', '/Tasks/contractor.js'
		];
		
		let ok = 0, fail = 0;
		for (const f of files) {
			if (!ns.fileExists(f)) {
				const success = await ns.wget(URL + f + '?t=' + Date.now(), f);
				if (success) ok++; else fail++;
				await ns.sleep(50);
			}
		}
		ns.tprint('Descarga: ' + ok + ' OK, ' + fail + ' FAIL');
		
		// Ir a fase segun dinero
		if (money < 200000) phase = PHASE.EARLY;
		else if (money < 10e9) phase = PHASE.CASINO;
		else phase = PHASE.HACK;
		
		ns.spawn('zzz.js', 1, String(phase));
		return;
	}
	
	// === PHASE EARLY: Farm $200k ===
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
	
	// === PHASE CASINO ===
	if (phase === PHASE.CASINO) {
		if (money >= 10e9) {
			for (const x of ns.ps('home')) if (x.filename === 'casino.js') ns.kill(x.pid);
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
			return;
		}
		
		let running = false;
		for (const x of ns.ps('home')) if (x.filename === 'casino.js') running = true;
		
		if (!running) {
			ns.tprint('Starting casino...');
			ns.run('casino.js');
		}
		
		await ns.sleep(10000);
		ns.spawn('zzz.js', 1, String(PHASE.CASINO));
		return;
	}
	
	// === PHASE HACK: Daemon + tools ===
	if (phase === PHASE.HACK) {
		// Daemon
		let daemonRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'daemon.js') daemonRunning = true;
		
		if (!daemonRunning) {
			ns.tprint('Starting daemon...');
			ns.run('daemon.js', 1, '--no-tail-windows');
		}
		
		// Host-manager (SIN --max-spend, ese flag no existe)
		let hostRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'host-manager.js') hostRunning = true;
		
		if (!hostRunning) {
			ns.tprint('Starting host-manager...');
			// Solo lanzar sin flags problematicos
			ns.run('host-manager.js', 1, '-c');  // -c = run continuously
		}
		
		// Hacknet
		let hacknetRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'hacknet-upgrade-manager.js') hacknetRunning = true;
		
		if (!hacknetRunning && money > 10e9) {
			ns.run('hacknet-upgrade-manager.js');
		}
		
		// Si tenemos SF4 y hack 50+, ir a factions
		if (hasSF4 && hack >= 50) {
			ns.tprint('SF4 + Hack 50 -> Factions');
			ns.spawn('zzz.js', 1, String(PHASE.FACTION));
			return;
		}
		
		// Sin SF4, quedarse en hack forever (o hasta que tengamos MUCHO dinero)
		if (!hasSF4 && money > 100e9 && hack >= 100) {
			ns.tprint('No SF4 pero mucho dinero, intentando install manual...');
			ns.spawn('zzz.js', 1, String(PHASE.INSTALL));
			return;
		}
		
		await ns.sleep(15000);
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// === PHASE FACTION: Solo con SF4 ===
	if (phase === PHASE.FACTION) {
		if (!hasSF4) {
			ns.tprint('No SF4, volviendo a HACK');
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
			return;
		}
		
		let wffRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'work-for-factions.js') wffRunning = true;
		
		if (!wffRunning) {
			ns.tprint('Starting factions...');
			ns.run('work-for-factions.js');
		}
		
		if (money > 50e9) {
			ns.spawn('zzz.js', 1, String(PHASE.INSTALL));
			return;
		}
		
		await ns.sleep(20000);
		ns.spawn('zzz.js', 1, String(PHASE.FACTION));
		return;
	}
	
	// === PHASE INSTALL ===
	if (phase === PHASE.INSTALL) {
		ns.tprint('Installing...');
		
		for (const x of ns.ps('home')) if (x.filename !== 'zzz.js') ns.kill(x.pid);
		await ns.sleep(3000);
		
		if (ns.fileExists('ascend.js')) {
			if (ns.run('ascend.js', 1, '--auto')) {
				while (ns.ps('home').find(x => x.filename === 'ascend.js')) await ns.sleep(1000);
				ns.tprint('Installed!');
				await ns.sleep(5000);
			}
		}
		
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// Reset
	ns.spawn('zzz.js', 1, String(PHASE.INIT));
}
