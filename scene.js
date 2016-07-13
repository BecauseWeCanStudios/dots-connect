function isDef(o) {
    return typeof(o) != 'undefined';
}

/*
 context.fillStyle = 'rgb(0, 0, 0)';
 context.fillRect(this.x, this.y, this.w, this.h);
 context.strokeStyle = 'rgb(255, 255, 255)'
 */

var STYLE_VALUES = {
    BG_COLOR: 'rgb(0, 0, 0)',
    GRID_BG_FILL: 'rgb(0, 0, 0)',
    GRID_BG_STROKE: 'rgb(170, 170, 170)',
    POINT_COLORS: ['rgb(255, 0, 0)', 'rgb(0, 255, 0)', 'rgb(0, 0, 255)', 'rgb(255, 255, 0)', 'rgb(255, 0, 255)',
        'rgb(0, 255, 255)', 'rgb(125, 0, 0)', 'rgb(0, 125, 0)', 'rgb(0, 0, 125)', 'rgb(125, 125, 0)',
        'rgb(255, 155, 155)', 'rgb(155, 255, 155)', 'rgb(155, 155, 255)', 'rgb(90, 90, 255)', 'rgb(90, 255, 90)',
        'rgb(255, 90, 90)'],
    CELL_SIDE: 48,
    DOT_RADIUS: 18,
    CONNECTION_STROKE_WIDTH: 15,
    CONNECTION_LINE_CAP: 'round',
    GAMEFIELD_OFFSET_X: 50.5,
    GAMEFIELD_OFFSET_Y: 50.5
}

class Drawable {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    render(context, frame, timestamp) {

    }
}

class DebugLabel extends Drawable {

    render(context, frame, timestamp) {

    }

    render(context, frame, timestamp, text) {
        context.font = '12px sans-serif';
        context.textAlign = 'left';
        context.textBaseline = 'hanging';
        let measurement = context.measureText(text);
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillRect(this.x, this.y, measurement.width + 12, 12);
        context.fillStyle = 'rgb(0, 0, 0)';
        context.fillText(text, this.x, this.y);
    }
}

class Framecounter extends DebugLabel {
    render(context, frame, timestamp) {
        if (this.lastRendered) {
            let delta = (timestamp - this.lastRendered) / 1000;
            let fps = 1 / delta | 0;
            let avg = (frame / ((timestamp - this.firstRendered) / 1000)) | 0;
            let text = 'FPS: ' + fps + ' AVG: ' + avg;
            super.render(context, frame, timestamp, text);
        } else {
            this.firstRendered = timestamp;
        }
        this.lastRendered = timestamp;
    }
}

class CoordinateDisplay extends DebugLabel {
    constructor(x, y) {
        super(x, y);
        this.clientX = 0;
        this.clientY = 0;
        this.visible = false;
    }

    updateCoords(clientX, clientY) {
        this.clientX = clientX;
        this.clientY = clientY;
    }

    updateVisibility(visible) {
        this.visible = visible;
    }

    render(context) {
        if (this.visible) {
            let text = 'X: ' + this.clientX + ' Y: ' + this.clientY;
            super.render(context, 0, 0, text);
        } else {
            context.fillStyle = 'rgb(255, 255, 255)';
            context.fillRect(this.x, this.y, 100, 12);
        }
    }
}

class Scene {
    constructor(canvasElement, gameManager) {
        this.coorDisplay = new CoordinateDisplay(0, 12);
        this.objects = [];
        this.overlayObjects = [new Framecounter(0, 0), this.coorDisplay];
        this.framesDrawn = 0;
        this.canvas = canvasElement;
        this.assignListeners(this.canvas);
        this.gm = gameManager;
        this.context = this.canvas.getContext('2d');
        this.requestAnimationFrame();
        console.log('Scene "' + canvasElement.id + '" initialized');
    }

    assignListeners(element) {
        let self = this;
        element.addEventListener('mousedown', (e) => {self.onMouseDown(e)}, false);
        element.addEventListener('mouseup', (e) => {self.onMouseUp(e)}, false);
        element.addEventListener('mousemove', (e) => {self.onMouseMove(e)}, false);
        element.addEventListener('click', (e) => {self.onMouseClick(e)}, false);
        element.addEventListener('mouseenter', (e) => {self.onMouseEnter(e)}, false);
        element.addEventListener('mouseleave', (e) => {self.onMouseLeave(e)}, false);
    }

