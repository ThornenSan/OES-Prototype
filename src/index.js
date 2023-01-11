const {
  app,
  BrowserWindow,
  BrowserView,
  ipcMain,
  screen,
  dialog,
} = require('electron')
const path = require('path')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

let mainWindow
let kioskWindow
let kioskView
let screenDimension = null

const options = {
  type: 'info',
  title: 'Message',
  message: 'This is a message',
  buttons: ['OK'],
}

const createWindow = () => {
  // Get the dimensions of the primary display
  screenDimension = screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: screenDimension.width * 0.5,
    height: screenDimension.height * 0.5,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'))

  // Open the DevTools.
  mainWindow.webContents.openDevTools()
}

// Handle the button click event in the lobby page
ipcMain.on('open-kiosk-window', (event) => {
  // Create the kiosk window
  kioskWindow = new BrowserWindow({
    width: 800,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  kioskWindow.loadFile(path.join(__dirname, 'kiosk.html'))
  kioskWindow.setKiosk(true)
  kioskWindow.setFullScreen(true)
  kioskWindow.setAlwaysOnTop(true)

  // Create the BrowserView and attach it to the kiosk window
  kioskView = new BrowserView()
  kioskWindow.setBrowserView(kioskView)
  kioskView.setBounds({
    x: 0,
    y: 30,
    width: 800,
    height: 800,
  })
  kioskView.webContents.loadURL('https://forms.gle/aJtbRBJLeJ95ATQ97')

  kioskWindow.on('blur', () => {
    // Show a warning
    dialog.showMessageBox(kioskWindow, options)
    kioskWindow.focus()
  })
})

// Handle the button click event in the kiosk window
ipcMain.on('close-kiosk-window', (event) => {
  kioskWindow.close()
})

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
