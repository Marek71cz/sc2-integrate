// ==UserScript==
// @name SC2-integrate
// @license MIT
// @version 0.9
// @downloadURL https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/sc2-integrate.js
// @updateURL https://raw.githubusercontent.com/Marek71cz/sc2-integrate/master/sc2-integrate.js
// @description Integrace SC2 do CSFD, IMDB a TRAKT.TV.
// @match https://www.csfd.cz/film/*
// @match https://www.imdb.com/title/*
// @match https://trakt.tv/shows/*
// @match https://trakt.tv/movies/*
// ==/UserScript==

const href = window.location.href;

const sc2logoWhite = "https://sc2.zone/logo/seda.png";
const sc2logoGrey = "https://i.ibb.co/YXdTfF9/logo-seda1.png";
const sc2logoBlue = "https://sc2.zone/logo/modra.png";
const sc2logoRed = "https://sc2.zone/logo/cervena.png";


var indexStart = -1;
var indexEnd = -1;
var parentEl;
var childEl;
var sc2;
var sc2src;

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

    // ToDo: stream info, video?
    /*    
    var mediaId = res._id;
    console.log('[SC2: Stream id %o]', mediaId);
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", 'https://plugin.sc2.zone/api/media/' + mediaId + '/streams', true);
    xhttp.send();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            res = this.responseText;
            var firstVideo = res[0];
            console.log('[SC2: video %o]', firstVideo);
            var codec = firstVideo.codec;
            var width = firstVideo.width;
            var height; 
            if(width == 1920) {
                height = '1080';
            }
            console.log('[SC2: Stream info %o]', codec + ', ' + width);
        }
    }  
    */

    return 'Streamu: ' + streamsCount + '\nAudio: ' + langs + '\nTitulky: ' + subs;
}

function getTraktURLFromresponse(response) {
    var res = JSON.parse(response); 
    var slug = res.services.slug;
    var mediaType = res.info_labels.mediatype;
    var traktType;
    if(mediaType == 'movie') {
        traktType = 'movies';
    } else {
        traktType = 'shows';
    }
    return 'https://trakt.tv/' + traktType + '/' + slug;
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
            
            // get rating and set correct color of logo
            var ratingText = document.getElementsByClassName('average')[0].innerHTML;
            var rating = parseInt(ratingText.substring(0, ratingText.indexOf("%")));
            if(rating < 25) {
                sc2src = sc2logoGrey;
            } else if(rating < 70) {
                sc2src = sc2logoBlue;
            } else {
                sc2src = sc2logoRed;
            }
            
            // create a link node
            var link = document.createElement('a');
            link.href = traktURL;

            sc2 = document.createElement('img');
            sc2.src = sc2src;
            sc2.setAttribute('width', '128px');
            sc2.title = infoText;
            
            // append logo tolink node
            link.appendChild(sc2);
            
            br = document.createElement('br');
            
            var posterImg = document.getElementsByClassName('film-poster')[0];
            insertAfter(link, posterImg);
            insertAfter(br, posterImg);
        }
    };
}

function checkMediaIMDB(id) {
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
            sc2 = document.createElement('img');
            sc2.src = sc2logoBlue;
            sc2.setAttribute('height', '48px');
            sc2.title = infoText;
            sc2.setAttribute('style', 'margin-left: 16px; margin-bottom: 12px;');

            // append logo to link node
            link.appendChild(sc2);

            parentEl.insertBefore(link, childEl);
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
    
            sc2 = document.createElement('img');
            sc2.src = sc2logoGrey;
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
        parentEl = document.getElementById("poster"); 
        if (parentEl) {
            indexStart = href.indexOf('film/') + 5;
            indexEnd = href.indexOf('-');
            var csfdId = href.substring(indexStart, indexEnd);
            console.log('[SC2: CSFD id %o]', csfdId);
            checkMediaCSFD(csfdId);
        }
        
    } else if (href.indexOf('imdb.com') >0) {
        // imdb.com
        indexStart = href.indexOf('title/') + 6;
        indexEnd = href.lastIndexOf('/');
        var imdbId = href.substring(indexStart, indexEnd);
        console.log('[SC2: IMDB id %o]', imdbId);
        
        parentEl = document.getElementsByClassName('uc-add-wl-button uc-add-wl--not-in-wl uc-add-wl')[0];
        if (parentEl) {
            checkMediaIMDB(imdbId);
        }
        
    } else if (href.indexOf('trakt.tv') > 0) {
        // trakt.tv
        var info = document.getElementsByClassName('summary-user-rating')[0];
        
        if (info) {
            var slug = href.substring(href.indexOf('shows/') + 6);
            if(slug.indexOf('/') == -1) {
                console.log('[SC2: slug %o]', slug);
                checkMediaTrakt(slug);
            }
        }
    }

}

sc2Integrate();
