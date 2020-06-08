// ==UserScript==
// @name SC2-integrate
// @license MIT
// @version 0.2
// @description Integrace SC2 do CSFD. IMDB a TRAKT.TV v planu.
// @match https://www.csfd.cz/film/*
// @match https://www.imdb.com/title/*
// @match https://trakt.tv/*
// ==/UserScript==

function sc2Integrate() {

    const href = window.location.href;
    console.log('[SC2] href =  %o', href);
    
    var indexStart = -1;
    var indexEnd = -1;
    var parentEl;
    var childEl;
    var sc2;
    var br;

    if (href.indexOf('trakt.tv') > 0) {
        // trakt.tv
        var info = document.getElementsByClassName('summary-user-rating')[0];
        var traktId = info.getAttribute('data-movie-id');
        console.log('[SC2: TRAKT.TV id %o]', traktId);
        
        parentEl = document.getElementsByClassName('sidebar affixable affix-top')[0];
        childEl = parentEl.childNodes[1];

        sc2 = document.createElement('img');
        sc2.src = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';
        sc2.setAttribute('width', '173px');
        sc2.setAttribute('style', 'margin-top: 8px; margin-bottom: 8px;');
        
        parentEl.insertBefore(sc2, childEl);
        
        return;

    } else if (href.indexOf('imdb.com') >0) {
        // imdb.com
        indexStart = href.indexOf('title/') + 6;
        indexEnd = href.lastIndexOf('/');
        var imdbId = href.substring(indexStart, indexEnd);
        console.log('[SC2: IMDB id %o]', imdbId);
        
        parentEl = document.getElementsByClassName('uc-add-wl-button uc-add-wl--not-in-wl uc-add-wl')[0];
        childEl = parentEl.childNodes[0];
        sc2 = document.createElement('img');
        sc2.src = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';
        sc2.setAttribute('style', 'margin-left: 16px; margin-bottom: 22px;');
        
        parentEl.insertBefore(sc2, childEl);
        
        return;
        
    } else if (href.indexOf('csfd.cz/film/') > 0) {
        // csfd.cz
        indexStart = href.indexOf('film/') + 5;
        indexEnd = href.indexOf('-');
        var csfdId = href.substring(indexStart, indexEnd);
        console.log('[SC2: CSFD id %o]', csfdId);
        
        // check CSFD ID, whether movie (TV Show) exists in SC2 database
        // if yes - dipslay SC2 logo
        parentEl = document.getElementById("poster");     
        childEl = document.getElementById("show-all-posters");     
        sc2 = document.createElement('img');
        sc2.src = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';
        br = document.createElement('br');
        
        parentEl.insertBefore(sc2, childEl);
        parentEl.insertBefore(br, childEl);
        
        return;
        
    }
}

sc2Integrate();
