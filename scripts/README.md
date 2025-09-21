# Scripts de Automatización

## Incremento Automático de Versión

Este directorio contiene scripts para automatizar tareas comunes del proyecto, especialmente el incremento automático de versión para las builds de Electron.

### Scripts Disponibles

#### `increment-version.js`

Script que incrementa automáticamente la versión en `package.json`.

**Uso:**

```bash
# Incrementar versión patch (0.0.1 → 0.0.2)
node scripts/increment-version.js patch

# Incrementar versión minor (0.0.1 → 0.1.0)
node scripts/increment-version.js minor

# Incrementar versión major (0.0.1 → 1.0.0)
node scripts/increment-version.js major
```

### Scripts de NPM

Se han agregado los siguientes scripts al `package.json`:

#### Builds de Electron con Incremento Automático

```bash
# Build con incremento patch (por defecto)
npm run electron:build

# Build con incremento minor
npm run electron:build:minor

# Build con incremento major
npm run electron:build:major
```

#### Incremento Manual de Versión

```bash
# Incrementar solo la versión sin hacer build
npm run version:patch
npm run version:minor
npm run version:major
```

### Flujo de Trabajo Recomendado

1. **Para releases normales:** Usa `npm run electron:build` (incremento patch automático)
2. **Para nuevas funcionalidades:** Usa `npm run electron:build:minor`
3. **Para cambios importantes:** Usa `npm run electron:build:major`

### Ejemplo de Uso

```bash
# Hacer una build normal (incrementa patch)
npm run electron:build

# El script automáticamente:
# 1. Incrementa la versión en package.json
# 2. Ejecuta ng build
# 3. Ejecuta electron-builder
```

### Notas

- El script valida que el tipo de incremento sea válido (patch, minor, major)
- La versión se actualiza en `package.json` antes de hacer la build
- El script es compatible con el sistema de versionado semántico
- Los archivos de build de Electron usarán automáticamente la nueva versión