    requestAnimationFrame() {
        let self = this;
        window.requestAnimationFrame((ts) => {self.render(ts)});
    }

    addObject(obj) {
        this.objects[this.objects.length] = obj;
        return obj;
    }

    addOverlay(obj) {
        this.overlayObjects[this.overlayObjects.length] = obj;
        return obj;
    }

    render(timestamp) {
        let i;
        for (i = 0; i < this.objects.length; i++) {
            this.objects[i].render(this.context, this.framesDrawn, timestamp);
        }
        for (i = 0; i < this.overlayObjects.length; i++) {
            this.overlayObjects[i].render(this.context, this.framesDrawn, timestamp);
        }
        this.framesDrawn++;
        this.requestAnimationFrame();
    }

    getMouseCoords(clientX, clientY) {
        let boundrect = this.canvas.getBoundingClientRect();
        let x = (clientX - boundrect.left) / ((boundrect.right - boundrect.left) / this.context.canvas.width);
        let y = (clientY - boundrect.top) / ((boundrect.bottom - boundrect.top) / this.context.canvas.height);
        return [x | 0, y | 0];
    }

    // TODO Placeholders
    onMouseDown(e) {
        console.log(e.type)
    }

    onMouseUp(e) {
        console.log(e.type)
    }

    onMouseMove(e) {
        let pos = this.getMouseCoords(e.clientX, e.clientY);
        this.coorDisplay.updateCoords(pos[0], pos[1]);
    }

    onMouseClick(e) {
        console.log(e.type)
    }

    onMouseEnter(e) {
        this.coorDisplay.updateVisibility(true);
        let pos = this.getMouseCoords(e.clientX, e.clientY);
        this.coorDisplay.updateCoords(pos[0], pos[1]);
    }

    onMouseLeave(e) {
        this.coorDisplay.updateVisibility(false);
    }
}

class Grid extends Drawable {
    constructor(x, y, gridSize, cellSize, cellType) {
        super(x, y);
        this.cellSize = cellSize;
        this.gridSize = gridSize;
        this.cells = [];
        this.cellType = cellType;
        for (let i = 0; i < gridSize * gridSize; i++) {
            this.cells[i] = new cellType(this, x, y, i % gridSize, (i / gridSize | 0), cellSize, cellSize);
        }
    }

    getElementId(col, row) {
        return row * this.gridSize + col;
    }

    getElement(col, row) {
        return this.cells[this.getElementId(col, row)];
    }

    getCenter(col, row) {
        return [this.x + this.cellSize * col + this.cellSize / 2 | 0,
                this.y + this.cellSize * row + this.cellSize / 2 | 0];
    }

    forceRedraw(col, row) {
        if (isDef(col) && isDef(row)) {
            this.cells[this.gridSize * row + col].dirty = true;
            return;
        }
        if (isDef(col)) {
            this.cells[col].dirty = true;
            return;
        }
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].dirty = true;
        }
    }

    render(context, frame, timestamp) {
        for (let i = 0; i < this.cells.length; i++) {
            this.cells[i].render(context, frame, timestamp);
        }
    }
}

class Tile extends Drawable {
    constructor(grid, ix, iy, col, row, w, h) {
        super(ix + col * grid.cellSize, iy + row * grid.cellSize);
        this.grid = grid;
        this.dirty = true;
        this.col = col;
        this.row = row;
        this.w = w;
        this.h = h;
    }

    render(context, frame, timestamp) {

    }
}

class BackgroundTile extends Tile {
    // TODO Grid resize
    render(context, frame, timestamp) {
        if (!this.dirty)
            return;
        // TODO Single redraw with hidden canvas?
        context.fillStyle = STYLE_VALUES.GRID_BG_FILL;
        context.fillRect(this.x, this.y, this.w, this.h);
        context.strokeStyle = STYLE_VALUES.GRID_BG_STROKE;
        context.strokeRect(this.x, this.y, this.w, this.h);
        this.dirty = false;
    }
}

class NodeTile extends Tile {
    constructor(grid, ix, iy, col, row, w, h, id) {
        super(grid, ix, iy, col, row, w, h);
        this.nodeId = id;
        this.radius = STYLE_VALUES.DOT_RADIUS;
    }

