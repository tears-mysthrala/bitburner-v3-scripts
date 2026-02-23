/**
 * ZERO TO HERO - Complete Bitburner Automation
 * 
 * Script que automatiza TODO el juego desde un save 100% nuevo.
 * 
 * Fases:
 * 1. STARTUP  - Configuración inicial
 * 2. CASINO   - Farmear dinero inicial ($10B)
 * 3. CRIME    - Subir stats y karma
 * 4. HACKING  - Infraestructura y hacking
 * 5. FACTIONS - Trabajar facciones
 * 6. AUGMENTS - Comprar augmentations  
 * 7. INSTALL  - Instalar augmentations
 * 8. DESTROY  - Destruir BitNode
 * 
 * @param {NS} ns 
 */

// Configuración de argumentos
const argsSchema = [
	['casino-goal', 10e9],
	['min-hack-level', 50],
	['install-at-aug-count', 6],
	['install-at-aug-plus-nf', 10],
	['auto-destroy', true],
	['next-bn', 0],
	['interval', 5000],
	['no-tail', false],
];

// Fases
const PHASE = {
	STARTUP: 0,
	CASINO: 1,
	CRIME: 2,
	HACKING: 3,
	FACTIONS: 4,
	AUGMENTS: 5,
	INSTALL: 6,
	DESTROY: 7,
	COMPLETE: 8
};

const PHASE_NAMES = ['STARTUP', 'CASINO', 'CRIME', 'HACKING', 'FACTIONS', 'AUGMENTS', 'INSTALL', 'DESTROY', 'COMPLETE'];

// Estado global
let options;
let currentPhase = PHASE.STARTUP;
let phaseStartTime = Date.now();
let startTime = Date.now();
let player;
let resetInfo;
let ownedSF = {};
let installedAugsCache = [];

/** @param {NS} ns **/
export async function main(ns) {
	// Parsear argumentos
	options = ns.flags(argsSchema);
	
	// Verificar instancia única
	const instances = ns.ps('home').filter(p => p.filename === ns.getScriptName() && p.pid !== ns.pid);
	if (instances.length > 0) {
		ns.tprint("ERROR: Ya hay una instancia de zero-to-hero corriendo");
		return;
	}

	// Abrir ventana de log
	if (!options['no-tail']) {
		ns.tail();
		// Posicionar ventana
		await ns.sleep(100);
		ns.ui.moveTail(50, 50);
		ns.ui.resizeTail(1000, 600);
	}

	printBanner(ns, "🚀 ZERO TO HERO INICIADO");
	log(ns, `Modo: ${options['auto-destroy'] ? 'AUTO-DESTROY' : 'MANUAL'}`, 'info');
	
	// Loop principal
	while (currentPhase !== PHASE.COMPLETE) {
		try {
			// Actualizar información
			await updateInfo(ns);
			
			// Ejecutar fase actual
			switch (currentPhase) {
				case PHASE.STARTUP:
					await phaseStartup(ns);
					break;
				case PHASE.CASINO:
					await phaseCasino(ns);
					break;
				case PHASE.CRIME:
					await phaseCrime(ns);
					break;
				case PHASE.HACKING:
					await phaseHacking(ns);
					break;
				case PHASE.FACTIONS:
					await phaseFactions(ns);
					break;
				case PHASE.AUGMENTS:
					await phaseAugments(ns);
					break;
				case PHASE.INSTALL:
					await phaseInstall(ns);
					break;
				case PHASE.DESTROY:
					await phaseDestroy(ns);
					break;
			}
		} catch (err) {
			log(ns, `⚠️ Error: ${String(err)}`, 'warning');
		}

		await ns.sleep(options['interval']);
	}

	printBanner(ns, "🎉 ZERO TO HERO COMPLETADO");
}

// ============================================
// FASES
// ============================================

