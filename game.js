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

    constructor(field) {
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

    clearPath(color) {
        let index = this.pathIndex(color);
        if (index < 0)
            return;
        let path = this.paths[index];
        if (!path)
            return;
        for (let i = 0; i < path.length; ++i)
            if (path[i].type == NodeTypes.ROAD)
                this.field[path[i].y][path[i].x].color = 0;
        this.paths.splice(index, 1);
        return path;
    }

    checkPath(color) {
        let path = this.paths[this.pathIndex(color)];
        return path && last(path).type == NodeTypes.DOT;
    }

    addPath(path) {
        this.paths.push(path);
    }

    checkAnswer() {
        for (let i = 0; i < this.field.length; ++i)
            for (let j = 0; j < this.field[i].length; ++j)
                if (!this.field[i][j].color || (this.canStartEnd(j, i) && !this.checkPath(this.field[i][j].color)))
                    return false;
        return true;
    }

}

class Game {

    constructor() {
        this.isMouseDown = false;
        this.isGameFinished = false;
        this.generator = new Generator();
        this.levelWidth = this.levelHeight = 5;
        this.levelNumber = 0;
        this.currentPath = [];
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
            this.generator.generate(this.levelWidth, this.levelHeight).puzzle :
            storage.level(this.levelNumber).puzzle);
        this.scene.initLevel(this.level);
    }

    startPath(x, y) {
        let color = this.level.nodeColor(x, y);
        let removedPath = this.level.clearPath(color);
        if (removedPath) {
            this.scene.clearPath(removedPath);
        }
        this.currentPath = [];
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
        if (this.currentPath.length == 1)
            return false;
        if (this.level.canStartEnd(x, y) && (x != this.currentPath[0].x || y != this.currentPath[0].y)
            && this.canContinue(x, y)) {
            this.currentPath.push(new PathNode(NodeTypes.DOT, this.currentPath[0].color, x, y));
            return true;
        }
        while (this.currentPath.length > 1 && (last(this.currentPath).x != x || last(this.currentPath).y != y)) {
            if (!this.level.canStartEnd(last(this.currentPath).x, last(this.currentPath).y))
                this.level.placeColor(last(this.currentPath).x, last(this.currentPath).y, 0);
            this.currentPath.pop();
        }
        return true;
    }

    endPath() {
        this.level.addPath(this.currentPath);
    }

    fieldMouseDown(x, y) {
        if (!this.isGameFinished && this.level.canStartEnd(x, y) && this.startPath(x, y)) {
            this.isMouseDown = true;
            this.scene.updateLevel();
        }
    }

    fieldMouseMove(x, y) {
        if (this.isMouseDown && this.continuePath(x, y)) {
            this.scene.updateLevel();
        }
    }

    fieldMouseUp() {
        this.endPath();
        if (this.isMouseDown && last(this.currentPath).type == NodeTypes.DOT && this.level.checkAnswer()) {
            this.isGameFinished = true;
            this.isMouseDown = false;
            this.currentPath = [];
            this.scene.updateLevel();
            window.alert('YOU WON!!!');
        }
        this.isMouseDown = false;
    }
}