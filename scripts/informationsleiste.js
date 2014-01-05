/**
 * Created by Dominik Rudisch on 25.11.13.
 *
 * Code definiert die Informationsleiste
 * --------------------------------------------------------------------------------------------------------------------------------------------------------------
 */

/**
 * Funktion setzt ein Array von InformationsObjekten auf die Informationsleiste
 *
 * @param informationObjects Array mit Informationsleistenobjekten
 */
function setMultipleInformationObjectsOnBar(informationObjects) {
    var htmlString = "";

    //Erzeuge auf der Informationsleiste für jedes Elemeint ein InformationsObekt
    for (var z = 0; z < informationObjects.length; z++) {
        //Zudem erzeugen für jeden Deeplink ein Element
        for (var i = 0; i < informationObjects[z].deeplinks.length; i++) {

            //Prüfen ob eine Deeplinkangabe sich auch innerhalb der Videolänge befindet
            if (informationObjects[z].deeplinks[i].time <= videoLength) {
                htmlString += '<a  class="' + informationObjects[z].commentType
                    + '" href="javascript:void(0)" '
                    + 'onClick="onClickInformationObject('
                    + informationObjects[z].deeplinks[i].time
                    + ', \''
                    + informationObjects[z].commentType
                    + '\')" style="left: '
                    + Math.round((informationObjects[z].deeplinks[i].time / videoLength) * 100) + '%;"></a>';

            }
        }
    }
    //Schreibe HTML-Code der Objekte auf Outputstelle
    $('#InformationsObjekte').html(htmlString);
}


/**
 * Funktion setzt ein InformationsObjekt auf die Informationsleiste
 *
 * @param informationObject Informationsleistenobjekt
 */
function setInformationObjectOnBar(informationObject) {

    var htmlString = "";
    //Zudem erzeugen für jeden Deeplink ein Element
    for (var i = 0; i < informationObject.deeplinks.length; i++) {
        //Prüfen ob eine Deeplinkangabe sich auch innerhalb der Videolänge befindet
        if (informationObject.deeplinks[i].time <= videoLength) {
            htmlString += '<a  class="' + informationObject.commentType
                + '" href="javascript:void(0)" '
                + 'onClick="onClickInformationObject('
                + informationObject.deeplinks[i].time
                + ', \''
                + informationObject.commentType
                + '\')" '
                +'onmouseover="onHoverInInformationObject('
                + informationObject.deeplinks[i].time
                + ', \''
                + informationObject.commentType
                + '\')" '
                + 'onmouseout="onHoverOutInformationObject()"'
                + ' style="left: '
                + Math.round((informationObject.deeplinks[i].time / videoLength) * 100) + '%;"></a>';
        }
    }
    if(htmlString != ""){
        //Schreibe HTML-Code der Objekte auf Outputstelle
        $('#InformationsObjekte').append(htmlString);
    }
}


/**
 * Kapitel auf der Zeitleiste anzeigen
 * @param chapterObjects Kapitelobjekte
 */
function showChaptersOnInformationBar(chapterObjects) {
    var htmlKapitelString = "";

    for (var i = 0; i < (chapterObjects.deeplinks.length); i++) {
        htmlKapitelString += '<a href="javascript:void(0)" class="Kapitel" '
            + 'style="left:'
            + Math.round((getSecondsFromTimestamp(chapterObjects.deeplinks[i]) / videoLength) * 100)
            + '%;"></a>';
    }
    //Schreibe HTML-Code der Kapitel auf Outputstelle
    $('#KapitelMarkierungen').html(htmlKapitelString);
}


/**
 * Funktion legt die Aktionen fest die beim Klicken auf ein informations Objekt auf der
 * Zeitleiste ausgeführt werden.
 * Hier wird die Videozeit gesetzt (Zum Kommentarzeitpunkt vor-/zurückgespult) und die Kommentare die sich
 * an der Videostelle befinden angezeigt.
 *
 * @param iObjTime Zeitpunkt des Informationsobjekts in Sekunden (integer)
 * @param iObjType Typ des Informationsobjekts (Frage, Kommentar, Anhang, Marker)
 */
function onClickInformationObject(iObjTime, iObjType) {
    //Videozeit setzen
    setVideoTime(iObjTime);

    //Infotmations Objekt mit allen Kommentaren an diesem Zeitpunkt anzeigen
   // showInformationObject(iObjTime, iObjType);

    //Zuvor angezeigte Kommentare cachen
    commentPreviewCache = $('#relatedComments').html();

    //Pointer Position aktualisieren und vorherige Position cachen
    cashedPointerPosition = currentPointerPosition;
    currentPointerPosition= Math.round((iObjTime / videoLength) * 100);
}

