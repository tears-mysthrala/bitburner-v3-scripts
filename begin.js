/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.ui.openTail();
	
	var log = function(m) { ns.print(m); };
	var fmt = function(n) { return n >= 1e9 ? (n/1e9).toFixed(1)+'b' : n >= 1e6 ? (n/1e6).toFixed(1)+'m' : Math.floor(n); };
	var running = function(s) { for(var p of ns.ps('home')) if(p.filename==s) return true; return false; };
	
	log('=== ZERO TO HERO ===');
	
	// Descargar
	var url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	var files = ['casino.js','daemon.js','ascend.js','work-for-factions.js'];
	for(var f of files) if(!ns.fileExists(f)) { await ns.wget(url+f+'?t='+Date.now(),f); log('+ '+f); }
	
	var phase = 0;
	while(true) {
		var p = ns.getPlayer();
		var money = p.money;
		
		// FASE 0: Casino
		if(phase==0) {
			if(money>=10e9) {
				for(var x of ns.ps('home')) if(x.filename=='casino.js') ns.kill(x.pid);
				phase=1; log('CASINO->HACKING');
			} else if(!running('casino.js') && money>=200000) {
				try{ns.singularity.travelToCity('Aevum');}catch(e){}
				ns.run('casino.js');
				log('CASINO START');
			} else if(money<200000) {
				// Farmear manualmente n00dles
				try {
					await ns.hack('n00dles');
				} catch(e) {}
				log('FARM: '+fmt(money));
			}
		}
		// FASE 1: Hacking
		else if(phase==1) {
			if(!running('daemon.js')) { ns.run('daemon.js'); log('DAEMON'); }
			if(p.skills.hacking>=50) { phase=2; log('->FACTIONS'); }
		}
		// FASE 2: Factions
		else if(phase==2) {
			if(!running('work-for-factions.js')) { ns.run('work-for-factions.js'); log('FACTIONS'); }
			// Simple counter
			if(money>1e9 && p.skills.hacking>100) phase=3;
		}
		// FASE 3: Install
		else if(phase==3) {
			log('INSTALL...');
			for(var x of ns.ps('home')) if(x.filename!='begin.js') ns.kill(x.pid);
			await ns.sleep(3000);
			if(ns.run('ascend.js',1,'--auto')) {
				while(running('ascend.js')) await ns.sleep(1000);
				log('DONE');
				await ns.sleep(5000);
				phase=1;
			}
		}
		
		// Status
		if(Date.now()%10000<2000) {
			ns.clearLog();
			log('=== ZERO TO HERO ===');
			log('Phase: '+['CASINO','HACKING','FACTIONS','INSTALL'][phase]);
			log('Money: '+fmt(money));
			log('Hack: '+p.skills.hacking);
		}
		
		await ns.sleep(2000);
	}
}
