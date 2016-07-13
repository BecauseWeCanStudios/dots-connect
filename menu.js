"use strict";

const $ = document.getElementById.bind(document);

var MenuStates = {
    MAIN_MENU: 0,
    LEVEL_SELECT: 1,
    GAME: 2,
    CHANGING_LEVEL: 3
};

var opts = {
    lines: 11 // The number of lines to draw
    , length: 0 // The length of each line
    , width: 50 // The line thickness
    , radius: 84 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 0.7 // Corner roundness (0..1)
    , color: '#FFFFFF' // #rgb or #rrggbb or array of colors
    , opacity: 0.1 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 40 // Afterglow percentage
    , fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
    , zIndex: 2e9 // The z-index (defaults to 2000000000)
    , className: 'spinner' // The CSS class to assign to the spinner
    , top: '50%' // Top position relative to parent
    , left: '50%' // Left position relative to parent
    , shadow: false // Whether to render a shadow
    , hwaccel: false // Whether to use hardware acceleration
    , position: 'absolute' // Element positioning
};

class Menu {

    constructor(parent, game) {
        this.nickname = ' ';
        this.spinner = new Spinner(opts);
        this.isClicked = true;
        this.parent = parent;
        this.game = game;
        this.levelsCount = storage.levelCount() + 1;
        this.state = MenuStates.MAIN_MENU;
        this.parent.style.width = this.parent.style.height = 
            Math.ceil(Math.min(window.innerHeight, window.innerWidth)) * 0.8 + 'px';
        window.onresize = this.updateAll.bind(this);
        this.createScoreLabel();
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
        Menu.setElementStyle($('nickname-input'), [
            ['line-height', buttonFontSize * 0.5 + 'px'],
            ['font-size', buttonFontSize * 0.5 + 'px'],
            ['height', (buttonFontSize * 0.8 | 0) + 'px'],
            ['width', this.menuDiv.offsetWidth * 0.7 + 'px'],
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
        let input = Menu.createElement('input', [['id', 'nickname-input']], [], '');
        input.value = 'Nickname';
        this.menuDiv.appendChild(input);
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
                this.scoreLabel.innerHTML = this.nickname + ' SCORE: ' + this.userInfo.totalScore;
                this.updateScoreLabel();
                this.state -= 1;
        }
    }
    
    animationEnd() {
        this.isClicked = false;
    }
    
    menuDivTransitionEnd() {
        this.menuDiv.remove();
        this.spinner.spin($('main-container'));
        leaderboard.getUserInfo(this.nickname, this.onGetUserInfo.bind(this));
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
        if (this.isClicked || event.target.className == 'locked') return;
        this.isClicked = true;
        $('playfield').className = 'glowDisabled';
        this.state = MenuStates.GAME;
        this.currentLevel = Number(event.target.id);
        this.levelButtonsDiv.style.opacity = 0;
        if (this.currentLevel < this.levelsCount - 1)
            this.scoreLabel.innerHTML = 'LVL ' + (this.currentLevel + 1) + ' SCORE: 0';
        else
            this.scoreLabel.innerHTML = 'RANDOM SCORE: 0';            
        this.updateScoreLabel();
        this.createNextLevelButton();
    }

    nextLevelButtonClick() {
        if(this.isClicked || (!this.game.levelsCompleted[this.currentLevel] && this.currentLevel < this.levelsCount - 1))
            return;
        this.isClicked = true;
        this.state += 1;
        $('header').style = 'display: none';
        Menu.assignListeners(this.game.scene.canvas, [['animationend', this.sceneFadeAnimationEnd.bind(this)]]);
        if (this.currentLevel < this.levelsCount - 1)
            this.scoreLabel.innerHTML = 'LVL ' + (this.currentLevel + 1) + ' SCORE: 0';
        else
            this.scoreLabel.innerHTML = 'RANDOM SCORE: 0';
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
            let buttonClass;
            if (game.levelsCompleted[i])
                buttonClass = '';
            else if (!i || (!game.levelsCompleted[i] && game.levelsCompleted[i - 1]))
                buttonClass = 'levelAvailable';
            else 
                buttonClass = 'locked';
            let button = Menu.createElement('button', [['id', i.toString()], ['class', buttonClass]], 
                [], i != this.levelsCount - 1 ? (i + 1).toString() : '?');
            Menu.assignListeners(button, [['click', this.levelButtonClick.bind(this)]]);
            this.levelButtonsDiv.appendChild(button);
        }
        this.updateLevelButtons();
    }

