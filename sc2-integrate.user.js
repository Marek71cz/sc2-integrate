// ==UserScript==
// @name            SC2-integrate
// @license         MIT
// @version         3.4
// @downloadURL     https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/sc2-integrate.user.js
// @updateURL       https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/sc2-integrate.user.js
// @description     Integrace SC2 do CSFD, IMDB a TRAKT.TV.
// @match           https://www.csfd.cz/film/*
// @match           https://www.csfd.cz/podrobne-vyhledavani/*
// @match           https://www.csfd.cz/zebricky/*
// @match           https://www.imdb.com/title/*
// @match           https://trakt.tv/shows/*
// @match           https://trakt.tv/movies/*
// @match           https://www.themoviedb.org/tv/*
// @match           https://www.themoviedb.org/movie/*
// ==/UserScript==

// const logoWhite = "https://i.imgur.com/NnJVWwX.png";

const ICONS_ROOT = "https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/icons/";

// icons for CSFD page
const ICON_CSFD_GREY = ICONS_ROOT + "logoCSFDGrey.png"
const ICON_CSFD_BLUE = ICONS_ROOT + "logoCSFDBlue.png"
const ICON_CSFD_RED  = ICONS_ROOT + "logoCSFDRed.png"

// icon for CSFD lists
const ICON_CSFD_LIST = ICONS_ROOT + "logoCSFDList.png"

// icons for IMDB page
const ICON_IMDB = ICONS_ROOT + "logoIMDB.png"

const ICON_IMDB_EPISODE = ICONS_ROOT + "logoIMDBEpisode.png"

// icon for Trakt page
const ICON_TRAKT = ICONS_ROOT + "logoTrakt.png"

// Ymovie link 
const YMOVIE_LINK = "https://ymovie.herokuapp.com/#/scc/"

var indexStart = -1;
var indexEnd = -1;
var parentEl;
var childEl;

var br;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Inserts newly created node after the node - this is not standart function
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function getServiceURL(service, id) {
    return "https://plugin.sc2.zone/api/media/detail/service/" + service + "/" + id + "?access_token=9ajdu4xyn1ig8nxsodr3";
}

function getInfoFromResponse(res) {

    var streamsCount;
    if(res.available_streams.count > 0){
        streamsCount = res.available_streams.count;
    } else {
        streamsCount = '-';
    }
    var langs = '';
    if(res.available_streams.audio_languages.length > 0) {
        var i;
        for(i = 0; i < res.available_streams.audio_languages.length; i++) {
            if(langs != '') {
                langs = langs + ', ' + res.available_streams.audio_languages[i].lang.toUpperCase();
            } else {
                langs = res.available_streams.audio_languages[i].lang.toUpperCase();    
            }
        }
        //langs = res.available_streams.audio_languages.toString().toUpperCase();
    } else {
        langs = '-';
    }
    var subs;
    if(res.available_streams.subtitles_languages.length > 0) {
        subs = res.available_streams.subtitles_languages.toString().toUpperCase();
    } else {
        subs = '-';
    }

    return 'Streamu: ' + streamsCount + '\nAudio: ' + langs + '\nTitulky: ' + subs;
}

function getTraktURLFromresponse(response) {
    var res = JSON.parse(response);
    var slug = res.services.slug;
    if(slug) {
        var mediaType = res.info_labels.mediatype;
        var traktType;
        if(mediaType == 'movie') {
            traktType = 'movies';
        } else {
            traktType = 'shows';
        }
        return 'https://trakt.tv/' + traktType + '/' + slug;
    } else return 'https://trakt.tv/';
}

function getCSFDLogoByRating() {
    // get rating and set correct color of logo
    var ratingText = document.getElementsByClassName('average')[0].innerHTML;
    var rating = parseInt(ratingText.substring(0, ratingText.indexOf("%")));
    var sc2Src;
    if(rating < 30) {
        sc2Src = ICON_CSFD_GREY;
    } else if(rating < 70) {
        sc2Src = ICON_CSFD_BLUE;
    } else {
        sc2Src = ICON_CSFD_RED;
    }
    return sc2Src;
}