async function phaseStartup(ns) {
	logPhase(ns, "Configuración inicial");

	// Verificar scripts base
	const required = ['helpers.js', 'autopilot.js', 'daemon.js'];
	const missing = required.filter(f => !ns.fileExists(f));
	
	if (missing.length > 0) {
		log(ns, `Descargando scripts faltantes: ${missing.join(', ')}`, 'info');
		
		// Descargar git-pull si no existe
		if (!ns.fileExists('git-pull.js')) {
			const url = 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/git-pull.js';
			await ns.wget(url, 'git-pull.js');
		}
		
		// Ejecutar git-pull
		if (ns.fileExists('git-pull.js')) {
			const pid = ns.run('git-pull.js');
			if (pid > 0) {
				log(ns, "Esperando descarga de scripts...", 'info');
				await ns.sleep(15000);
			}
		}
	}

	// Si es save completamente nuevo, ir a casino
	if (player.money < 1e6 && player.hacking < 20) {
		log(ns, "Save nuevo detectado - Iniciando fase CASINO", 'info');
		setPhase(PHASE.CASINO);
	} else {
		setPhase(PHASE.HACKING);
	}
}

async function phaseCasino(ns) {
	logPhase(ns, `Farmeando $${formatMoney(options['casino-goal'])}`);

	// Verificar objetivo
	if (player.money >= options['casino-goal']) {
		log(ns, `✅ Objetivo de casino alcanzado: ${formatMoney(player.money)}`, 'success');
		
		// Matar casino.js si sigue corriendo
		killScript(ns, 'casino.js');
		
		setPhase(PHASE.HACKING);
		return;
	}

	// Verificar si podemos viajar a Aevum
	const hasMoneyForTravel = player.money >= 200000;
	
	if (!hasMoneyForTravel) {
		// Farmear dinero inicial
		log(ns, `Farmeando $200k para viajar... (${formatMoney(player.money)})`, 'info');
		await workOrCrime(ns);
		return;
	}

	// Ejecutar casino
	if (!isRunning(ns, 'casino.js')) {
		log(ns, "🎰 Iniciando casino.js...", 'info');
		
		// Viajar a Aevum primero
		try {
			await ns.singularity.travelToCity('Aevum');
		} catch {}
		
		ns.run('casino.js');
	}
}

async function phaseCrime(ns) {
	logPhase(ns, "Subiendo stats (Karma)");

	const karma = ns.heart.break();
	const needKarma = player.bitNodeN === 2 || karma > -54000;

	if (!needKarma || karma <= -54000) {
		log(ns, `✅ Karma suficiente: ${formatNumber(karma)}`, 'success');
		killScript(ns, 'crime.js');
		setPhase(PHASE.HACKING);
		return;
	}

	if (!isRunning(ns, 'crime.js')) {
		log(ns, "🔫 Iniciando crime.js...", 'info');
		ns.run('crime.js');
	}
}

async function phaseHacking(ns) {
	logPhase(ns, "Construyendo infraestructura");

	// Comprar TOR
	if (!player.tor && player.money > 200000) {
		try {
			await ns.singularity.purchaseTor();
			log(ns, "🔌 TOR comprado", 'success');
		} catch {}
	}

	// Comprar programas
	await buyPrograms(ns);

	// Mejorar home RAM
	await upgradeHome(ns);

	// Iniciar daemon
	if (!isRunning(ns, 'daemon.js') && options['run-daemon'] !== false) {
		log(ns, "👹 Iniciando daemon.js...", 'info');
		const args = player.hacking > 8000 ? ['--high-hack-threshold', '8000'] : [];
		ns.run('daemon.js', 1, ...args);
	}

	// Iniciar host-manager para servidores cloud
	if (!isRunning(ns, 'host-manager.js')) {
		ns.run('host-manager.js', 1, '--max-spend', '0.5');
	}

	// Iniciar hacknet
	if (!isRunning(ns, 'hacknet-upgrade-manager.js')) {
		ns.run('hacknet-upgrade-manager.js');
	}

	// Verificar si debemos pasar a facciones
	const timeInPhase = Date.now() - phaseStartTime;
	if (player.hacking >= options['min-hack-level'] || timeInPhase > 300000) {
		setPhase(PHASE.FACTIONS);
	}
}

