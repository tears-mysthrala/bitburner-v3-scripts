/**
 * ZERO TO HERO - Lite Edition (8GB RAM compatible)
 * 
 * Versión ligera que NO importa helpers.js para poder correr
 * en saves nuevos con poca RAM.
 * 
 * @param {NS} ns 
 */

const VERSION = "2.0-lite";

// Fases
const PHASE = {
	INIT: 0,
	DOWNLOAD: 1,
	CASINO: 2,
	HACKING: 3,
	FACTIONS: 4,
	AUGMENTS: 5,
	INSTALL: 6,
	DESTROY: 7,
	DONE: 8
};

const PHASE_NAMES = ['INIT', 'DOWNLOAD', 'CASINO', 'HACKING', 'FACTIONS', 'AUGMENTS', 'INSTALL', 'DESTROY', 'DONE'];

// Estado
let currentPhase = PHASE.INIT;
let phaseStart = Date.now();
let startTime = Date.now();
let lastLog = "";

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('ALL');
	ns.enableLog('print');
	
	// Abrir ventana de log
	ns.tail();
	await ns.sleep(100);
	ns.ui.moveTail(50, 50);
	ns.ui.resizeTail(900, 500);
	
	banner(ns, `ZERO TO HERO v${VERSION}`);
	log(ns, "Modo: Ultra-Lite (8GB RAM compatible)");
	
	// Loop principal
	while (currentPhase !== PHASE.DONE) {
		try {
			const player = ns.getPlayer();
			
			switch (currentPhase) {
				case PHASE.INIT:
					await phaseInit(ns, player);
					break;
				case PHASE.DOWNLOAD:
					await phaseDownload(ns, player);
					break;
				case PHASE.CASINO:
					await phaseCasino(ns, player);
					break;
				case PHASE.HACKING:
					await phaseHacking(ns, player);
					break;
				case PHASE.FACTIONS:
					await phaseFactions(ns, player);
					break;
				case PHASE.AUGMENTS:
					await phaseAugments(ns, player);
					break;
				case PHASE.INSTALL:
					await phaseInstall(ns, player);
					break;
				case PHASE.DESTROY:
					await phaseDestroy(ns, player);
					break;
			}
		} catch (e) {
			log(ns, `Error: ${e.message || e}`);
		}
		
		await ns.sleep(2000);
	}
	
	banner(ns, "ZERO TO HERO COMPLETADO");
}

// ============================================
// FASES
// ============================================

async function phaseInit(ns, player) {
	logPhase(ns, "Inicializando");
	
	// Mostrar info inicial
	log(ns, `Dinero: ${fmtMoney(player.money)}`);
	log(ns, `Hacking: ${player.skills.hacking}`);
	log(ns, `Home RAM: ${ns.getServerMaxRam('home')}GB`);
	
	setPhase(PHASE.DOWNLOAD);
}

async function phaseDownload(ns, player) {
	logPhase(ns, "Descargando scripts");
	
	const files = [
		'git-pull.js', 'helpers.js', 'autopilot.js', 'daemon.js',
		'casino.js', 'crime.js', 'ascend.js', 'faction-manager.js',
		'work-for-factions.js', 'host-manager.js', 'hacknet-upgrade-manager.js',
		'gangs.js', 'kill-all-scripts.js', 'cleanup.js', 'scan.js',
		'sleeve.js', 'bladeburner.js', 'stockmaster.js', 'spend-hacknet-hashes.js'
	];
	
	const baseUrl = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/';
	let downloaded = 0;
	
	for (const file of files) {
		if (!ns.fileExists(file)) {
			const ok = await ns.wget(baseUrl + file + '?t=' + Date.now(), file);
			if (ok) {
				downloaded++;
				ns.print(`  + ${file}`);
			}
			await ns.sleep(200);
		}
	}
	
	log(ns, `Descargados: ${downloaded} archivos`);
	
	// Si tenemos los críticos, continuar
	if (ns.fileExists('casino.js') && ns.fileExists('daemon.js')) {
		await ns.sleep(1000);
		setPhase(PHASE.CASINO);
	}
}

async function phaseCasino(ns, player) {
	logPhase(ns, "Fase CASINO");
	
	const GOAL = 10e9; // $10B
	
	// Verificar si ya tenemos el dinero
	if (player.money >= GOAL) {
		log(ns, `✅ Objetivo alcanzado: ${fmtMoney(player.money)}`);
		killScript(ns, 'casino.js');
		setPhase(PHASE.HACKING);
		return;
	}
	
	// Necesitamos $200k para viajar a Aevum
	if (player.money < 200000) {
		log(ns, `Farmeando $200k para viajar... (${fmtMoney(player.money)})`);
		
		// Intentar trabajar
		try {
			if (ns.singularity.applyToCompany("Joe's Guns", "Employee")) {
				ns.singularity.workForCompany("Joe's Guns", false);
				return;
			}
		} catch {}
		
		// Si no hay trabajo, hacer crimen manualmente
		if (!isRunning(ns, 'crime.js') && ns.fileExists('crime.js')) {
			ns.run('crime.js');
		}
		return;
	}
	
	// Tenemos dinero para viajar - iniciar casino
	if (!isRunning(ns, 'casino.js')) {
		log(ns, "🎰 Iniciando casino.js...");
		
		// Viajar a Aevum
		try {
			ns.singularity.travelToCity('Aevum');
			log(ns, "📍 Viajado a Aevum");
		} catch {}
		
		ns.run('casino.js');
	}
	
	log(ns, `Dinero actual: ${fmtMoney(player.money)} / ${fmtMoney(GOAL)}`);
}

