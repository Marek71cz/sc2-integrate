// ==UserScript==
// @name SC2-integrate
// @license MIT
// @version 0.2
// @description Integrace SC2 do CSFD, IMDB a TRAKT.TV.
// @match https://www.csfd.cz/film/*
// @match https://www.imdb.com/title/*
// @match https://trakt.tv/shows/*
// @match https://trakt.tv/movies/*
// ==/UserScript==

function sc2Integrate() {

    const href = window.location.href;
    const sc2Src = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';
    
    var indexStart = -1;
    var indexEnd = -1;
    var parentEl;
    var childEl;
    var sc2;
    var br;

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
            childEl = document.getElementById("show-all-posters");     
            sc2 = document.createElement('img');
            sc2.src = sc2Src;
            sc2.title = 'Media info by SC2 API...';
            br = document.createElement('br');
            
            parentEl.insertBefore(sc2, childEl);
            parentEl.insertBefore(br, childEl);
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
            sc2.src = sc2Src;
            sc2.title = 'Media info by SC2 API...';
            sc2.setAttribute('style', 'margin-left: 16px; margin-bottom: 22px;');
            
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
            sc2.src = sc2Src;
            sc2.title = 'Media info by SC2 API...';
            sc2.setAttribute('width', '173px');
            sc2.setAttribute('style', 'margin-top: 8px; margin-bottom: 8px;');
            
            parentEl.insertBefore(sc2, childEl);
        }
    }

}

sc2Integrate();
