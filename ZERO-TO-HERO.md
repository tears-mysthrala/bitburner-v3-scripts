# 🚀 Zero to Hero - Guía Completa

Sistema de automatización total para Bitburner desde un save 100% nuevo.

---

## 📁 Archivos

| Archivo | Descripción |
|---------|-------------|
| `bootstrap.js` | Script inicial para descargar todo y empezar |
| `zero-to-hero.js` | Orquestador principal que automatiza todo el juego |

---

## 🎮 Uso en Save Nuevo

### Opción 1: Bootstrap (Recomendado)

1. En el terminal de Bitburner:
```bash
nano bootstrap.js
```

2. Copiar el contenido de:
```
https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/bootstrap.js
```

3. Ejecutar:
```bash
run bootstrap.js
```

Esto descargará automáticamente todos los scripts e iniciará `zero-to-hero.js`.

### Opción 2: Manual

```bash
# Descargar git-pull.js
wget https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/git-pull.js git-pull.js

# Descargar todos los scripts
run git-pull.js

# Iniciar zero-to-hero
run zero-to-hero.js
```

---

## 📊 Fases del Juego

```
STARTUP → CASINO → CRIME → HACKING → FACTIONS → AUGMENTS → INSTALL → DESTROY → (repeat)
```

### 1. STARTUP
- Descarga de scripts base
- Verificación de archivos

### 2. CASINO
- Farmear $200k para viajar
- Viajar a Aevum
- Jugar blackjack hasta $10B (o más)
- **Save scumming automático**

### 3. CRIME
- Subir karma a -54,000 (para gangs)
- Mejorar stats de combate

### 4. HACKING
- Comprar TOR y programas (BruteSSH, FTPCrack, etc.)
- Mejorar RAM de home
- Iniciar `daemon.js` (hacking automático)
- Comprar servidores cloud (`host-manager.js`)
- Iniciar hacknet

### 5. FACTIONS
- Unirse a facciones automáticamente
- `work-for-factions.js` para reputación
- `gangs.js` si disponible (BN2/SF2)
- `bladeburner.js` si disponible (BN6/7/SF7)
- `sleeve.js` si disponible (SF10)

### 6. AUGMENTS
- Ejecutar `faction-manager.js --purchase`
- Comprar todas las augmentations posibles

### 7. INSTALL
- Ejecutar `ascend.js --auto`
- Instalar augmentations
- Reiniciar ciclo

### 8. DESTROY
- Cuando se tiene "The Red Pill"
- Hackear nivel suficiente para World Daemon
- Destruir BitNode automáticamente
- Pasar al siguiente BN óptimo

---

## ⚙️ Opciones

```bash
run zero-to-hero.js --casino-goal 10000000000
run zero-to-hero.js --install-at-aug-count 8
run zero-to-hero.js --auto-destroy false
run zero-to-hero.js --next-bn 4
```

| Opción | Default | Descripción |
|--------|---------|-------------|
| `--casino-goal` | 10e9 | Dinero objetivo del casino |
| `--min-hack-level` | 50 | Nivel mínimo de hacking |
| `--install-at-aug-count` | 6 | Instalar con X augs nuevas |
| `--install-at-aug-plus-nf` | 10 | O con X augs totales (incl. NF) |
| `--auto-destroy` | true | Auto destruir BitNode |
| `--next-bn` | 0 | BN específico (0 = automático) |
| `--interval` | 5000 | Intervalo de chequeo (ms) |

---

## 🗺️ Orden de BitNodes Automático

El script elige automáticamente el siguiente BitNode basado en prioridad:

```
BN4 → BN1 → BN5 → BN2 → BN10 → BN8 → BN13 → BN7 → BN9 → BN14 → ...
```

**Prioridad:** Desbloquear características clave primero:
- **BN4**: Singularity API (automatización total)
- **BN1**: Mejoras generales
- **BN5**: Inteligencia + Formulas.exe
- **BN2**: Gangs
- **BN10**: Sleeves + Grafting
- **BN8**: Stocks
- **etc.**

---

## 📈 Progreso

El script muestra información en tiempo real:
- Fase actual
- Tiempo en fase
- Tiempo total
- Dinero
- Nivel de hacking
- Augmentations

**Para ver el log:**
```bash
tail zero-to-hero.js
```

---

## 🔄 Ciclo de Vida

```
Nuevo Save
    ↓
bootstrap.js (descarga todo)
    ↓
zero-to-hero.js (orquesta todo)
    ↓
CASINO → $10B
    ↓
HACKING → Stats base
    ↓
FACTIONS → Reputación
    ↓
AUGMENTS → Comprar todo
    ↓
INSTALL → Soft reset
    ↓
(REPETIR hasta The Red Pill)
    ↓
DESTROY → BitNode destruido
    ↓
Siguiente BN (automático)
```

---

## 🛠️ Troubleshooting

### "No descarga los scripts"
```bash
# Probar conexión
wget https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/git-pull.js test.js
```

### "Casino.js no funciona"
- Verificar que estás en Aevum
- Ejecutar manualmente: `run casino.js`

### "No instala augmentations"
- Verificar que tienes SF4 (Singularity)
- Esperar a tener suficiente reputación
- Revisar: `run faction-manager.js`

### "No destruye el BitNode"
- Necesitas "The Red Pill" augmentation
- Necesitas nivel de hacking suficiente para w0r1d_d43m0n
- Verificar: `run ascend.js --auto`

---

## 📝 Notas

- El script es **100% automático** una vez iniciado
- Compatible con **v2.x y v3.0** de Bitburner
- Usa los scripts de alainbryden como base
- Añade orquestación inteligente entre fases

---

## 🎉 Fin del Juego

El script se detiene cuando:
1. Alcanzas el `--target-bn` especificado
2. O ejecutas manualmente `kill zero-to-hero.js`

**¡Disfruta ver cómo el juego se juega solo! 🚀**