function getCSFDLink(traktURL, sc2Src, infoText) {
    // create a link node
    var link = document.createElement('a');
    link.href = traktURL;

    var sc2 = document.createElement('img');
    sc2.src = sc2Src;
    sc2.setAttribute('width', '128px');
    sc2.title = infoText;

    // append logo tolink node
    link.appendChild(sc2);

    return link;
}

function checkMediaCSFD(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('csfd', id), true);
    // xhttp.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // parse response...
            var res = JSON.parse(this.responseText);
            var infoText = getInfoFromResponse(res);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from CSFD id %o]', traktURL);

            var sc2Src = getCSFDLogoByRating();
            var link = getCSFDLink(traktURL, sc2Src, infoText);

            br = document.createElement('br');

            var ymlink = document.createElement('a');
            var ymlinkhref = "";
            if(res.info_labels.mediatype == "movie") {
                ymlinkhref = YMOVIE_LINK + "movie/" + res._id;
            } else if (res.info_labels.mediatype == "tvshow") {
                ymlinkhref = YMOVIE_LINK + "series/" + res._id;
            } else {
                ymlinkhref = YMOVIE_LINK + "season/" + res._id;
            }
            console.log('[SC2: Ymovie link: %o]', ymlinkhref);
            ymlink.href = ymlinkhref;
            ymlink.innerHTML = "<strong>YMovie link</strong>";

            var posterImg = document.getElementsByClassName('film-poster')[0];

            var divEl = document.createElement("div");
            divEl.setAttribute("style", "text-align: center;");
            divEl.appendChild(link);
            divEl.appendChild(br);
            divEl.appendChild(ymlink);

            insertAfter(divEl, posterImg);
        }
    };
}

function checkMediaCSFDEpisode(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('csfd', id), true);
    // xhttp.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // parse response...
            var res = JSON.parse(this.responseText);
            var infoText = getInfoFromResponse(res);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from CSFD id %o]', traktURL);

            var sc2Src = getCSFDLogoByRating();
            var link = getCSFDLink(traktURL, sc2Src, infoText);

            br = document.createElement('br');

            var ymlink = document.createElement('a');
            var ymlinkhref = YMOVIE_LINK + "episode/" + res._id;
            console.log('[SC2: Ymovie link: %o]', ymlinkhref);
            ymlink.href = ymlinkhref;
            ymlink.innerHTML = "<strong>YMovie link</strong>";


            var posterImg = document.getElementsByClassName('footer')[1];

            var divEl = document.createElement("div");
            divEl.setAttribute("style", "text-align: center;");
            divEl.appendChild(link);
            divEl.appendChild(br);
            divEl.appendChild(ymlink);

            insertAfter(divEl, posterImg);
        }
    };
}

function checkCSFDList(url, movieList) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", url, true);
    // xhttp.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // parse response...
            var data = (JSON.parse(this.responseText)).data;
            var mapData = new Map();
            var csfdid;
            var infoText;
            for(let i = 0; i < data.length; i++) {
                var source = data[i]._source;
                csfdid = source.services.csfd;
                infoText = getInfoFromResponse(source);
                mapData.set(csfdid, infoText)
            }

            for(let i = 0; i < movieList.length; i++) {
                var item = movieList[i];
                var el = item.childNodes[0];
                var title = el.innerHTML;
                var link = el.getAttribute('href');
                indexStart = link.indexOf('film/') + 5;
                indexEnd = link.indexOf('-');
                var id = link.substring(indexStart, indexEnd);
                if(mapData.has(id)) {
                    var sc2src = ICON_CSFD_LIST;
                    var sc2 = document.createElement('img');
                    sc2.src = sc2src;
                    sc2.setAttribute('width', '14px');
                    sc2.setAttribute('style', 'margin-right: 4px;');
                    sc2.title = mapData.get(id);
                    // link.appendChild(sc2);
                    item.insertBefore(sc2, el);
                }
            }


        }
    };

}

