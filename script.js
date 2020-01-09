function updateScroll(){
    var element = document.getElementById("live-console");
    element.scrollTop = element.scrollHeight;
}

setInterval(updateScroll,10000);