async function phaseHacking(ns, player) {
	logPhase(ns, "Fase HACKING");
	
	// Matar casino si sigue corriendo
	killScript(ns, 'casino.js');
	
	// Comprar TOR
	if (!player.tor && player.money > 200000) {
		try {
			ns.singularity.purchaseTor();
			log(ns, "🔌 TOR comprado");
		} catch {}
	}
	
	// Comprar programas básicos
	const programs = [
		['BruteSSH.exe', 500000],
		['FTPCrack.exe', 1500000]
	];
	
	for (const [prog, cost] of programs) {
		if (!ns.fileExists(prog) && player.money > cost * 2 && player.tor) {
			try {
				ns.singularity.purchaseProgram(prog);
				log(ns, `📦 ${prog} comprado`);
			} catch {}
		}
	}
	
	// Mejorar RAM de home
	try {
		const ram = ns.getServerMaxRam('home');
		if (ram < 64) {
			const cost = ns.singularity.getUpgradeHomeRamCost();
			if (player.money > cost * 2) {
				ns.singularity.upgradeHomeRam();
				log(ns, `💾 RAM mejorada a ${ram * 2}GB`);
			}
		}
	} catch {}
	
	// Iniciar daemon (el corazón del hacking)
	if (!isRunning(ns, 'daemon.js')) {
		log(ns, "👹 Iniciando daemon.js...");
		
		// Args para daemon según nuestra situación
		const args = player.skills.hacking > 100 ? [] : ['--silent'];
		const pid = ns.run('daemon.js', 1, ...args);
		
		if (pid > 0) {
			log(ns, `✅ daemon.js iniciado (PID: ${pid})`);
		}
	}
	
	// Iniciar host-manager para servidores cloud
	if (!isRunning(ns, 'host-manager.js') && ns.fileExists('host-manager.js')) {
		ns.run('host-manager.js', 1, '--max-spend', '0.3');
	}
	
	// Iniciar hacknet
	if (!isRunning(ns, 'hacknet-upgrade-manager.js')) {
		ns.run('hacknet-upgrade-manager.js');
	}
	
	// Verificar si pasamos a facciones
	if (player.skills.hacking >= 50 || player.money > 100000000) {
		await ns.sleep(5000);
		setPhase(PHASE.FACTIONS);
	}
}

async function phaseFactions(ns, player) {
	logPhase(ns, "Fase FACTIONS");
	
	// Intentar unirse a facciones
	const factions = ['CyberSec', 'Netburners', 'Sector-12', 'Iron-Gym', 'The Black Hand'];
	
	try {
		const invites = ns.singularity.checkFactionInvitations();
		for (const fac of factions) {
			if (invites.includes(fac)) {
				ns.singularity.joinFaction(fac);
				log(ns, `🎉 Unido a: ${fac}`);
			}
		}
	} catch {}
	
	// Iniciar work-for-factions
	if (!isRunning(ns, 'work-for-factions.js')) {
		log(ns, "💼 Iniciando work-for-factions.js...");
		ns.run('work-for-factions.js');
	}
	
	// Intentar gangs si tenemos karma
	try {
		const karma = ns.heart.break();
		if (karma <= -54000 && !isRunning(ns, 'gangs.js') && ns.fileExists('gangs.js')) {
			log(ns, "👥 Iniciando gangs.js...");
			ns.run('gangs.js');
		}
	} catch {}
	
	// Verificar si podemos comprar augmentations
	let canBuyAugs = false;
	try {
		const owned = ns.singularity.getOwnedAugmentations(true);
		const base = ns.singularity.getOwnedAugmentations(false);
		const newAugs = owned.length - base.length;
		
		if (newAugs >= 6 || owned.length >= 10) {
			canBuyAugs = true;
		}
	} catch {}
	
	if (canBuyAugs || player.money > 10000000000) {
		setPhase(PHASE.AUGMENTS);
	}
}

