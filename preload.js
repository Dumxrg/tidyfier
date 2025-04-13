const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: (defaultPath) => ipcRenderer.invoke('select-folder', defaultPath),
  createFolder: (folderPath) => ipcRenderer.invoke('create-folder', folderPath),
  moveFile: (oldPath, newPath) => ipcRenderer.invoke('move-file', oldPath, newPath),
  verifyPath: (filePath) => ipcRenderer.invoke('verify-path', filePath),
  scanFolder: (folderPath) => ipcRenderer.invoke('scan-folder', folderPath),
  

  testAPI: () => 'API is working'
});


window.addEventListener('DOMContentLoaded', () => {

  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const dependency of ['chrome', 'node', 'electron']) {
    const version = process.versions[dependency];
    if (version) replaceText(`${dependency}-version`, version);
  }
});
