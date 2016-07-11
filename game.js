"use strict";


function last(array) {
	return array[array.length - 1];
}

function penult(array) {
	return array[array.length - 2];
}

class Level {
	static createNode(type, color) {
		return {
			type: type,
			color: color
		}
	}

	constructor(field) {
		this.NodeTypes = {
			ROAD: 0,
			DOT: 1
		};
		this.dx = [-1, 0, 1, 0];
		this.dy = [0, -1, 0, 1];
		this.field = new Array(field.length);
		for (let i = 0; i < field.length; ++i) {
			let row = new Array(field[i].length);
			for (let j = 0; j < field[i].length; ++j)
				row[j] = Level.createNode(field[i][j] ? this.NodeTypes.DOT : this.NodeTypes.ROAD, field[i][j]);
			this.field[i] = row;
		}
	}

	nodeColor(x, y) {
		return this.field[y][x].color;
	}

	placeColor(x, y, color) {
		this.field[y][x].color = color;
	}

	canStartEnd(x, y) {
		return this.field[y][x].type == this.NodeTypes.DOT;
	}

	nextFor(x, y) {
		let node = this.field[y][x];
		for (let i = 0; i < 4; ++i) {
			let nx = x + this.dx[i], ny = y + this.dy[i];
			let next = this.field[ny][nx];
			if (!next)
				continue;
			if (next.type = this.NodeTypes.ROAD && next.color == node.color)
				return {x: nx, y: ny};
		}
		return {x: x, y: y};
	}

	dotsForColor(color) {
		let result = [];
		for (let i = 0; i < this.field.length; ++i)
			for (let j = 0; j < this.field[i].length; ++j)
				if (this.field[i][j].color == color && this.field[i][j].type == this.NodeTypes.DOT)
					result.push({x: j, y: i});
		return result.length ? result : null;
	}

	static copyField(from) {
		let temp = new Array(from.length);
		for (let i = 0; i < from.length; ++i) {
			let row = new Array(from.length);
			for (let j = 0; j < from.length; ++j)
				row[j] = Level.createNode(from[i][j].type, from[i][j].color);
			temp[i] = row;
		}
		return temp;
	}

	clearWay(x, y) {
		let prev = {x: x, y: y}, cur = this.nextFor(x, y);
		while (prev.x != cur.x && prev.y != cur.y) {
			this.placeColor(cur.x, cur.y, 0);
			prev = cur;
			cur = this.nextFor(prev.x, prev.y);
		}
		return cur;
	}

	checkWay(x, y) {
		let color = this.nodeColor(x, y), node = this.clearWay(x, y), fail = false;
		for (let i = 0; i < 4; ++i) {
			let next = this.field[node.y + this.dy[i]][node.y + this.dx[i]];
				if (next)
					fail = next.type == this.NodeTypes.DOT && next.color == color && fail;
		}
		return fail;
	}

	checkAnswer() {
		let temp = this.copyField(this.field);
		for (let i = 0; i < this.field.length; ++i) {
			for (let j = 0; j < this.field[i].length; ++j)
				if (!temp[i][j].color || (this.canStartEnd(j, i) && !this.checkWay(j, i))) {
					this.field = Level.copyField(temp);
					return false;
				}
		}
		this.field = Level.copyField(temp);
		return true;
	}
}

class Node {

	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
	}
}

class Game {
	constructor() {
		this.presetLevels = [
			[[1, 0, 0],
			[0, 0, 0],
			[0, 0, 1]]
		];
		this.isMouseDown = false;
		this.isGameFinished = false;
		this.generator = new Generator();
		this.levelWidth = this.levelHeight = 5;
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
		this.level = new Level(this.levelNumber < 0 ?
			this.generator.generate(this.levelWidth, this.levelHeight) :
			this.presetLevels[this.levelNumber]);
		//Invalidate view
	}

	startWay(x, y) {
		let color = this.level.nodeColor(x, y);
		let dots = this.level.dotsForColor(color);
		if (!dots)
			return false;
		this.level.clearWay(dots[0].x, dots[0].y);
		this.level.clearWay(dots[1].x, dots[1].y);
		this.way.push(new Node(x, y, this.level.nodeColor(x, y)));
		return true;
	}

	continueWay(x, y) {
		let color = this.level.nodeColor(x, y);
		if (color && color != last(this.field).color)
			return false;
		if (!color) {
			this.level.placeColor(x, y, color);
			this.way.push(new Node(x, y, color));
			return true;
		}
		if (this.way.length == 1)
			return false;
		if (penult(this.way).x == x && penult(this.way).y == y) {
			this.level.placeColor(this.way.back().x, this.way.back().y, 0);
			this.way.pop();
			return true;
		}
		return false;
	}

	endWay() {
		this.way = [];
	}

	fieldMouseDown(x, y) {
		if (!this.isGameFinished && this.level.canStartEnd(x, y) && this.startWay(x, y)) {
			this.isMouseDown = true;
			//Invalidate view
		}
	}

	fieldMouseMove(x, y) {
		if (this.isMouseDown && this.continueWay(x, y)) {
			//Invalidate view
		}
	}

	fieldMouseUp(x, y) {
		if (this.level.canStartEnd(x, y) && this.level.checkAnswer()) {
			this.isGameFinished = true;
			//Invalidate view
		}
		this.isMouseDown = false;
		this.endWay();
	}
}