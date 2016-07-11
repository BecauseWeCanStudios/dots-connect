"use strict";

const sigma = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '!', '"', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];
const dx = [0, 1, 0, -1];
const dy = [-1, 0, 1, 0];

function randPerm(maxValue){
    var permArray = new Array(maxValue);
    for (let i = 0; i < maxValue; i++){
        permArray[i] = i;
    }
    for (let i = (maxValue - 1); i >= 0; --i){
        var randPos = Math.floor(i * Math.random());
        var tmpStore = permArray[i];
        permArray[i] = permArray[randPos];
        permArray[randPos] = tmpStore;
    }
    return permArray;
}

function Generator () {

    this.generate = function (width, height) {
        if (width == 0 || height == 0 || width == 1 && height == 1)
            throw "Error: Requires bigger puzzle size";
        var table = this.tile(width, height);
        this.shuffle(table);
        this.oddCorner(table);
        this.findFlows(table);
        return this.print(table);
    };

    this.print = function (table) {
        var width = table[0].length;
        var height = table.length;
        var colorsUsed = this.flatten(table);
        if (colorsUsed > sigma.length)
            throw "Error: Not enough printable characters to print the puzzle";

        var puzzle = new Array(height);
        var solution = new Array(height);

        for (let y = 0; y < height; ++y) {
            puzzle[y] = '';
            solution[y] = '';
            for (let x = 0; x < width; ++x) {
                solution[y] += sigma[table[y][x]];
                if (this.isFlowHead(x, y, table))
                    puzzle[y] += sigma[table[y][x]];
                else
                    puzzle[y] += '.';
            }
        }

        return {puzzle: puzzle, solution: solution};
    };

    this.tile = function (width, height) {
        var table = new Array(height);
        for (let y = 0; y < height; ++y) {
            table[y] = new Array(width);
        }
        // Start with simple vertical tiling
        var alpha = 0;
        for (let y = 0; y < height - 1; y += 2) {
            for (let x = 0; x < width; ++x) {
                table[y][x] = alpha;
                table[y + 1][x] = alpha;
                ++alpha;
            }
        }
        // Add padding in case of odd height
        if (height % 2 == 1) {
            for (let x = 0; x < width - 1; x += 2) {
                table[height - 1][x] = alpha;
                table[height - 1][x + 1] = alpha;
                ++alpha;
            }
            // In case of odd width, add a single in the corner.
            if (width % 2 == 1)
                table[height - 1][width - 1] = alpha;
        }
        return table;
    };

    this.shuffle = function (table) {
        var width = table[0].length;
        var height = table.length;
        if (width == 1 || height == 1)
            return;
        for (let i = 0; i < Math.pow(width * height, 2); ++i) {
            var x = Math.floor(Math.random() * (width - 1));
            var y = Math.floor(Math.random() * (height - 1));
            if (table[y][x] == table[y][x + 1] && table[y + 1][x] == table[y + 1][x + 1]) {
                // Horizontal case
                // aa \ ab
                // bb / ab
                table[y + 1][x] = table[y][x];
                table[y][x + 1] = table[y + 1][x + 1];
            }
            else if (table[y][x] == table[y + 1][x] && table[y][x + 1] == table[y + 1][x + 1]) {
                // Vertical case
                // ab \ aa
                // ab / bb
                table[y][x+1] = table[y][x];
                table[y+1][x] = table[y+1][x+1];
            }
        }
    };

    this.oddCorner = function (table) {
        var width = table[0].length;
        var height = table.length;
        if (width % 2 == 1 && height % 2 == 1) {
            if (width > 2 && table[height - 1][width - 3] == table[height - 1][width - 2])
                // Horizontal case:
                // aax
                table[height - 1][width - 1] = table[height - 1][width - 2];
            if (height > 2 && table[height - 3][width - 1] == table[height - 2][width - 1])
                // Vertical case:
                // ab
                // ax
                table[height - 1][width - 1] = table[height - 2][width - 1];
        }
    };

    this.findFlows = function (table) {
        var width = table[0].length;
        var height = table.length;
        var perm = randPerm(width * height);
        for (let i = 0; i < perm.length; ++i) {
            var x = perm[i] % width;
            var y = Math.floor(perm[i] / width);
            if (this.isFlowHead(x, y, table))
                this.layFlow(x, y, table);
        }
    };

    this.isFlowHead = function (x, y, table) {
        var width = table[0].length;
        var height = table.length;
        var degree = 0;
        for (let i = 0; i < 4; ++i) {
            var x1 = x + dx[i];
            var y1 = y + dy[i];
            if (this.inside(x1, y1, width, height) && table[y1][x1] == table[y][x])
                ++degree;
        }
        return degree < 2;
    };
    
    this.inside = function (x, y, width, height) {
        return 0 <= x && x < width && 0 <= y && y < height;
    };

    this.layFlow = function (x, y, table) {
        var width = table[0].length;
        var height = table.length;
        var perm = randPerm(4);
        for (let i = 0; i < 4; ++i) {
            var x1 = x + dx[perm[i]];
            var y1 = y + dy[perm[i]];
            if (this.inside(x1, y1, width, height) && this.canConnect(x, y, x1, y1, table)) {
                this.fill(x1, y1, table[y][x], table);
                var xy2 = this.follow(x1, y1, x, y, table);
                this.layFlow(xy2.x, xy2.y, table);
                return;
            }
        }
    };

    this.canConnect = function (x1, y1, x2, y2, table) {
        var width = table[0].length;
        var height = table.length;
        if (table[y1][x1] == table[y2][x2])
            return false;
        if (!this.isFlowHead(x1, y1, table) || !this.isFlowHead(x2, y2, table))
            return false;
        for (let y3 = 0; y3 < height; ++y3) {
            for (let x3 = 0; x3 < width; ++x3) {
                for (let i = 0; i < 4; ++i) {
                    var x4 = x3 + dx[i];
                    var y4 = y3 + dy[i];
                    if (
                        this.inside(x4, y4, width, height) &&
                        !(x3 == x1 && y3 == y1 && x4 == x2 && y4 == y2) &&
                        table[y3][x3] == table[y1][x1] && table[y4][x4] == table[y2][x2]
                    )
                        return false;
                }
            }
        }
        return true;
    };
    
    this.fill = function (x, y, alpha, table) {
        var width = table[0].length;
        var height = table.length;
        var orig = table[y][x];
        table[y][x] = alpha;
        for (let i = 0; i < 4; i++) {
            var x1 = x + dx[i];
            var y1 = y + dy[i];
            if (this.inside(x1, y1, width, height) && table[y1][x1] == orig)
                this.fill(x1, y1, alpha, table);
        }
    };
    
    this.follow = function (x, y, x0, y0, table) {
        var width = table[0].length;
        var height = table.length;
        for (let i = 0; i < 4; ++i) {
            var x1 = x + dx[i];
            var y1 = y + dy[i];
            if (
                this.inside(x1, y1, width, height) &&
                !(x1 == x0 && y1 == y0) &&
                table[y][x] == table[y1][x1]
            )
                return this.follow(x1, y1, x, y, table);
        }
        return {x: x, y: y};
    };

    this.flatten = function (table) {
        var width = table[0].length;
        var height = table.length;
        var alpha = -1;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (table[y][x] >= 0) {
                    this.fill(x, y, alpha, table);
                    --alpha;
                }
            }
        }
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                table[y][x] = -table[y][x] - 1;
            }
        }
        return -alpha - 1;
    }
}

//debug

// var gen = new Generator();
// var res = gen.generate(6, 6);
// for (let i = 0; i < res.puzzle.length; ++i) {
//     console.log(res.puzzle[i]);
// }
// console.log('\n');
// for (let i = 0; i < res.solution.length; ++i) {
//     console.log(res.solution[i]);
// }