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
		return this.field[y][x].color;
	}

	placeColor(x, y, color) {
		this.field[y][x].color = color;
	}

	canStartEnd(x, y) {
		return this.field[y][x].type == NodeTypes.DOT;
	}

	pathIndex(color) {
		for (let i = 0; i < this.paths.length; ++i)
			if (this.paths[i][0].color == color)
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

var presetLevels = [
	    [[1, 0, 0],
		 [0, 0, 0],
		 [0, 0, 1]],

	    [[1, 0, 2],
		 [0, 0, 0],
         [1, 2, 0]],  
    
        [[1, 0, 0, 0],
         [2, 0, 3, 1],
         [0, 0, 4, 0],
         [2, 0, 3, 4]]
];

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
		this.level = new Level(this.levelNumber >= presetLevels.length ?
			this.generator.generate(this.levelWidth, this.levelHeight).puzzle :
			presetLevels[this.levelNumber]);
		this.scene.initLevel(this.level);
	}

	startPath(x, y) {
		let color = this.level.nodeColor(x, y);
		this.level.clearPath(color);
		this.currentPath.push(new PathNode(NodeTypes.DOT, this.level.nodeColor(x, y), x, y));
		return true;
	}

	canContinue(x, y) {
		for (let i = 0; i < 4; ++i) {
			let nx = x + dx[i], ny = y + dy[i];
			if (nx == last(this.currentPath).x && ny == last(this.currentPath).y)
				return true;
		}
		return false;
	}

	continuePath(x, y) {
		let color = this.level.nodeColor(x, y);
		if (color && color != last(this.currentPath).color)
			return false;
		if (!color) {
			if (!this.canContinue(x, y))
				return false;
			this.level.placeColor(x, y, this.currentPath[0].color);
			this.currentPath.push(new PathNode(NodeTypes.ROAD, this.currentPath[0].color, x, y));
			return true;
		}
		if (this.currentPath.length == 1)
			return false;
		if (this.level.canStartEnd(x, y) && (x != this.currentPath[0].x || y != this.currentPath[0].y))
			return true;
		while (this.currentPath.length > 1 && (last(this.currentPath).x != x || last(this.currentPath).y != y)) {
			this.level.placeColor(last(this.currentPath).x, last(this.currentPath).y, 0);
			this.currentPath.pop();
		}
		return true;
	}

	endPath(x, y) {
		if ((last(this.currentPath).x != x && 
            last(this.currentPath).y != y || this.level.canStartEnd(x, y)) && this.canContinue(x, y))
			this.currentPath.push(new PathNode(NodeTypes.DOT, this.currentPath[0].color, x, y));
		this.level.addPath(this.currentPath);
		this.currentPath = [];
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

	fieldMouseUp(x, y) {
		this.endPath(x, y);
		if (this.level.canStartEnd(x, y) && this.level.checkAnswer()) {
			this.isGameFinished = true;
			this.scene.updateLevel();
			window.alert('YOU WON!!!');
		}
		this.isMouseDown = false;
	}
}