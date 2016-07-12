"use strict";
var playfield;
var scene;
var game;

function init() {
	playfield = document.getElementById('playfield');
    game = new Game();
    scene = new Gamefield(initSceneCanvas('main-scene'), game);
    game.view = scene;
    game.selectLevel(-1);
    game.startNewGame();
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