    onGetUserInfo(nickname, userInfo) {
        console.log(userInfo);
        if (!userInfo) {
            leaderboard.addUser(this.nickname);
            leaderboard.getUserInfo(this.nickname, this.onGetUserInfo.bind(this));
            return;
        }
        this.spinner.stop();
        this.userInfo = userInfo;
        this.nickname = nickname;
        this.scoreLabel.innerHTML = this.nickname + ' SCORE: ' + userInfo.totalScore;
        this.game.clearCompletedLevels();
        if (userInfo.levels !== undefined) 
            this.game.updateLevelsCompletion(userInfo.levels);
        this.updateScoreLabel();
        this.createLevelButtons();
    }

    newGameClick() {
        if (this.isClicked) return;
        this.isClicked = true;
        this.state = MenuStates.LEVEL_SELECT;
        this.nickname = $('nickname-input').value;
        this.createBackButton();
        this.menuDiv.style.opacity = 0;
    }
    
    static tryUpdate(object, func) {
        if (object)
            func();        
    }
    
    completeLevel() {
        if (this.currentLevel >= this.levelsCount - 1)
            return;
        let pre_score = 0, cur_score = this.game.getScore();
        if (this.userInfo && this.userInfo.levels) {
            if (this.currentLevel < this.userInfo.levels.length) {
                pre_score = this.userInfo.levels[this.currentLevel];
                this.userInfo.levels[this.currentLevel] = cur_score;
            }
            else
                this.userInfo.levels.push(cur_score);                
        }
        else 
            this.userInfo.levels = [cur_score];
        this.game.levelsCompleted[this.currentLevel] = true;
        console.log('AAAAAAAAAAAAAAA');
        if (cur_score > pre_score) {
            leaderboard.updateUserScore(this.nickname, this.currentLevel, cur_score, 
                this.userInfo.totalScore - pre_score + cur_score);
            this.userInfo.totalScore += cur_score - pre_score;
            console.log(this.userInfo.totalScore);
        }
    }
    
    updateAll() {
        this.parent.style.width = this.parent.style.height =
            Math.ceil(Math.min(window.innerHeight, window.innerWidth)) * 0.8 + 'px';
        Menu.tryUpdate(this.menuDiv, this.updateMenuDiv.bind(this));
        Menu.tryUpdate(this.backButton, this.updateBackButton.bind(this));
        Menu.tryUpdate(this.nextLevelButton, this.updateNextLevelButton.bind(this));
        Menu.tryUpdate(this.levelButtonsDiv, this.updateLevelButtons.bind(this));
        Menu.tryUpdate(this.scoreLabel, this.updateScoreLabel.bind(this));
    }
    
    setScore(score) {
        this.scoreLabel.innerHTML = 'LVL ' + (this.currentLevel + 1) + ' SCORE: ' + score;
        this.updateScoreLabel();
    }

    updateScoreLabel() {
        let fontSize = Math.min(window.innerHeight, window.innerWidth) * 0.1;
        Menu.setElementStyle(this.scoreLabel, [
            ['font-size', fontSize * 0.5 + 'px'],
            ['line-height', fontSize + 'px'],
            ['top', this.parent.offsetTop + this.parent.offsetHeight + 'px']
        ]);
        this.scoreLabel.style.left = Math.floor((window.innerWidth - this.scoreLabel.offsetWidth) / 2) + 'px';
    }

    createScoreLabel() {
        this.scoreLabel = Menu.createElement('label', [['id', 'score-label']], [], '');
        $('main-container').appendChild(this.scoreLabel);
        this.updateScoreLabel();
    }
}