const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const isDev = !!process.env.VITE_DEV_SERVER_URL;

let mainWindowRef = null;

function createMainWindow() {
	mainWindowRef = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	if (isDev) {
		mainWindowRef.loadURL(process.env.VITE_DEV_SERVER_URL);
		mainWindowRef.webContents.openDevTools({ mode: 'detach' });
	} else {
		mainWindowRef.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
	}

	mainWindowRef.on('closed', () => {
		mainWindowRef = null;
	});
}

app.whenReady().then(() => {
	createMainWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createMainWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.handle('app:getVersion', () => app.getVersion());


