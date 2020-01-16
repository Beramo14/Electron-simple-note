const {app, BrowserWindow, dialog, ipcMain} = require('electron');
const fs = require('fs');

let mainWindow;

function createWindow(){
    mainWindow = new BrowserWindow({
        width: 640,
        height: 450,
        webPreferences: {
            nodeIntegration: true
        },
        resizable: false
    });
    mainWindow.removeMenu();

    mainWindow.loadFile("./front/index.html");
    mainWindow.on("closed", onclosed);
}

function onclosed(){
    mainWindow = null;
}

app.on('ready',() =>{
    createWindow();
    ipcEventHandler();
});


function ipcEventHandler(){
    ipcMain.on("app-init", (event, arg) =>{
        console.log("app-init : " + arg);
        if(typeof arg === 'string' && arg === 'init'){
            var content = '';
            var filePath = "./NoteSave.txt";
            if(isFileExists(filePath)){
                content = fs.readFileSync(filePath,'UTF-8');
                console.log(content);
            }
            var appInitInfo = {
                'title' : 'Simple Note',
                'content': content
            };
            event.returnValue = appInitInfo;
        }else{
            dialog.showErrorBox('Initialization Error', 'Abnormal application initialization');
            app.quit();
        }
    })

    ipcMain.on("note-content",(event, arg) =>{
        var content = arg;
        
        console.log(content);
        try{
            fs.writeFileSync('./NoteSave.txt', content, 'UTF-8');
            event.sender.send('note-save-stat', 'success');
            console.log('Note save SUCCESS');
        }catch(e){
            dialog.showErrorBox('Note','Note Save ERORR!');
            console.error(e);
        }
    });

    function isFileExists(filePath){
        var result = false;
        try{
            fs.accessSync(filePath);
            result = true;
        }catch(e){
            result = false;
            console.log(e);
            console.log('File is not exist');
        }
        return result;
    }
}
