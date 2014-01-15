/**
 * Script Datei enthält Funktionen zum Ausführen einer YouTube Suche auf einer Webseite
 * Webseite muss das formatierer.js Script importieren !!
 * @type {{ytQuery: number, cl: number, callback: {}, cfg: {}, init: Function, listVideos: Function, formatRating: Function, formatDuration: Function, formatDescription: Function, formatDate: Function, loadNext: Function, loadPrevious: Function, message: Function}}
 */

var youtubeSearch = {

    ytQuery: 0,
        cl: 0,
        callback: {},
        cfg: {},

        /**
         * Initialisierung
         * Aufruf über:
         * youtubeSearch.init({'block':'BLOCK','type':'SEARCHTYPE','q':'SUCHTEXT','results': ANZAHL_ERGEBNISSE,'order':'SORTIERREIHENFOLGE'}
         *
         * BLOCK = DIV-Block in dem die Suchergebnisse ausgegeben werden sollen
         * SEARCHTYPE = Suchtyp - 'search' oder 'filter' stehen zur Auswahl
         * SUCHTEXT = Tags nach denen gesucht werden soll
         * ANZAHL_ERGEBNISSE = Anzahl der angezeigten Ergebnisse pro Seite
         * SORTIERREIHENFOLGE = Azeigereiehenfolge. Zuer Auswahl stehen: 'new_first' um die neusten Videos zuerst zu zeigen,
         *              'highest_rating' um zuerst die best bewertesten Vdeos zu Zeigen und
         *              'most_relevance' um zuerst die Videos mit der höchsten Tag Trefferquote zu zeigen
         */
        init: function (cfg) {

        this.cfg = cfg || {};
        if (!this.cfg.block) {
            this.message('Bitte setzen Sie das \"block\" Element im Konfigurationsfile.');
        } else {
            if (!this.cfg.type) {
                this.message('Der suchmodus muss als \'search\' oder \'filter\' angegeben werden.');
            } else if (!this.cfg.q) {
                this.message('Es muss ein Suchbegriff nach YouTube-Tags angegeben werden.');
            } else {
                //this.message('Suche nach YouTube-Videos...');

                //Ajvascript Element erzeugen dass die JSONp Daten zurückgibt.
                var script = document.createElement('script');
                script.setAttribute('id', 'jsonScript');
                script.setAttribute('type', 'text/javascript');

                //Zähler für die Anzahl bereits abgerufener Abfragen
                this.ytQuery++;

                //settings
                if (!this.cfg.paging) {
                    this.cfg.paging = true;
                }
                if (!this.cfg.results) {
                    this.cfg.results = 10;
                }
                if (!this.cfg.start) {
                    this.cfg.start = 1;
                }
                if (!this.cfg.order) {
                    this.cfg.orderby = 'relevance';
                    this.cfg.sortorder = 'descending';
                }
                if (!this.cfg.thumbnail) {
                    this.cfg.thumbnail = 50;
                }
                if (!this.cfg.height) {
                    this.cfg.height = 195;
                }
                if (!this.cfg.width) {
                    this.cfg.width = 320;
                }
                switch (this.cfg.order) {
                    case "new_first":
                        this.cfg.orderby = 'published';
                        this.cfg.sortorder = 'ascending';
                        break;

                    case "highest_rating":
                        this.cfg.orderby = 'rating';
                        this.cfg.sortorder = 'descending';
                        break;

                    case "most_relevance":
                        this.cfg.orderby = 'relevance';
                        this.cfg.sortorder = 'descending';
                        break;
                }

                //what data do we need: a search, a user search
                switch (this.cfg.type) {
                    case "search":
                        script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/videos?q=' + this.cfg.q + '&v=2&format=5&start-index=' + this.cfg.start + '&max-results=' + this.cfg.results + '&alt=jsonc&callback=youtubeSearch.callback[' + this.ytQuery + ']&orderby=' + this.cfg.orderby + '&sortorder=' + this.cfg.sortorder);
                        break;

                    case "filter":
                        script.setAttribute('src', 'http://gdata.youtube.com/feeds/api/videos/?' + this.cfg.q + '&callback=youtubeSearch.callback[' + this.ytQuery + ']&max-results=' + cfg.results + '&start-index=' + this.cfg.start + '&alt=jsonc&v=2&format=5&orderby=' + this.cfg.orderby + '&sortorder=' + this.cfg.sortorder);
                        break;

                }
                cfg.mC = this.ytQuery;
                this.callback[this.ytQuery] = function (json) {
                    youtubeSearch.listVideos(json, cfg);
                }


                //Script zum aufrufenednen Seitenheader hinzufügen
                document.getElementsByTagName('head')[0].appendChild(script);
            }
        }

    },


    /**
     * Funktion Listet gefundene YouTube Videos auf.
     * @param json JSON-Rückgabeobjekt der Suchanfrage
     * @param cfg Konfiguration
     */
    listVideos: function (json, cfg) {
        this.cfg = cfg;

        var div = document.getElementById(this.cfg.block);

        var children = div.childNodes;
        for (var i = children.length; i > -1; i--) {
            if (children[i] && (children[i].className.indexOf("error") !== -1
                || children[i].className === "result-list"
                || children[i].className === "ytPage")) {/* is error message or result list */
                div.removeChild(children[i]);
            }
        }

        if (json.error) {
            this.message('Fehler aufgetreten:<br>' + json.error.message);
        } else if (json.data && json.data.items) {

            //Listenelement erzeugen
            var ol = document.createElement('ol')
            //Listenelement einer Klasse hinzufügen
            ol.className = 'result-list';

            //Jedes erhaltene Videoelement bearbeiten
            for (var i = 0; i < json.data.items.length; i++) {
                //Videoelemente
                var entry = json.data.items[i];


                if (entry.video) {
                    //add tags on the bottom
                    entry = entry.video;
                }

                //Listenelement erzeugen
                var li = document.createElement('li');
                li.className = 'result-list-element';

                var img
                if(entry.thumbnail) {
                    img = entry.thumbnail.hqDefault;
                } else {
                   img = "";
                }
                li.innerHTML =  '<div class="lockup-thumbnail">' +
                                '<a href="watch?v=' + entry.id +'" class="sessionlink" >' +
                                    '<img class="thumbnail-image" src="'+ img + '" alt="Kein Bild vorhanden" />' +
                                    '<span class="video-time">' + formatDuration(entry.duration) + '</span></a>' +
                            '</div>' +
                            '<div class="lockup-content">' +
                                '<h3 class="lockup-title">' +
                                    '<a class="sessionlinkTitle" title="' + entry.title +'" href="watch?v=' + entry.id +'">' +
                                        '<span class="ellipsis-wrapper">' + entry.title +'</span></a></h3>' +
                                '<div class="lockup-meta">' +
                                    '<ul class="lockup-meta-info">' +
                                        '<li class="uploaderlistItem">von <a target="_blank" href="http://www.youtube.com/profile?user='+
                                                entry.uploader + '" class="uploaderlink">'+ entry.uploader + '</a></li>' +
                                        '<li class="uploadDatelistItem">am ' + formatLongDateTimestampToGermanDate(entry.uploaded) + '</li>' +
                                        '<li class="hitslistItem">' + entry.viewCount + ' Aufrufe</li>' +
                                    '</ul>' +
                               '</div>' +
                                '<div class="lockup-description">' +
                                    '<span class="ellipsis-wrapper-description">' +
                                        entry.description.substr(0,125) + '<b class="triplepoint">...</b></span>' +
                                '</div>' +
                            '</div>';

                ol.appendChild(li);
            }

            //for fixed to bottom videos
            if (this.cfg.position == "fixed_bottom") {
                div.style.position = "fixed";
                div.style.bottom = '0px';
                div.style.left = '0px';
            }
            div.appendChild(ol);

            //Weitere Suchergebinse anzeigen / navigieren
            if (this.cfg.paging == true) {
                this.cfg.display_first = false;
                var pol = document.createElement('ul');
                pol.setAttribute('class', 'ytPage');
                if (json.data.totalItems > (json.data.startIndex + json.data.itemsPerPage)) {
                    var li = document.createElement('li');

                    var a = document.createElement('a');
                    a.className = 'ytNext';
                    a.style.cursor = 'pointer';

                    li.appendChild(a);
                    if (a.addEventListener) {
                        a.addEventListener('click', youtubeSearch.loadNext.bind(this, {cfg: cfg}), false);
                    } else if (a.attachEvent) {
                        a.attachEvent('onclick', youtubeSearch.loadNext.bind(this, {cfg: cfg}));
                    }
                    a.innerHTML = 'weiter';
                    li.appendChild(a);
                    pol.appendChild(li);
                }

                if (json.data.startIndex > 1) {
                    var li = document.createElement('li');

                    var a = document.createElement('a');
                    a.setAttribute('class', 'ytPrev');
                    a.style.cursor = 'pointer';

                    if (a.addEventListener) {
                        a.addEventListener('click', youtubeSearch.loadPrevious.bind(this, {cfg: cfg}), false);
                    } else if (a.attachEvent) {
                        a.attachEvent('onclick', youtubeSearch.loadPrevious.bind(this, {cfg: cfg}));
                    }
                    a.innerHTML = 'zurück';
                    li.appendChild(a);
                    pol.appendChild(li);
                }

                div.appendChild(pol);
            }

        } else {
            //Warnmeldung ausgeben
            this.message('Für Ihre Suche (' + this.cfg.q + ') wurden keine Videos auf YouTube gefunden!');
        }
    },

    /**
     * Videobewertung formatieren
     */
    formatRating: function (rt, rc) {
        if (rc) {
            //Wenn eine eweirtung gesetzt wurde soll diees angezeigt werden
            return rc;
        } else {
            //Wenn keine Bewertung gesetzt wurde soll 0 angezeigt werden
            return 0;
        }
    },

    /**
     * Funktion zum Laden einer neuen Seite von Suchergebnissen
     * @param data JSON Daten
     */
    loadNext: function (data) {
        data.cfg.start = parseInt(data.cfg.start) + parseInt(data.cfg.results);
        youtubeSearch.init(data.cfg);
    },
    /**
     * Funktion zum Laden der vorherigen Seite von Suchergebnissen
     * @param data JSON Daten
     */
    loadPrevious: function (data) {
        data.cfg.start = parseInt(data.cfg.start) - parseInt(data.cfg.results);
        if (data.cfg.start < 1) data.cfg.start = 1;
        youtubeSearch.init(data.cfg);
    },

    /**
     * Funktion zum Ausgeben von Fehremeldungen
     * @param msg
     */
    message: function (msg) {
        if (!youtubeSearch.cfg.block) {
            //attach message to body?
        } else {
            document.getElementById(youtubeSearch.cfg.block).innerHTML = '<div class="error">' + msg + '</div>';
        }
    }
};
