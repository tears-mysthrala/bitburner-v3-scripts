/** @param {NS} ns **/
export async function main(ns) {
	const URL = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	let phase = parseInt(ns.args[0]) || 0;
	let p = ns.getPlayer();
	let money = p.money;
	let hack = p.skills.hacking;
	
	ns.tprint('ZZZ P' + phase + ' $' + Math.floor(money/1e6) + 'M H' + hack);
	
	// FASE 0: Descargar
	if (phase === 0) {
		const files = ['helpers.js', 'casino.js', 'daemon.js'];
		for (const f of files) {
			if (!ns.fileExists(f)) await ns.wget(URL + f + '?t=' + Date.now(), f);
		}
		phase = (money < 200000) ? 1 : (money < 10e9) ? 2 : 3;
		ns.spawn('zzz.js', 1, String(phase));
		return;
	}
	
	// FASE 1: Farmear
	if (phase === 1) {
		if (money >= 200000) {
			ns.spawn('zzz.js', 1, '2');
			return;
		}
		try { await ns.hack('n00dles'); } catch(e) {}
		await ns.sleep(2000);
		ns.spawn('zzz.js', 1, '1');
		return;
	}
	
	// FASE 2: Casino
	if (phase === 2) {
		if (money >= 10e9) {
			for (const x of ns.ps('home')) if (x.filename === 'casino.js') ns.kill(x.pid);
			ns.spawn('zzz.js', 1, '3');
			return;
		}
		let running = false;
		for (const x of ns.ps('home')) if (x.filename === 'casino.js') running = true;
		if (!running) ns.run('casino.js');
		await ns.sleep(10000);
		ns.spawn('zzz.js', 1, '2');
		return;
	}
	
	// FASE 3: Daemon (sin singularity, sin complicaciones)
	if (phase === 3) {
		let daemonRunning = false;
		for (const x of ns.ps('home')) if (x.filename === 'daemon.js') daemonRunning = true;
		
		if (!daemonRunning) {
			ns.tprint('Starting daemon');
			ns.run('daemon.js', 1, '--no-tail-windows');
		}
		
		await ns.sleep(30000);
		ns.spawn('zzz.js', 1, '3');
		return;
	}
	
	ns.spawn('zzz.js', 1, '0');
}