/**
 * Funktion wird ausgeführt wenn der Mauszeiger sich innerhalb eines Informationsobjekts befindet und zeigt eine Kommentarvorschau
 * @param iObjTime Zeitpunkt des Informationsobjekts in Sekunden (integer)
 * @param iObjType Typ des Informationsobjekts (Frage, Kommentar, Anhang, Marker)
 */
function onHoverInInformationObject(iObjTime, iObjType) {
    //Vorschaumodus als aktiv vermerken
    previewMode = true;

    //Infotmations Objekt mit allen Kommentaren an diesem Zeitpunkt anzeigen
    showInformationObject(iObjTime, iObjType);

    //Pointer Position cachen und aktualisieren
    cashedPointerPosition = currentPointerPosition;
    currentPointerPosition= Math.round((iObjTime / videoLength) * 100);
}

/**
 * Funktion wird ausgeführt wenn der Mauszeiger eine Informationsobjekt verlässt und varanlasst den zuvor aufgerufen Informationsobjekt anzuzeigen
 */
function onHoverOutInformationObject() {
    // gecachte Kommentare wieder einfügen
    $('#relatedComments').html(commentPreviewCache);
    //Vorschaumodus als inaktiv vermerken
    previewMode = false;
    //Pointer position durch gecachten wert ersetzen
    currentPointerPosition = cashedPointerPosition;
}

/**
 * Funktion prüft informations Objekt auf der zum aktuellen Zeitpunkt auf der Informationsleiste existiert und
 * lässt diese gegebenenfalls anzeigen
 *
 */
function autoPopupInformationObject(currTime) {
    //Automatisches aupoppen von Kommentaren nur ausführen wenn gerade keine Kommentarvorschau angewendet wird
    if(previewMode == false) {
        //Infotmations Objekt mit allen Kommentaren am aktuellen Zeitpunkt suchen
        for (var i = 0; i < infObjects.length; i++) {
            for (var z = 0; z < infObjects[i].deeplinks.length; z++) {
                if (currTime == infObjects[i].deeplinks[z].time) {
                    // Informations Objekte anzeigen
                    showInformationObject(infObjects[i].deeplinks[z].time, infObjects[i].commentType);
                }
            }
        }
    }
}


/**
 * Funktion zeigt alle Zutreffenden Kommentare zu einem Zeitpunkt auf der Informationsleiste an
 *
 * @param iObjTime Zeitpunkt des Informationsobjekts in Sekunden (integer)
 * @param iObjType Typ des Informationsobjekts (Frage, Kommentar, Anhang, Marker)
 */
