# Electron Integration para Focus Loop

Este directorio contiene los archivos necesarios para ejecutar la aplicación Angular como una aplicación de escritorio usando Electron.

## Archivos

- `main.js` - Proceso principal de Electron que crea la ventana de la aplicación
- `preload.js` - Script que se ejecuta en el contexto del renderer para exponer APIs seguras
- `tsconfig.json` - Configuración TypeScript para los archivos de Electron

## Scripts Disponibles

### Desarrollo

```bash
# Ejecutar en modo desarrollo (Angular + Electron)
npm run electron:dev

# O ejecutar por separado
npm run start        # Servidor Angular en http://localhost:4200
npm run electron     # Electron apuntando a localhost:4200
```

### Producción

```bash
# Construir la aplicación Angular y ejecutar con Electron
npm run electron:serve

# Construir la aplicación completa para distribución
npm run electron:build
```

## Configuración

### Variables de Entorno

- `NODE_ENV=development` - Para modo desarrollo
- `NODE_ENV=production` - Para modo producción

### APIs Disponibles

La aplicación Angular puede acceder a las siguientes APIs a través de `window.electronAPI`:

```typescript
// Obtener información de la aplicación
const appInfo = window.electronAPI.getAppInfo();

// Mostrar notificación del sistema
window.electronAPI.showNotification("Título", "Mensaje");

// Manejo de archivos (ejemplo)
const filePath = await window.electronAPI.openFile();
await window.electronAPI.saveFile(data);
```

## Estructura de Archivos

```
my-tracker/
├── electron/
│   ├── main.js          # Proceso principal
│   ├── preload.js       # Script de precarga
│   ├── tsconfig.json    # Config TypeScript
│   └── README.md        # Este archivo
├── src/                 # Código Angular
├── dist/                # Build de Angular
└── release/             # Builds de Electron (generado)
```

## Notas de Seguridad

- `nodeIntegration` está deshabilitado por seguridad
- `contextIsolation` está habilitado
- Solo se exponen APIs específicas a través del preload script
- Se valida la lista de canales permitidos para IPC

## Troubleshooting

### Error: Cannot find module 'electron'

```bash
npm install electron --save-dev
```

### Error: Cannot find module './preload.js'

Asegúrate de que el archivo `preload.js` existe en el directorio `electron/`

### La aplicación no carga

Verifica que:

1. Angular esté ejecutándose en `http://localhost:4200` (modo desarrollo)
2. El build de Angular esté en `dist/my-tracker/` (modo producción)
3. El archivo `index.html` existe en la carpeta de build
