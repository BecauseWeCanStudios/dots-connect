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
        this.parent.style.width = this.parent.style.height = 
            Math.ceil(Math.min(window.innerHeight, window.innerWidth)) * 0.8 + 'px';
        window.onresize = this.updateAll.bind(this);
        this.createMenuDiv(parent);
    }

    static setElementStyle(element, style) {
        if (!element)
            return;
        let s = '';
        for (let i = 0; i < style.length; ++i)
            s += style[i][0] + ': ' + style[i][1] + '; ';
        element.style = s;
    }

    static setElementAttributes(element, attributes) {
        if (!element)
            return;
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

    updateMenuDiv() {
        let titleFontSize = Math.floor(this.parent.offsetHeight * 0.15),
            buttonFontSize = Math.floor(this.parent.offsetHeight * 0.08);
        Menu.setElementStyle(this.menuDiv, [
            ['line-height', titleFontSize + 'px'],
            ['font-size', titleFontSize + 'px']
        ]);
        Menu.setElementStyle($('new-game-button'), [
            ['line-height', buttonFontSize + 'px'],
            ['font-size', buttonFontSize + 'px'],
            ['height', (buttonFontSize * 1.2 | 0) + 'px']
        ]);
        Menu.setElementStyle($('score-board-button'), [
            ['line-height', buttonFontSize + 'px'],
            ['font-size', buttonFontSize + 'px'],
            ['height', (buttonFontSize * 1.2 | 0) + 'px']
        ]);
    }

    createMenuDiv() {
        this.menuDiv = Menu.createElement('div', [['id', 'menu-div']], [], '');
        this.menuDiv.appendChild(Menu.createElement('label', [['id', 'title-label']], [], 'DOTS CONNECT'));
        let button = Menu.createElement('button', [['id', 'new-game-button'], ['class', 'glowEnabledGreen']], [], 'NEW GAME');
        Menu.assignListeners(button, [['click', this.newGameClick.bind(this)]]);
        this.menuDiv.appendChild(button);
        this.menuDiv.appendChild(Menu.createElement('button', [['id', 'score-board-button'], ['class', 'glowEnabledGreen']],
            [], 'SCORE BOARD'));
        Menu.assignListeners(this.menuDiv, [['transitionend', this.menuDivTransitionEnd.bind(this)]]);
        Menu.assignListeners(this.menuDiv, [['animationend', this.animationEnd.bind(this)]]);
        this.parent.appendChild(this.menuDiv);
        this.updateMenuDiv();
    }

    updateBackButton() {
        let buttonSize = Math.floor(this.parent.offsetWidth * 0.1);
        Menu.setElementStyle($('back-button'), [
            ['width', buttonSize + 'px'],
            ['height', buttonSize + 'px'],
            ['top', this.parent.offsetHeight - buttonSize + 'px'],
            ['left', this.parent.offsetWidth + buttonSize * 1.5 + 'px'],
            ['font-size', buttonSize * 0.5 + 'px'],
            ['line-height', buttonSize * 0.5 + 'px']
        ]);
    }

    createBackButton() {
        this.backButton = Menu.createElement('button', [['id', 'back-button']], [], '✖');
        Menu.assignListeners(this.backButton, [['click', this.backButtonClick.bind(this)]]);
        $('main-container').appendChild(this.backButton);
        this.updateBackButton();
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
                $('header').style = 'display: none';
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
        $('header').style = 'display: none';
        Menu.assignListeners(this.game.scene.canvas, [['animationend', this.sceneFadeAnimationEnd.bind(this)]]);
        this.game.scene.canvas.className = 'fadeIn';
    }

    updateNextLevelButton() {
        let buttonSize = Math.floor(this.parent.offsetWidth * 0.1);
        Menu.setElementStyle($('next-level-button'), [
            ['width', buttonSize + 'px'],
            ['height', buttonSize + 'px'],
            ['top', this.parent.offsetHeight - buttonSize * 4 + 'px'],
            ['left', this.parent.offsetWidth + buttonSize * 1.5 + 'px'],
            ['font-size', buttonSize * 0.5 + 'px'],
            ['line-height', buttonSize * 0.5 + 'px']
        ]);
    }

    createNextLevelButton() {
        this.nextLevelButton = Menu.createElement('button', [['id', 'next-level-button']], [], '→');
        Menu.assignListeners(this.nextLevelButton, [['click', this.nextLevelButtonClick.bind(this)]]);
        $('main-container').appendChild(this.nextLevelButton);
        this.updateNextLevelButton();
    }

    updateLevelButtons() {
        let divSize = Math.floor(this.parent.offsetWidth * 0.9);
        let buttonsInRow = Math.ceil(Math.sqrt(this.levelsCount));
        let buttonsInCol = Math.ceil(this.levelsCount / buttonsInRow);
        let buttonSize = Math.ceil((divSize * 0.8) / buttonsInRow);
        let buttonsMargin = Math.ceil((divSize - buttonSize * buttonsInRow) / buttonsInRow - 1);
        Menu.setElementStyle(this.levelButtonsDiv, [
            ['height', buttonSize * buttonsInCol + buttonsMargin * (buttonsInCol - 1) + 'px'],
            ['width', buttonSize * buttonsInRow + buttonsMargin * (buttonsInRow - 1) + 'px']
        ]);
        for (let i = 0; i < this.levelsCount; ++i) 
            Menu.setElementStyle($(i.toString()), [
                ['position', 'relative'],
                ['width', buttonSize + 'px'],
                ['height', buttonSize + 'px'],
                ['top', buttonsMargin * Math.floor(i / buttonsInRow) + 'px'],
                ['left', buttonsMargin * (i % buttonsInRow)+ 'px'],
                ['font-size', buttonSize * 0.5 + 'px'],
                ['line-height', buttonSize * 0.5 + 'px']
            ]);        
    }

    createLevelButtons() {
        this.levelButtonsDiv = Menu.createElement('div', [['id', 'level-buttons-div']], [], '');
        Menu.assignListeners(this.levelButtonsDiv, [['transitionend',this.buttonsDivTransitionEnd.bind(this)]]);
        Menu.assignListeners(this.levelButtonsDiv, [['animationend',this.animationEnd.bind(this)]]);
        this.parent.appendChild(this.levelButtonsDiv);
        for (let i = 0; i < this.levelsCount; ++i) {
            let button = Menu.createElement('button', [['id', i.toString()], ['class', 'level-select-button']], 
                [], i != this.levelsCount - 1 ? (i + 1).toString() : '?');
            Menu.assignListeners(button, [['click', this.levelButtonClick.bind(this)]]);
            this.levelButtonsDiv.appendChild(button);
        }
        this.updateLevelButtons();
    }

    newGameClick() {
        if (this.isClicked) return;
        this.isClicked = true;
        this.state = MenuStates.LEVEL_SELECT;
        this.createBackButton();
        this.menuDiv.style.opacity = 0;
    }
    
    static tryUpdate(object, func) {
        if (object)
            func();        
    }
    
    updateAll() {
        this.parent.style.width = this.parent.style.height =
            Math.ceil(Math.min(window.innerHeight, window.innerWidth)) * 0.8 + 'px';
        Menu.tryUpdate(this.menuDiv, this.updateMenuDiv.bind(this));
        Menu.tryUpdate(this.backButton, this.updateBackButton.bind(this));
        Menu.tryUpdate(this.nextLevelButton, this.updateNextLevelButton.bind(this));
        Menu.tryUpdate(this.levelButtonsDiv, this.updateLevelButtons.bind(this));
    }
}