function showInformationObject(iObjTime, iObjType) {

    //Kommentarausgabe in HTML
    var htmlString = "";

    //Sofern Objekte vorhanden sind füge diese in eine related Comments tabelle ein
    if (infObjects.length > 0) {
        htmlString = '<div class="commentPointer" id="commentPointer"></div>' + '<table class="relatedComments-Table" >';

        //Passende Kommentare anzeigen
        for (var i = 0; i < infObjects.length; i++) {
            for (var z = 0; z < infObjects[i].deeplinks.length; z++) {

                var googlePlusActivityID = "";
                //Prüfen ob Google+ ID vorhanden und Kommentarantworten vorhanden sind
                if (typeof(infObjects[i].yt$googlePlusUserId) != "undefined") {
                    if (infObjects[i].yt$replyCount.$t > 0) {
                        var idParts = infObjects[i].id.$t.split('/');
                        //Letzes Element der ID URL repräsentiert Google+ ActivityID
                        googlePlusActivityID = idParts[idParts.length - 1];
                     //   alert(googlePlusActivityID + "\n" + currentUser.id + "\n" + infObjects[i].author[0].name.$t );
                    }
                }

                //Alle Kommentare die zu diesem Zeitpunkt als Informationsobjekt vorkommen ausgeben
                if (infObjects[i].deeplinks[z].time == iObjTime) {

                    var commenterIDLink, commenterIDPictureLink, userPictureLink, positiveComment = "";

                    if (typeof(infObjects[i].yt$googlePlusUserId) != "undefined") {
                        commenterIDPictureLink = 'https://plus.google.com/s2/photos/profile/'
                            + infObjects[i].yt$googlePlusUserId.$t
                            + '?sz=50';
                        commenterIDLink = 'http://www.youtube.com/profile_redirector/'
                            + infObjects[i].yt$googlePlusUserId.$t;
                    } else {
                        //TODO richtige Adressen für reine Youtube accounts herausfinden kein Google+
                        commenterIDPictureLink = "img/defaultUserImage.jpg";
                        commenterIDLink = 'http://www.youtube.com/user/'
                            + infObjects[i].yt$channelId.$t;
                    }

                    //Bildpfad für den Antwortenden Benutzer festlegen
                    if (currentUser) {
                        userPictureLink = 'https://plus.google.com/s2/photos/profile/'
                            + currentUser.id
                            + '?sz=50';
                    } else {
                        userPictureLink = "img/defaultUserImage.jpg";
                    }

                    htmlString += '<tr>'
                        + '<td class="commenter-image-row">'
                        + '<a  href="'
                        + commenterIDLink
                        + '" target="_blank" >'
                        + '<img src="'
                        + commenterIDPictureLink
                        + '" height="50px" width="50px" alt="Image not found"'
                        + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">'
                        + '</a>'
                        + '</td>'
                        + '<td>'
                        + '<div class="comment-right-frame">'
                        + '<span class="commenter-name">'
                        + '<a id="commenter-name-tag-' + i + '" href="'
                        + commenterIDLink
                        + '" target="_blank">'
                        + infObjects[i].author[0].name.$t + '</a>'
                        + '</span>'
                        + '<span class="comment-time"> am '
                        + new Date(infObjects[i].published.$t).toLocaleDateString()
                        + '</span>'
                        + '<div class="comment-text">'
                        + addHTMLExpressionToHyperlink(addHTMLExpressionToDeeplink(infObjects[i].content.$t))
                        + '</div>'
                        // + '<span class="answer-button" onclick="showAnswerTextField(\'' + i  + '\')">'
                        // + 'Antworten </span>'
                        + '<span class="thumb-value">'
                        + positiveComment
                        + '</span>'
                        // + '<span class="thumb-down"> :( '
                        // + '</span>'
                        //Auskommentiert, da Youtube derzeit keien Lösung zum sezten von Antworten auf Kommentare über die API bietet
                        /*+ '<div class="answer-textfield-div" id="answer-textfield-div-' + i  + '">'
                         + '<table class="answer-textfield-table">'
                         +'<tr>'
                         +'<td class="answer-textfield-table-picture-column">'
                         + '<span class="answer-user-picture-span" >'
                         + '<img src="'
                         + userPictureLink
                         + '" height="50px" width="50px" alt="Image not found"'
                         + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">'
                         + '</span>'
                         +'</td>'
                         +'<td class="answer-textfield-coloumn">'
                         + '<textarea class="answer-textfield" id="answer-textfield-' + i
                         + '" onkeydown="setTimeout(\'addTextFieldRow(document.getElementById(\'answer-textfield-'
                         + i + '-' + z + '"\'))\',10)"' + 'style="font-size:14px;"></textarea>'
                         + '</td>'
                         + '<td class="answer-hide-coloumn">'
                         + '<span class="answer-hide-span" onclick="showAnswerTextField(\'' + i + '\')"> x'
                         + '</span>'
                         + '</td>'
                         + '</tr>'
                         + '<tr>'
                         + '<input class="answer-button" type="button" id="answer-button-' + i +  '" onclick="'
                         // + 'alert(document.getElementById(\'answer-textfield-' + i + '\').value)'
                         //+ 'alert(document.getElementById(answer-textfield-' + i + ').value)'
                         + 'writeComment(document.getElementById(\'answer-textfield-' + i + '\').value , currentPointerPosition , document.getElementById(\'commenter-name-tag-' + i + '\').innerText)'
                         //         + '\').html)'
                         + '" style="width: 75px; height: 30px">'
                         + '</input>'
                         + '</tr>'
                         + '</table>'
                         + '</span>'
                         + '</div>'*/
                        + '</div>'
                        + '<table class="comment-replies-div" id="comment-replies-div-' + i + '">'
                        + '</table>'
                        + '</td>'
                        + '</tr>';
                }
            }
            //Kommentarantworten anzeigen
            getCommentReplies(googlePlusActivityID, 'comment-replies-div-' + i  );
        }

        htmlString += '</table>';
    } else {
        htmlString = '<div class="commentPointer" id="commentPointer"></div>';
    }


    //Anzeigen der zutreffenden Kommentare in der relatedComments ansicht
    $('#relatedComments').html(htmlString);
    //CommentPointer auf angezeigtes Objekt richten
    $('.commentPointer').css('left', Math.round((iObjTime / videoLength) * 100) + "%");
}