async function phaseFactions(ns) {
	logPhase(ns, "Trabajando con facciones");

	// Unirse a facciones disponibles
	await joinFactions(ns);

	// Iniciar work-for-factions
	if (!isRunning(ns, 'work-for-factions.js')) {
		log(ns, "💼 Iniciando work-for-factions.js...", 'info');
		ns.run('work-for-factions.js');
	}

	// Iniciar gangs si es BN2 o tenemos SF2
	if (ownedSF[2] >= 1 || player.bitNodeN === 2) {
		const karma = ns.heart.break();
		if (karma <= -54000 && !isRunning(ns, 'gangs.js')) {
			log(ns, "👥 Iniciando gangs.js...", 'info');
			ns.run('gangs.js');
		}
	}

	// Iniciar bladeburner si es BN6/7 o tenemos SF7
	if ((player.bitNodeN === 6 || player.bitNodeN === 7 || ownedSF[7] >= 1) && !isRunning(ns, 'bladeburner.js')) {
		if (!isRunning(ns, 'bladeburner.js')) {
			ns.run('bladeburner.js');
		}
	}

	// Iniciar sleeves si tenemos SF10
	if (ownedSF[10] >= 1 && !isRunning(ns, 'sleeve.js')) {
		ns.run('sleeve.js');
	}

	// Iniciar stocks si tenemos acceso
	if (player.money > 50e9 && !isRunning(ns, 'stockmaster.js')) {
		if (await hasStockAccess(ns)) {
			ns.run('stockmaster.js');
		}
	}

	// Verificar augmentations disponibles
	await checkAugmentations(ns);
}

async function phaseAugments(ns) {
	logPhase(ns, "Comprando augmentations");

	// Ejecutar faction-manager para comprar
	if (!isRunning(ns, 'faction-manager.js')) {
		log(ns, "🛒 Comprando augmentations...", 'info');
		ns.run('faction-manager.js', 1, '--purchase', '--allow-reserve-debt');
		await ns.sleep(10000);
	}

	// Verificar si debemos instalar
	const shouldInstall = await shouldInstallNow(ns);
	if (shouldInstall) {
		setPhase(PHASE.INSTALL);
	}
}

async function phaseInstall(ns) {
	logPhase(ns, "Instalando augmentations");

	// Guardar lista de augs antes de instalar
	installedAugsCache = await ns.singularity.getOwnedAugmentations(true);

	// Matar scripts
	killScript(ns, 'daemon.js');
	killScript(ns, 'faction-manager.js');
	killScript(ns, 'work-for-factions.js');
	
	await ns.sleep(2000);

	// Usar ascend.js
	log(ns, "⬆️ Ejecutando ascend.js...", 'info');
	const pid = ns.run('ascend.js', 1, '--auto');
	
	if (pid > 0) {
		// Esperar a que termine (ascend.js se cierra después de instalar)
		while (isRunning(ns, 'ascend.js')) {
			await ns.sleep(1000);
		}
		
		log(ns, "✅ Instalación completada", 'success');
		await ns.sleep(5000);
		
		// Volver a hacking
		setPhase(PHASE.HACKING);
	} else {
		log(ns, "❌ Error al ejecutar ascend.js", 'error');
	}
}

