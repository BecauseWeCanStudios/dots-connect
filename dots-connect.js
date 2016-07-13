"use strict";
var playfield;
var scene;
var game;
var menu;
var storage;

function init() {
	playfield = document.getElementById('playfield');
    playfield.style.width = playfield.style.height = (Math.min(window.innerHeight, window.innerWidth) * 0.8 | 0) + 'px';
    storage = new levelStorage();
    game = new Game();
    menu = new Menu(playfield, game);
    //scene = new Gamefield(initSceneCanvas('main-scene'), game);
    //game.setScene(scene);
    //game.selectLevel(-1);
    //game.startNewGame();
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