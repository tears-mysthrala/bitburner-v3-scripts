# Guía de Uso - Bitburner v3.0 Scripts

## 📥 Repositorio Configurado

Fork: `https://github.com/tears-mysthrala/bitburner-v3-scripts`
Local: `C:\Users\unaiu\DEV\bitburner-v3-scripts`

---

## 🎮 Opción 1: Instalar desde el juego (Recomendado para empezar)

1. Abre Bitburner (Steam o navegador)
2. En la terminal del juego, ejecuta:
   ```
   nano git-pull.js
   ```
3. Copia el contenido de:
   ```
   https://raw.githubusercontent.com/tears-mysthrala/bitburner-v3-scripts/main/git-pull.js
   ```
4. Guarda (Ctrl+S) y ejecuta:
   ```
   run git-pull.js
   ```

Esto descargará todos los scripts actualizados para v3.0.

---

## 💻 Opción 2: Desarrollo local con VS Code (Recomendado para editar)

### Prerrequisitos
- [VS Code](https://code.visualstudio.com/)
- Extensión "Bitburner" de hexnaught (ID: `hexnaught.bitburner`)

### Configuración

1. Abre la carpeta en VS Code:
   ```
   code "C:\Users\unaiu\DEV\bitburner-v3-scripts"
   ```

2. En Bitburner, habilita el Remote API:
   - Opciones (⚙️) → Remote API → Autoconnect
   - Puerto por defecto: 12525

3. Los scripts se sincronizarán automáticamente cuando guardes en VS Code.

---

## 🔄 Mantener actualizado

Para traer cambios del repositorio original de alainbryden:

```bash
cd C:\Users\unaiu\DEV\bitburner-v3-scripts
git fetch upstream
git merge upstream/main
git push origin main
```

---

## 📋 Scripts principales

| Script | Descripción |
|--------|-------------|
| `autopilot.js` | Ejecuta todo automáticamente (modo Dios) |
| `daemon.js` | Core de hacking y gestión de servidores |
| `casino.js` | Farmeo inicial de dinero (save scumming) |
| `ascend.js` | Automatización de instalación de augmentations |
| `faction-manager.js` | Gestión de facciones y compra de augs |
| `stockmaster.js` | Trading automático de acciones |
| `gangs.js` | Gestión de bandas (SF2) |
| `bladeburner.js` | Automatización de Bladeburner (SF7) |
| `sleeve.js` | Gestión de sleeves (SF10) |
| `go.js` | Juego de Go (SF14) |

---

## ⚠️ Notas sobre v3.0

Los scripts incluyen **compatibilidad retroactiva**:
- Detectan automáticamente la versión del juego
- Usan las APIs correctas según la versión
- Funcionan tanto en v2.x estable como v3.0 beta

Cambios principales en v3.0:
- Servidores comprados → `ns.cloud.*`
- `RepToDonateToFaction` → `FavorToDonateToFaction`
- `ns.tFormat()` → `ns.ui.time()`

---

## 📁 Estructura del proyecto

```
bitburner-v3-scripts/
├── .vscode/              # Configuración de VS Code
├── helpers.js            # Funciones utilitarias
├── autopilot.js          # Script principal
├── daemon.js             # Core de hacking
├── [otros scripts]       # Resto de scripts
└── USO-V3.md             # Este archivo
```

---

## 🆘 Soporte

- Issues en GitHub: https://github.com/tears-mysthrala/bitburner-v3-scripts/issues
- Discord oficial de Bitburner: https://discord.gg/bitburner
- Canal #insights-scripts en el Discord
