"use strict";

const $ = document.getElementById.bind(document);

var MenuStates = {
    MAIN_MENU: 0,
    LEVEL_SELECT: 1,
    GAME: 2,
    CHANGING_LEVEL: 3
};

class Menu {

    constructor(parent, game) {
        this.isClicked = true;
        this.parent = parent;
        this.game = game;
        this.levelsCount = storage.levelCount() + 1;
        this.state = MenuStates.MAIN_MENU;
        this.createMenuDiv(parent);
    }

    static setElementStyle(element, style) {
        let s = '';
        for (let i = 0; i < style.length; ++i)
            s += style[i][0] + ': ' + style[i][1] + '; ';
        element.style = s;
    }

    static setElementAttributes(element, attributes) {
        for (let i = 0; i < attributes.length; ++i)
            element.setAttribute(attributes[i][0], attributes[i][1]);
    }

    static createElement(name, attributes, style, innerHTML) {
        let element = document.createElement(name);
        Menu.setElementAttributes(element, attributes);
        Menu.setElementStyle(element, style);
        element.innerHTML = innerHTML;
        return element;
    }

    static assignListeners(element, listeners) {
        for (let i = 0; i < listeners.length; ++i)
            element.addEventListener(listeners[i][0], listeners[i][1]);
    }

    createMenuDiv() {
        let titleFontSize = this.parent.offsetHeight * 0.15 | 0,
            buttonFontSize = this.parent.offsetHeight * 0.09 | 0;
        this.menuDiv = Menu.createElement('div', [['id', 'menu-div']], [], '');
        this.menuDiv.appendChild(Menu.createElement('label', [['id', 'title-label']], [
                ['line-height', titleFontSize + 'px'],
                ['font-size', titleFontSize + 'px']
            ], 'DOTS CONNECT'
        ));
        let button = Menu.createElement('button', [['id', 'new-game-button'], ['class', 'glowEnabledGreen']], [
                ['line-height', buttonFontSize + 'px'],
                ['font-size', buttonFontSize + 'px'],
                ['height', (buttonFontSize * 1.2 | 0) + 'px']
            ], 'NEW GAME'
        );
        Menu.assignListeners(button, [['click', this.newGameClick.bind(this)]]);
        this.menuDiv.appendChild(button);
        this.menuDiv.appendChild(Menu.createElement('button', [['id', 'score-board-button'], ['class', 'glowEnabledGreen']], [
                ['line-height', buttonFontSize + 'px'],
                ['font-size', buttonFontSize + 'px'],
                ['height', (buttonFontSize * 1.2 | 0) + 'px']
            ], 'SCORE BOARD'
        ));
        Menu.assignListeners(this.menuDiv, [['transitionend', this.menuDivTransitionEnd.bind(this)]]);
        Menu.assignListeners(this.menuDiv, [['animationend', this.animationEnd.bind(this)]]);
        this.parent.appendChild(this.menuDiv);
    }

    createBackButton() {
        let buttonSize = Math.floor(this.parent.offsetWidth * 0.1);
        this.backButton = Menu.createElement('button', [['id', 'back-button']], [
            ['width', buttonSize + 'px'],
            ['height', buttonSize + 'px'],
            ['top', this.parent.offsetHeight - buttonSize + 'px'],
            ['left', this.parent.offsetWidth + buttonSize * 1.5 + 'px'],
            ['font-size', buttonSize * 0.5 + 'px'],
            ['line-height', buttonSize * 0.5 + 'px']
        ], '✖');
        Menu.assignListeners(this.backButton, [['click', this.backButtonClick.bind(this)]]);
        $('main-container').appendChild(this.backButton);
    }
    
    sceneFadeAnimationEnd() {
        if (this.state == MenuStates.CHANGING_LEVEL) {
            this.game.scene.canvas.remove();
            this.state -= 1;
            this.currentLevel += 1;
            this.startGame();
            return;
        }
        this.game.scene.canvas.remove();
        $('playfield').className = 'glowEnabledOrange';
        this.createLevelButtons();
    }
    
    backButtonClick() {
        if (this.isClicked) return;
        this.isClicked = true;
        switch (this.state) {
            case MenuStates.MAIN_MENU:
                return;
            case MenuStates.LEVEL_SELECT:
                this.state -= 1;
                this.backButton.remove();
                this.levelButtonsDiv.style.opacity = 0;
                break;
            case MenuStates.GAME:
                //GameField destroy
                Menu.assignListeners(this.game.scene.canvas, [['animationend', this.sceneFadeAnimationEnd.bind(this)]]);
                this.game.scene.canvas.className = 'fadeIn';
                this.nextLevelButton.remove();
                this.state -= 1;
        }
    }
    
