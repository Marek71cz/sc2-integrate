// ==UserScript==
// @name SC2-integrate
// @license MIT
// @version 1.4
// @downloadURL https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/sc2-integrate.user.js
// @updateURL https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/sc2-integrate.user.js
// @description Integrace SC2 do CSFD, IMDB a TRAKT.TV.
// @match https://www.csfd.cz/film/*
// @match https://www.csfd.cz/podrobne-vyhledavani/*
// @match https://www.imdb.com/title/*
// @match https://trakt.tv/shows/*
// @match https://trakt.tv/movies/*
// ==/UserScript==

const href = window.location.href;

const sc2logoWhite = "https://sc2.zone/logo/seda.png";
const sc2logoGrey = "https://i.ibb.co/YXdTfF9/logo-seda1.png";
const sc2logoBlue = "https://sc2.zone/logo/modra.png";
const sc2logoRed = "https://sc2.zone/logo/cervena.png";
//const sc2logoRed = "https://i.ibb.co/sQfThKr/logo128cervena.png";
const sclogoIMDB = "https://i.ibb.co/t31x4Nt/IMDBmodra.png"
const sclogoTrakt = "https://i.ibb.co/K2092G4/TRAKTseda.png"

const sc2LogoClearGrey = "https://i.ibb.co/BtJyPYj/CSFDseda2.png";
const sc2LogoClearBlue = "https://i.ibb.co/Ptt7NP3/IMDBclr-M2.png"

var indexStart = -1;
var indexEnd = -1;
var parentEl;
var childEl;
// var sc2;
// var sc2src;

var br;

// Inserts newly created node after the node - this is not standart function
function insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}

function getServiceURL(service, id) {
    return "https://plugin.sc2.zone/api/media/detail/service/" + service + "/" + id;
}

function getInfoFromResponse(response) {
    var res = JSON.parse(response);
    
    var streamsCount;
    if(res.available_streams.count > 0){
        streamsCount = res.available_streams.count;
    } else {
        streamsCount = '-';
    }
    var langs;
    if(res.available_streams.audio_languages.length > 0) {
        langs = res.available_streams.audio_languages.toString().toUpperCase();
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
    if(rating < 25) {
        sc2Src = sc2logoGrey;
    } else if(rating < 70) {
        sc2Src = sc2logoBlue;
    } else {
        sc2Src = sc2logoRed;
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
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
            // parse response...
            var infoText = getInfoFromResponse(this.responseText);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from CSFD id %o]', traktURL);
            
            var sc2Src = getCSFDLogoByRating();
            var link = getCSFDLink(traktURL, sc2Src, infoText);

            br = document.createElement('br');
            
            var posterImg = document.getElementsByClassName('film-poster')[0];
            insertAfter(link, posterImg);
            insertAfter(br, posterImg);
        }
    };
}

function checkMediaCSFDEpisode(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('csfd', id), true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
            // parse response...
            var infoText = getInfoFromResponse(this.responseText);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from CSFD id %o]', traktURL);
            
            var sc2Src = getCSFDLogoByRating();
            var link = getCSFDLink(traktURL, sc2Src, infoText);

            br = document.createElement('br');
            
            var posterImg = document.getElementsByClassName('footer')[1];
            insertAfter(link, posterImg);
            insertAfter(br, posterImg);
        }
    };
}

// ToDo: Too many requests - SC2 server blocks!
/*
function checkCSFDList(item) {
    // get first child node of td with movie name
    var el = item.childNodes[0];
    var title = el.innerHTML;
    var link = el.getAttribute('href');
    indexStart = link.indexOf('film/') + 5;
    indexEnd = link.indexOf('-');
    var csfdId = link.substring(indexStart, indexEnd);
    console.log('[SC2: CSFD search, movie: %o]', title + ', csfd Id: ' + csfdId);
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('csfd', csfdId), true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
            // parse response...
            var infoText = getInfoFromResponse(this.responseText);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from CSFD id %o]', traktURL);
            
            var sc2src = sc2LogoClear;
            
            // create a link node
            var link = document.createElement('a');
            link.href = traktURL;

            sc2 = document.createElement('img');
            sc2.src = sc2src;
            sc2.setAttribute('width', '16px');
            sc2.title = infoText;
            
            // append logo tolink node
            link.appendChild(sc2);
            
            item.insertBefore(link, el);
        }
    };
    
}
*/

function checkMediaIMDB(id, inEpisode) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('imdb', id), true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
            // parse response...
            var infoText = getInfoFromResponse(this.responseText);
            var traktURL = getTraktURLFromresponse(this.responseText);
            console.log('[SC2: Trakt URL from IMDB id %o]', traktURL);

            // create a link node
            var link = document.createElement('a');
            link.href = traktURL;

            childEl = parentEl.childNodes[0];
            var sc2 = document.createElement('img');
            sc2.title = infoText;
            
            if(inEpisode) {
                sc2.src = sc2LogoClearBlue;
                sc2.setAttribute('height', '56px');
                sc2.setAttribute('style', 'margin-bottom: 16px;');
            } else {
                sc2.src = sclogoIMDB;
                sc2.setAttribute('height', '48px');
                sc2.setAttribute('style', 'margin-bottom: 12px;');
            }            

            // append logo to link node
            link.appendChild(sc2);

            // parentEl.insertBefore(link, childEl);
            var afterElement = document.getElementsByClassName("ipc-button uc-add-wl-button-icon--add watchlist--title-main-desktop-standalone ipc-button--core-base ipc-button--single-padding ipc-button--default-height")[0];
            insertAfter(link, afterElement);
            
            
        }
    };
}

function checkMediaTrakt(id) {
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", getServiceURL('slug', id), true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) { 
            // parse response...
            var infoText = getInfoFromResponse(this.responseText);

            parentEl = document.getElementsByClassName('sidebar affixable affix-top')[0];
            childEl = parentEl.childNodes[1];
    
            var sc2 = document.createElement('img');
            sc2.src = sclogoTrakt;
            sc2.title = infoText
            sc2.setAttribute('width', '173px');
            sc2.setAttribute('style', 'margin-top: 8px; margin-bottom: 8px;');
            
            parentEl.insertBefore(sc2, childEl);
        }
    };
}

function sc2Integrate() {

    if (href.indexOf('csfd.cz/film/') > 0) {
        // csfd.cz
        var csfdId;
        parentEl = document.getElementById("poster"); 
        if (parentEl) {
            indexStart = href.indexOf('film/') + 5;
            indexEnd = href.indexOf('-');
            csfdId = href.substring(indexStart, indexEnd);
            console.log('[SC2: CSFD id %o]', csfdId);
            checkMediaCSFD(csfdId);
        } else {
            // we do not have prent, we are in episode
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
        var i;
        for(i = 0; i < movieList.length; i++) {
            // checkCSFDList(movieList[i]);
        }
         
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
    }

}

sc2Integrate();
