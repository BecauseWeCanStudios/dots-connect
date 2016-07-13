"use strict";

const levels = [
    '{"puzzle":[[1,0,0,1,2],[2,0,0,0,0],[3,0,0,0,0],[4,0,0,4,0],[3,0,0,0,0]],"solution":[[1,1,1,1,2],[2,2,2,2,2],[3,3,3,3,3],[4,4,4,4,3],[3,3,3,3,3]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0}],"2":[{"x":4,"y":0},{"x":4,"y":1},{"x":3,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":0,"y":1}],"3":[{"x":0,"y":2},{"x":1,"y":2},{"x":2,"y":2},{"x":3,"y":2},{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4},{"x":3,"y":4},{"x":2,"y":4},{"x":1,"y":4},{"x":0,"y":4}],"4":[{"x":0,"y":3},{"x":1,"y":3},{"x":2,"y":3},{"x":3,"y":3}]}}',
    '{"puzzle":[[1,0,0,0,0],[2,0,0,0,0],[0,3,4,0,0],[0,0,0,0,0],[3,4,2,0,1]],"solution":[[1,1,1,1,1],[2,2,2,2,1],[3,3,4,2,1],[3,4,4,2,1],[3,4,2,2,1]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":4,"y":1},{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4}],"2":[{"x":0,"y":1},{"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":3,"y":2},{"x":3,"y":3},{"x":3,"y":4},{"x":2,"y":4}],"3":[{"x":1,"y":2},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4}],"4":[{"x":2,"y":2},{"x":2,"y":3},{"x":1,"y":3},{"x":1,"y":4}]}}',
    '{"puzzle":[[1,2,0,0,0],[0,0,0,0,0],[0,0,0,0,2],[0,4,3,0,1],[3,0,0,0,4]],"solution":[[1,2,2,2,2],[1,1,1,1,2],[3,3,3,1,2],[3,4,3,1,1],[3,4,4,4,4]],"flows":{"1":[{"x":0,"y":0},{"x":0,"y":1},{"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":3,"y":2},{"x":3,"y":3},{"x":4,"y":3}],"2":[{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":4,"y":1},{"x":4,"y":2}],"3":[{"x":2,"y":3},{"x":2,"y":2},{"x":1,"y":2},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4}],"4":[{"x":1,"y":3},{"x":1,"y":4},{"x":2,"y":4},{"x":3,"y":4},{"x":4,"y":4}]}}',
    '{"puzzle":[[0,1,0,0,2],[0,0,0,0,3],[0,0,3,0,4],[0,0,0,0,0],[0,0,1,2,4]],"solution":[[1,1,2,2,2],[1,2,2,3,3],[1,2,3,3,4],[1,2,2,2,4],[1,1,1,2,4]],"flows":{"1":[{"x":1,"y":0},{"x":0,"y":0},{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4},{"x":1,"y":4},{"x":2,"y":4}],"2":[{"x":4,"y":0},{"x":3,"y":0},{"x":2,"y":0},{"x":2,"y":1},{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3},{"x":2,"y":3},{"x":3,"y":3},{"x":3,"y":4}],"3":[{"x":4,"y":1},{"x":3,"y":1},{"x":3,"y":2},{"x":2,"y":2}],"4":[{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4}]}}',
    '{"puzzle":[[1,0,0,1,2],[0,0,0,0,0],[0,0,0,0,4],[0,3,2,0,0],[0,0,0,3,4]],"solution":[[1,1,1,1,2],[2,2,2,2,2],[2,3,3,3,4],[2,3,2,3,4],[2,2,2,3,4]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0}],"2":[{"x":4,"y":0},{"x":4,"y":1},{"x":3,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4},{"x":1,"y":4},{"x":2,"y":4},{"x":2,"y":3}],"3":[{"x":1,"y":3},{"x":1,"y":2},{"x":2,"y":2},{"x":3,"y":2},{"x":3,"y":3},{"x":3,"y":4}],"4":[{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4}]}}',

    '{"puzzle":[[0,0,0,0,0,0],[0,2,0,0,3,0],[0,0,0,0,4,0],[0,0,0,0,1,0],[0,2,3,0,0,4],[0,0,0,0,0,1]],"solution":[[1,1,1,1,1,1],[1,2,3,3,3,1],[1,2,3,4,4,1],[1,2,3,4,1,1],[1,2,3,4,4,4],[1,1,1,1,1,1]],"flows":{"1":[{"x":4,"y":3},{"x":5,"y":3},{"x":5,"y":2},{"x":5,"y":1},{"x":5,"y":0},{"x":4,"y":0},{"x":3,"y":0},{"x":2,"y":0},{"x":1,"y":0},{"x":0,"y":0},{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4},{"x":0,"y":5},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":5},{"x":4,"y":5},{"x":5,"y":5}],"2":[{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4}],"3":[{"x":4,"y":1},{"x":3,"y":1},{"x":2,"y":1},{"x":2,"y":2},{"x":2,"y":3},{"x":2,"y":4}],"4":[{"x":4,"y":2},{"x":3,"y":2},{"x":3,"y":3},{"x":3,"y":4},{"x":4,"y":4},{"x":5,"y":4}]}}',
    '{"puzzle":[[1,0,0,1,2,3],[2,0,0,0,0,0],[4,0,0,4,0,0],[0,0,0,0,0,5],[0,5,0,0,0,0],[0,0,0,0,0,3]],"solution":[[1,1,1,1,2,3],[2,2,2,2,2,3],[4,4,4,4,3,3],[3,3,3,3,3,5],[3,5,5,5,5,5],[3,3,3,3,3,3]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0}],"2":[{"x":4,"y":0},{"x":4,"y":1},{"x":3,"y":1},{"x":2,"y":1},{"x":1,"y":1},{"x":0,"y":1}],"3":[{"x":5,"y":0},{"x":5,"y":1},{"x":5,"y":2},{"x":4,"y":2},{"x":4,"y":3},{"x":3,"y":3},{"x":2,"y":3},{"x":1,"y":3},{"x":0,"y":3},{"x":0,"y":4},{"x":0,"y":5},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":5},{"x":4,"y":5},{"x":5,"y":5}],"4":[{"x":0,"y":2},{"x":1,"y":2},{"x":2,"y":2},{"x":3,"y":2}],"5":[{"x":5,"y":3},{"x":5,"y":4},{"x":4,"y":4},{"x":3,"y":4},{"x":2,"y":4},{"x":1,"y":4}]}}',
    '{"puzzle":[[0,0,0,0,2,3],[0,0,0,1,0,0],[0,0,0,0,0,0],[1,0,5,0,0,3],[0,0,0,0,0,2],[4,5,0,0,0,4]],"solution":[[1,1,1,1,2,3],[1,4,4,1,2,3],[1,4,4,4,2,3],[1,4,5,4,2,3],[4,4,5,4,2,2],[4,5,5,4,4,4]],"flows":{"1":[{"x":3,"y":1},{"x":3,"y":0},{"x":2,"y":0},{"x":1,"y":0},{"x":0,"y":0},{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3}],"2":[{"x":4,"y":0},{"x":4,"y":1},{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4},{"x":5,"y":4}],"3":[{"x":5,"y":0},{"x":5,"y":1},{"x":5,"y":2},{"x":5,"y":3}],"4":[{"x":0,"y":5},{"x":0,"y":4},{"x":1,"y":4},{"x":1,"y":3},{"x":1,"y":2},{"x":1,"y":1},{"x":2,"y":1},{"x":2,"y":2},{"x":3,"y":2},{"x":3,"y":3},{"x":3,"y":4},{"x":3,"y":5},{"x":4,"y":5},{"x":5,"y":5}],"5":[{"x":2,"y":3},{"x":2,"y":4},{"x":2,"y":5},{"x":1,"y":5}]}}',
    '{"puzzle":[[1,0,0,0,0,0],[2,0,3,0,0,0],[4,0,0,0,0,0],[0,0,4,0,0,0],[2,0,0,0,3,0],[1,0,0,0,0,0]],"solution":[[1,1,1,1,1,1],[2,2,3,3,3,1],[4,2,2,2,3,1],[4,4,4,2,3,1],[2,2,2,2,3,1],[1,1,1,1,1,1]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0},{"x":5,"y":1},{"x":5,"y":2},{"x":5,"y":3},{"x":5,"y":4},{"x":5,"y":5},{"x":4,"y":5},{"x":3,"y":5},{"x":2,"y":5},{"x":1,"y":5},{"x":0,"y":5}],"2":[{"x":0,"y":1},{"x":1,"y":1},{"x":1,"y":2},{"x":2,"y":2},{"x":3,"y":2},{"x":3,"y":3},{"x":3,"y":4},{"x":2,"y":4},{"x":1,"y":4},{"x":0,"y":4}],"3":[{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4}],"4":[{"x":0,"y":2},{"x":0,"y":3},{"x":1,"y":3},{"x":2,"y":3}]}}',
    '{"puzzle":[[1,0,0,0,0,2],[3,0,0,0,0,0],[4,0,0,0,3,5],[0,0,0,2,0,0],[0,0,0,1,0,0],[4,0,0,0,0,5]],"solution":[[1,1,1,2,2,2],[3,3,1,2,2,2],[4,3,1,2,3,5],[4,3,1,2,3,5],[4,3,1,1,3,5],[4,3,3,3,3,5]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":2,"y":1},{"x":2,"y":2},{"x":2,"y":3},{"x":2,"y":4},{"x":3,"y":4}],"2":[{"x":5,"y":0},{"x":5,"y":1},{"x":4,"y":1},{"x":4,"y":0},{"x":3,"y":0},{"x":3,"y":1},{"x":3,"y":2},{"x":3,"y":3}],"3":[{"x":0,"y":1},{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":5},{"x":4,"y":5},{"x":4,"y":4},{"x":4,"y":3},{"x":4,"y":2}],"4":[{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4},{"x":0,"y":5}],"5":[{"x":5,"y":2},{"x":5,"y":3},{"x":5,"y":4},{"x":5,"y":5}]}}',

    '{"puzzle":[[1,0,0,0,0,0,0],[3,0,0,0,0,0,0],[4,0,0,1,2,0,0],[5,0,0,0,0,0,0],[0,0,0,4,2,0,0],[0,0,0,0,0,3,0],[5,0,0,0,0,0,0]],"solution":[[1,1,1,1,2,2,2],[3,3,3,1,2,2,2],[4,4,3,1,2,2,2],[5,4,3,3,3,3,2],[5,4,4,4,2,3,2],[5,4,4,4,2,3,2],[5,4,4,4,2,2,2]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":3,"y":1},{"x":3,"y":2}],"2":[{"x":4,"y":2},{"x":4,"y":1},{"x":4,"y":0},{"x":5,"y":0},{"x":6,"y":0},{"x":6,"y":1},{"x":5,"y":1},{"x":5,"y":2},{"x":6,"y":2},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":5},{"x":6,"y":6},{"x":5,"y":6},{"x":4,"y":6},{"x":4,"y":5},{"x":4,"y":4}],"3":[{"x":0,"y":1},{"x":1,"y":1},{"x":2,"y":1},{"x":2,"y":2},{"x":2,"y":3},{"x":3,"y":3},{"x":4,"y":3},{"x":5,"y":3},{"x":5,"y":4},{"x":5,"y":5}],"4":[{"x":0,"y":2},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4},{"x":1,"y":5},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":3,"y":5},{"x":2,"y":5},{"x":2,"y":4},{"x":3,"y":4}],"5":[{"x":0,"y":3},{"x":0,"y":4},{"x":0,"y":5},{"x":0,"y":6}]}}',
    '{"puzzle":[[1,2,0,3,4,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,2,0,6,0,3,0],[0,0,0,0,0,4,0],[0,5,1,0,0,0,0],[0,0,0,6,0,0,5]],"solution":[[1,2,3,3,4,4,4],[1,2,3,3,3,3,4],[1,2,5,5,5,3,4],[1,2,5,6,5,3,4],[1,5,5,6,5,4,4],[1,5,1,6,5,5,5],[1,1,1,6,5,5,5]],"flows":{"1":[{"x":0,"y":0},{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4},{"x":0,"y":5},{"x":0,"y":6},{"x":1,"y":6},{"x":2,"y":6},{"x":2,"y":5}],"2":[{"x":1,"y":0},{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3}],"3":[{"x":3,"y":0},{"x":2,"y":0},{"x":2,"y":1},{"x":3,"y":1},{"x":4,"y":1},{"x":5,"y":1},{"x":5,"y":2},{"x":5,"y":3}],"4":[{"x":4,"y":0},{"x":5,"y":0},{"x":6,"y":0},{"x":6,"y":1},{"x":6,"y":2},{"x":6,"y":3},{"x":6,"y":4},{"x":5,"y":4}],"5":[{"x":1,"y":5},{"x":1,"y":4},{"x":2,"y":4},{"x":2,"y":3},{"x":2,"y":2},{"x":3,"y":2},{"x":4,"y":2},{"x":4,"y":3},{"x":4,"y":4},{"x":4,"y":5},{"x":4,"y":6},{"x":5,"y":6},{"x":5,"y":5},{"x":6,"y":5},{"x":6,"y":6}],"6":[{"x":3,"y":3},{"x":3,"y":4},{"x":3,"y":5},{"x":3,"y":6}]}}',
    '{"puzzle":[[1,0,0,0,0,0,0],[3,0,0,4,0,0,0],[0,0,0,0,0,0,0],[0,0,5,0,0,0,2],[3,1,0,0,2,0,0],[0,0,0,6,0,0,0],[5,7,0,0,7,6,4]],"solution":[[1,1,2,2,2,2,2],[3,1,2,4,4,2,2],[3,1,2,2,4,2,2],[3,1,5,2,4,4,2],[3,1,5,2,2,4,4],[5,5,5,6,6,6,4],[5,7,7,7,7,6,4]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4}],"2":[{"x":6,"y":3},{"x":6,"y":2},{"x":5,"y":2},{"x":5,"y":1},{"x":6,"y":1},{"x":6,"y":0},{"x":5,"y":0},{"x":4,"y":0},{"x":3,"y":0},{"x":2,"y":0},{"x":2,"y":1},{"x":2,"y":2},{"x":3,"y":2},{"x":3,"y":3},{"x":3,"y":4},{"x":4,"y":4}],"3":[{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4}],"4":[{"x":3,"y":1},{"x":4,"y":1},{"x":4,"y":2},{"x":4,"y":3},{"x":5,"y":3},{"x":5,"y":4},{"x":6,"y":4},{"x":6,"y":5},{"x":6,"y":6}],"5":[{"x":2,"y":3},{"x":2,"y":4},{"x":2,"y":5},{"x":1,"y":5},{"x":0,"y":5},{"x":0,"y":6}],"6":[{"x":3,"y":5},{"x":4,"y":5},{"x":5,"y":5},{"x":5,"y":6}],"7":[{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6}]}}',
    '{"puzzle":[[0,0,0,2,1,3,0],[0,4,0,0,0,0,0],[0,0,0,0,2,0,3],[0,0,0,0,0,0,0],[0,0,0,0,1,4,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]],"solution":[[1,1,1,2,1,3,3],[1,4,1,2,1,1,3],[1,4,1,2,2,1,3],[1,4,1,1,1,1,1],[1,4,1,1,1,4,1],[1,4,4,4,4,4,1],[1,1,1,1,1,1,1]],"flows":{"1":[{"x":4,"y":0},{"x":4,"y":1},{"x":5,"y":1},{"x":5,"y":2},{"x":5,"y":3},{"x":6,"y":3},{"x":6,"y":4},{"x":6,"y":5},{"x":6,"y":6},{"x":5,"y":6},{"x":4,"y":6},{"x":3,"y":6},{"x":2,"y":6},{"x":1,"y":6},{"x":0,"y":6},{"x":0,"y":5},{"x":0,"y":4},{"x":0,"y":3},{"x":0,"y":2},{"x":0,"y":1},{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":2,"y":1},{"x":2,"y":2},{"x":2,"y":3},{"x":2,"y":4},{"x":3,"y":4},{"x":3,"y":3},{"x":4,"y":3},{"x":4,"y":4}],"2":[{"x":3,"y":0},{"x":3,"y":1},{"x":3,"y":2},{"x":4,"y":2}],"3":[{"x":5,"y":0},{"x":6,"y":0},{"x":6,"y":1},{"x":6,"y":2}],"4":[{"x":1,"y":1},{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4},{"x":1,"y":5},{"x":2,"y":5},{"x":3,"y":5},{"x":4,"y":5},{"x":5,"y":5},{"x":5,"y":4}]}}',
    '{"puzzle":[[1,0,0,0,0,1,2],[0,3,0,0,0,0,0],[0,4,0,0,0,5,6],[0,0,2,5,0,0,0],[0,0,0,0,0,0,0],[0,4,6,7,0,0,7],[0,0,0,0,0,0,3]],"solution":[[1,1,1,1,1,1,2],[3,3,2,2,2,2,2],[3,4,2,5,5,5,6],[3,4,2,5,6,6,6],[3,4,6,6,6,7,7],[3,4,6,7,7,7,7],[3,3,3,3,3,3,3]],"flows":{"1":[{"x":0,"y":0},{"x":1,"y":0},{"x":2,"y":0},{"x":3,"y":0},{"x":4,"y":0},{"x":5,"y":0}],"2":[{"x":6,"y":0},{"x":6,"y":1},{"x":5,"y":1},{"x":4,"y":1},{"x":3,"y":1},{"x":2,"y":1},{"x":2,"y":2},{"x":2,"y":3}],"3":[{"x":1,"y":1},{"x":0,"y":1},{"x":0,"y":2},{"x":0,"y":3},{"x":0,"y":4},{"x":0,"y":5},{"x":0,"y":6},{"x":1,"y":6},{"x":2,"y":6},{"x":3,"y":6},{"x":4,"y":6},{"x":5,"y":6},{"x":6,"y":6}],"4":[{"x":1,"y":2},{"x":1,"y":3},{"x":1,"y":4},{"x":1,"y":5}],"5":[{"x":5,"y":2},{"x":4,"y":2},{"x":3,"y":2},{"x":3,"y":3}],"6":[{"x":6,"y":2},{"x":6,"y":3},{"x":5,"y":3},{"x":4,"y":3},{"x":4,"y":4},{"x":3,"y":4},{"x":2,"y":4},{"x":2,"y":5}],"7":[{"x":3,"y":5},{"x":4,"y":5},{"x":5,"y":5},{"x":5,"y":4},{"x":6,"y":4},{"x":6,"y":5}]}}'
];

class levelStorage {

    levelCount () {
        return levels.length;
    }

    level (number) {
        return JSON.parse(levels[number]);
    }

}
