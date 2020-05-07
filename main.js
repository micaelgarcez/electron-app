const {
  app,
  BrowserWindow,
  Menu,
  ipcMain
} = require("electron");
const path = require("path");
const fs = require("fs");

// SET ENV
process.env.NODE_ENV = 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.

// TRADUCAO: Mantenha uma referência global do objeto da janela; caso contrário, 
// a janela será fechada automaticamente quando o objeto JavaScript for coletado como lixo.

let mainWindow;
let addWindow;

async function createWindow() {

  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      // protect against prototype pollution : proteger contra a poluição do protótipo
      contextIsolation: true, 
      // turn off remote : desligar o controle remoto
      enableRemoteModule: false, 
      // use a preload script : use um script de pré-carregamento
      preload: path.join(__dirname, "preload.js") 
    }
  });

  // Load app
  mainWindow.loadFile(path.join(__dirname, "views/index.html"));

  // Quit app when closed
  mainWindow.on('closed', function(){
    app.quit();
  })

  // Build menu from template : Construindo o menu no template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu : Inserindo menu
  Menu.setApplicationMenu(mainMenu);
}

app.on("ready", createWindow);

ipcMain.on("toMain", (event, args) => {
  fs.readFile("path/to/file", (error, data) => {
    // Do something with file contents : Faça algo com o conteúdo do arquivo
    
    // Send result back to renderer process : Enviar resultado de volta ao processo do renderizador
    mainWindow.webContents.send("fromMain", args);
  });
});

// handle create add window
function createAddWindow() {
  // Create new window : Cria uma nova janela
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'add Shopping List item',
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, "preload.js") 
    }
  });

  // Load html into window : Carreca o html na janela
  addWindow.loadFile(path.join(__dirname, 'views/addWindow.html'));
  // Garbage collection handle
  addWindow.on('closed', function(){
    addWindow = null;
  })
}

// Create menu template : Criando menu no template
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Adicionar Item',
        click(){
          createAddWindow();
        }
      },
      {
        label: 'Limpar Items',
        click(){
          mainWindow.webContents.send("clearList", null);
        }
      },
      {
        label: 'Sair',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

// If mac, add empty object to menu
if(process.platform == 'darwin'){
  mainMenuTemplate.unshift({});
}

// Add developer tools item if not in prod
if(process.env.NODE_ENV !== 'production'){
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}