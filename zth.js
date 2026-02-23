/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.tail();
	const $ = (n) => n >= 1e9 ? (n/1e9).toFixed(1) + 'b' : (n/1e6).toFixed(1) + 'm';
	const T = (ms) => { const s = Math.floor(ms/1000), m = Math.floor(s/60); return m > 0 ? m + 'm' : s + 's'; };
	let phase = 0, start = Date.now(), last = start, p = ns.getPlayer();
	
	const log = (m) => ns.print(`[${T(Date.now()-start)}] ${m}`);
	const kill = (s) => { for(const x of ns.ps('home')) if(x.filename==s) ns.kill(x.pid); };
	const run = (s,...a) => ns.run(s,1,...a) > 0;
	const running = (s) => ns.ps('home').some(x => x.filename==s);
	
	// Descargar scripts si faltan
	const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	const need = ['casino.js','daemon.js','ascend.js','faction-manager.js','work-for-factions.js','host-manager.js'];
	for(const f of need) if(!ns.fileExists(f)) { log(`Descargando ${f}...`); await ns.wget(url+f+'?t='+Date.now(),f); }
	
	log("🚀 ZERO TO HERO iniciado!");
	
	while(true) {
		p = ns.getPlayer();
		
		// FASE 0: Casino
		if(phase==0) {
			if(p.money >= 10e9) { kill('casino.js'); phase=1; log("✅ Casino listo!"); }
			else if(!running('casino.js')) {
				if(p.money < 200000) { try { ns.singularity.workForCompany("Joe's Guns",false); } catch { run('crime.js'); } }
				else { try { ns.singularity.travelToCity('Aevum'); } catch {} run('casino.js'); log("🎰 Casino iniciado"); }
			}
		}
		
		// FASE 1: Hacking
		else if(phase==1) {
			kill('casino.js');
			if(!p.tor && p.money > 200000) try { ns.singularity.purchaseTor(); } catch {}
			if(p.tor && !ns.fileExists('BruteSSH.exe') && p.money > 1e6) try { ns.singularity.purchaseProgram('BruteSSH.exe'); } catch {}
			if(!running('daemon.js')) { run('daemon.js'); log("👹 Daemon iniciado"); }
			if(!running('host-manager.js')) run('host-manager.js','--max-spend','0.3');
			if(p.skills.hacking > 50 || p.money > 100e6) phase=2;
		}
		
		// FASE 2: Factions
		else if(phase==2) {
			try {
				for(const f of ['CyberSec','Netburners','Sector-12']) {
					if(ns.singularity.checkFactionInvitations().includes(f)) { ns.singularity.joinFaction(f); log(`Unido a ${f}`); }
				}
			} catch {}
			if(!running('work-for-factions.js')) { run('work-for-factions.js'); log("💼 Work-for-factions iniciado"); }
			try {
				const owned = ns.singularity.getOwnedAugmentations(true);
				const base = ns.singularity.getOwnedAugmentations(false);
				if(owned.length - base.length >= 6) phase=3;
			} catch {}
		}
		
		// FASE 3: Install
		else if(phase==3) {
			log("Instalando augmentations...");
			kill('daemon.js'); kill('work-for-factions.js'); await ns.sleep(2000);
			if(run('ascend.js','--auto')) {
				while(running('ascend.js')) await ns.sleep(1000);
				log("✅ Instalado! Reiniciando...");
				phase=1;
			}
		}
		
		// Status cada 10s
		if(Date.now() - last > 10000) {
			last = Date.now();
			ns.clearLog();
			log(`Fase: ${['CASINO','HACKING','FACTIONS','INSTALL'][phase] || phase}`);
			log(`Dinero: ${$(p.money)} | Hack: ${p.skills.hacking}`);
		}
		
		await ns.sleep(2000);
	}
}
