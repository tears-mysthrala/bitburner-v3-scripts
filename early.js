/**
 * EARLY - Farmeo inicial con $0
 * 
 * Para los primeros momentos del juego cuando tienes:
 * - $0 dinero
 * - Hack 1
 * - Nada de stats
 * 
 * Estrategia:
 * 1. Hackear n00dles (servidor más fácil, 0 hack required)
 * 2. Hacer crimen básico
 * 3. Trabajar en el primer trabajo disponible
 * 
 * @param {NS} ns 
 */

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.ui.openTail();
	
	const log = m => ns.print(`[EARLY] ${m}`);
	const fmt = n => n >= 1e6 ? (n/1e6).toFixed(1)+'m' : n >= 1e3 ? (n/1e3).toFixed(1)+'k' : n;
	
	log('=== FASE EARLY ($0 to $200k) ===');
	log('Farmeando dinero inicial...');
	
	let totalEarned = 0;
	let startMoney = ns.getPlayer().money;
	
	// Intentar unirnos a CyberSec primero (da $250k al completar)
	try {
		const server = ns.getServer('CSEC');
		if (server && server.requiredHackingSkill <= ns.getPlayer().skills.hacking) {
			if (!server.hasAdminRights) {
				// Intentar hackear CSEC
				try { await ns.brutessh('CSEC'); } catch {}
				try { await ns.ftpcrack('CSEC'); } catch {}
				try { await ns.nuke('CSEC'); } catch {}
				
				if (server.hasAdminRights || ns.hasRootAccess('CSEC')) {
					// Instalar backdoor para unirse a CyberSec
					log('Hackeado CSEC! Instalando backdoor...');
					// Nota: backdoor requiere hacerlo manual o esperar a tener SF4
				}
			}
		}
	} catch {}
	
	// Loop principal hasta tener $200k
	while (ns.getPlayer().money < 200000) {
		const p = ns.getPlayer();
		const money = p.money;
		const hackLevel = p.skills.hacking;
		
		// 1. Intentar hackear n00dles (siempre disponible, 0 hack req)
		try {
			if (ns.serverExists('n00dles')) {
				const n00dles = ns.getServer('n00dles');
				if (!n00dles.hasAdminRights && hackLevel >= n00dles.requiredHackingSkill) {
					await ns.nuke('n00dles');
					log('Root en n00dles!');
				}
				
				if (n00dles.hasAdminRights || ns.hasRootAccess('n00dles')) {
					// Hackear manualmente
					const earned = await ns.hack('n00dles');
					if (earned > 0) {
						totalEarned += earned;
						log(`Hackeado n00dles: +$${fmt(earned)}`);
					}
				}
			}
		} catch (e) {
			// Si falla el hack, esperar y seguir
		}
		
		// 2. Intentar hacer crimen si tenemos SF4
		try {
			if (ns.singularity) {
				const crimes = ['Shoplift', 'Rob Store', 'Mug', 'Larceny', 'Deal Drugs', 'Bond Forgery', 'Traffick Arms', 'Homicide', 'Grand Theft Auto', 'Kidnap', 'Assassinate', 'Heist'];
				for (const crime of crimes) {
					try {
						const stats = ns.singularity.getCrimeStats(crime);
						if (stats.difficulty <= 0.5) { // Solo crímenes fáciles
							const result = ns.singularity.commitCrime(crime, false);
							if (result) {
								log(`Haciendo: ${crime}`);
								await ns.sleep(stats.time + 100);
								break;
							}
						}
					} catch {}
				}
			}
		} catch {}
		
		// 3. Trabajar en compañía si podemos
		try {
			if (ns.singularity) {
				const companies = ["Joe's Guns", "Max Hardware", "Alpha Enterprises", "Carmichael Security", "FoodNStuff"];
				for (const company of companies) {
					try {
						// Intentar aplicar a cualquier trabajo
						const jobs = ["Employee", "IT Intern", "Software Engineering Intern", "Business Intern", "Security Guard", "Janitor"];
						for (const job of jobs) {
							if (ns.singularity.applyToCompany(company, job)) {
								ns.singularity.workForCompany(company, false);
								log(`Trabajando en ${company} como ${job}`);
								await ns.sleep(10000); // Trabajar 10 segundos
								break;
							}
						}
					} catch {}
				}
			}
		} catch {}
		
		// 4. Crear un script de hacking simple si tenemos RAM
		const homeRam = ns.getServerMaxRam('home');
		const usedRam = ns.getServerUsedRam('home');
		const freeRam = homeRam - usedRam;
		
		if (freeRam >= 2.4 && !ns.fileExists('/Temp/hack-loop.js')) {
			const script = `export async function main(ns) {
				while(true) {
					try { await ns.hack('n00dles'); } catch {}
					await ns.sleep(100);
				}
			}`;
			await ns.write('/Temp/hack-loop.js', script, 'w');
			ns.run('/Temp/hack-loop.js', Math.floor(freeRam / 2.4));
			log('Script de hacking auto-iniciado');
		}
		
		// Mostrar progreso cada 5 segundos
		if (Date.now() % 5000 < 1000) {
			ns.clearLog();
			log('=== FASE EARLY ($0 to $200k) ===');
			log(`Dinero: $${fmt(money)} / $200k`);
			log(`Hack: ${hackLevel}`);
			log(`Progreso: ${(money/200000*100).toFixed(1)}%`);
			
			if (money > startMoney) {
				log(`Ganado: +$${fmt(money - startMoney)}`);
			}
		}
		
		await ns.sleep(1000);
	}
	
	log('✅ Objetivo alcanzado: $200k');
	log('Puedes viajar a Aevum para el casino!');
}