async function phaseDestroy(ns) {
	logPhase(ns, "Destruyendo BitNode");

	// Verificar The Red Pill
	const owned = await ns.singularity.getOwnedAugmentations();
	const hasTRP = owned.includes('The Red Pill');

	if (!hasTRP) {
		log(ns, "❌ No tienes 'The Red Pill'", 'warning');
		setPhase(PHASE.FACTIONS);
		return;
	}

	// Verificar nivel de hacking para WD
	const wdLevel = ns.getServerRequiredHackingLevel('w0r1d_d43m0n');
	if (player.hacking < wdLevel) {
		log(ns, `💻 Subiendo hacking: ${player.hacking}/${wdLevel}`, 'info');
		setPhase(PHASE.HACKING);
		return;
	}

	// Destruir BitNode
	printBanner(ns, "💥 DESTRUYENDO BITNODE");
	
	if (options['auto-destroy']) {
		const nextBN = options['next-bn'] || getNextBitNode();
		
		try {
			await ns.singularity.destroyW0r1dD43m0n(nextBN);
			log(ns, `✅ BitNode ${player.bitNodeN} destruido!`, 'success');
			
			// Esperar a que cargue el nuevo BN
			await ns.sleep(10000);
			
			// Reiniciar ciclo
			setPhase(PHASE.STARTUP);
		} catch (err) {
			log(ns, `❌ Error al destruir: ${err}`, 'error');
		}
	} else {
		log(ns, "Modo manual: Destruye el BitNode manualmente", 'warning');
		setPhase(PHASE.COMPLETE);
	}
}

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function updateInfo(ns) {
	player = ns.getPlayer();
	resetInfo = ns.getResetInfo();
	
	// Detectar Source Files
	try {
		for (let i = 1; i <= 14; i++) {
			const level = ns.singularity.getOwnedSourceFiles().find(sf => sf.n === i)?.lvl || 0;
			if (level > 0) ownedSF[i] = level;
		}
	} catch {}
}

function setPhase(newPhase) {
	if (currentPhase !== newPhase) {
		currentPhase = newPhase;
		phaseStartTime = Date.now();
	}
}

function logPhase(ns, desc) {
	const elapsed = formatDuration(Date.now() - phaseStartTime);
	const total = formatDuration(Date.now() - startTime);
	ns.print(`\n[${PHASE_NAMES[currentPhase]} | ⏱️ ${elapsed} | Total: ${total}] ${desc}`);
}

function log(ns, msg, level = 'info') {
	const prefix = {
		'info': 'ℹ️',
		'success': '✅',
		'warning': '⚠️',
		'error': '❌'
	}[level] || '•';
	
	ns.print(`${prefix} ${msg}`);
}

function printBanner(ns, title) {
	const line = '═'.repeat(50);
	ns.print(`\n╔${line}╗`);
	ns.print(`║${title.padStart(25 + title.length/2).padEnd(50)}║`);
	ns.print(`╚${line}╝`);
}

function isRunning(ns, script) {
	return ns.ps('home').some(p => p.filename === script);
}

function killScript(ns, script) {
	const procs = ns.ps('home').filter(p => p.filename === script);
	for (const p of procs) {
		ns.kill(p.pid);
	}
}

async function workOrCrime(ns) {
	// Intentar trabajar en compañía
	const companies = ['Joe\'s Guns', 'Max Hardware', 'Alpha Enterprises'];
	const jobs = ['Training', 'IT Intern', 'Software Engineering Intern', 'Employee'];
	
	for (const company of companies) {
		for (const job of jobs) {
			try {
				if (await ns.singularity.applyToCompany(company, job)) {
					await ns.singularity.workForCompany(company, false);
					return;
				}
			} catch {}
		}
	}
	
	// Si no hay trabajo, crimen
	if (!isRunning(ns, 'crime.js')) {
		ns.run('crime.js');
	}
}

async function buyPrograms(ns) {
	if (!player.tor) return;
	
	const programs = [
		{ name: 'BruteSSH.exe', cost: 500000 },
		{ name: 'FTPCrack.exe', cost: 1500000 },
		{ name: 'relaySMTP.exe', cost: 5000000 },
		{ name: 'HTTPWorm.exe', cost: 30000000 },
		{ name: 'SQLInject.exe', cost: 250000000 }
	];

	for (const prog of programs) {
		if (!ns.fileExists(prog.name, 'home') && player.money >= prog.cost * 1.5) {
			try {
				await ns.singularity.purchaseProgram(prog.name);
				log(ns, `📦 Comprado: ${prog.name}`, 'success');
				await ns.sleep(500);
			} catch {}
		}
	}
}

