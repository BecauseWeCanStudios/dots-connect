const LEADERBOARD_SIZE = 10;

class Leaderboard {

    constructor () {
        this.db = fbApp.database();
    }

    refreshScores (callback) {
        this.db.ref('leaderboard').orderByValue().limitToLast(LEADERBOARD_SIZE).once('value', (snapshot) => {
            var board = [];
            snapshot.forEach((data) => {
                board.push({user: data.key, score: data.val()});
            });
            board.reverse();
            callback(board);
        });
    }

    updateScore (username, score) {
        this.db.ref('leaderboard/' + username).on('value', (snapshot) => {
            this.db.ref('leaderboard/' + username).set(Math.max(score, snapshot.val()));
        });
    }

    updatePassedLevel (username, levelNumber) {
        this.db.ref('passedLevels/' + username + '/' + levelNumber.toString()).set(1);
    }

    getPassedLevels (username, callback) {
        this.db.ref('passedLevels/' + username + '/').orderByKey().once('value', (snapshot) => {
            var levels = [];
            snapshot.forEach((data) => {
                levels.push(data.key * 1);
            });
            callback(levels);
        });
    }

    getUserInfo (username, callback) {
        this.getPassedLevels(username, (levels) => {
            this.db.ref('leaderboard/' + username).on('value', (snapshot) => {
                callback({score: snapshot.val(), levels: levels});
            });
        })
    }

}