function checkMediaIMDB(id, inEpisode) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('imdb', id), true);
    // xhttp.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // parse response...
            var res = JSON.parse(this.responseText);
            var infoText = getInfoFromResponse(res);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from IMDB id %o]', traktURL);

            // create a link node
            var link = document.createElement('a');
            link.href = traktURL;

            var sc2 = document.createElement('img');
            sc2.title = infoText;

            if(inEpisode) {
                sc2.src = ICON_IMDB_EPISODE;
                sc2.setAttribute('height', '56px');
                sc2.setAttribute('style', 'margin-left: 20px;');
            } else {
                sc2.src = ICON_IMDB;
                sc2.setAttribute('height', '48px');
                sc2.setAttribute('style', 'margin-left: 20px;margin-bottom: 16px;');
            }

            // append logo to link node
            link.appendChild(sc2);

            var afterElement = document.getElementsByClassName("plot_summary")[0];
            insertAfter(link, afterElement);


        }
    };
}

function checkMediaTrakt(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('slug', id), true);
    // xhttp.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // parse response...
            var res = JSON.parse(this.responseText);
            var infoText = getInfoFromResponse(res);

            parentEl = document.getElementsByClassName('sidebar affixable affix-top')[0];
            childEl = parentEl.childNodes[1];

            var sc2 = document.createElement('img');
            sc2.src = ICON_TRAKT;
            sc2.title = infoText
            sc2.setAttribute('width', '173px');
            sc2.setAttribute('style', 'margin-top: 8px; margin-bottom: 8px;');

            parentEl.insertBefore(sc2, childEl);
        }
    };
}

async function checkMediaTMDB(id, slug, type) {
    var xhttp = new XMLHttpRequest();
    var xhttp2 = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('slug', slug), true);
    // xhttp.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp.send();
    var requestOK = false;
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            requestOK = true;
            // parse response...
            var res = JSON.parse(this.responseText);
            console.log("----- RESULT: " + res)
            var infoText = getInfoFromResponse(res);
            var traktURL = getTraktURLFromresponse(this.responseText);

            // create a link node
            var link = document.createElement('a');
            link.href = traktURL;

            var sc2 = document.createElement('img');
            sc2.title = infoText;
            sc2.src = ICON_TRAKT;
            sc2.setAttribute('width', '184px');
            sc2.setAttribute('style', 'margin-bottom: 12px;');

            // append logo to link node
            link.appendChild(sc2);

            var afterElement = document.getElementsByClassName('facts left_column')[0].firstChild;
            insertAfter(link, afterElement);
        }
    };

    console.log('[SC2: before sleep]');
    await sleep(1000);
    console.log('[SC2: after sleep]');
    
    xhttp2.open("GET", getServiceURL('tmdb', id), true);
    // xhttp2.setRequestHeader('Authorization', 'Basic 9ajdu4xyn1ig8nxsodr3');
    xhttp2.send();
    xhttp2.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            // parse response...
            var res = JSON.parse(this.responseText);
            console.log("----- RESULT: " + res)
            console.log("----- URL: " + getServiceURL('tmdb', id))
            var infoText = getInfoFromResponse(res);
            var traktURL = getTraktURLFromresponse(this.responseText);

            // create a link node if does not exist
            var scclink = document.getElementById('scclogo');
            if(requestOK == false) {
                var link = document.createElement('a');
                link.id = 'scclogo';
                link.href = traktURL;
    
                var sc2 = document.createElement('img');
                sc2.title = infoText;
                sc2.src = ICON_TRAKT;
                sc2.setAttribute('width', '184px');
                sc2.setAttribute('style', 'margin-bottom: 12px;');
    
                // append logo to link node
                link.appendChild(sc2);
    
                var afterElement = document.getElementsByClassName('facts left_column')[0].firstChild;
                insertAfter(link, afterElement);
            }

        }
    };
}

