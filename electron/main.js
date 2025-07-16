const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const path = require("path");
const isDev = process.env.NODE_ENV === "development";

let mainWindow;

function createWindow() {
  // Crear la ventana del navegador
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../src/assets/icon.png"),
    show: false,
    // Configurar para mostrar solo controles nativos del sistema operativo
    titleBarStyle: "customButtonsOnHover", // Usar controles nativos
    frame: true, // Mantener el marco nativo con controles del sistema
    // Hacer la ventana redimensionable
    resizable: false, // Cambiado a false para que no se pueda redimensionar
    // Permitir minimizar y maximizar
    minimizable: false,
    maximizable: false,
    // Configuraciones adicionales para una mejor experiencia
    transparent: true,
    hasShadow: true,
  });

  // Cargar la aplicación Angular
  const startUrl = isDev
    ? "http://localhost:4200"
    : `file://${path.join(__dirname, "../dist/my-tracker/browser/index.html")}`;

  mainWindow.loadURL(startUrl);

  // Mostrar la ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();

    // Abrir DevTools en desarrollo
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Manejar cuando se cierra la ventana
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// Este método se llamará cuando Electron haya terminado de inicializar
app.whenReady().then(() => {
  createWindow();

  // En macOS, es común recrear una ventana cuando se hace clic en el icono del dock
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Salir cuando todas las ventanas estén cerradas
app.on("window-all-closed", () => {
  // En macOS, es común que las aplicaciones permanezcan activas hasta que se cierren explícitamente
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// Configurar el menú de la aplicación
const template = [];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

// Agregar listeners para IPC
ipcMain.handle("resize-window", (event, { width, height }) => {
  if (mainWindow) {
    mainWindow.setSize(width, height);
    // Centrar la ventana en la pantalla
    mainWindow.center();
    return true;
  }
  return false;
});

ipcMain.handle("reset-window-size", () => {
  if (mainWindow) {
    mainWindow.setSize(1200, 800);
    mainWindow.center();
    return true;
  }
  return false;
});

ipcMain.handle("make-window-floating", (event, { width, height }) => {
  if (mainWindow) {
    // Hacer la ventana siempre visible sobre otras aplicaciones
    mainWindow.setAlwaysOnTop(true);
    // Redimensionar la ventana
    mainWindow.setSize(width, height);
    // Centrar la ventana
    mainWindow.center();
    return true;
  }
  return false;
});

ipcMain.handle("reset-window-floating", () => {
  if (mainWindow) {
    // Quitar la propiedad de siempre visible
    mainWindow.setAlwaysOnTop(false);
    // Restaurar tamaño original
    mainWindow.setSize(1200, 800);
    mainWindow.center();
    return true;
  }
  return false;
});

ipcMain.handle("move-window", (event, { x, y }) => {
  if (mainWindow) {
    mainWindow.setPosition(x, y);
    return true;
  }
  return false;
});

ipcMain.handle("hide-titlebar", () => {
  if (mainWindow) {
    mainWindow.setWindowButtonVisibility(false); // Solo en macOS
    // Para Windows/Linux, se requiere recrear la ventana sin frame, lo cual es más complejo.
    return true;
  }
  return false;
});

ipcMain.handle("show-titlebar", () => {
  if (mainWindow) {
    mainWindow.setWindowButtonVisibility(true); // Solo en macOS
    return true;
  }
  return false;
});

ipcMain.handle("hide-menu", () => {
  Menu.setApplicationMenu(null);
  return true;
});

ipcMain.handle("show-menu", () => {
  Menu.setApplicationMenu(menu);
  return true;
});
