import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';
import * as path from 'path';

const ADMIN_SUBSCRIPTION_PLAN_ID = '2';
const ROLE_ADMIN = 'admin';
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 800;

let mainWindow: BrowserWindow | null = null;
let userContext: { role?: string; subscriptionPlan?: { subscription_plan_id?: string | number } } | null = null;

function isAdminUser(user: typeof userContext): boolean {
  if (!user) return false;
  if (user.role === ROLE_ADMIN) return true;
  const planId = user.subscriptionPlan?.subscription_plan_id;
  const idStr = planId != null ? String(planId) : '';
  return idStr === ADMIN_SUBSCRIPTION_PLAN_ID;
}

function isRoleAdmin(user: typeof userContext): boolean {
  return user?.role === ROLE_ADMIN;
}

function buildApplicationMenu(): Menu {
  const isAdmin = isAdminUser(userContext);
  const isAdminRole = isRoleAdmin(userContext);
  const isLoggedIn = userContext != null;

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Focus Loop',
      submenu: [
        { label: 'About Focus Loop', click: () => showAboutDialog() },
        { type: 'separator' as const },
        { label: 'Generate Daily', click: () => mainWindow?.webContents.send('menu:generateDaily') },
        ...(isAdminRole ? [{ label: 'Profile', click: () => mainWindow?.webContents.send('menu:profile') }] : []),
        ...(isLoggedIn ? [{ type: 'separator' as const }, { label: 'Logout', click: () => mainWindow?.webContents.send('menu:logout') }] : []),
        { type: 'separator' as const },
        { label: 'Quit', role: 'quit' as const },
      ].filter(Boolean),
    },
  ];

  return Menu.buildFromTemplate(template);
}

function showAboutDialog(): void {
  const version = app.getVersion();
  dialog.showMessageBox(mainWindow!, {
    type: 'info',
    title: 'Focus Loop',
    message: 'Focus Loop',
    detail: `Versión ${version}\n\nDeveloped by Danniel Navas. Focus Loop is a task management and productivity application.`,
  }).catch(() => {});
}

function getAngularPath(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar', 'dist', 'focus-loop', 'browser', 'index.html');
  }
  return path.join(__dirname, '../../../dist/focus-loop/browser/index.html');
}

function createWindow(): void {
  const preloadPath = path.join(__dirname, '../preload/index.js');
  const isDev = process.env.ELECTRON_RENDERER_URL != null;

  mainWindow = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    title: 'Focus Loop',
    resizable: false,
    maximizable: false,
    fullscreen: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: !app.isPackaged,
    },
    show: false,
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  if (isDev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL).catch(() => {});
  } else {
    mainWindow.loadFile(getAngularPath()).catch((err) => {
      console.error('Failed to load Angular app:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    // if (isDev) {
      mainWindow?.webContents.openDevTools({ mode: 'detach' });
    // }
  });

  applyMenu();
}

function applyMenu(): void {
  if (!mainWindow) return;
  const menu = buildApplicationMenu();
  Menu.setApplicationMenu(menu);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC handlers (same API as Tauri desktopAPI)
ipcMain.handle('resize_window', async (_, width: number, height: number) => {
  try {
    if (mainWindow) {
      mainWindow.setSize(width, height);
      mainWindow.center();
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('reset_window_size', async () => {
  try {
    if (mainWindow) {
      mainWindow.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      mainWindow.setAlwaysOnTop(false);
      mainWindow.center();
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('make_window_floating', async (_, width: number, height: number, x?: number, y?: number) => {
  try {
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(true, 'floating');
      mainWindow.setResizable(false);
      mainWindow.setMinimumSize(width, height);
      mainWindow.setMaximumSize(width, height);
      mainWindow.setSize(width, height);
      if (x !== undefined && y !== undefined) {
        mainWindow.setPosition(x, y);
      }
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('reset_window_floating', async () => {
  try {
    if (mainWindow) {
      mainWindow.setMinimumSize(0, 0);
      mainWindow.setMaximumSize(0, 0);
      mainWindow.setAlwaysOnTop(false);
      mainWindow.setSize(DEFAULT_WIDTH, DEFAULT_HEIGHT);
      mainWindow.center();
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('move_window', async (_, x: number, y: number) => {
  try {
    if (mainWindow) {
      mainWindow.setPosition(x, y);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('hide_titlebar', async () => {
  try {
    if (mainWindow) {
      mainWindow.setMenuBarVisibility(false);
      mainWindow.setFullScreenable(false);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('show_titlebar', async () => {
  try {
    if (mainWindow) {
      mainWindow.setMenuBarVisibility(true);
      mainWindow.setFullScreenable(true);
      return true;
    }
    return false;
  } catch {
    return false;
  }
});

ipcMain.handle('hide_menu', async () => {
  try {
    if (mainWindow) mainWindow.setMenu(null);
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('show_menu', async () => {
  try {
    applyMenu();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('set_user_context', async (_, user_context: typeof userContext) => {
  try {
    userContext = user_context ?? null;
    applyMenu();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('show_notification', async (_, title: string, body: string) => {
  try {
    if (mainWindow && process.platform !== 'darwin') {
      const { Notification } = await import('electron');
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
      }
    }
    if (process.platform === 'darwin') {
      const { Notification } = await import('electron');
      if (Notification.isSupported()) {
        new Notification({ title, body }).show();
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
});
