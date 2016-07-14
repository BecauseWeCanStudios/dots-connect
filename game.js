"use strict";


function last(array) {
    return array[array.length - 1];
}

var NodeTypes = {
    ROAD: 0,
    DOT: 1
};

class Node {

    constructor(type, color) {
        this.type = type;
        this.color = color;
    }

}

class PathNode extends Node {

    constructor(type, color, x, y) {
        super(type, color);
        this.x = x;
        this.y = y;
    }
}

class Level {

    constructor(levelInfo) {
        this.levelInfo = levelInfo;
        let field = levelInfo.puzzle;
        this.field = new Array(field.length);
        for (let i = 0; i < field.length; ++i) {
            let row = new Array(field[i].length);
            for (let j = 0; j < field[i].length; ++j)
                row[j] = new Node(field[i][j] ? NodeTypes.DOT : NodeTypes.ROAD, field[i][j]);
            this.field[i] = row;
        }
        this.paths = [];
    }

    nodeColor(x, y) {
        return this.field[y] && this.field[y][x] ? this.field[y][x].color : null;
    }

    placeColor(x, y, color) {
        if (!this.field[y] || !this.field[y][x])
            return;
        this.field[y][x].color = color;
    }

    canStartEnd(x, y) {
        return this.field[y] && this.field[y][x] && this.field[y][x].type == NodeTypes.DOT;
    }

    pathIndex(color) {
        for (let i = 0; i < this.paths.length; ++i)
            if (this.paths[i] && this.paths[i].length && this.paths[i][0].color == color)
                return i;
        return -1;
    }

    clearPath(path) {
        if (!path)
            return;
        for (let i = 0; i < path.length; ++i)
            if (path[i].type == NodeTypes.ROAD)
                this.field[path[i].y][path[i].x].color = 0;
    }

    checkPath(color) {
        let path = this.paths[this.pathIndex(color)];
        return path && path.length > 1 && last(path).type == NodeTypes.DOT;
    }

    addPath(path) {
        this.paths.push(path);
    }

    checkAnswer() {
        for (let i = 0; i < this.field.length; ++i)
            for (let j = 0; j < this.field[i].length; ++j)
                if (this.canStartEnd(j, i) && !this.checkPath(this.field[i][j].color))
                    return false;
        return true;
    }

    extractPath(color) {
        let index = this.pathIndex(color);
        if (index < 0)
            return null;
        let path = this.paths[index];
        this.paths.splice(index, 1);
        return path;
    }

}

class Game {

    constructor() {
        this.pathsRestarts = 0;
        this.isMouseDown = false;
        this.isGameFinished = false;
        this.generator = new Generator();
        this.levelWidth = this.levelHeight = 10;
        this.levelNumber = 0;
        this.currentPath = [];
        this.clearCompletedLevels();
    }
    
    clearCompletedLevels() {
        this.levelsCompleted = [];
        for (let i = 0; i < storage.levelCount(); ++i)
            this.levelsCompleted.push(false);        
    }

    updateLevelsCompletion(completed) {
        for (let i = 0; i < this.levelsCompleted.length && completed[i]; ++i)
            this.levelsCompleted[i] = true;
    }

    setScene(scene) {
        this.scene = scene;
    }

    changeLevelDimensions(width, height) {
        this.levelWidth = width;
        this.levelHeight = height;
    }

    selectLevel(levelNumber) {
        this.levelNumber = levelNumber;
    }

    startNewGame() {
        this.isGameFinished = false;
        this.currentPath = [];
        this.level = new Level(this.levelNumber >= storage.levelCount() ?
            this.generator.generate(this.levelWidth, this.levelHeight) :
            storage.level(this.levelNumber));
        this.scene.initLevel(this.level);
    }

    cutPath(x, y, path) {
        let cut = [];
        while (path.length > 1 && (last(path).x != x || last(path).y != y)) {
            if (!this.level.canStartEnd(last(path).x, last(path).y))
                this.level.placeColor(last(path).x, last(path).y, 0);
            cut.push(last(path));
            path.pop();
        }
        if (path.length == 1) {
            cut.push(path[0]);
            path.pop();
        }
        return cut;
    }