    render(context, frame, timestamp) {
        if (!this.dirty || this.nodeId == 0) // TODO Enum with node states
            return;

        context.fillStyle = STYLE_VALUES.POINT_COLORS[this.nodeId - 1];
        let centerX = this.x + (this.w / 2 | 0);
        let centerY = this.y + (this.h / 2 | 0);
        context.beginPath();
        context.arc(centerX, centerY, this.radius, 0, Math.PI * 2);
        context.fill();
        this.dirty = false;
    }

}

class NodesGrid extends Grid {
    constructor(x, y, gridSize, cellSize, cellType, level) {
        super(x, y);
        this.cellType = cellType;
        this.cellSize = cellSize;
        this.gridSize = gridSize;
        this.level = level;
        this.cells = [];
        this.dirtyPaths = [];
        this.currentState = {};
        this.initLevel(level);
    }

    initLevel(level) {
        for (let i = 0; i < level.length; i++) {
            for (let j = 0; j < level[i].length; j++) {
                this.cells[i * this.gridSize + j] = new this.cellType(this, this.x, this.y, j, i,
                    this.cellSize, this.cellSize, level[i][j].color);
            }
        }
        console.log(level);
    }

    updateLevel(level, gm) {
        // TODO Grid size checks
        var changed = [];
        let amt = 0;
        if (this.dirtyPaths.length > level.paths.length) {
            // TODO Handle addition and removal of paths
        }
        let curPath = gm.currentPath;
        let prevPath = this.currentState.prevPath;
        if (curPath.length == 0 || (isDef(this.currentState.color) && this.currentState.color != curPath[0].color)) {
            // Clean up old currentPath info
            this.currentState = {};
            prevPath = undefined;
            if (isDef(this.level.paths))
            {
                this.dirtyPaths[this.level.paths.length - 1] = false;
            }
        }
        if ((curPath.length > 1 && (isDef(prevPath) && curPath.length != prevPath.length)) ||
            (curPath.length == 1 && (isDef(prevPath)))) {
            // Updating current path
            if (curPath.length > prevPath.length) {
                this.currentState.newNodes = curPath.length - prevPath.length;
                if (curPath.length > 2) {
                    // Redraws one more cell for looks
                    this.currentState.newNodes++;
                }
                this.currentState.dirty = true;
            } else {
                for (let i = prevPath.length - 1; i >= curPath.length - 1; i--) {
                    let eid = this.getElementId(prevPath[i].x, prevPath[i].y);
                    if (prevPath[i].type == NodeTypes.DOT) {
                        this.forceRedraw(eid);
                    }
                    changed[changed.length] = eid;
                }
                this.currentState.newNodes = 1; // Redraw latest element
                this.currentState.dirty = true;
            }
            this.currentState.prevPath = curPath.slice();
        }
        else if (curPath.length == 1 && (!isDef(this.currentState.color))) {
            // New currentPath initialization
            this.currentState.color = curPath[0].color;
            this.currentState.dirty = false; // Nothing to draw yet
            this.currentState.prevPath = curPath.slice();
        }
        return changed;
    }

    drawPath(context, path) {
        let prevStroke = context.strokeStyle;
        let prevLineW = context.lineWidth;
        let prevLineC = context.lineCap;
        context.strokeStyle = STYLE_VALUES.POINT_COLORS[path[0].color - 1];
        context.lineWidth = STYLE_VALUES.CONNECTION_STROKE_WIDTH;
        context.lineCap = STYLE_VALUES.CONNECTION_LINE_CAP;

        let orientation = undefined;
        let prevCenter = this.getCenter(path[0].x, path[0].y);
        for (let i = 1; i <= path.length; i++) {
            let newOrientation = (isDef(path[i]) && path[i - 1].x - path[i].x == 0) ? 1 : 2;
            if (newOrientation != orientation || i == path.length) {
                context.beginPath();
                context.moveTo(prevCenter[0], prevCenter[1]);
                let curCenter = this.getCenter(path[i - 1].x, path[i - 1].y);
                context.lineTo(curCenter[0], curCenter[1]);
                context.stroke();
                orientation = newOrientation;
                prevCenter = curCenter;
            }
        }

        context.strokeStyle = prevStroke;
        context.lineWidth = prevLineW;
        context.lineCap = prevLineC;
        return true;
    }

