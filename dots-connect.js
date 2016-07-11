"use strict";
var playfield;
var scene;

function init() {
	playfield = document.getElementById('playfield');
    var game = new Game();
    scene = new Gamefield(initSceneCanvas('main-scene'), game);
}

function initSceneCanvas(name) {
    var result = document.createElement('canvas');
    result.id = name;
    result.style = 'border: solid 1px';
    result.width = 500;
    result.height = 500;
    playfield.appendChild(result);
    return result;
}