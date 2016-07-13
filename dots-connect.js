"use strict";
var playfield;
var scene;
var game;
var menu;
var storage;
var fbApp;
var leaderboard;

function init() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyDYgHZ_7RRrDt7bpjhZRmQ2V2shCCQ8fUk",
        authDomain: "dots-connect.firebaseapp.com",
        databaseURL: "https://dots-connect.firebaseio.com",
        storageBucket: "dots-connect.appspot.com",
    };
    fbApp = firebase.initializeApp(config);
	playfield = document.getElementById('playfield');
    playfield.style.width = playfield.style.height = (Math.min(window.innerHeight, window.innerWidth) * 0.8 | 0) + 'px';
    leaderboard = new Leaderboard();
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
    result.className = 'fadeOut';
    result.width = 500;
    result.height = 500;
    playfield.appendChild(result);
    return result;
}