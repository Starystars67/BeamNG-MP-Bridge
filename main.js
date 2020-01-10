const path = require('path')
const os = require('os');
var argv = require('minimist')(process.argv.slice(2));
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Open the DevTools.
  if (argv.dev) {
    win.webContents.openDevTools()
  }

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Settings
///////////////////////////////////////////////
var checkboxes = {
    ["TCPIN"]: false,
    ["TCPOUT"]: false,
    ["UDPIN"]: false,
    ["UDPOUT"]: false,
    ["WSIN"]: false,
    ["WSOUT"]: false,
}
var Name = "Link"

// IPC Handler
///////////////////////////////////////////////
ipcMain.on('hello', (event, args) => {
  console.log("Hello Event: "+args)
  event.sender.send('fromMain','Hi, asyn reply');
});

ipcMain.on('checkboxes', (event, args) => {
  checkboxes = args;
});

ipcMain.on('control', (event, args) => {
  //console.log(args)
  if (args.option == "START") {
    Start(args);
  } else if (args.option == "RESET") {
    Reset(args)
  }
});

const net = require('net');
var dgram = require('dgram');

function Start(config) {
  // TCP Server
  ///////////////////////////////////////////////
  var TCPserver = net.createServer();
  TCPserver.listen(Number(config.local.tcp), () => {
    win.webContents.send('console', `[TCP][${Name}] TCP Ready & Listening on port: ${config.local.tcp}`);
  });

  TCPserver.on('connection', function(sock) {
    // Show user that game connected
    win.webContents.send('console', `[TCP][Game -> ${Name}] Game Connected`);
    // TCP Client
    ///////////////////////////////////////////////
    var TCPclient = new net.Socket();
    TCPclient.connect(Number(config.remote.tcp), config.remote.ip, function() {
      win.webContents.send('console', `[TCP][${Name} --> Server] TCP Connected`);
    });

    TCPclient.on('data', function(cdata) {
      if (checkboxes.TCPIN) {
        win.webContents.send('console', `[TCP][Server --> Client] ${cdata}`);
      }
      sock.write(cdata);
    });

    TCPclient.on('close', function() {
      //console.log('Connection closed');
    });


    sock.on('data', function(data) {
      if (checkboxes.TCPOUT) {
        win.webContents.send('console', `[TCP][Client --> Server] ${data}`);
      }
      TCPclient.write(data);
    });

    sock.on('close', function(data) {
      win.webContents.send('console', `[TCP][Game -> ${Name}] Game Disconnected`);
    });

    sock.on('error', (err) => {
      win.webContents.send('console', `[TCP][${Name}] TCP Error Seek Developer Help!`);
      win.webContents.send('err', err);
      console.error(err);
    });
  });



  // UDP Server
  ///////////////////////////////////////////////
  var UDPserver = dgram.createSocket('udp4');
  var Rinfo = {}
  UDPserver.on('listening', function() {
    win.webContents.send('console', `[UDP][${Name}] UDP Ready & Listening on port: ${config.local.udp}`);
  });
  // UDP Client
  ///////////////////////////////////////////////
  var UDPclient = dgram.createSocket('udp4');
  UDPclient.on('message',function(msg,info){
    if (checkboxes.UDPIN) {
      win.webContents.send('console', `[UDP][Server --> Client] ${msg.toString()}`);
    }
    UDPserver.send(msg,Rinfo.port,Rinfo.address,function(err){
      if(err){
        win.webContents.send('console', `[TCP][${Name}] UDP(server) Error Seek Developer Help!`);
        win.webContents.send('err', err);
        console.error(err);
      }else{
        //console.log('Data sent !!!');
      }
    });
  });
  UDPserver.on('message',function(msg,rinfo){
    Rinfo = rinfo;
    UDPclient.send(msg,config.remote.udp,config.remote.ip,function(err){
      if(err){
        win.webContents.send('console', `[TCP][${Name}] UDP (client) Error Seek Developer Help!`);
        win.webContents.send('err', err);
        console.error(err);
      }else{
        if (checkboxes.UDPOUT) {
          win.webContents.send('console', `[UDP][Client --> Server] ${msg.toString()}`);
        }
      }
    });
  });
  UDPserver.bind(Number(config.local.udp));

  // WS Client
  ///////////////////////////////////////////////

  // WS Server
  ///////////////////////////////////////////////
  /*const WebSocket = require('ws');

  const wss = new WebSocket.Server({ port: wsport });

  wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
      console.log('[WS] received: %s', message);
      wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    });

    ws.send('Welcome!');
  });*/
}

function RESET() {

}
