/**
 * Script Datei bietet Funktionen zum Formatieren von Zeit und Datumsangaben
 * Created by Dominik Rudisch on 13.11.13.
 */

/**
 * Funktion zur umberechnung von Sekunden in HH:MM:SS bzw. MM:SS
 * @param dr Zeit in sekunden
 * @returns {string} String HH:MM:SS bzw. MM:SS
 */
function formatDuration (dr) {

    if(dr > 0) {
        var stunden = Math.floor(dr / 3600);
        var sekunden = Math.floor(dr % 60);
        var minuten;
        var zeitstring = "";

        if (stunden > 0) {
            zeitstring += stunden + ":";
            minuten = Math.floor(dr / 60 - stunden*60);
        } else {
            minuten = Math.floor(dr / 60);
        }
        if (minuten.toString().length < 2) {
            zeitstring += "0" + minuten + ":";
        } else {
            zeitstring += minuten + ":";
        }
        if (sekunden.toString().length < 2) {
            zeitstring += "0" + sekunden;
        } else {
            zeitstring += sekunden;
        }
        return zeitstring;
    }
    else {
        return "00:00";
    }
}

/**
 * Funktion zur umberechnung von Sekunden in HH:MM:SS bzw. MM:SS ohne führende nullen
 * @param dr Zeit in sekunden
 * @returns {string} String HH:MM:SS bzw. MM:SS
 */
function formatDurationWithoutPrefix (dr) {

    if(dr > 0) {
        var stunden = Math.floor(dr / 3600);
        var sekunden = Math.floor(dr % 60);
        var minuten;
        var zeitstring = "";

        if (stunden > 0) {
            zeitstring += stunden + ":";
            minuten = Math.floor(dr / 60 - stunden*60);
        } else {
            minuten = Math.floor(dr / 60);
        }
        if (minuten.toString().length < 2) {
            if (stunden > 0) {
            zeitstring += "0" + minuten + ":";
            } else {
                zeitstring += minuten + ":";
            }
        } else {
            zeitstring += minuten + ":";
        }
        if (sekunden.toString().length < 2) {
            zeitstring += "0" + sekunden;
        } else {
            zeitstring += sekunden;
        }
        return zeitstring;
    }
    else {
        return "00:00";
    }
}


/**
 * Datum formatieren (2009-08-10T09:04:20.000Z zu 10.08.2009)
 */
function formatLongDateTimestampToGermanDate (dateTimestamp) {
    if (dateTimestamp) {
        //englisches Datumsformat aus Timestamp isolieren
        var englDate = dateTimestamp.substr(0, 10);
        //Datumsteile erhalten
        var dateParts = englDate.split("-");
        //deutsches Datum zurückgeben
        return dateParts[2] + "." + dateParts[1] + "." +dateParts[0] ;
    } else {
        return "";
    }
}

/**
 * Funktion berechnet Sekunden aus Timestamp
 * @param timestamp Zeitstempel in Format "20:13" oder "01:20:13"
 */
function getSecondsFromTimestamp(timestamp) {
    var parts = timestamp.split(":");
    var seconds;
    if (parts.length < 3) {
        seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
        seconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
    }
    return seconds;
}


/**
 * Funktion gibt anhand eines Prozentwerts den Timestamp zurück
 * @param percentage PRozentwert (z.B. 23%)
 * @returns {string} Timestamp = "04:23"
 */
function formatPercentageToTimestamp(percentage) {
    if (percentage > 0) {
        return formatDurationWithoutPrefix(percentage*videoLength/100);
    } else {
        return "";
    }
}