function sc2Integrate() {

    var href = window.location.href;
    if (href.indexOf('csfd.cz/film/') > 0) {
        // csfd.cz
        var csfdId;
        parentEl = document.getElementById("poster");
        if (parentEl) {
            indexStart = href.indexOf('film/') + 5;
            href = href.substring(indexStart);
            if(href.indexOf("-serie-") < 0) {
                indexStart = 0;
            } else {
                indexStart = href.indexOf("/") + 1;
            }
            indexEnd = href.indexOf('-', indexStart);
            csfdId = href.substring(indexStart, indexEnd);
            console.log('[SC2: CSFD id %o]', csfdId);
            checkMediaCSFD(csfdId);
        } else {
            // we do not have parent, we are in episode
            var filmIndex = href.indexOf('film/') + 5;
            indexStart = href.indexOf("/", filmIndex) + 1;
            indexEnd = href.indexOf("-", indexStart);
            csfdId = href.substring(indexStart, indexEnd);
            console.log('[SC2: CSFD id %o]', csfdId);
            checkMediaCSFDEpisode(csfdId);
        }

    } else if (href.indexOf('csfd.cz/podrobne-vyhledavani/') > 0) {
        // csfd.cz - search
        var movieList = document.getElementsByClassName('name');
        var url = "https://plugin.sc2.zone/api/media/filter/service?type=*&service=csfd"
        for(let i = 0; i < movieList.length; i++) {
            var item = movieList[i];
            var el = item.childNodes[0];
            var title = el.innerHTML;
            var link = el.getAttribute('href');
            indexStart = link.indexOf('film/') + 5;
            indexEnd = link.indexOf('-');
            var id = link.substring(indexStart, indexEnd);
            url = url + "&value=" + id;
        }
        url = url + "&access_token=9ajdu4xyn1ig8nxsodr3"
        checkCSFDList(url, movieList);

    } else if (href.indexOf('csfd.cz/zebricky/') > 0) {
        // csfd.cz - search
        movieList = document.getElementsByClassName('film');
        url = "https://plugin.sc2.zone/api/media/filter/service?type=*&service=csfd"
        for(let i = 0; i < movieList.length; i++) {
            item = movieList[i];
            el = item.childNodes[0];
            title = el.innerHTML;
            link = el.getAttribute('href');
            indexStart = link.indexOf('film/') + 5;
            indexEnd = link.indexOf('-');
            id = link.substring(indexStart, indexEnd);
            url = url + "&value=" + id;
        }
        url = url + "&limit=300&access_token=9ajdu4xyn1ig8nxsodr3"
        checkCSFDList(url, movieList);

    } else if (href.indexOf('imdb.com') >0) {
        // imdb.com
        indexStart = href.indexOf('title/') + 6;
        indexEnd = href.lastIndexOf('/');
        var imdbId = href.substring(indexStart, indexEnd);
        console.log('[SC2: IMDB id %o]', imdbId);

        parentEl = document.getElementsByClassName('uc-add-wl-button uc-add-wl--not-in-wl uc-add-wl')[0];
        if (parentEl) {
            var inEpisode = false;
            if(href.indexOf("ref_=ttep") > 0) {
                // means we are in episode
                inEpisode = true;
            }
            checkMediaIMDB(imdbId, inEpisode);
        }

    } else if (href.indexOf('trakt.tv') > 0) {
        // trakt.tv
        var info = document.getElementsByClassName('summary-user-rating')[0];

        if (info) {
            indexStart = href.indexOf('movies/');
            if(indexStart > -1) {
                indexStart += 7;
            } else {
                indexStart = href.indexOf('shows/') + 6;
            }
            var slug = href.substring(indexStart);
            if(slug.indexOf('/') == -1) {
                console.log('[SC2: slug %o]', slug);
                checkMediaTrakt(slug);
            }
        }
    
    } else if (href.indexOf('themoviedb.org') > 0) {
        // TMDB
        slug = '';
        indexStart = href.indexOf('-') + 1;
        if(indexStart > 0) {
            slug = href.substring(indexStart);
        }
        
        var tmdbId = ''
        indexStart = href.lastIndexOf('/') + 1;
        indexEnd = href.indexOf('-');
        if(indexEnd > 0) {
            tmdbId = href.substring(indexStart, indexEnd);
        } else {
            tmdbId = href.substring(indexStart);
        }
        
        var type = 'movie';
        if(href.indexOf('tv/') > -1) {
            type = 'tv';
        }

        console.log('[SC2: TMDB id: %o, slug: %o, type: %o]', tmdbId, slug, type);
        checkMediaTMDB(tmdbId, slug, type);
    }

}

sc2Integrate();