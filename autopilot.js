/**
 * AUTOPILOT - Bitburner Automation
 * Version: 1.2
 * 
 * Script principal que automatiza el juego desde cero.
 * Uso: run autopilot.js
 */

const CONFIG = {
    repoUrl: 'https://raw.githubusercontent.com/alainbryden/bitburner-scripts/main/',
    casinoGoal: 10e9,
    minHackForFactions: 50,
    checkInterval: 10000,
};

const PHASES = {
    DOWNLOAD: 0,
    EARLY: 1,
    CASINO: 2,
    HACKING: 3,
    FACTIONS: 4,
    INSTALL: 5
};

/** @param {NS} ns **/
export async function main(ns) {
    ns.disableLog('ALL');
    ns.ui.openTail();
    
    let state = loadState(ns);
    
    ns.print("╔════════════════════════════════════════════════════╗");
    ns.print("║        AUTOPILOT v1.2 - Bitburner Automation       ║");
    ns.print("╚════════════════════════════════════════════════════╝");
    ns.print("");
    
    while (true) {
        try {
            const player = ns.getPlayer();
            const money = player.money;
            const hackLevel = player.skills.hacking;
            
            if (Date.now() % 30000 < 1000) {
                ns.print(`[${getPhaseName(state.phase)}] $${formatMoney(money)} | Hack: ${hackLevel}`);
            }
            
            switch (state.phase) {
                case PHASES.DOWNLOAD:
                    await phaseDownload(ns, state);
                    break;
                case PHASES.EARLY:
                    await phaseEarly(ns, state, money);
                    break;
                case PHASES.CASINO:
                    await phaseCasino(ns, state, money);
                    break;
                case PHASES.HACKING:
                    await phaseHacking(ns, state, hackLevel);
                    break;
                case PHASES.FACTIONS:
                    await phaseFactions(ns, state, money);
                    break;
                case PHASES.INSTALL:
                    await phaseInstall(ns, state);
                    break;
            }
            
            saveState(ns, state);
            
        } catch (err) {
            ns.print(`ERROR: ${err.message || err}`);
        }
        
        await ns.sleep(CONFIG.checkInterval);
    }
}

// ============================================
// FASES
// ============================================

async function phaseDownload(ns, state) {
    ns.print("📥 Fase DOWNLOAD: Descargando repo completo...");
    
    // Descargar git-pull.js primero
    ns.print("Descargando git-pull.js...");
    await ns.wget(CONFIG.repoUrl + 'git-pull.js?t=' + Date.now(), 'git-pull.js');
    
    if (!ns.fileExists('git-pull.js')) {
        ns.print("✗ Error descargando git-pull.js");
        // Fallback: descargar manualmente los esenciales
        await downloadEssential(ns);
    } else {
        ns.print("✓ git-pull.js descargado");
        ns.print("Ejecutando git-pull.js para descargar TODO el repo...");
        
        // Ejecutar git-pull.js
        const pid = ns.run('git-pull.js');
        if (pid > 0) {
            // Esperar a que termine (max 60 segundos)
            let attempts = 0;
            while (ns.isRunning(pid) && attempts < 60) {
                await ns.sleep(1000);
                attempts++;
            }
            ns.print("✓ git-pull.js completado");
        } else {
            ns.print("✗ No se pudo ejecutar git-pull.js, usando fallback");
            await downloadEssential(ns);
        }
    }
    
    // Decidir siguiente fase
    const money = ns.getPlayer().money;
    if (money < 200000) {
        state.phase = PHASES.EARLY;
    } else if (money < CONFIG.casinoGoal) {
        state.phase = PHASES.CASINO;
    } else {
        state.phase = PHASES.HACKING;
    }
}

async function downloadEssential(ns) {
    ns.print("Descargando archivos esenciales (fallback)...");
    
    // Lista completa de archivos importantes
    const files = [
        // Core
        'helpers.js', 'casino.js', 'daemon.js', 'ascend.js', 'kill-all-scripts.js',
        // Analysis
        'analyze-hack.js', 'stats.js', 'scan.js',
        // Factions
        'work-for-factions.js', 'faction-manager.js',
        // Money
        'stockmaster.js', 'hacknet-upgrade-manager.js',
        // Features
        'host-manager.js', 'sleeve.js', 'bladeburner.js', 'gangs.js', 'go.js',
        // Utils
        'cleanup.js', 'reserve.js', 'grep.js', 'run-command.js',
        // Tasks (en subcarpeta)
        '/Tasks/crack-host.js', '/Tasks/grow-host.js', '/Tasks/hack-host.js', 
        '/Tasks/weaken-host.js', '/Tasks/contractor.js'
    ];
    
    let ok = 0, fail = 0;
    for (const file of files) {
        if (!ns.fileExists(file)) {
            const success = await ns.wget(CONFIG.repoUrl + file + '?t=' + Date.now(), file);
            if (success) ok++; else fail++;
            if (fail === 0 || ok % 5 === 0) {
                ns.print(`  Progreso: ${ok} OK, ${fail} FAIL`);
            }
            await ns.sleep(50);
        }
    }
    
    ns.print(`✓ Descarga completa: ${ok} archivos nuevos, ${fail} fallos`);
}

