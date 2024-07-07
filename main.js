const { app, BrowserWindow, ipcMain, desktopCapturer, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const { Buffer } = require('buffer'); // Import Buffer

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // use preload script
      contextIsolation: true, // enable context isolation
      enableRemoteModule: false, // disable remote module for security
    },
  });

  mainWindow.loadURL('http://localhost:3000'); // or your app's URL
});

ipcMain.handle('get-sources', async (event, opts) => {
  const sources = await desktopCapturer.getSources(opts);
  return sources;
});

ipcMain.handle('save-video', async (event, arrayBuffer) => {
  const buffer = Buffer.from(arrayBuffer); // Convert ArrayBuffer to Buffer
  const desktopPath = path.join(app.getPath('desktop'), 'elsa_files');
  if (!fs.existsSync(desktopPath)) {
    fs.mkdirSync(desktopPath);
  }
  const filePath = path.join(desktopPath, 'recorded-video.webm'); // Save to the elsa_files folder on the desktop
  fs.writeFileSync(filePath, buffer);
  return filePath;
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});


ipcMain.handle('save-screenshot', async (event, arrayBuffer) => {
  const desktopPath = path.join(app.getPath('desktop'), 'elsa_files');
  if (!fs.existsSync(desktopPath)) {
    fs.mkdirSync(desktopPath);
  }
  const filePath = path.join(desktopPath, 'screenshot.png');
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  return filePath;
});


// Save audio
ipcMain.handle('save-audio', async (event, arrayBuffer) => {
  const desktopPath = path.join(app.getPath('desktop'), 'elsa_files');
  if (!fs.existsSync(desktopPath)) {
    fs.mkdirSync(desktopPath);
  }
  const filePath = path.join(desktopPath, 'recorded-audio.webm');
  fs.writeFileSync(filePath, Buffer.from(arrayBuffer));
  return filePath;
});


ipcMain.on('show-notification', (event, { title, body }) => {
  new Notification({ title, body }).show();
});