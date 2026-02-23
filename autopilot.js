/**
 * AUTOPILOT - Bitburner Automation
 * Version: 1.1
 * 
 * Script principal que automatiza el juego desde cero.
 * Uso: run autopilot.js
 */

const CONFIG = {
    repoUrl: 'https://raw.githubusercontent.com/alainbryden/bitburner-scripts/main/',
    casinoGoal: 10e9,  // $10B
    minHackForFactions: 50,
    checkInterval: 10000,  // 10 segundos
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
    ns.print("║        AUTOPILOT v1.0 - Bitburner Automation       ║");
    ns.print("╚════════════════════════════════════════════════════╝");
    ns.print("");
    
    while (true) {
        try {
            const player = ns.getPlayer();
            const money = player.money;
            const hackLevel = player.skills.hacking;
            
            // Log de estado
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
    ns.print("📥 Fase DOWNLOAD: Descargando scripts...");
    
    const essentialFiles = [
        'helpers.js',
        'casino.js', 
        'daemon.js',
        'ascend.js',
        'kill-all-scripts.js',
        '/Tasks/crack-host.js',
        '/Tasks/grow-host.js',
        '/Tasks/hack-host.js',
        '/Tasks/weaken-host.js'
    ];
    
    let downloaded = 0;
    for (const file of essentialFiles) {
        if (!ns.fileExists(file)) {
            const success = await ns.wget(CONFIG.repoUrl + file + '?t=' + Date.now(), file);
            if (success) {
                downloaded++;
                ns.print(`  ✓ ${file}`);
            } else {
                ns.print(`  ✗ ${file} (fallo)`);
            }
            await ns.sleep(100);
        }
    }
    
    ns.print(`Descarga completa: ${downloaded} archivos nuevos`);
    
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
        ns.print("✅ Early complete! Tenemos $200k");
        state.phase = PHASES.CASINO;
        return;
    }
    
    ns.print(`💰 Farmeando... $${formatMoney(money)} / $200k`);
    
    // Intentar hackear n00dles
    try {
        const earned = await ns.hack('n00dles');
        if (earned > 0) {
            ns.print(`  +$${formatMoney(earned)} de n00dles`);
        }
    } catch (e) {
        // Si falla, esperar
    }
}

async function phaseCasino(ns, state, money) {
    if (money >= CONFIG.casinoGoal) {
        ns.print("✅ Casino complete! Tenemos $10B");
        // Matar casino si sigue corriendo
        killScript(ns, 'casino.js');
        state.phase = PHASES.HACKING;
        return;
    }
    
    // Verificar si casino.js está corriendo
    if (!isScriptRunning(ns, 'casino.js')) {
        ns.print("🎰 Iniciando casino.js...");
        ns.run('casino.js');
    }
    
    ns.print(`🎰 Casino activo: $${formatMoney(money)} / $${formatMoney(CONFIG.casinoGoal)}`);
}

async function phaseHacking(ns, state, hackLevel) {
    // Iniciar daemon si no está corriendo
    if (!isScriptRunning(ns, 'daemon.js')) {
        ns.print("👹 Iniciando daemon.js...");
        ns.run('daemon.js', 1, '--no-tail-windows');
    }
    
    ns.print(`👹 Daemon activo | Hack: ${hackLevel}`);
    
    // Si tenemos hack suficiente, pasar a factions
    if (hackLevel >= CONFIG.minHackForFactions) {
        ns.print("🎉 Hack 50+ alcanzado!");
        state.phase = PHASES.FACTIONS;
    }
}

async function phaseFactions(ns, state, money) {
    // Descargar work-for-factions si no existe
    if (!ns.fileExists('work-for-factions.js')) {
        await ns.wget(CONFIG.repoUrl + 'work-for-factions.js?t=' + Date.now(), 'work-for-factions.js');
    }
    
    // Intentar iniciar work-for-factions
    if (!isScriptRunning(ns, 'work-for-factions.js')) {
        ns.print("🏛️ Iniciando work-for-factions.js...");
        const pid = ns.run('work-for-factions.js');
        if (pid === 0) {
            ns.print("⚠️ No se pudo iniciar (probablemente falta SF4)");
        }
    }
    
    ns.print(`🏛️ Factions activo | Dinero: $${formatMoney(money)}`);
    
    // Si tenemos mucho dinero, intentar install
    if (money > 50e9) {
        ns.print("💰 Mucho dinero, verificando augmentations...");
        state.phase = PHASES.INSTALL;
    }
}

async function phaseInstall(ns, state) {
    ns.print("⬆️ Fase INSTALL: Instalando augmentations...");
    
    // Descargar ascend si no existe
    if (!ns.fileExists('ascend.js')) {
        await ns.wget(CONFIG.repoUrl + 'ascend.js?t=' + Date.now(), 'ascend.js');
    }
    
    // Matar todos los scripts excepto autopilot
    ns.print("🛑 Deteniendo scripts...");
    for (const proc of ns.ps('home')) {
        if (proc.filename !== 'autopilot.js') {
            ns.kill(proc.pid);
        }
    }
    
    await ns.sleep(3000);
    
    // Ejecutar ascend
    ns.print("⬆️ Ejecutando ascend.js...");
    const pid = ns.run('ascend.js', 1, '--auto');
    
    if (pid > 0) {
        // Esperar a que termine
        while (isScriptRunning(ns, 'ascend.js')) {
            await ns.sleep(1000);
        }
        ns.print("✅ Instalación completa!");
        await ns.sleep(5000);
    }
    
    // Volver a hacking
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
