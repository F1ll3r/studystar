/**
 *  Javascriptdatei enthält Funktionen für das Einbinden udn Manipulieren eines YouTube Videoplayers
 */

// Aktualisieren einer bestimmten HTML-Elements mit einem neuen Wert
// generiert den Text der angezeigt wird
function updateHTML(elmId, value) {
    document.getElementById(elmId).innerHTML = value;
}

// Errorcode, bei Fehlern
function onPlayerError(errorCode) {
    alert("An error occured of type:" + errorCode);
}


// Informationen über den aktuellen Zustand des Spielers
function updatePlayerInfo() {

    if (ytplayer.getPlayerState()== 1){
        showCurrentTimeOnInformationBar (ytplayer.getCurrentTime());
    }
}


// holt die URL
// URL wird zerteilt bis zu VideoId (v=)
function setNewVideo() {
    var url = document.getElementById("videoLink").value;
    if(ytplayer) {
        var video_id = url.split('v=')[1];
        var ampersandPosition = video_id.indexOf('&');
        if(ampersandPosition != -1) {
            video_id = video_id.substring(0, ampersandPosition);
        }
        ytplayer.loadVideoById(video_id);

    }
}

/**
 * Funktion ermöglicht das Springen des embedded Players zu einer angegebenen Zeitstelle (in Sekunden)
 * fals die eingegebene Zeitstelle grlßer als die Gesamtlänge des Videos ist wird ein Fehler ausgegeben
 * @param time Zeitstelle in Sekunden
 */
function setVideoTime(time) {
    //Wenn das Video noch nicht gestartet ist, starte es
    if(ytPlayer.getPlayerState()== -1) {
        ytplayer.playVideo();
        setTimeout(function () {
            if(ytplayer) {
                var duration = parseInt(ytplayer.getDuration());
                if(time < duration) {
                    ytplayer.seekTo(time, true);
                }
            }
        }, 500);
    } else {
        if(ytplayer) {
            var duration = parseInt(ytplayer.getDuration());
            if(time < duration) {
                ytplayer.seekTo(time, true);
            } else {
                alert("Anggebene Zeitstelle ist länger als das Video!");
            }
        }
    }
}


// Diese Funktion wird vom Player automatisch aufgerufen, sobald es lädt
function onYouTubePlayerReady(playerId) {
    ytplayer = document.getElementById("ytPlayer");
    // Jede viertel Sekunde wird die Zeit aktualisiert
    setInterval(updatePlayerInfo, 1000);
    //updatePlayerInfo();
    ytplayer.addEventListener("onStateChange", "onPlayerStateChange");
    ytplayer.addEventListener("onError", "onPlayerError");
    // Läd das erste Video in den Player
    ytplayer.cueVideoById(videoID);

    //Veranlasse das Laden von allen Kommentaren sobald der Videoplayer bereit und die Videolänge bekannt ist
    getAllComments(videoID);

}

// Läuft wenn es ausgeführt wird
// Player wird konfiguriert und das erste Video wird gesetzt
function loadPlayer() {
    // Lets Flash from another domain call JavaScript
    var params = { allowScriptAccess: "always",
                    allowFullScreen: "true"};
    // The element id of the Flash embed
    var atts = { id: "ytPlayer" };

    // Code um Chromeless-Player einzubinden
    /*swfobject.embedSWF("http://www.youtube.com/apiplayer?" +
        "version=3&enablejsapi=1&playerapiid=player1",
        "videoDiv", "600", "400", "9", null, null, params, atts);*/

    //Code um Player mit Schaltflächen einzubinden
    var playerStr = "http://www.youtube.com/v/"+videoID +"?enablejsapi=1&playerapiid=player1&version=3&fs=1&autohide=1";
    swfobject.embedSWF(playerStr,
        "videoDiv", "100%", "500", "8", null, null, params, atts);

}
function _run() {
    loadPlayer();
}
google.setOnLoadCallback(_run);