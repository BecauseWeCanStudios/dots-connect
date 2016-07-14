"use strict";

const $ = document.getElementById.bind(document);

var MenuStates = {
    MAIN_MENU: 0,
    LEVEL_SELECT: 1,
    GAME: 2,
    CHANGING_LEVEL: 3,
    LEADERBOARD: 4
};

var opts = {
    lines: 13 // The number of lines to draw
    , length: 0 // The length of each line
    , width: 35 // The line thickness
    , radius: 84 // The radius of the inner circle
    , scale: 1 // Scales overall size of the spinner
    , corners: 1 // Corner roundness (0..1)
    , color: '#FFA500' // #rgb or #rrggbb or array of colors
    , opacity: 0 // Opacity of the lines
    , rotate: 0 // The rotation offset
    , direction: 1 // 1: clockwise, -1: counterclockwise
    , speed: 1 // Rounds per second
    , trail: 60 // Afterglow percentage
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
        let userdata;
        try {
            userdata = JSON.parse(window.document.cookie);
        }
        catch(err) { }
        if (userdata && userdata.nickname) {
            this.nickname = userdata.nickname;
        }
        else {
            this.nickname = '';
        }
        this.spinner = new Spinner(opts);
        this.isClicked = true;
        this.parent = parent;
        this.game = game;
        this.levelsCount = storage.levelCount() + 1;
        this.state = MenuStates.MAIN_MENU;
        this.parent.style.width = this.parent.style.height = 
            Math.ceil(Math.min(window.innerHeight, window.innerWidth)) * 0.8 + 'px';
        opts.radius = Math.ceil(this.parent.offsetHeight * 0.20);
        opts.width = Math.ceil(opts.radius * 0.30);
        $('header').style.fontSize = Math.floor((window.innerHeight - this.parent.offsetHeight) / 2) + 'px';
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
            ['width', this.menuDiv.offsetWidth * 0.7 + 'px']
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
        let input = Menu.createElement('input', [['id', 'nickname-input'], ['placeholder','nickname'], ['maxlength', 10]], [], '');
        if (this.nickname) 
            input.value = this.nickname;
        this.menuDiv.appendChild(input);
        let button = Menu.createElement('button', [['id', 'new-game-button'], ['class', 'glowEnabledGreen']], [], 'START GAME');
        Menu.assignListeners(button, [['click', this.newGameClick.bind(this)]]);
        this.menuDiv.appendChild(button);
        button = Menu.createElement('button', [['id', 'score-board-button'], ['class', 'glowEnabledGreen']],
            [], 'LEADERBOARD');
        Menu.assignListeners(button, [['click', this.leaderBoardButtonClick.bind(this)]]);
        this.menuDiv.appendChild(button);
        Menu.assignListeners(this.menuDiv, [['transitionend', this.menuDivTransitionEnd.bind(this)]]);
        Menu.assignListeners(this.menuDiv, [['animationend', this.animationEnd.bind(this)]]);
        this.parent.appendChild(this.menuDiv);
        this.updateMenuDiv();
    }
    
    sceneFadeAnimationEnd() {
        if (this.state == MenuStates.CHANGING_LEVEL) {
            this.game.scene.canvas.remove();
            this.state -= 1;
            this.currentLevel += 1;
            this.setScore(0);
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
                this.state = MenuStates.MAIN_MENU;
                this.backButton.remove();
                this.levelButtonsDiv.style.opacity = 0;
                break;
            case MenuStates.GAME:
                //GameField destroy
                $('header').style = 'display: none';
                Menu.assignListeners(this.game.scene.canvas, [['animationend', this.sceneFadeAnimationEnd.bind(this)]]);
                this.game.scene.canvas.className = 'fadeIn';
                this.nextLevelButton.remove();
                this.resetButton.remove();
                this.state = MenuStates.LEVEL_SELECT;
                this.setScore(this.userInfo.totalScore);
                this.updateScoreLabel();
                break;
            case MenuStates.LEADERBOARD:
                this.state = MenuStates.MAIN_MENU;
                this.backButton.remove();
                this.leaderboardDiv.style.opacity = 0;
                break;
        }
    }
    
    animationEnd() {
        this.isClicked = false;
    }
    
    menuDivTransitionEnd() {
        this.menuDiv.remove();
        this.spinner.spin($('main-container'));
        if (this.state == MenuStates.LEVEL_SELECT)
            leaderboard.getUserInfo(this.nickname, this.onGetUserInfo.bind(this));
        else 
            leaderboard.getHighScores(this.onGetLeaderboard.bind(this));
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
    
    resetButtonClick() {
        this.game.resetLevel();        
    }

    levelButtonClick(event) {
        if (this.isClicked || event.target.className == 'locked') return;
        this.isClicked = true;
        $('playfield').className = 'glowDisabled';
        this.state = MenuStates.GAME;
        this.currentLevel = Number(event.target.id);
        this.levelButtonsDiv.style.opacity = 0;
        this.setScore(0);           
        this.updateScoreLabel();
        this.nextLevelButton = this.createButton('next-level-button', this.nextLevelButtonClick, '→', 1.5, 4);
        this.resetButton = this.createButton('reset-button', this.resetButtonClick, '↺', 1.5, 7);
    }

    nextLevelButtonClick() {
        if(this.isClicked || (!this.game.levelsCompleted[this.currentLevel] && this.currentLevel < this.levelsCount - 1))
            return;
        this.isClicked = true;
        this.state += 1;
        $('header').style = 'display: none';
        Menu.assignListeners(this.game.scene.canvas, [['animationend', this.sceneFadeAnimationEnd.bind(this)]]);
        this.game.scene.canvas.className = 'fadeIn';
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
                [], i != this.levelsCount - 1 ? (i + 1).toString() : '🎲');
            Menu.assignListeners(button, [['click', this.levelButtonClick.bind(this)]]);
            this.levelButtonsDiv.appendChild(button);
        }
        this.updateLevelButtons();
    }

    onGetUserInfo(nickname, userInfo) {
        if (!userInfo) {
            leaderboard.addUser(this.nickname);
            leaderboard.getUserInfo(this.nickname, this.onGetUserInfo.bind(this));
            return;
        }
        this.spinner.stop();
        this.userInfo = userInfo;
        this.nickname = nickname;
        this.setScore(userInfo.totalScore);
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
        this.nickname = $('nickname-input').value.replace(/<(?:.|\n)*?>/gm, '');
        if (!this.nickname) {
            this.isClicked = false;
            $('nickname-input').className = 'wrongInput'
            return;
        }
        $('nickname-input').className = '';
        this.backButton = this.createButton('back-button', this.backButtonClick, '↩', 1.5, 1);
        window.document.cookie = JSON.stringify({nickname: this.nickname});
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
        if (cur_score > pre_score) {
            leaderboard.updateUserScore(this.nickname, this.currentLevel, cur_score, 
                this.userInfo.totalScore - pre_score + cur_score);
            this.userInfo.totalScore += cur_score - pre_score;
        }
    }
    
    updateAll() {
        this.parent.style.width = this.parent.style.height =
            Math.ceil(Math.min(window.innerHeight, window.innerWidth)) * 0.8 + 'px';
        opts.radius = Math.ceil(this.parent.offsetHeight * 0.20);
        opts.width = Math.ceil(opts.radius * 0.30);
        Menu.tryUpdate(this.menuDiv, this.updateMenuDiv.bind(this));
        this.updateButton(this.backButton, 1.5, 1);
        this.updateButton(this.nextLevelButton, 1.5, 4);
        this.updateButton(this.resetButton, 1.5, 7);
        Menu.tryUpdate(this.levelButtonsDiv, this.updateLevelButtons.bind(this));
        Menu.tryUpdate(this.scoreLabel, this.updateScoreLabel.bind(this));
        Menu.tryUpdate(this.leaderboardDiv, this.updateLeaderboradDiv.bind(this));
        $('header').style.fontSize =  Math.floor((window.innerHeight - this.parent.offsetHeight) / 2) + 'px';
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
    
    onGetLeaderboard(leaderboardData) {
        this.spinner.stop();
        this.createLeaderboardDiv(leaderboardData);
    }
    
    leaderBoardButtonClick() {
        if (this.isClicked) return;
        this.isClicked = true;
        this.state = MenuStates.LEADERBOARD;
        this.backButton = this.createButton('back-button', this.backButtonClick, '↩', 1.5, 1);
        this.menuDiv.style.opacity = 0;                
    }
    
    leaderBoardTransitionEnd() {
        this.leaderboardDiv.remove();
        this.createMenuDiv();
    }

    updateLeaderboradDiv() {
        if (!this.leaderboardDiv)
            return;
        let fontSize = this.parent.offsetHeight * 0.07;
        let minFont = this.parent.offsetHeight * 0.03;
        let table = this.leaderboardDiv.firstChild;
        let num = 0;
        let row = table.firstChild;
        while (row) {
            Menu.setElementStyle(row, [['font-size', Math.max(fontSize * Math.pow(0.8, num), minFont) + 'px']]);
            ++num;
            row = row.nextSibling;
        }
    }
    
    createLeaderboardDiv(leaderboardData) {
        this.leaderboardDiv = Menu.createElement('div', [['id', 'leaderboard-div']], [], '');
        Menu.assignListeners(this.leaderboardDiv, [['transitionend', this.leaderBoardTransitionEnd.bind(this)]]);
        Menu.assignListeners(this.leaderboardDiv, [['animationend', this.animationEnd.bind(this)]]);
        let table = Menu.createElement('table', [['id', 'leaderboard-table']], [], '');
        this.parent.appendChild(this.leaderboardDiv);
        for (let i = 0; i < leaderboardData.length; ++i) {
            console.log(leaderboardData);
            let row = Menu.createElement('tr', [], [], '');
            row.appendChild(Menu.createElement('td', [], [], decodeURIComponent(leaderboardData[i].user)));
            row.appendChild(Menu.createElement('td', [['id', 'score-col']], [], leaderboardData[i].data.totalScore));
            table.appendChild(row);
        }
        this.leaderboardDiv.appendChild(table);
        this.updateLeaderboradDiv();
    }
    
    updateButton(button, mx, my) {
        if (!button) 
            return;
        let buttonSize = Math.floor(this.parent.offsetWidth * 0.1);
        Menu.setElementStyle(button, [
            ['width', buttonSize + 'px'],
            ['height', buttonSize + 'px'],
            ['top', this.parent.offsetHeight - buttonSize * my + 'px'],
            ['left', this.parent.offsetWidth + buttonSize * mx + 'px'],
            ['font-size', buttonSize * 0.5 + 'px'],
            ['line-height', buttonSize * 0.5 + 'px']
        ]);        
    }
    
    createButton(id, func, text, mx, my) {
        let button = Menu.createElement('button', [['id', id]], [], text);
        Menu.assignListeners(button, [['click', func.bind(this)]]);
        $('main-container').appendChild(button);
        this.updateButton(button, mx, my, 4);
        return button;
    }
    
    setScore(score) {
        if (this.state == MenuStates.GAME) {
            let s = '';
            s += ' HIGH-SCORE: ' + (this.userInfo && this.userInfo.levels &&
                this.userInfo.levels[this.currentLevel] ? this.userInfo.levels[this.currentLevel] : 0);
            if (this.currentLevel < this.levelsCount - 1)
                this.scoreLabel.innerHTML = 'LVL ' + (this.currentLevel + 1) + s + ' SCORE: ' + score;
            else
                this.scoreLabel.innerHTML = 'RANDOM SCORE: ' + score;
        }
        else 
            this.scoreLabel.innerHTML = this.nickname + ' SCORE: ' + score;
        this.updateScoreLabel();
    }
}