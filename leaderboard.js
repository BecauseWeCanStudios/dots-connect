const LEADERBOARD_SIZE = 10;

class leaderboard {

    constructor () {
        this.db = fbApp.database();
    }

    refresh (callback) {
        this.db.ref('leaderboard').orderByValue().limitToLast(LEADERBOARD_SIZE).once('value', (snapshot) => {
            this.board = [];
            snapshot.forEach((data) => {
                this.board.push({user: data.key, score: data.val()});
            });
            this.board.reverse();
            if (callback)
                callback(this.board);
        });
    }

    update (username, score) {
        this.db.ref('leaderboard/' + username).on('value', (snapshot) => {
            this.db.ref('leaderboard/' + username).set(Math.max(score, snapshot.val()));
        });
    }

}