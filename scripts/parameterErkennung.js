/**
 * Created by Dominik Rudsich on 13.11.13.
 */

/**
 * Funktion ließt den Wert eines Parameters in der Adresszeile aus
 * @param key Parameterschlüssel der ausgelesen werden soll
 * @returns {*} Parameterwert oder doer undefined
 */
function getParameter (key) {
    var query = window.location.search.substring(1);
    var pairs = query.split('&');

    for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i].split('=');
        if(pair[0] == key) {
            if(pair[1].length > 0)
                return pair[1];
        }
    }

    return undefined;
}
