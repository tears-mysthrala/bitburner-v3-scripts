/**
 * AUTOPILOT - Bitburner Automation
 * Version: 3.0.0-dev
 * Compatible: Bitburner v3.0.0dev
 * 
 * Script principal que automatiza el juego desde cero.
 * Uso: run autopilot.js
 */

const CONFIG = {
    repoUrl: 'https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/',
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
    ns.print("║     AUTOPILOT v3.0.0-dev - Bitburner v3.0         ║");
    ns.print("╚════════════════════════════════════════════════════╝");
    ns.print("");
    
    // Verificar si tenemos SF4 (singularity)
    const hasSF4 = checkSF4(ns);
    ns.print(`INFO: Singularity (SF4) disponible: ${hasSF4}`);
    ns.print("");
    
    while (true) {
        try {
            const player = ns.getPlayer();
            const money = player.money;
            const hackLevel = player.skills.hacking;
            
            // Log cada 30s
            if (Date.now() % 30000 < 1000) {
                ns.print(`[${getPhaseName(state.phase)}] $${formatMoney(money)} | Hack: ${hackLevel} | RAM: ${ns.getServerMaxRam('home')}GB`);
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
                    await phaseHacking(ns, state, hackLevel, hasSF4);
                    break;
                case PHASES.FACTIONS:
                    await phaseFactions(ns, state, money, hasSF4);
                    break;
                case PHASES.INSTALL:
                    await phaseInstall(ns, state, hasSF4);
                    break;
            }
            
            saveState(ns, state);
            
        } catch (err) {
            ns.print(`ERROR: ${err.message || err}`);
        }
        
        await ns.sleep(CONFIG.checkInterval);
    }
}

function checkSF4(ns) {
    try {
        ns.singularity.getOwnedAugmentations(true);
        return true;
    } catch(e) {
        return false;
    }
}

async function phaseDownload(ns, state) {
    ns.print("[DOWNLOAD] Descargando repo completo...");
    
    // Descargar git-pull.js
    if (!ns.fileExists('git-pull.js')) {
        ns.print("  Descargando git-pull.js...");
        await ns.wget(CONFIG.repoUrl + 'git-pull.js?t=' + Date.now(), 'git-pull.js');
    }
    
    // Ejecutar git-pull.js para descargar todo
    if (ns.fileExists('git-pull.js')) {
        ns.print("  Ejecutando git-pull.js...");
        const pid = ns.run('git-pull.js');
        if (pid > 0) {
            let attempts = 0;
            while (ns.isRunning(pid) && attempts < 60) {
                await ns.sleep(1000);
                attempts++;
            }
            ns.print("  ✓ Repo descargado");
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

async function phaseEarly(ns, state, money) {
    if (money >= 200000) {
        ns.print("[EARLY] ✓ Objetivo alcanzado: $200k");
        state.phase = PHASES.CASINO;
        return;
    }
    
    // Farmear n00dles
    try {
        const earned = await ns.hack('n00dles');
        if (earned > 0 && Date.now() % 10000 < 2000) {
            ns.print(`[EARLY] +$${formatMoney(earned)} | Total: $${formatMoney(money)}`);
        }
    } catch (e) {}
}

async function phaseCasino(ns, state, money) {
    if (money >= CONFIG.casinoGoal) {
        ns.print("[CASINO] ✓ Objetivo alcanzado: $10B");
        killScript(ns, 'casino.js');
        state.phase = PHASES.HACKING;
        return;
    }
    
    if (!isScriptRunning(ns, 'casino.js')) {
        ns.print("[CASINO] Iniciando casino.js...");
        ns.run('casino.js');
    }
}

async function phaseHacking(ns, state, hackLevel, hasSF4) {
    // Iniciar daemon
    if (!isScriptRunning(ns, 'daemon.js')) {
        ns.print("[HACKING] Iniciando daemon.js...");
        // Con --no-tail-windows para v3.0
        ns.run('daemon.js', 1, '--no-tail-windows');
    }
    
    // Iniciar stockmaster si tenemos dinero
    if (!isScriptRunning(ns, 'stockmaster.js') && ns.getPlayer().money > 6e9) {
        ns.run('stockmaster.js', 1, '--disable-purchase-tix-api');
    }
    
    // Host-manager (SIN --max-spend, con flags correctos para v3.0)
    if (!isScriptRunning(ns, 'host-manager.js')) {
        ns.print("[HACKING] Iniciando host-manager.js...");
        // Usar -c (continuous) y --reserve-percent 0.5 para gastar mas dinero en servidores
        ns.run('host-manager.js', 1, '-c', '--reserve-percent', '0.5');
    }
    
    // Pasar a factions si tenemos SF4 y hack suficiente
    if (hasSF4 && hackLevel >= CONFIG.minHackForFactions) {
        ns.print("[HACKING] ✓ Hack 50+ y SF4 disponible");
        state.phase = PHASES.FACTIONS;
    }
}

async function phaseFactions(ns, state, money, hasSF4) {
    // Sin SF4, no podemos automatizar facciones
    if (!hasSF4) {
        if (Date.now() % 30000 < 1000) {
            ns.print("[FACTIONS] SF4 no disponible, quedandose en HACKING");
        }
        state.phase = PHASES.HACKING;
        return;
    }
    
    // Iniciar work-for-factions
    if (!isScriptRunning(ns, 'work-for-factions.js')) {
        ns.print("[FACTIONS] Iniciando work-for-factions.js...");
        ns.run('work-for-factions.js');
    }
    
    // Si tenemos mucho dinero, intentar install
    if (money > 50e9) {
        state.phase = PHASES.INSTALL;
    }
}

async function phaseInstall(ns, state, hasSF4) {
    if (!hasSF4) {
        ns.print("[INSTALL] SF4 requerido para install automatico");
        state.phase = PHASES.HACKING;
        return;
    }
    
    ns.print("[INSTALL] Instalando augmentations...");
    
    // Matar todo excepto autopilot
    for (const proc of ns.ps('home')) {
        if (proc.filename !== 'autopilot.js') {
            ns.kill(proc.pid);
        }
    }
    
    await ns.sleep(3000);
    
    // Ejecutar ascend
    if (ns.run('ascend.js', 1, '--auto')) {
        while (isScriptRunning(ns, 'ascend.js')) {
            await ns.sleep(1000);
        }
        ns.print("[INSTALL] ✓ Instalacion completa!");
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
