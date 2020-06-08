// ==UserScript==
// @name SC2-integrate
// @license MIT
// @version 0.1
// @description Integrace SC2 do CSFD. IMDB a TRAKT.TV v planu.
// @match https://www.csfd.cz/film/*
// @match https://www.imdb.com/title/*
// @match https://trakt.tv/*
// ==/UserScript==

function sc2Integrate() {

    const href = window.location.href;
    console.log('[SC2] href =  %o', href);

    if (href.indexOf('trakt.tv') > 0) {
        // trakt.tv
    } else if (href.indexOf('imdb.com') >0) {
        // imdb.com
    } else if (href.indexOf('csfd.cz/film/') > 0) {
        // csfd.cz
        var indexStart = href.indexOf('film/') + 5;
        var indexEnd = href.indexOf('-');
        var csfdId = href.substring(indexStart, indexEnd);
        console.log('[SC2: CSFD id %]', csfdId);
        
        // check CSFD ID, whether movie (TV Show) exists in SC2 database
        // if yes - dipslay SC2 logo
        var poster = document.getElementById("poster");     
        var allPosters = document.getElementById("show-all-posters");     
        var element = document.createElement('img');
        element.src = 'https://forum.sc2.zone/assets/logo-2i7unhce.png';
        var br = document.createElement('br');
        
        poster.insertBefore(element, allPosters);
        poster.insertBefore(br, allPosters);
        
        return;
        
    }
}

sc2Integrate();
