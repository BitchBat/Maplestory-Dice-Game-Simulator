const { app, BrowserWindow, Menu } = require('electron'); // <-- Menu를 추가했습니다.
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    title: "2026 진의 신비한 정원 시뮬레이터", 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });
  Menu.setApplicationMenu(null); 

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  win.on('page-title-updated', (evt) => {
     evt.preventDefault();
   });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});