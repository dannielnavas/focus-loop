# Electron Configuration

This directory contains the specific configuration for the Electron desktop application.

## 📁 Structure

```
electron/
├── main.js          # Main Electron process
├── preload.js       # Preload script for IPC communication
├── tsconfig.json    # TypeScript configuration for Electron
└── README.md        # This documentation
```

## 🔧 Configuration

### main.js

The main Electron process that:

- Creates the main window
- Handles application events
- Configures menu and shortcuts
- Manages IPC communication

### preload.js

Preload script that:

- Exposes secure APIs to the renderer process
- Handles inter-process communication
- Configures contextBridge for native APIs

## 🚀 Development Commands

### Development

```bash
# Run in development mode
npm run electron:dev

# This command:
# 1. Starts the Angular development server (ng serve)
# 2. Waits for it to be available at http://localhost:4200
# 3. Starts Electron pointing to the development server
```

### Production

```bash
# Build complete application
npm run electron:build

# This command:
# 1. Builds the Angular application (ng build)
# 2. Packages with Electron Builder
# 3. Generates executables for all platforms
```

## 🖥️ Window Configuration

### Main Window

- **Size**: 1200x800 (minimum)
- **Resizable**: Yes
- **Minimizable**: Yes
- **Maximizable**: Yes
- **Always on Top**: No (default)

### Timer Window (Floating)

- **Size**: 380x120 (Windows/Linux), 306x80 (macOS)
- **Resizable**: No
- **Minimizable**: Yes
- **Maximizable**: No
- **Always on Top**: Yes
- **Frameless**: Yes

### Work Window

- **Size**: 440x[screen_height]
- **Resizable**: No
- **Minimizable**: Yes
- **Maximizable**: No
- **Always on Top**: No

## 🔌 Exposed APIs

### electronAPI

```typescript
interface ElectronAPI {
  // Window management
  resizeWindow: (width: number, height: number) => Promise<boolean>;
  resetWindowSize: () => Promise<boolean>;
  makeWindowFloating: (width: number, height: number) => Promise<boolean>;
  resetWindowFloating: () => Promise<boolean>;
  moveWindow: (x: number, y: number) => Promise<boolean>;

  // UI management
  hideTitlebar: () => Promise<boolean>;
  showTitlebar: () => Promise<boolean>;
  hideMenu: () => Promise<boolean>;
  showMenu: () => Promise<boolean>;

  // Notifications
  showNotification: (title: string, body: string) => Promise<boolean>;
  hideNotification: () => Promise<boolean>;
}
```

## 🛡️ Security

### Context Isolation

- Enabled by default
- Prevents direct access to Node.js APIs from renderer
- All native APIs are exposed through contextBridge

### Node Integration

- Disabled by default
- Only the preload script has access to Node.js
- Native APIs are exposed in a controlled manner

### Sandbox

- Enabled for the renderer process
- Prevents execution of unauthorized code
- Improves overall application security

## 📦 Build Configuration

### electron-builder

Configured in `package.json`:

```json
{
  "build": {
    "appId": "dev.danniel.focusloop",
    "productName": "Focus Loop",
    "directories": {
      "output": "release"
    },
    "files": ["dist/**/*", "electron/**/*", "node_modules/**/*", "package.json"]
  }
}
```

### Supported Platforms

#### macOS

- **Target**: DMG
- **Architectures**: x64, arm64
- **Icon**: `src/assets/icon.icns`

#### Windows

- **Target**: NSIS
- **Architecture**: x64
- **Icon**: `src/assets/icon.png`

#### Linux

- **Target**: AppImage
- **Architecture**: x64
- **Icon**: `src/assets/icon.png`

## 🐛 Troubleshooting

### Common Errors

1. **Permission Error (macOS)**

```bash
# Run with admin permissions
sudo npm run electron:dev
```

2. **Port Error**

```bash
# Check if port 4200 is free
lsof -ti:4200 | xargs kill -9
```

3. **Build Error**

```bash
# Clear Electron cache
rm -rf node_modules/.cache
npm run electron:build
```

### Debugging

#### Debug Mode

```bash
# Enable DevTools automatically
ELECTRON_IS_DEV=true npm run electron:dev
```

#### Logs

```bash
# View Electron logs
npm run electron:dev 2>&1 | tee electron.log
```

## 🔄 Updates

### Auto-updater

- Configured for automatic updates
- Checks for updates on application start
- Downloads and installs updates in background

### Versioning

- Follows semver (Semantic Versioning)
- Version in `package.json`
- Automatic build number

## 📚 Additional Resources

- [Official Electron Documentation](https://www.electronjs.org/docs)
- [Security Guide](https://www.electronjs.org/docs/tutorial/security)
- [Electron Builder](https://www.electron.build/)
- [Context Bridge](https://www.electronjs.org/docs/api/context-bridge)

---

**Note**: This configuration is optimized for development and production. Adjust according to your specific needs.