    startPath(x, y) {
        let color = this.level.nodeColor(x, y);
        let path = this.level.extractPath(color);
        if (path) {
            this.pathsRestarts += 1;
            if (Game.isInPath(x, y, path) && !this.level.canStartEnd(x, y)) {
                this.currentPath = path;
                this.scene.updateLevel();
                this.cutPath(x, y, path);
                this.currentPath = path;
                this.scene.updateLevel();
            }
            else {
                this.scene.clearPath(this.cutPath(-1, -1, path));
                this.currentPath = [new PathNode(NodeTypes.DOT, this.level.nodeColor(x, y), x, y)];
            }
            return true;
        }
        if (!this.level.canStartEnd(x, y))
            return false;
        this.currentPath.push(new PathNode(NodeTypes.DOT, this.level.nodeColor(x, y), x, y));
        return true;
    }

    canContinue(x, y) {
        if (this.currentPath.length > 1 && last(this.currentPath).type == NodeTypes.DOT)
            return false;
        for (let i = 0; i < 4; ++i) {
            let nx = x + dx[i], ny = y + dy[i];
            if (nx == last(this.currentPath).x && ny == last(this.currentPath).y)
                return true;
        }
        return false;
    }

    static isInPath(x, y, path) {
        for (let i = 0; i < path.length; ++i)
            if (x == path[i].x && y == path[i].y)
                return true;
        return false;
    }

    continuePath(x, y) {
        let color = this.level.nodeColor(x, y);
        if ((x == last(this.currentPath).x && y == last(this.currentPath).y)
            || (color && color != last(this.currentPath).color) || color == null)
            return false;
        if (color == 0) {
            if (!this.canContinue(x, y))
                return;
            this.level.placeColor(x, y, this.currentPath[0].color);
            this.currentPath.push(new PathNode(NodeTypes.ROAD, this.currentPath[0].color, x, y));
            return true;
        }
        if (this.currentPath.length == 1 && !this.level.canStartEnd(x, y))
            return false;
        if (this.level.canStartEnd(x, y) && (x != this.currentPath[0].x || y != this.currentPath[0].y)
            && this.canContinue(x, y)) {
            this.currentPath.push(new PathNode(NodeTypes.DOT, this.currentPath[0].color, x, y));
            return true;
        }
        if (!Game.isInPath(x, y, this.currentPath))
            return false;
        while (this.currentPath.length > 1 && (last(this.currentPath).x != x || last(this.currentPath).y != y)) {
            if (!this.level.canStartEnd(last(this.currentPath).x, last(this.currentPath).y))
                this.level.placeColor(last(this.currentPath).x, last(this.currentPath).y, 0);
            this.currentPath.pop();
        }
        return true;
    }
    
    getScore() {
        let res = 0;
        for (let i = 0; i < this.level.field.length; ++i) 
            for (let j = 0; j < this.level.field[i].length; ++j) 
                if (this.level.field[i][j].color && this.level.field[i][j].type != NodeTypes.DOT)
                    res += 1;
        let max = 0;
        for (let i = 0; i < this.level.paths.length; ++i) 
            max = Math.max(max, this.level.paths[i].length);
        res += max * 10;
        res = Math.ceil(res *  Math.pow(0.95, this.pathsRestarts));
        return res;
    }

    endPath() {
        this.level.addPath(this.currentPath);
    }

    fieldMouseDown(x, y) {
        if (!this.isGameFinished && this.startPath(x, y)) {
            this.isMouseDown = true;
            menu.setScore(this.getScore());
            this.scene.updateLevel();
        }
    }

    fieldMouseMove(x, y) {
        if (this.isMouseDown && this.continuePath(x, y)) {
            menu.setScore(this.getScore());
            this.scene.updateLevel();
        }
    }
    
    resetLevel() {
        if (this.isGameFinished)
            return;
        for (let i = 0; i < this.level.paths.length; ++i)
            this.scene.clearPath(this.cutPath(-1, -1, this.level.paths[i]));
        this.pathsRestarts = 0;
        menu.setScore(this.getScore());
    }

    fieldMouseUp() {
        this.endPath();
        if (this.isMouseDown && last(this.currentPath).type == NodeTypes.DOT && this.level.checkAnswer()) {
            this.isGameFinished = true;
            this.isMouseDown = false;
            this.currentPath = [];
            menu.completeLevel();
            this.scene.updateLevel();
            $('header').style = '';
        }
        menu.setScore(this.getScore());
        this.currentPath = [];
        this.isMouseDown = false;
    }
}