// IPC Setup
///////////////////////////////////////////////
const ipc = require('electron').ipcRenderer;
ipc.send('hello','UI Loaded');

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

// Console Scrolling handler
///////////////////////////////////////////////
function updateScroll(){
    var element = document.getElementById("live-console");
    element.scrollTop = element.scrollHeight;
}

setInterval(updateScroll,10000);

// Checkbox handler + Button
///////////////////////////////////////////////

$(document).ready(function(){
    $('input[type="checkbox"]').click(function(){
        if($(this).prop("checked") == true){
            checkboxes[$(this).attr('id')] = true;
            console.log($(this).attr('id')+" = true");
        }
        else if($(this).prop("checked") == false){
            checkboxes[$(this).attr('id')] = false;
            console.log($(this).attr('id')+" = false");
        }
        // Send updated choices to main
        ipc.send('checkboxes',checkboxes);
    });
    $('button').click(function(){
        if($(this).attr('id') == "START"){
            //alert("START!")
            var config = {
                ["option"]: "START",
                ["local"]: {
                    ["tcp"]: $("#TCPport").val(),
                    ["udp"]: $("#UDPport").val(),
                    ["ws"]: $("#WSport").val(),
                },
                ["remote"]: {
                    ["ip"]: $("#SERVERip").val(),
                    ["tcp"]: $("#sTCPport").val(),
                    ["udp"]: $("#sUDPport").val(),
                    ["ws"]: $("#sWSport").val(),
                },
            };
            ipc.send('control', config)
        }
        else if($(this).attr('id') == "RESET"){
            //alert("RESET!")
            var config = {
                ["option"]: "RESET",
                ["local"]: {
                    ["tcp"]: $("#TCPport").val(),
                    ["udp"]: $("#UDPport").val(),
                    ["ws"]: $("#WSport").val(),
                },
                ["remote"]: {
                    ["ip"]: $("#SERVERip").val(),
                    ["tcp"]: $("#sTCPport").val(),
                    ["udp"]: $("#sUDPport").val(),
                    ["ws"]: $("#sWSport").val(),
                },
            };
            ipc.send('control', config)
        }
        // Send updated choices to main
        ipc.send('checkboxes',checkboxes);
    });
});

// IPC / Main to renderer handler + console
///////////////////////////////////////////////

ipc.on('fromMain', (event, messages) => {
 console.log(messages)
});

ipc.on('console', (event, messages) => {
 console.log(messages)
 ConsoleLog(messages)
 updateScroll()
});

ipc.on('settings', (event, messages) => {
 console.log(messages)
 $("#TCPport").val(messages.settings.local.tcp);
 $("#UDPport").val(messages.settings.local.udp);
 $("#WSport").val(messages.settings.local.ws);
 $("#SERVERip").val(messages.settings.remote.ip);
 $("#sTCPport").val(messages.settings.remote.tcp);
 $("#sUDPport").val(messages.settings.remote.udp);
 $("#sWSport").val(messages.settings.remote.ws);
});

ipc.on('err', (event, messages) => {
 console.log(messages)
 alert(messages)
});

function ConsoleLog(msg){
    $("#live-console").append('<li>'+msg+'</li>');
}
