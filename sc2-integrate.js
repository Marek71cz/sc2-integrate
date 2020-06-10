// ==UserScript==
// @name SC2-integrate
// @license MIT
// @version 0.3
// @description Integrace SC2 do CSFD, IMDB a TRAKT.TV.
// @match https://www.csfd.cz/film/*
// @match https://www.imdb.com/title/*
// @match https://trakt.tv/shows/*
// @match https://trakt.tv/movies/*
// ==/UserScript==

const href = window.location.href;

// ToDo: it is white
const sc2logoGrey = 'https://db.sc2.zone/assets/images/logo.png';
// ToDo: it is blue
const sc2logoBlue = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';
const sc2logoRed  = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';


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

// ToDo:
function checkMedia(service, search) {
    if(service == 'csfd') {
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", "https://plugin.sc2.zone/api/db/validate/media", true);
        xhttp.setRequestHeader("content-type", "application/json");
        xhttp.setRequestHeader("accept", "application/json");
        xhttp.send(JSON.stringify(search));
        // xhttp.send();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                console.log('[SC2: CSFD response status %o]', this.status);
                // parse response...
                
                // get rating
                var ratingNode = document.getElementsByClassName('average')[0];
                console.log('[SC2: CSFD rating node %o]', ratingNode);
                var ratingText = ratingNode.innerHTML;
                var rating = parseInt(ratingText.substring(0, ratingText.indexOf("%")));
                if(rating < 25) {
                    sc2src = sc2logoGrey;
                } else if(rating < 75) {
                    sc2src = sc2logoBlue;
                } else {
                    sc2src = sc2logoRed;
                }
                console.log('[SC2: CSFD rating %o]', rating);
                
                sc2 = document.createElement('img');
                sc2.src = sc2src;
                sc2.setAttribute('width', '128px');
                sc2.title = 'Media info by SC2 API...';
                br = document.createElement('br');
                
                posterImg = document.getElementsByClassName('film-poster')[0];
                insertAfter(sc2, posterImg);
                insertAfter(br, posterImg);
            }
        };
        
    } else {
        return;
    }
}


function sc2Integrate() {

    if (href.indexOf('csfd.cz/film/') > 0) {
        // csfd.cz
        indexStart = href.indexOf('film/') + 5;
        indexEnd = href.indexOf('-');
        var csfdId = href.substring(indexStart, indexEnd);
        console.log('[SC2: CSFD id %o]', csfdId);
        
        parentEl = document.getElementById("poster"); 
        if (parentEl) {
            // This means we are in TV show or episodes view
            // check CSFD ID, whether movie (TV Show) exists in SC2 database
            // if yes - dipslay SC2 logo

            // Only temporary, real check is for csfd id
            var title = href.substring(href.indexOf('-')+1);
            title = title.substring(0, title.indexOf('/')).replace(/-/g,' ');
            var csfdSearch = [csfdId];// "[\"" + csfdId + "\"]}";
            console.log('[SC2: CSFD ID %o]', csfdId);   
            console.log('[SC2: CSFD search %o]', csfdSearch);
            
            checkMedia('csfd', csfdSearch);
            // console.log('[SC2: CSFD status %o]', status);   
            
        }
        
    } else if (href.indexOf('imdb.com') >0) {
        // imdb.com
        indexStart = href.indexOf('title/') + 6;
        indexEnd = href.lastIndexOf('/');
        var imdbId = href.substring(indexStart, indexEnd);
        console.log('[SC2: IMDB id %o]', imdbId);
        
        parentEl = document.getElementsByClassName('uc-add-wl-button uc-add-wl--not-in-wl uc-add-wl')[0];
        if (parentEl) {
            // check IMDB ID, whether movie (TV Show) exists in SC2 database
            // if yes - dipslay SC2 logo
            childEl = parentEl.childNodes[0];
            sc2 = document.createElement('img');
            sc2.src = sc2logoBlue;
            sc2.setAttribute('height', '48px');
            sc2.title = 'Media info by SC2 API...';
            sc2.setAttribute('style', 'margin-left: 16px; margin-bottom: 12px;');
            
            parentEl.insertBefore(sc2, childEl);
        }
        
    } else if (href.indexOf('trakt.tv') > 0) {
        // trakt.tv
        var info = document.getElementsByClassName('summary-user-rating')[0];
        
        if (info) {
            var dataType = info.getAttribute('data-type');
            console.log('[SC2: TRAKT.TV type %o]', dataType);
            var traktId = null;
            
            if (dataType == 'movie') {
                traktId = info.getAttribute('data-movie-id');
            } else if (dataType == 'show' || dataType == 'episode') {
                traktId = info.getAttribute('data-show-id');
            }
            console.log('[SC2: TRAKT.TV id %o]', traktId);
            
            // check TRAKT ID, whether movie (TV Show) exists in SC2 database
            // if yes - dipslay SC2 logo
            parentEl = document.getElementsByClassName('sidebar affixable affix-top')[0];
            childEl = parentEl.childNodes[1];
    
            sc2 = document.createElement('img');
            sc2.src = sc2logoBlue;
            sc2.title = 'Media info by SC2 API...';
            sc2.setAttribute('width', '173px');
            sc2.setAttribute('style', 'margin-top: 8px; margin-bottom: 8px;');
            
            parentEl.insertBefore(sc2, childEl);
        }
    }

}

sc2Integrate();