async function phaseEarly(ns, state, money) {
    if (money >= 200000) {
        ns.print("✅ Early complete! Tenemos $200k");
        state.phase = PHASES.CASINO;
        return;
    }
    
    ns.print(`💰 Farmeando... $${formatMoney(money)} / $200k`);
    
    try {
        const earned = await ns.hack('n00dles');
        if (earned > 0) {
            ns.print(`  +$${formatMoney(earned)} de n00dles`);
        }
    } catch (e) {}
}

async function phaseCasino(ns, state, money) {
    if (money >= CONFIG.casinoGoal) {
        ns.print("✅ Casino complete! Tenemos $10B");
        killScript(ns, 'casino.js');
        state.phase = PHASES.HACKING;
        return;
    }
    
    if (!isScriptRunning(ns, 'casino.js')) {
        ns.print("🎰 Iniciando casino.js...");
        ns.run('casino.js');
    }
    
    ns.print(`🎰 Casino activo: $${formatMoney(money)} / $${formatMoney(CONFIG.casinoGoal)}`);
}

async function phaseHacking(ns, state, hackLevel) {
    if (!isScriptRunning(ns, 'daemon.js')) {
        ns.print("👹 Iniciando daemon.js...");
        ns.run('daemon.js', 1, '--no-tail-windows');
    }
    
    ns.print(`👹 Daemon activo | Hack: ${hackLevel}`);
    
    if (hackLevel >= CONFIG.minHackForFactions) {
        ns.print("🎉 Hack 50+ alcanzado!");
        state.phase = PHASES.FACTIONS;
    }
}

async function phaseFactions(ns, state, money) {
    if (!isScriptRunning(ns, 'work-for-factions.js')) {
        ns.print("🏛️ Iniciando work-for-factions.js...");
        const pid = ns.run('work-for-factions.js');
        if (pid === 0) {
            ns.print("⚠️ No se pudo iniciar (probablemente falta SF4)");
        }
    }
    
    ns.print(`🏛️ Factions activo | Dinero: $${formatMoney(money)}`);
    
    if (money > 50e9) {
        ns.print("💰 Mucho dinero, verificando augmentations...");
        state.phase = PHASES.INSTALL;
    }
}

async function phaseInstall(ns, state) {
    ns.print("⬆️ Fase INSTALL: Instalando augmentations...");
    
    ns.print("🛑 Deteniendo scripts...");
    for (const proc of ns.ps('home')) {
        if (proc.filename !== 'autopilot.js') {
            ns.kill(proc.pid);
        }
    }
    
    await ns.sleep(3000);
    
    ns.print("⬆️ Ejecutando ascend.js...");
    const pid = ns.run('ascend.js', 1, '--auto');
    
    if (pid > 0) {
        while (isScriptRunning(ns, 'ascend.js')) {
            await ns.sleep(1000);
        }
        ns.print("✅ Instalación completa!");
        await ns.sleep(5000);
    }
    
    state.phase = PHASES.HACKING;
}

// ============================================
// UTILIDADES
// ============================================

function isScriptRunning(ns, scriptName) {
    return ns.ps('home').some(p => p.filename === scriptName);
}

function killScript(ns, scriptName) {
    for (const proc of ns.ps('home')) {
        if (proc.filename === scriptName) {
            ns.kill(proc.pid);
        }
    }
}

function formatMoney(n) {
    if (n >= 1e12) return (n / 1e12).toFixed(2) + 't';
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'b';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'm';
    if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
    return Math.floor(n).toString();
}

function getPhaseName(phase) {
    const names = ['DOWNLOAD', 'EARLY', 'CASINO', 'HACKING', 'FACTIONS', 'INSTALL'];
    return names[phase] || 'UNKNOWN';
}

function loadState(ns) {
    try {
        const data = ns.read('autopilot-state.txt');
        if (data) return JSON.parse(data);
    } catch (e) {}
    return { phase: PHASES.DOWNLOAD };
}

function saveState(ns, state) {
    try {
        ns.write('autopilot-state.txt', JSON.stringify(state), 'w');
    } catch (e) {}
}
