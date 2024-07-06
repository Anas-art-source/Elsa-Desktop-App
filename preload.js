// Preload script or from a context bridge in electron-preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  saveScreenshot: async (arrayBuffer) => {
    return await ipcRenderer.invoke('save-screenshot', arrayBuffer);
  },
  saveAudio: async (arrayBuffer) => {
    return await ipcRenderer.invoke('save-audio', arrayBuffer);
  },
  minimizeApp: () => ipcRenderer.send('minimize-app'),
  getSources: async (options) => ipcRenderer.invoke('get-sources', options),
  saveVideo: async (buffer) => ipcRenderer.invoke('save-video', buffer)
});