/** @param {NS} ns **/
export async function main(ns) {
	var u = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	var f = ['casino.js','daemon.js','ascend.js','work-for-factions.js'];
	for(var i = 0; i < f.length; i++) {
		if(!ns.fileExists(f[i])) await ns.wget(u + f[i] + '?t=' + Date.now(), f[i]);
	}
	
	var phase = 0;
	while(1) {
		var p = ns.getPlayer();
		var m = p.money;
		
		// Phase 0: Get money
		if(phase == 0) {
			if(m >= 10e9) {
				for(var x of ns.ps('home')) if(x.filename == 'casino.js') ns.kill(x.pid);
				phase = 1;
				ns.tprint('CASINO DONE');
			}
			else if(!ns.ps('home').find(function(x){return x.filename=='casino.js';}) && m >= 200000) {
				ns.run('casino.js');
				ns.tprint('CASINO START');
			}
			else if(m < 200000) {
				// Manual farm - nuke and hack n00dles
				try {
					// Try to get root on n00dles first
					if(!ns.hasRootAccess('n00dles')) {
						try { await ns.brutessh('n00dles'); } catch(e) {}
						try { await ns.ftpcrack('n00dles'); } catch(e) {}
						try { await ns.relaysmtp('n00dles'); } catch(e) {}
						try { await ns.httpworm('n00dles'); } catch(e) {}
						try { await ns.sqlinject('n00dles'); } catch(e) {}
						try { await ns.nuke('n00dles'); ns.tprint('NUKE n00dles OK'); } catch(e) {}
					}
					// Now hack
					var earned = await ns.hack('n00dles');
					if(earned > 0) ns.tprint('HACK n00dles: +' + Math.floor(earned));
				} catch(e) {
					ns.tprint('Error: ' + e);
				}
			}
		}
		// Phase 1: Hacking
		else if(phase == 1) {
			if(!ns.ps('home').find(function(x){return x.filename=='daemon.js';})) {
				ns.run('daemon.js');
				ns.tprint('DAEMON START');
			}
			if(p.skills.hacking >= 50) {
				phase = 2;
				ns.tprint('PHASE 2');
			}
		}
		// Phase 2: Factions
		else if(phase == 2) {
			if(!ns.ps('home').find(function(x){return x.filename=='work-for-factions.js';})) {
				ns.run('work-for-factions.js');
				ns.tprint('FACTIONS START');
			}
			if(m > 5e9 && p.skills.hacking > 200) phase = 3;
		}
		// Phase 3: Install
		else if(phase == 3) {
			ns.tprint('INSTALLING...');
			for(var x of ns.ps('home')) if(x.filename != 'zzz.js') ns.kill(x.pid);
			await ns.sleep(3000);
			if(ns.run('ascend.js', 1, '--auto')) {
				while(ns.ps('home').find(function(x){return x.filename=='ascend.js';})) await ns.sleep(1000);
				ns.tprint('INSTALLED!');
				await ns.sleep(5000);
				phase = 1;
			}
		}
		
		await ns.sleep(3000);
	}
}
