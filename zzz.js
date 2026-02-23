/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	
	// === CONFIGURACION ===
	const PHASE = {
		INIT: 0,      // Descargar todo
		EARLY: 1,     // Farmear $200k
		CASINO: 2,    // Casino a $10B
		HACK: 3,      // Daemon + tools
		FACTION: 4,   // Factions + install
		INSTALL: 5    // Instalar augs
	};
	
	let phase = parseInt(ns.args[0]) || PHASE.INIT;
	let money = ns.getPlayer().money;
	let hack = ns.getPlayer().skills.hacking;
	
	ns.tprint('=== ZZZ v5 === P' + phase + ' | $' + (money/1e9).toFixed(2) + 'B | H' + hack);
	
	// === PHASE INIT: Descargar TODO de golpe ===
	if (phase === PHASE.INIT) {
		ns.tprint('Descargando repo completo...');
		
		// Lista completa de archivos del repo
		const files = [
			// Core
			'helpers.js', 'casino.js', 'daemon.js', 'autopilot.js',
			// Tools
			'host-manager.js', 'hacknet-upgrade-manager.js', 'stockmaster.js',
			'work-for-factions.js', 'faction-manager.js', 'ascend.js',
			// Utils
			'kill-all-scripts.js', 'cleanup.js', 'scan.js', 'analyze-hack.js',
			// Stats
			'stats.js', 'go.js', 'sleeve.js', 'bladeburner.js', 'gangs.js',
			// Tasks
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
		
		// Ir a siguiente fase segun dinero
		if (money < 200000) {
			ns.spawn('zzz.js', 1, String(PHASE.EARLY));
		} else if (money < 10e9) {
			ns.spawn('zzz.js', 1, String(PHASE.CASINO));
		} else {
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
		}
		return;
	}
	
	// === PHASE EARLY: Farm $200k ===
	if (phase === PHASE.EARLY) {
		if (money >= 200000) {
			ns.tprint('Early complete!');
			ns.spawn('zzz.js', 1, String(PHASE.CASINO));
			return;
		}
		
		// Solo hack n00dles
		try { await ns.hack('n00dles'); } catch(e) {}
		ns.tprint('Farming... $' + Math.floor(money/1000) + 'k');
		
		await ns.sleep(2000);
		ns.spawn('zzz.js', 1, String(PHASE.EARLY));
		return;
	}
	
	// === PHASE CASINO: $200k -> $10B ===
	if (phase === PHASE.CASINO) {
		if (money >= 10e9) {
			ns.tprint('Casino complete! $' + (money/1e9).toFixed(2) + 'B');
			for (const p of ns.ps('home')) if (p.filename === 'casino.js') ns.kill(p.pid);
			ns.spawn('zzz.js', 1, String(PHASE.HACK));
			return;
		}
		
		// Lanzar casino
		let running = false;
		for (const p of ns.ps('home')) if (p.filename === 'casino.js') running = true;
		
		if (!running) {
			ns.tprint('Starting casino...');
			ns.run('casino.js');
		}
		
		ns.tprint('Casino running... $' + (money/1e9).toFixed(2) + 'B');
		await ns.sleep(10000);
		ns.spawn('zzz.js', 1, String(PHASE.CASINO));
		return;
	}
	
	// === PHASE HACK: Daemon ===
	if (phase === PHASE.HACK) {
		// Lanzar daemon
		let daemonRunning = false;
		for (const p of ns.ps('home')) if (p.filename === 'daemon.js') daemonRunning = true;
		
		if (!daemonRunning) {
			ns.tprint('Starting daemon...');
			ns.run('daemon.js', 1, '--no-tail-windows');
		}
		
		// Lanzar host-manager (sin flags problemáticos)
		let hostRunning = false;
		for (const p of ns.ps('home')) if (p.filename === 'host-manager.js') hostRunning = true;
		
		if (!hostRunning) {
			ns.tprint('Starting host-manager...');
			ns.run('host-manager.js');  // Sin --max-spend
		}
		
		// Cuando tengamos hack 50+, ir a factions
		if (hack >= 50) {
			ns.tprint('Hack 50+ -> Factions');
			ns.spawn('zzz.js', 1, String(PHASE.FACTION));
			return;
		}
		
		ns.tprint('Daemon running... H' + hack);
		await ns.sleep(15000);
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// === PHASE FACTION: Factions + Install check ===
	if (phase === PHASE.FACTION) {
		// Lanzar work-for-factions
		let wffRunning = false;
		for (const p of ns.ps('home')) if (p.filename === 'work-for-factions.js') wffRunning = true;
		
		if (!wffRunning) {
			ns.tprint('Starting factions...');
			ns.run('work-for-factions.js');
		}
		
		// Si tenemos mucho dinero, intentar install
		if (money > 50e9) {
			ns.tprint('Money for install -> Checking...');
			ns.spawn('zzz.js', 1, String(PHASE.INSTALL));
			return;
		}
		
		ns.tprint('Factions running... $' + (money/1e9).toFixed(2) + 'B');
		await ns.sleep(20000);
		ns.spawn('zzz.js', 1, String(PHASE.FACTION));
		return;
	}
	
	// === PHASE INSTALL: Instalar augmentations ===
	if (phase === PHASE.INSTALL) {
		ns.tprint('Installing...');
		
		// Matar todo
		for (const p of ns.ps('home')) if (p.filename !== 'zzz.js') ns.kill(p.pid);
		await ns.sleep(3000);
		
		// Intentar install
		if (ns.fileExists('ascend.js')) {
			ns.tprint('Running ascend...');
			if (ns.run('ascend.js', 1, '--auto')) {
				while (ns.ps('home').find(x => x.filename === 'ascend.js')) await ns.sleep(1000);
				ns.tprint('Installed!');
				await ns.sleep(5000);
			}
		}
		
		// Volver a hack
		ns.spawn('zzz.js', 1, String(PHASE.HACK));
		return;
	}
	
	// Fase invalida -> reset
	ns.tprint('Invalid phase: ' + phase);
	ns.spawn('zzz.js', 1, String(PHASE.INIT));
}
