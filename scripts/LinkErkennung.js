/**
 * Script Datei bietet Funktionen für die Erkennung von Deep- und Hyperlinks
 * Created by Dominik Rudisch on 09.11.13.
 */


/**
 * Funktion erkennt anhand regulärer Patterns Kapitel in einem Text
 * @param description
 * @returns {Object} chapters objekt mit erkannten Kapiteln
 */
    function getDeeplinkChaptersinDescription(description) {

        //Pattern für Deeplinks
        var deeplinkPattern = /([0-9]?[0-9]?:?[0-1]?[0-9]|[2][0-3]):([0-5][0-9])/g;

        //String nach Zeilen aufteilen
        var splittedString = description.split("\n");

        var qualities = [];
        var chapterDescription = [];
        var match;

        //Stringzeilen nach Deeplings durchsuchen
        for (var i = 0; i < splittedString.length; i++) {
            if (match = deeplinkPattern.exec(splittedString[i])) {
                //Deeplinks sammeln
                qualities.push(match[0]);

                var postfixString = splittedString[i].substr(match.index + match[0].length);
                var prefixString =  splittedString[i].substr(0, match.index);

                var commentPattern = /[^ \t|\r|\|\v|\f]/g;

                var charactersInPost, charactersInPre;
                if (charactersInPost = commentPattern.exec(postfixString) && postfixString.length >= 3) {
                    //Lesbarer String in nachfolgendem Zeilentext der mindestens 3 Zeichen lang ist
                    chapterDescription.push(postfixString);
                } else {
                    if (charactersInPre = commentPattern.exec(prefixString) && prefixString.length >= 3) {
                        //Lesbarer String in vorhergehenden Zeilentext
                        chapterDescription.push(prefixString);
                    }
                }
            }
            match = deeplinkPattern.exec(splittedString[i])
        }

        //Rückgabeobjekt zur Stukturierung der Informationen erstellen
        var chapters = {};
        chapters.deeplinks = qualities;
        chapters.descriptions = chapterDescription;

        return chapters;
    }


/**
 * Funktion findet Deeplinks in einem Text durch einen regulären Ausdruck
 * @param text Text in dem nach Deeplinks gesucht werden soll (String)
 * @returns {Array} Array von gefundenen Deeplink-Objekten
 *                  mit beginn = Startposition im Text an dem der Deeplink gefunden wurde
 *                      ende = Position im text an dem der Deeplink endet
 *                      text = Deeplinktext der gefunden wurde
 *                      time = Deeplinkzeit in Sekunden
 */
    function getDeeplinksInText(text) {

        //Deeplink Pattern als regulärer Ausdruck
        var deeplinkPattern = /([0-9]?[0-9]?:?[0-1]?[0-9]|[2][0-3]):([0-5][0-9])/g;
        var treffer;
        var deeplinks = [];

        //Alle vorkommen von Deeplinks im Text durch regulären Ausdruck prüfen
        while (treffer = deeplinkPattern.exec(text)) {
            var deeplinkObj = {};
            deeplinkObj.beginn = treffer.index;
            deeplinkObj.ende = treffer.index + treffer[0].length;
            deeplinkObj.text = treffer[0];
            deeplinkObj.time = getSecondsFromTimestamp(treffer[0]);
            deeplinks.push(deeplinkObj);
        }

        //Zurückgeben aller geundenen Deeplink vorkommen
        return(deeplinks);
    }