async function upgradeHome(ns) {
	try {
		const ram = ns.getServerMaxRam('home');
		if (ram < 64) {
			const cost = await ns.singularity.getUpgradeHomeRamCost();
			if (player.money >= cost * 2) {
				await ns.singularity.upgradeHomeRam();
				log(ns, `💾 RAM mejorada a ${ram * 2}GB`, 'success');
			}
		}
	} catch {}
}

async function joinFactions(ns) {
	const priorities = [
		'CyberSec', 'Netburners', 'Sector-12', 'Iron-Gym',
		'The Black Hand', 'NiteSec', 'Tian Di Hui', 
		'Volhaven', 'Chongqing', 'New Tokyo', 'Ishima',
		'Daedalus', 'Illuminati', 'The Covenant'
	];
	
	try {
		const invitations = ns.singularity.checkFactionInvitations();
		
		for (const faction of priorities) {
			if (invitations.includes(faction)) {
				await ns.singularity.joinFaction(faction);
				log(ns, `🎉 Unido a: ${faction}`, 'success');
				await ns.sleep(500);
			}
		}
	} catch {}
}

async function checkAugmentations(ns) {
	try {
		// Contar augmentations que podemos comprar
		const owned = await ns.singularity.getOwnedAugmentations(true);
		const factions = ns.getPlayer().factions || [];
		let affordable = 0;
		
		for (const faction of factions) {
			const augs = await ns.singularity.getAugmentationsFromFaction(faction);
			for (const aug of augs) {
				if (owned.includes(aug)) continue;
				
				const price = await ns.singularity.getAugmentationPrice(aug);
				const rep = await ns.singularity.getAugmentationRepReq(aug);
				const factionRep = await ns.singularity.getFactionRep(faction);
				
				if (player.money >= price && factionRep >= rep) {
					affordable++;
				}
			}
		}
		
		if (affordable >= options['install-at-aug-count']) {
			setPhase(PHASE.AUGMENTS);
		}
	} catch {}
}

async function shouldInstallNow(ns) {
	try {
		const owned = await ns.singularity.getOwnedAugmentations(true);
		const base = await ns.singularity.getOwnedAugmentations(false);
		const newAugs = owned.filter(a => !base.includes(a));
		
		// Contar NF como 1
		const nfLevels = newAugs.filter(a => a.includes('NeuroFlux')).length;
		const uniqueAugs = newAugs.length - nfLevels + (nfLevels > 0 ? 1 : 0);
		
		if (uniqueAugs >= options['install-at-aug-count']) {
			return true;
		}
		
		if (owned.length >= options['install-at-aug-plus-nf']) {
			return true;
		}
		
		// Si tenemos The Red Pill, instalar para poder usarlo
		if (newAugs.includes('The Red Pill')) {
			return true;
		}
		
		return false;
	} catch {
		return false;
	}
}

async function hasStockAccess(ns) {
	try {
		return await ns.stock.hasWSEAccount() && await ns.stock.hasTIXAPIAccess();
	} catch {
		return false;
	}
}

function getNextBitNode() {
	// Orden óptimo de BitNodes
	const order = [4, 1, 5, 2, 10, 8, 13, 7, 9, 14, 11, 3, 6, 12];
	
	for (const bn of order) {
		if (!ownedSF[bn] || ownedSF[bn] < 3) {
			return bn;
		}
	}
	
	return 12; // Por defecto, seguir en BN12
}

// Formatters
function formatMoney(n) {
	if (n >= 1e12) return (n / 1e12).toFixed(2) + 't';
	if (n >= 1e9) return (n / 1e9).toFixed(2) + 'b';
	if (n >= 1e6) return (n / 1e6).toFixed(2) + 'm';
	if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
	return n.toString();
}

function formatNumber(n) {
	return n.toLocaleString();
}

function formatDuration(ms) {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	
	if (hours > 0) return `${hours}h ${minutes % 60}m`;
	if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
	return `${seconds}s`;
}
