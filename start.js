/**
 * START - Script bootstrap mínimo (EVITA cache de RAM)
 * 
 * Este script usa eval() para ejecutar código dinámicamente,
 * evitando que el juego precalcule el uso de RAM.
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	// Código ejecutado via eval para evitar análisis estático de RAM
	const code = `
		ns.disableLog('ALL');
		ns.tail();
		
		const fmt = (n) => n >= 1e9 ? (n/1e9).toFixed(1)+'b' : (n/1e6).toFixed(1)+'m';
		const log = (m) => ns.print('['+Math.floor(Date.now()/60000)+'m] '+m);
		
		// Descargar
		const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
		const files = ['casino.js','daemon.js','ascend.js','faction-manager.js','work-for-factions.js'];
		
		log('Descargando...');
		for(const f of files) {
			if(!ns.fileExists(f)) await ns.wget(url+f+'?t='+Date.now(), f);
		}
		
		// Loop principal
		let phase = 0;
		while(true) {
			const p = ns.getPlayer();
			
			if(phase==0) { // Casino
				if(p.money >= 10e9) {
					for(const x of ns.ps('home')) if(x.filename=='casino.js') ns.kill(x.pid);
					phase=1; log('Casino OK');
				} else if(!ns.ps('home').some(x=>x.filename=='casino.js')) {
					if(p.money >= 200000) {
						try { ns.singularity.travelToCity('Aevum'); } catch {}
						ns.run('casino.js'); log('Casino start');
					}
				}
			}
			else if(phase==1) { // Hacking
				if(!ns.ps('home').some(x=>x.filename=='daemon.js')) {
					ns.run('daemon.js'); log('Daemon start');
				}
				if(!ns.ps('home').some(x=>x.filename=='host-manager.js')) {
					ns.run('host-manager.js', 1, '--max-spend', '0.3');
				}
				if(p.skills.hacking > 50) phase=2;
			}
			else if(phase==2) { // Factions
				if(!ns.ps('home').some(x=>x.filename=='work-for-factions.js')) {
					ns.run('work-for-factions.js'); log('Factions start');
				}
				try {
					const owned = ns.singularity.getOwnedAugmentations(true);
					const base = ns.singularity.getOwnedAugmentations(false);
					if(owned.length - base.length >= 6) phase=3;
				} catch {}
			}
			else if(phase==3) { // Install
				log('Instalando...');
				for(const x of ns.ps('home')) if(x.filename!='start.js') ns.kill(x.pid);
				await ns.sleep(2000);
				if(ns.run('ascend.js', 1, '--auto')) {
					while(ns.ps('home').some(x=>x.filename=='ascend.js')) await ns.sleep(1000);
					log('Instalado!');
					phase=1;
				}
			}
			
			// Status
			if(Date.now() % 10000 < 2000) {
				ns.clearLog();
				log('Fase: '+['CASINO','HACKING','FACTIONS','INSTALL'][phase]);
				log('Money: '+fmt(p.money)+' | Hack: '+p.skills.hacking);
			}
			
			await ns.sleep(2000);
		}
	`;
	
	// Ejecutar via eval - el juego no puede analizar esto estáticamente
	eval(code);
}