/**
 * Funktion Ruft Antworten auf Youtube Kommentare über Google+ ab
 * @param googlePlusActivityID Google plus activity ID zum Abrufne der Kommentarantworten
 * @param insertPlace HTML ID NAme des div Tags in den die Antworten eingefügt werden sollen
 */
function getCommentReplies(googlePlusActivityID, insertPlace) {

    $.getJSON(('https://www.googleapis.com/plus/v1/activities/' + googlePlusActivityID + '/comments?key=' + SERVER_API_KEY), function(data) {
        //Kommentarausgabe in HTML
        var htmlString = "";
       $.each(data.items, function(i, item) {

            var positiveComment = "";

           //Bildpfad für den Antwortenden Benutzer festlegen
           if (currentUser) {
               userPictureLink = 'https://plus.google.com/s2/photos/profile/'
                   + currentUser.id
                   + '?sz=50';
           } else {
               userPictureLink = "img/defaultUserImage.jpg";
           }

           var splittedInsert = insertPlace.split("-");

          //Auf Positive Kommentarbewertung prüfen
          if(item.plusoners.totalItems > 0) {

              positiveComment = item.plusoners.totalItems
          }

           htmlString += '<tr>'
               + '<td class="commenter-image-row">'
               + '<a href="http://www.youtube.com/profile_redirector/'
               + item.actor.id
               + '" target="_blank" >'
               + '<img src="'
               + item.actor.image.url
               + '" height="50px" width="50px" alt="Image not found"'
               + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">'
               + '</a>'
               + '</td>'
               + '<td>'
               + '<div class="comment-right-frame">'
               + '<span class="commenter-name">'
               + '<a href="http://www.youtube.com/profile_redirector/'
               + item.actor.id
               + '" target="_blank">'
               + item.actor.displayName + '</a>'
               + '</span>'
                  + '<span class="comment-time"> am '
               + new Date(item.published).toLocaleDateString()
               + '</span>'
                 + '<div class="comment-text">'
               + addHTMLExpressionToDeeplink(item.object.content)
               + '</div>'
               //+ '<span class="answer-button" onclick="showAnswerTextField(\'' +  splittedInsert[splittedInsert.length-1] + '-' + i + '\')">'
              //+ 'Antworten </span>'
               + '<span class="thumb-value">'
               + positiveComment
               + '</span>'
              // + '<span class="thumb-down"> :( '
              // + '</span>'
               //Auskommentiert, da Youtube derzeit keien Lösung zum sezten von Antworten auf Kommentare über die API bietet
             /*  + '<div class="answer-textfield-div" id="answer-textfield-div-' +  splittedInsert[splittedInsert.length-1] + '-' + i + '">'
               + '<table class="answer-textfield-table">'
                   +'<tr>'
                   +'<td class="answer-textfield-table-picture-column">'
                   + '<span class="answer-user-picture-span" >'
                   + '<img src="'
                   + userPictureLink
                   + '" height="50px" width="50px" alt="Image not found"'
                   + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">'
                   + '</span>'
                   +'</td>'
               +'<td class="answer-textfield-coloumn">'
               + '<textarea class="answer-textfield" id="answer-textfield-'  + splittedInsert[splittedInsert.length-1] + '-' + i
               + '" onkeydown="setTimeout(\'addTextFieldRow(document.getElementById(\'answer-textfield-'
               +  splittedInsert[splittedInsert.length-1] + '-' + i + '"\'))\',10)"' + 'style="font-size:14px;"></textarea>'
               + '</td>'
               + '<td class="answer-hide-coloumn">'
               + '<span class="answer-hide-span" onclick="showAnswerTextField(\'' + splittedInsert[splittedInsert.length-1] + '-' + i + '\')"> x'
               + '</span>'
               + '</td>'
               + '</tr>'
               + '</table>'
               + '</div>'*/
               + '</div>'
               + '</td>'
               + '</tr>';
        });
        //Anzeigen der Antworten in dem bereich der zugehörigen Kommentare
        $('#' + insertPlace).html(htmlString);
    });
}


/**
 * Funktion zeigt alle Kommentare ohne Deeplinks am unteren Ende der Grundseite an
 *
 */
