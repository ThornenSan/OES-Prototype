const { app, BrowserWindow, BrowserView, ipcMain, screen } = require('electron')
const path = require('path')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow
let kioskWindow
let kioskView

const createWindow = () => {
  // Get the dimensions of the primary display
  const { width, height } = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: width * 0.5,
    height: height * 0.5,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Handle the button click event in the lobby page
  ipcMain.on('open-kiosk-window', (event) => {
    // Create the kiosk window
    kioskWindow = new BrowserWindow({
      width: width,
      height: height,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    })

    kioskWindow.loadFile(path.join(__dirname, 'kiosk.html'))
    kioskWindow.setKiosk(true)

    // Create the BrowserView and attach it to the kiosk window
    kioskView = new BrowserView()
    kioskWindow.setBrowserView(kioskView)
    kioskView.setBounds({
      x: 0,
      y: 30,
      width: 800,
      height: height,
    })
    kioskView.webContents.loadURL('https://forms.gle/aJtbRBJLeJ95ATQ97')
  })

  // Handle the button click event in the kiosk window
  ipcMain.on('close-kiosk-window', (event) => {
    kioskWindow.close()
  })

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