/**
 * Funktion findet Hyperlinks in einem Text durch einen regulären Ausdruck
 * @param text Text in dem nach Hyperlinks gesucht werden soll (String)
 * @returns {Array} Array von gefundenen Hyperlink-Objekten
 *                  mit beginn = Startposition im Text an dem der Hyperlink gefunden wurde
 *                      ende = Position im text an dem der Hyperlink endet
 *                      text = Hyperlinktext der gefunden wurde
 */
    function getHyperLinksInText(text) {

        //Hyperlink Pattern als regulärer Ausdruck
        var regExPattern = /(http(s)?:\/\/([\w+?\.\w+])+([a-zA-Z0-9\~\!\@\#\$\%\^\&amp;\*\(\)_\-\=\+\\\/\?\.\:\;\'\,]*)?)|(www\.([a-zA-Z0-9\~\!\@\#\$\%\^\&amp;\*\(\)_\-\=\+\\\/\?\.\:\;\'\,]*)?)/g;
        var match;
        var trefferliste = [];

        //Alle vorkommen von Hyperlinks im Text durch regulären Ausdruck prüfen
        while (match = regExPattern.exec(text)) {
          var hyperlinkObj = {};
            hyperlinkObj.beginn = match.index;
            hyperlinkObj.ende = match.index + match[0].length;
            hyperlinkObj.text = match[0];
            trefferliste.push(hyperlinkObj);
        }

         //gibt die Trefferliste mit allen beinhaltenden Hyperlink Objekten zurück
        return trefferliste;
    }


/**
 * Funktion Ruft die Erkennung der Hyperlinks in einem Text auf und ersetzt diese durch HTML-Ausdrücke
 * @param text Text in dem Hyperlinks dur HTML-Ausdrücke erweitert werden sollen
 * @returns {string} Text mit HTML-Ausdrücken für Hyperlinks
 */
    function addHTMLExpressionToHyperlink(text) {

        var gefundeneHyperlinks = getHyperLinksInText(text);
        var neuerText = "";
        var letztesEnde = 0;

        for (var i = 0; i < gefundeneHyperlinks.length; i++) {

            //Starttext übernehmen
            neuerText = neuerText + text.substr(letztesEnde,gefundeneHyperlinks[i].beginn - letztesEnde);

            //Link einfügen
            var linkText;
            //Fehlendes "http://" ersetzen
            if (gefundeneHyperlinks[i].text.substr(0,3) == "www") {
                linkText = "http://" + gefundeneHyperlinks[i].text;
            } else {
                linkText = gefundeneHyperlinks[i].text;
            }

            neuerText = neuerText + '<a class="attachment-hyperlink" href=\"' + linkText + '" target="_blank">' + gefundeneHyperlinks[i].text + '</a>';

            //Letztes Ende zwischenspeichern
            letztesEnde = gefundeneHyperlinks[i].ende;
        }

        //Text nach dem letzten gefundenen Hyperlink hinzufügen
        if (letztesEnde < text.length) {
            neuerText = neuerText + text.substr(letztesEnde);
        }

        return neuerText;
    }


/**
 * Funktion Ruft die Erkennung der Deeplinks in einem Text auf und ersetzt diese durch HTML-Ausdrücke
 * @param text Text in dem Hyperlinks dur HTML-Ausdrücke erweitert werden sollen
 * @returns {string} Text mit HTML-Ausdrücken für Deeplinks
 */
    function addHTMLExpressionToDeeplink(text) {

        var gefundeneDeeplinks = getDeeplinksInText(text);
        var neuerText = "";
        var letztesEnde = 0;

        for (var i = 0; i < gefundeneDeeplinks.length; i++) {

            //Starttext übernehmen
            neuerText = neuerText + text.substr(letztesEnde,gefundeneDeeplinks[i].beginn - letztesEnde);

            //Link einfügen
            neuerText = neuerText +'<a class="deeplink-hyperlink" href="javascript:void(0)" onClick="setVideoTime('
                            + getSecondsFromTimestamp(gefundeneDeeplinks[i].text) +')">'
                            + gefundeneDeeplinks[i].text + '</a>  ';

            //Letztes Ende zwischenspeichern
            letztesEnde = gefundeneDeeplinks[i].ende;
        }

        //Text nach dem letzten gefundenen Hyperlink hinzufügen
        if (letztesEnde < text.length) {
            neuerText = neuerText + text.substr(letztesEnde);
        }

        return neuerText;
    }