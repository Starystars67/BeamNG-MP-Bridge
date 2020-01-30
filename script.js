var v = ""; // System Version
// IPC Setup
///////////////////////////////////////////////
const ipc = require('electron').ipcRenderer;
ipc.send('hello','UI Loaded');
//console.log = function(d){
  //ipc.send('log', d);
//}

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

// Helper Network Functions + Server List Update
///////////////////////////////////////////////
function getLatestVersion() {
  console.log("Getting Latest Release Info!")
  $.getJSON("https://api.github.com/repos/Starystars67/BeamNG-MP-Bridge/tags").done(function (json) {
     var release = json[0];
     var downloadURL = release.zipball_url;
     //console.log(release);
     //console.log(downloadURL);
     if (v != release.name) {
       $("#Update-Button").attr("href", downloadURL).show();
     } else {
       $("#Update-Button").hide();
     }
     //$(".mongodb-download").attr("href", downloadURL);
  });
}

var levels = {
  "/levels/italy/info.json": "Italy",
  "/levels/east_coast_usa/info.json": "East Coast USA",
  "/levels/GridMap/info.json": "Grid Map",
  "/levels/smallgrid/info.json": "Small Pure Grid Map",
  "/levels/Industrial/info.json": "Industrial",
  "/levels/west_coast_usa/info.json": "West Coast USA",
  "/levels/port/info.json": "Port",
  "/levels/Utah/info.json": "Utah",
  //"/levels//info.json": "",
}

function levelToMap(l) {
  return levels[l]
}

function getServerList() {
  //console.log("Getting Latest Server Info!")
  $.getJSON("http://s1.yourthought.co.uk:3599/servers-info").done(function (json) {
     //console.log(json);
     $('#server-list').html('');
     var html = "";
     json.forEach(function(e, i, o) {
       //e[Object.keys(e)[0]]
       html += `<div class="servers-item" data-ip="${e[Object.keys(e)[0]].ip}" data-port="${e[Object.keys(e)[0]].port}">
         <span class="server-location">${e[Object.keys(e)[0]].location}</span>
         <span class="server-name">${e[Object.keys(e)[0]].sname}</span>
         <span class="server-map">${levelToMap(e[Object.keys(e)[0]].map)}</span>
         <span class="server-players">${e[Object.keys(e)[0]].players}</span>
         <span class="server-join"><button class="server-join-button" data-ip="${e[Object.keys(e)[0]].ip}" data-port="${e[Object.keys(e)[0]].port}">Join</button></span>
       <span class="server-ping">ms</span>
       </div>`

     });
     $('#server-list').html(html);
  });
}

$(document).on("click", ".server-join-button", function(event){
    event.stopPropagation();
    event.stopImmediatePropagation();
    var ip = $(this).data('ip');
    var port = $(this).data('port');
    $('.tab-page').hide();
    $('div[name="#direct-connect"]').show();
    console.log(`Wanting to join: ${ip}:${port}`)
    $("#SERVERip").val(ip)
    $("#sTCPport").val(port)
    var config = {
        ["option"]: "START",
        ["local"]: {
            ["tcp"]: $("#TCPport").val().replace(/\s/g, ""),
            ["udp"]: $("#UDPport").val().replace(/\s/g, ""),
            ["ws"]: $("#WSport").val().replace(/\s/g, ""),
        },
        ["remote"]: {
            ["ip"]: $("#SERVERip").val(),
            ["tcp"]: $("#sTCPport").val(),
            ["udp"]: $("#sUDPport").val().replace(/\s/g, ""),
            ["ws"]: $("#sWSport").val().replace(/\s/g, ""),
        },
    };
    ipc.send('control', config)
});

function updateServerList() {
  //console.log("Looking for if it is visablle")
  if (!$('div[name="servers"]').is(":hidden")) {
    // okay servers list is visable, lets get and update
    //console.log('Updating Server List');
    getServerList();
  }
}
getServerList();
setInterval(updateServerList, 10 * 1000);

// Tab Navigation Handler
///////////////////////////////////////////////
$(document).ready(function(){
    $('a').click(function(event){
        event.preventDefault();
        var item = event.target.parentElement.hash;
        if (item) {
            $('.tab-page').hide();
            $('div[name="'+item+'"]').show();
        }
    })

    getLatestVersion();
    setInterval(getLatestVersion(), 30000);
});

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
                    ["tcp"]: $("#TCPport").val().replace(/\s/g, ""),
                    ["udp"]: $("#UDPport").val().replace(/\s/g, ""),
                    ["ws"]: $("#WSport").val().replace(/\s/g, ""),
                },
                ["remote"]: {
                    ["ip"]: $("#SERVERip").val().replace(/\s/g, ""),
                    ["tcp"]: $("#sTCPport").val().replace(/\s/g, ""),
                    ["udp"]: $("#sUDPport").val().replace(/\s/g, ""),
                    ["ws"]: $("#sWSport").val().replace(/\s/g, ""),
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

ipc.on('version', (event, messages) => {
 v = messages;
 var w = $("#window-title-text").text();
 w = w+" ("+v+")";
 console.log(w)
 $("#window-title-text").text(w);
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
