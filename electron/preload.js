const { contextBridge, ipcRenderer } = require("electron");

// Exponer APIs protegidas al renderer process
contextBridge.exposeInMainWorld("electronAPI", {
  // Métodos para comunicación con el proceso principal
  send: (channel, data) => {
    // Lista de canales permitidos
    const validChannels = ["app-version", "app-name"];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  receive: (channel, func) => {
    // Lista de canales permitidos
    const validChannels = ["app-version", "app-name"];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  // Obtener información de la aplicación
  getAppInfo: () => {
    return {
      version: process.env.npm_package_version || "1.0.0",
      name: process.env.npm_package_name || "My Tracker",
      platform: process.platform,
      arch: process.arch,
    };
  },

  // Métodos para manejo de archivos (ejemplo)
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (data) => ipcRenderer.invoke("dialog:saveFile", data),

  // Métodos para notificaciones del sistema
  showNotification: (title, body) => {
    ipcRenderer.send("show-notification", { title, body });
  },
});

// Manejar eventos de la aplicación
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ["chrome", "node", "electron"]) {
    replaceText(`${dependency}-version`, process.versions[dependency]);
  }
});
