const { app, BrowserWindow, Menu } = require("electron");
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
    icon: path.join(__dirname, "../public/favicon.ico"),
    show: false,
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
const template = [
  {
    label: "Archivo",
    submenu: [
      {
        label: "Nueva Ventana",
        accelerator: "CmdOrCtrl+N",
        click: () => {
          createWindow();
        },
      },
      {
        type: "separator",
      },
      {
        label: "Salir",
        accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: "Editar",
    submenu: [
      { role: "undo", label: "Deshacer" },
      { role: "redo", label: "Rehacer" },
      { type: "separator" },
      { role: "cut", label: "Cortar" },
      { role: "copy", label: "Copiar" },
      { role: "paste", label: "Pegar" },
    ],
  },
  {
    label: "Ver",
    submenu: [
      { role: "reload", label: "Recargar" },
      { role: "forceReload", label: "Forzar Recarga" },
      { role: "toggleDevTools", label: "Herramientas de Desarrollo" },
      { type: "separator" },
      { role: "resetZoom", label: "Zoom Normal" },
      { role: "zoomIn", label: "Acercar" },
      { role: "zoomOut", label: "Alejar" },
      { type: "separator" },
      { role: "togglefullscreen", label: "Pantalla Completa" },
    ],
  },
  {
    label: "Ventana",
    submenu: [
      { role: "minimize", label: "Minimizar" },
      { role: "close", label: "Cerrar" },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
