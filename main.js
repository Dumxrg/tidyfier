const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("node:path");
const fs = require("fs");

try {
  require("electron-reloader")(module);
} catch (_) {}

function createWindow() {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: true,
    devTools: true,
    width: 800,
    height: 600,
    icon: "assets/icon.ico",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile("index.html");
}

ipcMain.handle('create-folder', async (event, folderPath) => {
  try {
    const normalizedPath = path.normalize(folderPath);
    
    if (!fs.existsSync(normalizedPath)) {
      fs.mkdirSync(normalizedPath, { recursive: true });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('move-file', async (event, oldPath, newPath) => {
  try {
    const normalizedOldPath = path.normalize(oldPath);
    const normalizedNewPath = path.normalize(newPath);
    
    if (!fs.existsSync(normalizedOldPath)) {
      return { 
        success: false, 
        error: `Source file not found` 
      };
    }
    
    const targetDir = path.dirname(normalizedNewPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    if (fs.existsSync(normalizedNewPath)) {
      const ext = path.extname(normalizedNewPath);
      const baseName = path.basename(normalizedNewPath, ext);
      const dirName = path.dirname(normalizedNewPath);
      let counter = 1;
      let newFilePath = normalizedNewPath;
      
      while (fs.existsSync(newFilePath)) {
        newFilePath = path.join(dirName, `${baseName} (${counter})${ext}`);
        counter++;
      }
      
      normalizedNewPath = newFilePath;
    }
    
    fs.renameSync(normalizedOldPath, normalizedNewPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('verify-path', async (event, filePath) => {
  try {
    const normalizedPath = path.normalize(filePath);
    const exists = fs.existsSync(normalizedPath);
    return { success: true, exists };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-folder', async (event, defaultPath) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      defaultPath: defaultPath || app.getPath('downloads')
    });
    
    if (result.canceled) {
      return null;
    }
    
    return result.filePaths[0];
  } catch (error) {
    console.error('Error selecting folder:', error);
    return null;
  }
});

ipcMain.handle('scan-folder', async (event, folderPath) => {
  try {
    const files = [];
    
    function scanDir(dirPath) {
      const entries = fs.readdirSync(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        
        if (entry.isDirectory()) {
          scanDir(fullPath);
        } 
        else if (entry.isFile()) {
          files.push({
            name: entry.name,
            path: fullPath,
            ext: path.extname(entry.name).toLowerCase(),
            isDirectory: false
          });
        }
      }
    }
    
    scanDir(folderPath);
    return { success: true, files };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
