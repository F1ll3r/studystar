/**
 * Created by Fabian Wiedenhoefer on 05.12.13.
 */

var OAUTHURL    =   'https://accounts.google.com/o/oauth2/auth?';
var VALIDURL    =   'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=';
var DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.readonly + https://www.googleapis.com/auth/drive + https://www.googleapis.com/auth/drive.file ' +
    ' + https://www.googleapis.com/auth/drive.metadata.readonly + https://www.googleapis.com/auth/drive.appdata + https://www.googleapis.com/auth/drive.apps.readonly';
var SCOPE       =   'https://www.googleapis.com/auth/userinfo.profile + http://gdata.youtube.com + ' + DRIVE_SCOPES;
var CLIENTID    =   '296855025663-t26p7m8d4vmpt03377gsfptql8q83297.apps.googleusercontent.com';
//var REDIRECT    =   'http://studystar.se.hs-heilbronn.de/watch.html'
var REDIRECT    =   'http://localhost:63342/seb-labsw-13-ws-tankstar/watch.html'

var TYPE        =   'token';
var _url        =   OAUTHURL + 'scope=' + SCOPE + '&client_id=' + CLIENTID + '&redirect_uri=' + REDIRECT + '&response_type=' + TYPE;

function checkLogin() {
    if(sessionStorage.getItem('accessToken')) {
        $('#loginButton').hide();
        $('#logoutButton').show();
        $('#notesOverviewLink').show();
        if (document.getElementById('notesOverviewLink')) {
            document.getElementById('notesOverviewLink').style.visibility="visible";
        }
        accessToken = sessionStorage.getItem('accessToken');
        isLoggedIn = true;
    } else {
        $('#loginButton').show();
        $('#logoutButton').hide();
        if (document.getElementById('notesOverviewLink')) {
            document.getElementById('notesOverviewLink').style.visibility="collapse";
        }
        accessToken = "";
        isLoggedIn = false;
    }
    getUserInfo();
}

function login() {
        var win         =   window.open(_url, "windowname1", 'width=800, height=600', "scrollbars=auto");

        var pollTimer   =   window.setInterval(function() {
            try {
                console.log(win.document.URL);
                if (win.document.URL.indexOf(REDIRECT) != -1) {
                    window.clearInterval(pollTimer);
                    var url =   win.document.URL;
                    accessToken =   gup(url, 'access_token');
                    console.log(accessToken);
                    tokenType = gup(url, 'token_type');
                    expiresIn = gup(url, 'expires_in');
                    win.close();
                    validateToken(accessToken);
                }
            } catch(e) {
            }
        }, 100);

}

function validateToken(token) {
    $.ajax({
        url: VALIDURL + token,
        data: null,
        success: function(responseText){
            getUserInfo();
            isLoggedIn = true;
            sessionStorage.setItem('accessToken',accessToken);
            checkLogin();
        },

        dataType: "jsonp"
    });
}

/**
 * Funktion zum auslesen des AccessToken
 * Quelle: http://www.netlobo.com/url_query_string_javascript.html
 */
function gup(url, name) {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\#&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    if( results == null )
        return "";
    else
        return results[1];
}

/**
 * Funktion zum Ausloggen des Benutzers
 */
function logout() {
    // Revoke the accesstoken of this session.
    sessionStorage.removeItem('accessToken');
    checkLogin();

    /*
    $.ajax({
        type: 'GET',
        url: 'https://accounts.google.com/o/oauth2/revoke?token=' +
            accessToken,
        async: false,
        contentType: 'application/json',
        dataType: 'jsonp',
        success: function(result) {
            console.log('revoke response: ' + result);
            //Gespeicherter Access Token aus session Storage entfernen
            sessionStorage.removeItem('accessToken');
            //Login Button wieder anzeigen etc.
            checkLogin();
        },
        error: function(e) {
            console.log(e);
        }
    });
    */
}

/**
 * Gets information about the current user
 */
function getUserInfo() {
    if(isLoggedIn){
        //Private Studystar Notizdatei suchen und ggf neu erstellen
        findStudystarPrivateNoteFile();

        $.ajax({
            url: 'https://www.googleapis.com/oauth2/v1/userinfo?access_token=' + accessToken,
            data: null,
            error: function(resp) {
                console.log(resp);
                console.log("could not get user data");
            },
            success: function(resp) {
                user    =   resp;
                console.log(user);

                //Write user info's to global variable
                currentUser = user
                document.getElementById("userName").innerHTML = user.name;
                //Set user picture
                $('#userPicture').html('<img src="https://plus.google.com/s2/photos/profile/'+ user.id +'" height="50px" width="50px" alt="Image not found"'
                    + ' onError="this.onerror=null;this.src=\'img/defaultUserImage.jpg\';">');
                $('#imgHolder').attr('src', user.picture);
            },
            dataType: "jsonp"
        });
    } else {
        //Set user info and picture to null if not present
        $('#userPicture').html('');
        $('#imgHolder').attr('src', "");
    }
}

function refreshToken() {

}

