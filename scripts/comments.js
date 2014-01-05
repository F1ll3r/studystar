/**
 * Created by Fabian J. Wiedenhoefer on 14.11.13.
 */
function getAllComments (videoid) {
   // var htmlString = "<ul>";

    $.getJSON('https://gdata.youtube.com/feeds/api/videos/' + videoid + '/comments?alt=json', function(data) {
        $.each(data.feed.entry, function(i, item) {
            var content = item['content']['$t'];
            if (getDeeplinksInText(content)!= '') {
                item["deeplinks"] = getDeeplinksInText(item.content.$t);

                item["commentType"] = "Frage";

                //Writes the comment object into a Globalarray
                infObjects.push(item);

                setInformationObjectOnBar(item);
            }
            else {
                //Zum globalen Array hinzufügen
                generalCommentObjects.push(item);
                //Kommentare ohne Deeplink in der Zeitleiste anzeigen
                showGeneralCommentsObjects();
            }
        });
    });
}

function writeComment (commentText, onPercentage) {

    //Prüfen ob ein Benutzer eingeloggt ist
    if (isLoggedIn ) {
        //Prüfen ob Eingabetextfeld einen Kommentar enthält
        if(commentText != ""){
            //Bei vorhandenem deeplinkTimestamp leerzeichen für die Kommentarausgabe hinzufügen
            var deeplinkTimestamp = formatPercentageToTimestamp(onPercentage);
            if(deeplinkTimestamp != "") {
                deeplinkTimestamp+= " ";
            }

            var xmlString = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>" +
                            "<entry xmlns=\"http://www.w3.org/2005/Atom\" xmlns:yt=\"http://gdata.youtube.com/schemas/2007>\">"+
                                "<content>" + deeplinkTimestamp +  commentText + "</content>" +
                            "</entry>";

            $.ajax({
                type: 'POST',
                url: "https://gdata.youtube.com/feeds/api/videos/"+ videoID + '/comments',
                data: xmlString,


                dataType: 'application/atom+xml',
                beforeSend: function(xhr){
                    xhr.setRequestHeader('Content-type', 'application/atom+xml; charset=UTF-8');
                    xhr.setRequestHeader('Authorization', 'AuthSub token="' + accessToken + '"');
                    xhr.setRequestHeader('X-GData-Key', 'key="' + 'AIzaSyBt0t0JJU1c9WQBMHwKNNg9g3M0hGFuQqQ' + '"');
                    xhr.setRequestHeader('GData-Version', 2);
                },
                scope: 'https://gdata.youtube.com',
                error: function(data, textStatus, errorThrown) {
                    console.log(data.responseText);
                    //Wenn Kommentar geschrieben werden konnte, aktualisieren alle Kommentare
                    if (data.statusText =="Created") {
                        //Neues InformationObjekt erzeugen und anzeigen
                        if (getDeeplinksInText(deeplinkTimestamp + commentText)!= '') {
                            //InformationObjekt erzeugen und in infObjects einfügen
                            var newInfObj = generateInformationObject(deeplinkTimestamp + commentText);
                            infObjects.push(newInfObj);
                            setInformationObjectOnBar(newInfObj);
                            var t = getSecondsFromTimestamp(deeplinkTimestamp.replace(" ", ""));
                            showInformationObject(t,"Frage");
                        }
                        else {
                            //Kommentar objekt nicht auf der Informationsleiste anzeigen
                            var newInfObj = generateInformationObject(commentText);
                            //Zum globalen gerneral Objects Array hinzufügen und Anzeige neu befüllen
                            generalCommentObjects.push(newInfObj);
                            $('#generalComments').html("");
                            showGeneralCommentsObjects();
                        }
                        document.getElementById('newCommentTextField').value="";
                    }
                }
            });
        } else {
            //Warnmeldung ausgeben
            alert("Ihr Kommentar enthält keine Zeichen!");
        }
    }
    else {
        //Loginfenster öffnen
        login();
    }
}

/**
 * Genieriert ein neues Informationsobjekt anhand des aktuell eingeloggten Benutzers und eines Kommentartexts
 * @param commentText Kommentartext
 * @returns {*} neues Informationsobjekt
 */
function generateInformationObject(commentText) {
    if (isLoggedIn) {
        var infObj = {};

        infObj.deeplinks = getDeeplinksInText(commentText);
        infObj.content = {};
        infObj.content.$t = commentText;
        infObj.commentType = "Frage";
        infObj.yt$replyCount = {};
        infObj.yt$replyCount.$t = 0;
        infObj.yt$googlePlusUserId = currentUser.id;
        infObj.yt$channelId = {};
        infObj.yt$channelId.$t = currentUser.link;
        infObj.author = [];
        infObj.author[0] = {};
        infObj.author[0].name = {};
        infObj.author[0].name.$t = currentUser.name;
        infObj.published = {};
        infObj.published.$t = Date.now();

        return infObj;
    }
}