async function phaseAugments(ns, player) {
	logPhase(ns, "Fase AUGMENTS");
	
	// Ejecutar faction-manager para comprar
	if (!isRunning(ns, 'faction-manager.js')) {
		log(ns, "🛒 Comprando augmentations...");
		ns.run('faction-manager.js', 1, '--purchase');
		await ns.sleep(10000);
	}
	
	// Verificar si debemos instalar
	let shouldInstall = false;
	try {
		const owned = ns.singularity.getOwnedAugmentations(true);
		const base = ns.singularity.getOwnedAugmentations(false);
		const newAugs = owned.filter(a => !base.includes(a));
		
		// Contar NF como 1
		const nfCount = newAugs.filter(a => a.includes('NeuroFlux')).length;
		const uniqueAugs = newAugs.length - nfCount + (nfCount > 0 ? 1 : 0);
		
		if (uniqueAugs >= 6 || newAugs.includes('The Red Pill')) {
			shouldInstall = true;
		}
		
		log(ns, `Augmentations nuevas: ${newAugs.length} (instalar con ${uniqueAugs} unicas)`);
	} catch {}
	
	if (shouldInstall) {
		setPhase(PHASE.INSTALL);
	}
}

async function phaseInstall(ns, player) {
	logPhase(ns, "Fase INSTALL");
	
	// Matar scripts
	killScript(ns, 'daemon.js');
	killScript(ns, 'faction-manager.js');
	killScript(ns, 'work-for-factions.js');
	killScript(ns, 'host-manager.js');
	
	await ns.sleep(2000);
	
	// Usar ascend.js
	log(ns, "⬆️ Ejecutando ascend.js --auto...");
	const pid = ns.run('ascend.js', 1, '--auto');
	
	if (pid > 0) {
		log(ns, "Esperando instalacion...");
		
		// Esperar a que termine
		while (isRunning(ns, 'ascend.js')) {
			await ns.sleep(1000);
		}
		
		log(ns, "✅ Instalacion completada!");
		await ns.sleep(5000);
		
		// Volver a hacking
		setPhase(PHASE.HACKING);
	}
}

async function phaseDestroy(ns, player) {
	logPhase(ns, "Fase DESTROY");
	
	// Verificar The Red Pill
	let hasTRP = false;
	let hasWDAccess = false;
	
	try {
		const owned = ns.singularity.getOwnedAugmentations();
		hasTRP = owned.includes('The Red Pill');
		
		if (hasTRP) {
			// Verificar si podemos hackear WD
			const wdLevel = ns.getServerRequiredHackingLevel('w0r1d_d43m0n');
			hasWDAccess = player.skills.hacking >= wdLevel;
			
			log(ns, `The Red Pill: ✅ | WD Hack: ${player.skills.hacking}/${wdLevel}`);
		}
	} catch {}
	
	if (!hasTRP) {
		log(ns, "❌ No tienes The Red Pill, volviendo a FACTIONS...");
		setPhase(PHASE.FACTIONS);
		return;
	}
	
	if (!hasWDAccess) {
		log(ns, "💻 Subiendo hacking para World Daemon...");
		setPhase(PHASE.HACKING);
		return;
	}
	
	// Destruir BitNode
	banner(ns, "DESTRUYENDO BITNODE!");
	
	try {
		// Elegir siguiente BN (priorizar BN4 para Singularity)
		const nextBN = 4; // Siempre ir a BN4 primero si es posible
		
		ns.singularity.destroyW0r1dD43m0n(nextBN);
		log(ns, `💥 BitNode destruido! Siguiente: BN${nextBN}`);
		
		await ns.sleep(10000);
		setPhase(PHASE.HACKING);
		
	} catch (e) {
		log(ns, `Error al destruir: ${e.message || e}`);
		setPhase(PHASE.HACKING);
	}
}

// ============================================
// UTILIDADES
// ============================================

function setPhase(newPhase) {
	if (currentPhase !== newPhase) {
		currentPhase = newPhase;
		phaseStart = Date.now();
	}
}

function logPhase(ns, desc) {
	const elapsed = fmtTime(Date.now() - phaseStart);
	const total = fmtTime(Date.now() - startTime);
	const msg = `[${PHASE_NAMES[currentPhase]} | ${elapsed}] ${desc}`;
	
	if (msg !== lastLog) {
		ns.print(msg);
		lastLog = msg;
	}
}

function log(ns, msg) {
	ns.print(`  → ${msg}`);
}

function banner(ns, text) {
	const line = "=".repeat(50);
	ns.print("");
	ns.print(line);
	ns.print(text);
	ns.print(line);
	ns.print("");
}

function isRunning(ns, script) {
	return ns.ps('home').some(p => p.filename === script);
}

function killScript(ns, script) {
	for (const p of ns.ps('home')) {
		if (p.filename === script) {
			ns.kill(p.pid);
		}
	}
}

function fmtMoney(n) {
	if (n >= 1e12) return (n/1e12).toFixed(2) + 't';
	if (n >= 1e9) return (n/1e9).toFixed(2) + 'b';
	if (n >= 1e6) return (n/1e6).toFixed(2) + 'm';
	if (n >= 1e3) return (n/1e3).toFixed(2) + 'k';
	return '$' + Math.floor(n);
}

function fmtTime(ms) {
	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	const h = Math.floor(m / 60);
	if (h > 0) return `${h}h${m%60}m`;
	if (m > 0) return `${m}m${s%60}s`;
	return `${s}s`;
}
