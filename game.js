"use strict";


function last(array) {
	return array[array.length - 1];
}

//var dx = [-1, 0, 1, 0], dy = [0, -1, 0, 1];

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

class WayNode extends Node {

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
		this.ways = [];
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

	dotsForColor(color) {
		let result = [];
		for (let i = 0; i < this.field.length; ++i)
			for (let j = 0; j < this.field[i].length; ++j)
				if (this.field[i][j].color == color && this.field[i][j].type == NodeTypes.DOT)
					result.push({x: j, y: i});
		return result.length ? result : null;
	}

	wayIndex(color) {
		for (let i = 0; i < this.ways.length; ++i)
			if (this.ways[i][0].color == color)
				return i;
		return -1;
	}

	clearWay(color) {
		let index = this.wayIndex(color);
		if (index < 0)
			return;
		let way = this.ways[index];
		if (!way)
			return;
		for (let i = 0; i < way.length; ++i)
			if (way[i].type == NodeTypes.ROAD)
				this.field[way[i].y][way[i].x].color = 0;
		this.ways.splice(index, 1);
	}

	checkWay(color) {
		let way = this.ways[this.wayIndex(color)];
		return way && last(way).type == NodeTypes.DOT;
	}

	addWay(way) {
		this.ways.push(way);
	}

	checkAnswer() {
		for (let i = 0; i < this.field.length; ++i)
			for (let j = 0; j < this.field[i].length; ++j)
				if (!this.field[i][j].color || (this.canStartEnd(j, i) && !this.checkWay(this.field[i][j].color)))
					return false;
		return true;
	}

}

var presetLevels = [
	[[1, 0, 0],
		[0, 0, 0],
		[0, 0, 1]],

	[[1, 0],
		[0, 1]]
];

class Game {

	constructor(view) {
		this.view = view;
		this.isMouseDown = false;
		this.isGameFinished = false;
		this.generator = new Generator();
		this.levelWidth = this.levelHeight = 5;
		this.levelNumber = 0;
		this.way = [];
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
		this.way = [];
		this.level = new Level(this.levelNumber < 0 ?
			this.generator.generate(this.levelWidth, this.levelHeight).puzzle :
			presetLevels[this.levelNumber]);
		//Inv
	}

	startWay(x, y) {
		let color = this.level.nodeColor(x, y);
		this.level.clearWay(color);
		this.way.push(new WayNode(NodeTypes.DOT, this.level.nodeColor(x, y), x, y));
		return true;
	}

	canContinue(x, y) {
		for (let i = 0; i < 4; ++i) {
			let nx = x + dx[i], ny = y + dy[i];
			if (nx == last(this.way).x && ny == last(this.way).y)
				return true;
		}
		return false;
	}

	continueWay(x, y) {
		let color = this.level.nodeColor(x, y);
		if (color && color != last(this.way).color)
			return false;
		if (!color) {
			if (!this.canContinue(x, y))
				return false;
			this.level.placeColor(x, y, this.way[0].color);
			this.way.push(new WayNode(NodeTypes.ROAD, this.way[0].color, x, y));
			return true;
		}
		if (this.way.length == 1)
			return false;
		if (color == this.way[0].color) {
			if (this.level.canStartEnd(x, y))
				return true;
			while (this.way.length > 1 && (last(this.way).x != x || last(this.way).y != y)) {
				this.level.placeColor(last(this.way).x, last(this.way).y, 0);
				this.way.pop();
			}
			return true;
		}
		return false;
	}

	endWay(x, y) {
		if ((last(this.way).x != x && last(this.way).y != y || this.level.canStartEnd(x, y)) && this.canContinue(x, y))
			this.way.push(new WayNode(NodeTypes.DOT, this.way[0].color, x, y));
		this.level.addWay(this.way);
		this.way = [];
	}

	fieldMouseDown(x, y) {
		if (!this.isGameFinished && this.level.canStartEnd(x, y) && this.startWay(x, y)) {
			this.isMouseDown = true;
			//Inv
		}
	}

	fieldMouseMove(x, y) {
		if (this.isMouseDown && this.continueWay(x, y)) {
			//Inv
		}
	}

	fieldMouseUp(x, y) {
		this.endWay(x, y);
		if (this.level.canStartEnd(x, y) && this.level.checkAnswer()) {
			this.isGameFinished = true;
			//Inv
		}
		this.isMouseDown = false;
	}
}