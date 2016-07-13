"use strict";

const LEADERBOARD_SIZE = 10;

class Leaderboard {

    constructor () {
        this.db = fbApp.database();
    }

    getUserInfo (username, callback) {
        this.db.ref('userdata/' + username).once('value', (snapshot) => {
            callback(username, snapshot.val());
        });
    }

    getHighScores (callback) {
        this.db.ref('userdata').orderByChild('totalScore').limitToLast(LEADERBOARD_SIZE).once('value', (snapshot) => {
            var board = [];
            snapshot.forEach((data) => {
                board.push({user: data.key, data: data.val()});
            });
            board.reverse();
            callback(board);
        });
    }

    updateUserScore (username, level, score, totalScore) {
        this.db.ref('userdata/' + username + '/totalScore').once('value', (snapshot) => {
            this.db.ref('userdata/' + username + '/totalScore').set(Math.max(snapshot.val(), totalScore));
        });
        this.db.ref('userdata/' + username + '/levels/' + level.toString()).set(score);
    }

    addUser (username) {
        this.db.ref('userdata/' + username + '/totalScore').set(0);
        this.db.ref('userdata/' + username + '/levels/').set({});
    }

}