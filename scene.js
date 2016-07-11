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
        context.font = '12px';
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

    // TODO Placeholders
    onMouseDown(e) {
        console.log(e.type)
    }

    onMouseUp(e) {
        console.log(e.type)
    }

    onMouseMove(e) {
        let clientX = e.clientX - this.canvas.offsetLeft;
        let clientY = e.clientY - this.canvas.offsetTop;
        this.coorDisplay.updateCoords(clientX, clientY);
    }

    onMouseClick(e) {
        console.log(e.type)
    }

    onMouseEnter(e) {
        this.coorDisplay.updateVisibility(true);
        this.coorDisplay.updateCoords(e.clientX, e.clientY);
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
        for (let i = 0; i < gridSize * gridSize; i++) {
            this.cells[i] = new cellType(this, x, y, i % gridSize, (i / gridSize | 0), cellSize, cellSize);
        }
    }

    getElement(col, row) {
        return this.cells[row * cellSize + col];
    }

    forceRedraw(col, row) {
        if (col && row) {
            this.cells[this.gridSize * row + col].dirty = true;
            return;
        }
        if (col) {
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
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillRect(this.x, this.y, this.w, this.h);
        context.strokeStyle = 'rgb(100, 100, 100)';
        context.setLineDash([15, 15]);
        context.strokeRect(this.x, this.y, this.w, this.h);
        context.strokeStyle = 'rgb(0, 0, 0)';
        context.setLineDash([]);
        context.beginPath();
        let centerX = this.x + (this.w / 2 | 0);
        let centerY = this.y + (this.h / 2 | 0);
        if (this.col != 0) {
            context.moveTo(this.x, centerY);
            context.lineTo(centerX, centerY);
        }
        if (this.col != this.grid.gridSize - 1) {
            context.moveTo(centerX, centerY);
            context.lineTo(this.x + this.w, centerY);
        }
        if (this.row != 0) {
            context.moveTo(centerX, this.y);
            context.lineTo(centerX, centerY);
        }
        if (this.row != this.grid.gridSize - 1) {
            context.moveTo(centerX, centerY);
            context.lineTo(centerX, this.y + this.h);
        }
        context.stroke();
        context.closePath();
        this.dirty = false;
    }
}

class NodeTile extends Tile {
    constructor(grid, ix, iy, col, row, w, h, id) {
        super(grid, ix, iy, col, row, w, h);
        this.nodeId = id;
    }

    render(context, frame, timestamp) {
        if (!this.dirty || this.nodeId == 0) // TODO Enum with node states
            return;

        context.fillStyle = 'rgb' + this.grid.colorCodes[this.nodeId - 1];
        let centerX = this.x + (this.w / 2 | 0);
        let centerY = this.y + (this.h / 2 | 0);
        context.beginPath();
        context.arc(centerX, centerY, (this.w / 3 | 0), 0, Math.PI * 2);
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
        this.cells = [];
        this.colorCodes = ['(255, 0, 0)', '(0, 255, 0)', '(0, 0, 255)'];
        this.initLevel(level);
    }

    initLevel(level) {
        for (let i = 0; i < level.length; i++) {
            this.cells[i] = new this.cellType(this, this.x, this.y, i % this.gridSize, (i / this.gridSize | 0),
                this.cellSize, this.cellSize, level[i]);
        }
    }

    updateLevel(level) {
        // TODO Grid size checks
        let changed = [];
        let amt = 0;
        for (let i = 0; i < level.length; i++) {
            if (this.cells[i].nodeId != level[i]) {
                this.cells[i].nodeId = level[i];
                changed[amt] = i;
                amt++;
                this.forceRedraw(i);
            }
        }
        return changed;
    }
}

class Gamefield extends Scene{
    constructor(canvasElement, gameManager) {
        super(canvasElement, gameManager);
        this.background = new Grid(100, 100, 4, 32, BackgroundTile);
        this.addObject(this.background);
        this.foreground = new NodesGrid(100, 100, 4, 32, NodeTile, [0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0]);
        this.addObject(this.foreground);
    }

    initLevel(level) {
        // TODO
    }

    updateLevel(level) {
        let changed = this.foreground.updateLevel(level);
        for (let i = 0; i < changed.length; i++) {
            this.background.forceRedraw(i);
        }
    }
}