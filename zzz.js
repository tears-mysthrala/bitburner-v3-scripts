/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const TASKS_URL = 'https://raw.githubusercontent.com/alainbryden/bitburner-scripts/main/Tasks/';
	
	let phase = parseInt(ns.args[0]) || 0;
	let loops = 0;
	
	ns.tprint('=== ZZZ v4.0 === Phase: ' + phase);
	
	// === FASE 0: Descargar TODO de golpe ===
	if (phase === 0) {
		ns.tprint('FASE 0: Descargando todo...');
		
		// Core scripts
		const core = ['helpers.js', 'casino.js', 'daemon.js', 'stockmaster.js'];
		for (const f of core) {
			if (!ns.fileExists(f)) {
				ns.tprint('  DL: ' + f);
				await ns.wget(URL + f + '?t=' + Date.now(), f);
				await ns.sleep(100);
			}
		}
		
		// Tasks scripts (necesarios para daemon)
		const tasks = ['crack-host.js', 'grow-host.js', 'hack-host.js', 'weaken-host.js'];
		for (const f of tasks) {
			const path = '/Tasks/' + f;
			if (!ns.fileExists(path)) {
				ns.tprint('  DL: ' + path);
				await ns.wget(TASKS_URL + f + '?t=' + Date.now(), path);
				await ns.sleep(100);
			}
		}
		
		ns.tprint('Fase 0 completa -> Fase 1');
		ns.spawn('zzz.js', 1, '1');
		return;
	}
	
	// === FASE 1: Farmear dinero inicial ===
	if (phase === 1) {
		const money = ns.getPlayer().money;
		ns.tprint('FASE 1: Farmeando... $' + Math.floor(money/1000) + 'k');
		
		if (money >= 200000) {
			ns.tprint('Fase 1 completa -> Fase 2 (Casino)');
			ns.spawn('zzz.js', 1, '2');
			return;
		}
		
		// Farm simple: hackear n00dles
		try {
			await ns.hack('n00dles');
		} catch(e) {}
		
		await ns.sleep(2000);
		ns.spawn('zzz.js', 1, '1');  // Loop en fase 1
		return;
	}
	
	// === FASE 2: Casino ===
	if (phase === 2) {
		const money = ns.getPlayer().money;
		ns.tprint('FASE 2: Casino... $' + (money/1e9).toFixed(2) + 'B');
		
		if (money >= 10e9) {
			ns.tprint('Fase 2 completa -> Fase 3 (Setup)');
			// Matar casino
			for (const p of ns.ps('home')) {
				if (p.filename === 'casino.js') ns.kill(p.pid);
			}
			ns.spawn('zzz.js', 1, '3');
			return;
		}
		
		// Lanzar casino si no corre
		let casinoRunning = false;
		for (const p of ns.ps('home')) {
			if (p.filename === 'casino.js') casinoRunning = true;
		}
		
		if (!casinoRunning) {
			ns.tprint('Iniciando casino.js...');
			ns.run('casino.js');
		}
		
		await ns.sleep(5000);
		ns.spawn('zzz.js', 1, '2');  // Loop en fase 2
		return;
	}
	
	// === FASE 3: Setup y Daemon ===
	if (phase === 3) {
		ns.tprint('FASE 3: Setup...');
		
		// Descargar mas tools si faltan
		const tools = ['host-manager.js', 'hacknet-upgrade-manager.js', 'work-for-factions.js', 'faction-manager.js', 'ascend.js'];
		for (const f of tools) {
			if (!ns.fileExists(f)) {
				ns.tprint('  DL: ' + f);
				await ns.wget(URL + f + '?t=' + Date.now(), f);
				await ns.sleep(100);
			}
		}
		
		ns.tprint('Fase 3 completa -> Fase 4 (Daemon)');
		ns.spawn('zzz.js', 1, '4');
		return;
	}
	
	// === FASE 4: Ejecutar Daemon ===
	if (phase === 4) {
		const p = ns.getPlayer();
		ns.tprint('FASE 4: Daemon activo | $' + (p.money/1e9).toFixed(2) + 'B | H' + p.skills.hacking);
		
		// Iniciar daemon SOLO si no corre
		let daemonRunning = false;
		for (const proc of ns.ps('home')) {
			if (proc.filename === 'daemon.js') daemonRunning = true;
		}
		
		if (!daemonRunning) {
			ns.tprint('Iniciando daemon.js...');
			// Usar flags para reducir RAM usage
			ns.run('daemon.js', 1, '--no-tail-windows', '--reserved-ram', '16');
		}
		
		// Iniciar host-manager
		let hostRunning = false;
		for (const proc of ns.ps('home')) {
			if (proc.filename === 'host-manager.js') hostRunning = true;
		}
		
		if (!hostRunning) {
			ns.run('host-manager.js', 1, '--max-spend', '0.2');
		}
		
		// Si tenemos buen hacking, ir a fases avanzadas
		if (p.skills.hacking >= 50 && loops > 100) {
			ns.tprint('Hack 50+ -> Fase 5 (Factions)');
			ns.spawn('zzz.js', 1, '5');
			return;
		}
		
		loops++;
		await ns.sleep(10000);  // Check cada 10s
		ns.spawn('zzz.js', 1, '4');  // Loop en fase 4
		return;
	}
	
	// === FASE 5: Factions ===
	if (phase === 5) {
		ns.tprint('FASE 5: Factions');
		
		// Iniciar work-for-factions si no corre
		let wffRunning = false;
		for (const proc of ns.ps('home')) {
			if (proc.filename === 'work-for-factions.js') wffRunning = true;
		}
		
		if (!wffRunning) {
			ns.tprint('Iniciando work-for-factions.js...');
			ns.run('work-for-factions.js');
		}
		
		// Simple check: si tenemos mucho dinero, instalar
		const money = ns.getPlayer().money;
		if (money > 100e9) {
			ns.tprint('Mucho dinero -> Fase 6 (Install)');
			ns.spawn('zzz.js', 1, '6');
			return;
		}
		
		await ns.sleep(10000);
		ns.spawn('zzz.js', 1, '5');
		return;
	}
	
	// === FASE 6: Install ===
	if (phase === 6) {
		ns.tprint('FASE 6: Instalando augmentations...');
		
		// Matar todo excepto zzz
		for (const proc of ns.ps('home')) {
			if (proc.filename !== 'zzz.js') ns.kill(proc.pid);
		}
		await ns.sleep(3000);
		
		// Ejecutar ascend
		if (ns.fileExists('ascend.js')) {
			ns.tprint('Ejecutando ascend.js...');
			if (ns.run('ascend.js', 1, '--auto')) {
				// Esperar a que termine
				while (true) {
					let running = false;
					for (const p of ns.ps('home')) {
						if (p.filename === 'ascend.js') running = true;
					}
					if (!running) break;
					await ns.sleep(1000);
				}
				ns.tprint('Instalacion completa!');
				await ns.sleep(5000);
			}
		}
		
		// Volver a fase 4 (daemon)
		ns.tprint('Volviendo a Fase 4...');
		ns.spawn('zzz.js', 1, '4');
		return;
	}
	
	// Fase invalida
	ns.tprint('ERROR: Fase invalida ' + phase);
	ns.spawn('zzz.js', 1, '0');
}
