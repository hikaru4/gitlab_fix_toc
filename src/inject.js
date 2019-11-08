function injectCss() {
    var array;

    if ( window.location.hostname.indexOf('gitlab') === -1 ) {
        return;
    }

    array = ["css/jquery-ui.css", "css/main.css", "css/gitlab.css"];
    array.forEach(function (item, index) {
        var style_path = chrome.runtime.getURL(item);
        fetch(style_path)
            .then((response => response.text()))
            .then(function(text){
                var styleElement = document.createElement("style");
                styleElement.type = "text/css";
                styleElement.appendChild(document.createTextNode(text));
                document.getElementsByTagName("head")[0].appendChild(styleElement);
            });
    });
}


injectCss();