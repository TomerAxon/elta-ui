const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
	getAppVersion: () => ipcRenderer.invoke('app:getVersion'),
});