function showGeneralCommentsObjects() {
    //Kommentarausgabe in HTML
    var htmlString = '<table class="generalComments-Table" >';

    //Passende Kommentare anzeigen
    for (var i = 0; i < generalCommentObjects.length; i++) {

        var commenterIDLink, commenterIDPictureLink;

        if (typeof(generalCommentObjects[i].yt$googlePlusUserId) != "undefined") {
            commenterIDPictureLink = 'https://plus.google.com/s2/photos/profile/'
                + generalCommentObjects[i].yt$googlePlusUserId.$t
                + '?sz=50';
            commenterIDLink = 'http://www.youtube.com/profile_redirector/'
                + generalCommentObjects[i].yt$googlePlusUserId.$t;
        } else {
            //TODO richtige Adressen für reine Youtube accounts herausfinden kein Google+
            commenterIDPictureLink = "img/defaultUserImage.jpg";
            commenterIDLink = 'http://www.youtube.com/user/'
                + generalCommentObjects[i].yt$channelId.$t;
        }

        htmlString += '<tr>'
            + '<td class="commenter-image-row">'
            + '<a href="'
            + commenterIDLink
            + '" target="_blank" >'
            + '<img src="'
            + commenterIDPictureLink
            + '" height="50px" width="50px" alt="Image not found"'
            + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">'
            + '</a>'
            + '</td>'
            + '<td>'
            + '<span class="commenter-name">'
            + '<a href="'
            + commenterIDLink
            + '" target="_blank">'
            + generalCommentObjects[i].author[0].name.$t + '</a>'
            + '</span>'
            + '<span class="comment-time"> am '
            + new Date(generalCommentObjects[i].published.$t).toLocaleDateString()
            + '</span>'
            + '<div class="comment-text">'
            + addHTMLExpressionToHyperlink(generalCommentObjects[i].content.$t)
            + '</div>'
            + '</td>'
            + '</tr>';
    }
    htmlString += '</table>';
    //Anzeigen der zutreffenden Kommentare in der relatedComments Ansicht
    $('#generalComments').html(htmlString);
}

/**
 * Funktion zum Anzeigen eines AntwortTextfelds
 * @param fieldID ID der Antwort TextFields
 */
function showAnswerTextField(fieldID){

    //Textfield die Autogrow Eigenschaft zuweisen
    $('#answer-textfield-' + fieldID).autogrow();

    //Prüfen ob Antwortfelder bereits angezeigt werden - ggf wieder ausblenden
    if(document.getElementById('answer-textfield-div-' + fieldID).style.visibility == "visible") {
       //Antworttextfeld ausblenden
        document.getElementById('answer-textfield-div-' + fieldID).style.visibility="hidden";
        document.getElementById('answer-textfield-div-' + fieldID).style.display="none";
    } else {
        //Antworttextfeld einblenden
        document.getElementById('answer-textfield-div-' + fieldID).style.visibility="visible";
        document.getElementById('answer-textfield-div-' + fieldID).style.display="block";
    }
}

/**
 * Funktion  schickt eine Bewertung des Kommentars an Youtube (like/dislike)
 * @param rType Bewertungstyp: "like" oder "dislike"
 */
function setRating(rType) {
    //Prüfen ob Benutzer eingeloggt ist
    if(isLoggedIn) {

        var xmlData = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" '
            + 'xmlns:yt="http://gdata.youtube.com/schemas/2007"><yt:rating value="' + rType +'"/></entry>';

        $.ajax({
            type: 'POST',
            url: "https://gdata.youtube.com/feeds/api/videos/"+ videoID + '/ratings',
            data: xmlData,
            dataType: 'application/atom+xml',
            beforeSend: function(xhr){
                xhr.setRequestHeader('Content-type', 'application/atom+xml');
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken );
                xhr.setRequestHeader('GData-Version', '2');
                xhr.setRequestHeader('X-GData-Key', 'key=' + SERVER_API_KEY);
                xhr.setRequestHeader('GData-Version', 2);
            },
            error: function(data, textStatus, errorThrown) {
                console.log(data.responseText);
            }
        });

    } else {
        //Loginfenster öffnen
        login();
    }
}


/**
 * Marker und Zeit setzen
 */
function setMarker(time, mark) {
        infObject = new Object();
        infObject.commentType = mark;
        infObject.deeplinks = new Array(time, time);
       // infObject.deeplinks[1] = time;
        setInformationObjectOnBar(infObject);
        showInformationObject(parseInt(time) , mark);
}