    render(context, frame, timestamp) {
        super.render(context, frame, timestamp);
        if (isDef(this.level.paths)) {
            for (let i = 0; i < this.level.paths.length; i++) {
                if (isDef(this.dirtyPaths[i]) && this.dirtyPaths[i]) {
                    this.drawPath(context, this.level.paths[i]);
                    this.dirtyPaths[i] = false;
                }
            }
        }

        if (!isDef(this.currentState.color) || !this.currentState.dirty) {
            return;
        }
        let p = this.currentState.prevPath;
        let redraw = p.slice(p.length - this.currentState.newNodes - 1, p.length);
        this.drawPath(context, redraw);
        this.currentState.dirty = false;
    }
}

class Gamefield extends Scene{
    constructor(canvasElement, gameManager) {
        super(canvasElement, gameManager);
        this.context.fillStyle = STYLE_VALUES.BG_COLOR;
        this.context.fillRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    }

    initLevel(level) {
        this.currentLevel = level;
        let oX = (this.context.canvas.width / 2) - ((level.field[0].length * STYLE_VALUES.CELL_SIDE) / 2) + 0.5;
        let oY = (this.context.canvas.height / 2) - ((level.field[0].length * STYLE_VALUES.CELL_SIDE) / 2) + 0.5;
        this.background = new Grid(oX, oY, level.field.length, STYLE_VALUES.CELL_SIDE, BackgroundTile);
        this.addObject(this.background);
        this.foreground = new NodesGrid(oX, oY, level.field.length, STYLE_VALUES.CELL_SIDE, NodeTile, level.field);
        this.addObject(this.foreground);
    }

    updateLevel() {
        return this.updateLevel(this.currentLevel);
    }

    updateLevel(level) {
        let changed = this.foreground.updateLevel(this.currentLevel, this.gm);
        for (let i = 0; i < changed.length; i++) {
            this.background.forceRedraw(changed[i]);
        }
    }

    clearPath(path) {
        if (!path) {
            return;
        }
        for (let i = 0; i < path.length; i++) {
            if (path[i].type == NodeTypes.ROAD) {
                this.background.forceRedraw(path[i].x, path[i].y);
            }
            else if (path[i].type == NodeTypes.DOT) {
                this.foreground.forceRedraw(path[i].x, path[i].y);
                this.background.forceRedraw(path[i].x, path[i].y);
            }
        }
    }

    checkBound(clientX, clientY) {
        return !(clientX < this.foreground.x ||
        clientX > this.foreground.x + this.foreground.gridSize * this.foreground.cellSize ||
        clientY < this.foreground.y ||
        clientY > this.foreground.y + this.foreground.gridSize * this.foreground.cellSize);
    }

    getCellCoordinates(clientX, clientY) {
        let x = 0;
        let y = 0;
        if (clientX < this.foreground.x) {
            x = 0;
        }
        else if (clientX > this.foreground.x + this.foreground.gridSize * this.foreground.cellSize) {
            x = this.foreground.gridSize - 1;
        }
        else {
            x = (clientX - this.background.x) / this.background.cellSize | 0;
        }
        if (clientY < this.foreground.y) {
            y = 0;
        }
        else if (clientY > this.foreground.y + this.foreground.gridSize * this.foreground.cellSize) {
            y = this.foreground.gridSize - 1;
        }
        else {
            y = (clientY - this.background.y) / this.background.cellSize | 0;
        }
        return [x, y];
    }

    onMouseDown(e) {
        if (e.button != 0) {
            return;
        }
        let pos = this.getMouseCoords(e.clientX, e.clientY)
        if (!this.checkBound(pos[0], pos[1])) {
            return;
        }
        let cellCoords = this.getCellCoordinates(pos[0], pos[1]);
        this.gm.fieldMouseDown(cellCoords[0], cellCoords[1]);
    }

    onMouseUp(e) {
        if (e.button != 0) {
            return;
        }
        this.gm.fieldMouseUp();
    }

    onMouseMove(e) {
        super.onMouseMove(e);
        let pos = this.getMouseCoords(e.clientX, e.clientY)
        let cellCoords = this.getCellCoordinates(pos[0], pos[1]);
        this.gm.fieldMouseMove(cellCoords[0], cellCoords[1]);
    }
}
