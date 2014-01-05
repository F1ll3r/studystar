 /**
 * Created by Dominik Rudisch on 13.11.13.
 */

 /**
  * Code wird beim einbinden des Skripts in eine HTML-Seite ausgeführt
  * @type {videoID|*}
  * --------------------------------------------------------------------------------------------------------------------------------------------------------------
  */

     //Erhalten der Videoinformationen
     $.getScript('http://gdata.youtube.com/feeds/api/videos/' + encodeURIComponent(videoID) + '?v=2&alt=json-in-script&callback=youtubeDataCallback');

     //erhalten der RelatedVideoInformationen
     $.getScript('http://gdata.youtube.com/feeds/api/videos/' + encodeURIComponent(videoID) + '/related?v=2&alt=json-in-script&callback=youtubeRelatedVideoCallback');

 // ---------------------------------------------------------------------------------------------------------------------------------------------------------------


 /**
  * Funktion stellt die von Youtube erhaltenen Videoinformationen dar.
  * Außerdem wird versucht eine Kapitelgenerierung anzustoßen
  * @param data Videoinformationen
  */
 function youtubeDataCallback(data) {

     //Videolänge setzen
     videoLength = data.entry.media$group.yt$duration.seconds;

     //Autorbild anzeigen
     $.getScript('http://gdata.youtube.com/feeds/api/users/' + data.entry.author[0].yt$userId.$t
            + '?fields=yt:username,media:thumbnail,title&alt=json-in-script&format=5&callback=userPictureCallback');

     //Autor Namen anzeigen
     $('#uploaderUserName').html('<a href="http://www.youtube.com/user/' + data.entry.author[0].uri.$t.split("/")[(data.entry.author[0].uri.$t.split("/").length - 1)]
         + '" target="_blank">' + data.entry.author[0].name.$t + '</a>');
     //Uloaddatum anzeigen
     $('#videoUploadDate').html("am " + new Date(data.entry.published.$t).toLocaleDateString() + " veröffentlicht");
     //Videodauer anzeigen
     $('#videoDurationView').html("Dauer: " + Math.floor(data.entry.media$group.yt$duration.seconds / 60) + ':' + (data.entry.media$group.yt$duration.seconds % 60));
     //Videoaufrufe anzeigen
     $('#videoViews').html(data.entry.yt$statistics.viewCount + " Aufrufe");

     //Likes setzen
     if (data.entry.gd$rating) {
         $('#videoLikes').html(data.entry.yt$rating.numLikes);
         $('#videoDislikes').html(data.entry.yt$rating.numDislikes);
     } else {
         $('#videoLikes').html(0);
         $('#videoDislikes').html(0);
     }

     //Erhaltene Daten aufbereiten
     $('#videoDescriptionOutput').html(addHTMLExpressionToDeeplink(addHTMLExpressionToHyperlink(data.entry.media$group.media$description.$t.replace(/\n/g, '<br/>'))));
     $('#title').html(data.entry.title.$t);

     createChapterView(getDeeplinkChaptersinDescription(data.entry.media$group.media$description.$t), data);
 }

 /**
  * Funktion erstellt eine Kapitelübersicht anhand der Videoinformationen
  * @param chapters Kapitel (Array mit Deeplinkvorkommen innerhalb der Videobeschreibung)
  * @param data Videoinformationen (Von Youtube erhalten)
  */
 function createChapterView(chapters, data) {

     var str = '<ul id="chapters-list" class="chapter-video-list">';

     var pictures = [];

     //Zeiten erhalten
     for (var z = 0; z< data.entry.media$group.media$thumbnail.length; z++) {
         var picture = {};
         picture.url = data.entry.media$group.media$thumbnail[z].url;
         picture.width = data.entry.media$group.media$thumbnail[z].width;
         picture.height = data.entry.media$group.media$thumbnail[z].height;
         picture.name = data.entry.media$group.media$thumbnail[z].yt$name;
         picture.time = data.entry.media$group.media$thumbnail[z].time;
         if(picture.time) {
             //milisekunden entfernen
             picture.time = picture.time.substr(0,data.entry.media$group.media$thumbnail[z].time.length-4);

             //Als mögliches Vorschaubild hinufügen
             pictures.push(picture);
         }
     }


     for (var i = 0; i < chapters.deeplinks.length; i++) {

         //Zeitlich passendes Thumbnail-Bild auswählen
         var selectedPic;
         if(getSecondsFromTimestamp(chapters.deeplinks[i]) <= getSecondsFromTimestamp(pictures[1].time)) {
             selectedPic = 0;
         } else {
             if(getSecondsFromTimestamp(chapters.deeplinks[i]) > getSecondsFromTimestamp(pictures[1].time)
                 && getSecondsFromTimestamp(chapters.deeplinks[i]) <= getSecondsFromTimestamp(pictures[2].time)) {
                 selectedPic = 1;
             } else {
                 if(getSecondsFromTimestamp(chapters.deeplinks[i]) > getSecondsFromTimestamp(pictures[2].time)
                     && getSecondsFromTimestamp(chapters.deeplinks[i]) <= getSecondsFromTimestamp(pictures[3].time)) {
                     selectedPic = 2;
                 } else {
                     selectedPic = 3;
                 }
             }
         }

         //HTML-Codestring generieren
         str +=  '<li class="chapter-item">';
         str     += '<a href="javascript:void(0)" onClick="setVideoTime('+ getSecondsFromTimestamp(chapters.deeplinks[i]) +')">';
         str     += '<span class="ux-thumb-wrap">';
         str     += '<span class="video-thumb-clip">';
         str        += '<img  class="video-image" src="' + pictures[selectedPic].url;
         str        +='" width="' + pictures[selectedPic].width;
         str        += '" height="' + pictures[selectedPic].height;
         str        += '" alt="' + pictures[selectedPic].name + '" align="right"/>';
         str        += '<span class="video-vertical-align"></span></span>';
         str        += '<span class="video-time">' + formatDuration(getSecondsFromTimestamp(chapters.deeplinks[i])) + '</span>';
         str     += '</span>';
         str     += '<span class="related-video-title">';
         str         += chapters.descriptions[i];
         str     += '</span>';
         str     += '<span class="stat-attribution">';
         str     +=     '<span class="g-hovercard">bei ';
         str     +=       '<b ><span class="g-hovercard">' + formatDuration(getSecondsFromTimestamp(chapters.deeplinks[i])) + '</span></b></span>';
         str     += '</span>';
         str     += '</a>';
         str += '</li>';
     }

     str += '</ul>';
     //Schreibe HTML-Code auf bestimmte Outputstelle
     $('#chapterView').html(str);

     //Zeige Kapitel in Informationsleiste
     showChaptersOnInformationBar(chapters);

     //Überschrift sichtbar machen
     if (chapters.deeplinks.length > 0) {
        document.getElementById('chaptersHeadline').style.visibility="visible";
         document.getElementById('chaptersHeadline').style.display="table-row";
     }
 }

 /**
  * Funktion um die Related Video Ansicht zu erzeugen
  * @param relatedVideoData Von Youtube zurückgegebene Relate Video Daten
  */
 function youtubeRelatedVideoCallback(relatedVideoData) {

     //Es sollen 15 related Videos angezeigt werden
     var itemsToShow = 15;

     if (relatedVideoData.feed.entry.length < 15) {
         itemsToShow = relatedVideoData.feed.entry.length;
     }

     //Erhaltene Daten aufbereiten
     var str = '<ul id="related-videos-list" class="related-videos-list">';
     for (var z = 0; z < itemsToShow; z++) {
         try {
             //HTML-Codestring generieren
             str +=  '<li class="related-video-item">';
             str     += '<a href="watch?v=' + relatedVideoData.feed.entry[z].media$group.yt$videoid.$t + '" class="related-video-sessionlink">';
             str     += '<span class="ux-thumb-wrap">';
             str     += '<span class="video-thumb-clip">';
             str        += '<img  class="video-image" src="' + relatedVideoData.feed.entry[z].media$group.media$thumbnail[0].url;
             str        +='" width="' + relatedVideoData.feed.entry[z].media$group.media$thumbnail[0].width;
             str        += '" height="' + relatedVideoData.feed.entry[z].media$group.media$thumbnail[0].height;
             str        += '" alt="' + relatedVideoData.feed.entry[z].title.$t + '" align="right"/>';
             str        += '<span class="video-vertical-align"></span></span>';
             str        += '<span class="video-time">' + formatDuration(parseInt(relatedVideoData.feed.entry[z].media$group.yt$duration.seconds)) + '</span>';
             str     += '</span>';
             str     += '<span class="related-video-title">';
             str         += relatedVideoData.feed.entry[z].title.$t;
             str     += '</span>';
             str     += '<span class="stat-attribution">';
             str     +=     '<span class="g-hovercard">von ';
             str     +=       '<b ><span class="g-hovercard">' + relatedVideoData.feed.entry[z].author[0].name.$t + '</span></b></span></span>';
             str     += '<span class="related-stat-view-count"">' + relatedVideoData.feed.entry[z].yt$statistics.viewCount + ' Ansichten</span>';
             str     += '</a>';
             str += '</li>';
         } catch (e) {
         }
     }

     str += '</ul>';
     //Schreibe HTML-Code auf bestimmte Outputstelle
     $('#relatedVideoView').html(str);
     //Überschrift sichtbar machen
     document.getElementById('relatedVideoHeadline').style.visibility="visible";
     document.getElementById('relatedVideoHeadline').style.display="table-row";
 }

 /**
  * Funktion zum anzeigen (ausklapen) der Videobeschreibung.
  */
 function showVideoDescription(){

     //Videobeschreibung anzeigen Schaltfläche ausblenden
     document.getElementById('descriptionExpandRow').style.visibility="collapse";
     document.getElementById('descriptionExpandRow').style.display="none";
     //Videobeschreibung ausblenden Schaltfläche einblenden
     document.getElementById('descriptionCollapseRow').style.visibility="visible";
     document.getElementById('descriptionCollapseRow').style.display="table-row";
     //Videobeschreibung anzeigen
     document.getElementById('videoDescription').style.visibility="visible";
     document.getElementById('videoDescription').style.display="table-row";

 }

 /**
  * Funktion zum ausblenden (einklapen) der Videobeschreibung.
  */
 function hideVideoDescription(){

     //Videobeschreibung ausblenden Schaltfläche ausblenden
     document.getElementById('descriptionCollapseRow').style.visibility="collapse";
     document.getElementById('descriptionCollapseRow').style.display="none";
     //Videobeschreibung anzeigen Schaltfläche einblenden
     document.getElementById('descriptionExpandRow').style.visibility="visible";
     document.getElementById('descriptionExpandRow').style.display="table-row";
     //Videobeschreibung anzeigen
     document.getElementById('videoDescription').style.visibility="collapse";
     document.getElementById('videoDescription').style.display="none";

 }

 /**
  * Funktion  schickt eine Bewertung des Videos an Youtube (like/dislike)
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
                  refreshVideoRating();
              }
          });
      } else {
          //Loginfenster öffnen
          login();
      }
 }

 /**
  * Funktion aktualisiert die Bewertungsinformatonen eines Videos
  * (Callbackmethode wird aufgerufen)
  */
 function refreshVideoRating(){
     //Erhalten der Videoinformationen
     $.getScript('http://gdata.youtube.com/feeds/api/videos/' + encodeURIComponent(videoID) + '?v=2&alt=json-in-script&callback=videoRatingCallback');
 }

 /**
  * Callbackfunktion für die Videoaktualisierung
  * @param data
  */
 function videoRatingCallback(data){
     //Likes erneuern
     if (data.entry.gd$rating) {
         $('#videoLikes').html(data.entry.yt$rating.numLikes);
         $('#videoDislikes').html(data.entry.yt$rating.numDislikes);
     } else {
         $('#videoLikes').html(0);
         $('#videoDislikes').html(0);
     }
 }

 /**
  * Callbackfunktion für das erhalten von Benutzerbildern
  * @param data
  */
function userPictureCallback(data) {
     $('#videoUploaderImage').html('<img src="'
         + data.entry.media$thumbnail.url
         + '?sz=50'
         + '" height="50px" width="50px" alt="Image not found"'
         + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">');
}