    animationEnd() {
        this.isClicked = false;
    }
    
    menuDivTransitionEnd() {
        this.menuDiv.remove();
        this.createLevelButtons();
    }

    buttonsDivTransitionEnd() {
        this.levelButtonsDiv.remove();
        if (this.state == MenuStates.GAME)
            this.startGame();
        else 
            this.createMenuDiv();
    }

    startGame() {
        this.game.selectLevel(this.currentLevel);
        this.game.setScene(new Gamefield(initSceneCanvas('main-scene'), this.game));
        this.game.startNewGame();
        this.isClicked = false;
    }

    levelButtonClick(event) {
        if (this.isClicked) return;
        this.isClicked = true;
        $('playfield').className = 'glowDisabled';
        this.state = MenuStates.GAME;
        this.currentLevel = Number(event.target.id);
        this.levelButtonsDiv.style.opacity = 0;
        this.createNextLevelButton();
    }

    nextLevelButtonClick() {
        if(this.isClicked)
            return;
        this.isClicked = true;
        this.state += 1;
        Menu.assignListeners(this.game.scene.canvas, [['animationend', this.sceneFadeAnimationEnd.bind(this)]]);
        this.game.scene.canvas.className = 'fadeIn';
    }
    
    createNextLevelButton() {
        let buttonSize = Math.floor(this.parent.offsetWidth * 0.1);
        this.nextLevelButton = Menu.createElement('button', [['id', 'next-level-button']], [
            //['position', 'relative'],
            ['width', buttonSize + 'px'],
            ['height', buttonSize + 'px'],
            ['top', this.parent.offsetHeight - buttonSize * 4 + 'px'],
            ['left', this.parent.offsetWidth + buttonSize * 1.5 + 'px'],
            ['font-size', buttonSize * 0.5 + 'px'],
            ['line-height', buttonSize * 0.5 + 'px']
        ], '→');
        Menu.assignListeners(this.nextLevelButton, [['click', this.nextLevelButtonClick.bind(this)]]);
        $('main-container').appendChild(this.nextLevelButton);
    }
    
    createLevelButtons() {
        let divSize = Math.floor(this.parent.offsetWidth * 0.9);
        let buttonsInRow = Math.ceil(Math.sqrt(this.levelsCount));
        let buttonsInCol = Math.ceil(this.levelsCount / buttonsInRow);
        let buttonSize = Math.ceil((divSize * 0.8) / buttonsInRow);
        let buttonsMargin = Math.ceil((divSize - buttonSize * buttonsInRow) / buttonsInRow - 1);
        this.levelButtonsDiv = Menu.createElement('div', [['id', 'level-buttons-div']], [
            ['height', buttonSize * buttonsInCol + buttonsMargin * (buttonsInCol - 1) + 'px'],
            ['width', buttonSize * buttonsInRow + buttonsMargin * (buttonsInRow - 1) + 'px']
        ], '');
        Menu.assignListeners(this.levelButtonsDiv, [['transitionend',this.buttonsDivTransitionEnd.bind(this)]]);
        Menu.assignListeners(this.levelButtonsDiv, [['animationend',this.animationEnd.bind(this)]]);
        this.parent.appendChild(this.levelButtonsDiv);
        for (let i = 0; i < this.levelsCount; ++i) {
            let button = Menu.createElement('button', [['id', i.toString()], ['class', 'level-select-button']], [
                ['position', 'relative'],
                ['width', buttonSize + 'px'],
                ['height', buttonSize + 'px'],
                ['top', buttonsMargin * Math.floor(i / buttonsInRow) + 'px'],
                ['left', buttonsMargin * (i % buttonsInRow)+ 'px'],
                ['font-size', buttonSize * 0.5 + 'px'],
                ['line-height', buttonSize * 0.5 + 'px']
            ], i != this.levelsCount - 1 ? (i + 1).toString() : '?');
            Menu.assignListeners(button, [['click', this.levelButtonClick.bind(this)]]);
            this.levelButtonsDiv.appendChild(button);
        }
    }

    newGameClick() {
        if (this.isClicked) return;
        this.isClicked = true;
        this.state = MenuStates.LEVEL_SELECT;
        this.createBackButton();
        this.menuDiv.style.opacity = 0;
    }
}