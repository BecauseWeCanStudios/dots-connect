"use strict";

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

class Generator {

    generate (width, height) {
        const attempts = 10;
        if (width == 0 || height == 0 || width == 1 && height == 1)
            throw "Error: Requires bigger puzzle size";
        var best_table;
        var best = Infinity;
        for (let i = 0; i < attempts; ++i) {
            var table = this.tile(width, height);
            this.shuffle(table);
            this.oddCorner(table);
            this.findFlows(table);
            var degFactor = this.degenerationFactor(table);
            if (degFactor < best) {
                best_table = table.map(function(arr) {
                    return arr.slice();
                });
                best = degFactor;
            }
        }
        return this.print(best_table);
    };

    print (table) {
        var width = table[0].length;
        var height = table.length;

        var puzzle = new Array(height);
        for (let y = 0; y < height; ++y) {
            puzzle[y] = new Array(width);
            for (let x = 0; x < width; ++x) {
                if (this.isFlowHead(x, y, table))
                    puzzle[y][x] = table[y][x];
                else
                    puzzle[y][x] = 0;
            }
        }
        //attempt to fix degenerated segments is made
        this.fixDegenerated(table, puzzle);
        this.flatten(table);
        this.flattenPuzzle(table, puzzle);
        return {puzzle: puzzle, solution: table};
    };

    tile (width, height) {
        var table = new Array(height);
        for (let y = 0; y < height; ++y) {
            table[y] = new Array(width);
        }
        // Start with simple vertical tiling
        var color = 1;
        for (let y = 0; y < height - 1; y += 2) {
            for (let x = 0; x < width; ++x) {
                table[y][x] = color;
                table[y + 1][x] = color;
                ++color;
            }
        }
        // Add padding in case of odd height
        if (height % 2 == 1) {
            for (let x = 0; x < width - 1; x += 2) {
                table[height - 1][x] = color;
                table[height - 1][x + 1] = color;
                ++color;
            }
            // In case of odd width, add a single in the corner.
            if (width % 2 == 1)
                table[height - 1][width - 1] = color;
        }
        return table;
    };

    shuffle (table) {
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

    oddCorner (table) {
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

    findFlows (table) {
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

    isFlowHead (x, y, table) {
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
    
    inside (x, y, width, height) {
        return 0 <= x && x < width && 0 <= y && y < height;
    };

    layFlow (x, y, table) {
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

    canConnect (x1, y1, x2, y2, table) {
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
    
    fill (x, y, color, table) {
        var width = table[0].length;
        var height = table.length;
        var orig = table[y][x];
        table[y][x] = color;
        for (let i = 0; i < 4; i++) {
            var x1 = x + dx[i];
            var y1 = y + dy[i];
            if (this.inside(x1, y1, width, height) && table[y1][x1] == orig)
                this.fill(x1, y1, color, table);
        }
    };
    
    follow (x, y, x0, y0, table) {
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

    flatten (table) {
        var width = table[0].length;
        var height = table.length;
        var color = -2;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (table[y][x] >= 0) {
                    this.fill(x, y, color, table);
                    --color;
                }
            }
        }
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                table[y][x] = -table[y][x] - 1;
            }
        }
        return -color - 1;
    }

    degenerationFactor (table) {
        var count = 0;
        var width = table[0].length;
        var height = table.length;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (this.isFlowHead(x, y, table)) {
                    for (let i = 0; i < 4; ++i) {
                        let x1 = x + dx[i];
                        let y1 = y + dy[i];
                        if (this.inside(x1, y1, width, height) &&
                            this.isFlowHead(x1, y1, table) && table[y][x] == table[y1][x1]
                        )
                            ++count;
                    }
                }
            }
        }
        return Math.floor(count / 2);
    }

    //This function makes an attempt to partially fix degenerated segments
    //It doesn't cover all the cases, but it probably covers the most often ones
    //TODO: Refactor the code
    fixDegenerated (solution, puzzle) {
        var width = solution[0].length;
        var height = solution.length;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (this.isFlowHead(x, y, solution)) {
                    for (let i = 0; i < 4; ++i) {
                        let x1 = x + dx[i];
                        let y1 = y + dy[i];
                        if (this.inside(x1, y1, width, height) &&
                            this.isFlowHead(x1, y1, solution) &&
                            solution[y][x] == solution[y1][x1])
                        {
                            if (Math.abs(x - x1) == 1) {
                                let dy1 = [1, -1];
                                for (let j = 0; j < 2; ++ j) {
                                    if (this.inside(x1, y1 + dy1[j], width, height) &&
                                        solution[y1 + dy1[j]][x] == solution[y1 + dy1[j]][x1])
                                    {
                                        solution[y][x] = solution[y1 + dy1[j]][x];
                                        solution[y1][x1] = solution[y1 + dy1[j]][x];
                                        puzzle[y][x] = 0;
                                        puzzle[y1][x1] = 0;
                                    }
                                }
                            }
                            if (Math.abs(y - y1) == 1) {
                                let dx1 = [1, -1];
                                for (let j = 0; j < 2; ++ j) {
                                    if (this.inside(x1 + dx1[j], y1, width, height) &&
                                        solution[y1][x1 + dx1[j]] == solution[y][x + dx1[j]])
                                    {
                                        solution[y][x] = solution[y][x + dx1[j]];
                                        solution[y1][x1] = solution[y1][x1 + dx1[j]];
                                        puzzle[y][x] = 0;
                                        puzzle[y1][x1] = 0;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    flattenPuzzle (solution, puzzle) {
        var width = solution[0].length;
        var height = solution.length;
        for (let y = 0; y < height; ++y) {
            for (let x = 0; x < width; ++x) {
                if (puzzle[y][x] != 0) {
                    puzzle[y][x] = solution[y][x];
                }
            }
        }
    }
}
//debug

// var gen = new Generator();
// var res = gen.generate(6, 6);
// var s = '';
// for (let y = 0; y < res.puzzle.length; ++y) {
//     for (let x = 0; x < res.puzzle[y].length; ++x) {
//         s += res.puzzle[y][x].toString() + '\t';
//     }
//     s += '\n';
// }
// console.log(s);
// s = '';
// for (let y = 0; y < res.solution.length; ++y) {
//     for (let x = 0; x < res.solution[y].length; ++x) {
//         s += res.solution[y][x].toString() + '\t';
//     }
//     s += '\n';
// }
// console.log(s);
