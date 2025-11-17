class CharacterMatchGame {
    constructor() {
        this.layers = 3;
        this.rows = 6;
        this.cols = 8;
        this.characters = ['我', '你', '他', '她', '它', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '天', '地', '人', '日', '月', '水', '火', '山', '石', '田', '土', '木', '金', '玉', '宝'];
        this.board = [];
        this.selected = [];
        this.score = 0;
        this.time = 60;
        this.timer = null;
        this.isGameRunning = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startNewGame();
    }

    setupEventListeners() {
        // 新游戏按钮
        document.getElementById('new-game').addEventListener('click', () => this.startNewGame());
        
        // 提示按钮
        document.getElementById('hint').addEventListener('click', () => this.showHint());
        
        // 重新开始按钮
        document.getElementById('restartGame').addEventListener('click', () => {
            this.hideGameOverModal();
            this.startNewGame();
        });
    }

    startNewGame() {
        // 重置游戏状态
        this.score = 0;
        this.time = 60;
        this.selected = [];
        this.isGameRunning = true;
        
        // 清除计时器
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // 生成新棋盘
        this.generateBoard();
        
        // 渲染棋盘
        this.renderBoard();
        
        // 更新分数和时间
        this.updateScore();
        this.updateTime();
        
        // 开始计时
        this.startTimer();
        
        // 隐藏游戏结束弹窗
        this.hideGameOverModal();
    }

    generateBoard() {
        this.board = [];
        
        // 为每一层生成字符
        for (let layer = 0; layer < this.layers; layer++) {
            const layerBoard = [];
            
            // 计算该层需要的字符数量
            const totalChars = this.rows * this.cols;
            const uniqueCharsCount = Math.floor(totalChars / 2);
            
            // 选择随机字符
            const selectedChars = [];
            for (let i = 0; i < uniqueCharsCount; i++) {
                const randomChar = this.characters[Math.floor(Math.random() * this.characters.length)];
                selectedChars.push(randomChar, randomChar); // 每个字符出现两次
            }
            
            // 打乱字符顺序
            this.shuffleArray(selectedChars);
            
            // 填充棋盘
            for (let row = 0; row < this.rows; row++) {
                const rowChars = [];
                for (let col = 0; col < this.cols; col++) {
                    const char = selectedChars[row * this.cols + col];
                    rowChars.push({
                        char: char,
                        isVisible: true,
                        isSelected: false,
                        layer: layer,
                        row: row,
                        col: col
                    });
                }
                layerBoard.push(rowChars);
            }
            
            this.board.push(layerBoard);
        }
    }

    renderBoard() {
        for (let layer = 0; layer < this.layers; layer++) {
            const layerElement = document.getElementById(`layer${layer + 1}`);
            layerElement.innerHTML = '';
            
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const charItem = this.board[layer][row][col];
                    if (charItem.isVisible) {
                        const charElement = document.createElement('div');
                        charElement.className = `character-item ${charItem.isSelected ? 'selected' : ''}`;
                        charElement.textContent = charItem.char;
                        charElement.dataset.layer = layer;
                        charElement.dataset.row = row;
                        charElement.dataset.col = col;
                        
                        // 添加点击事件
                        charElement.addEventListener('click', () => this.handleCharacterClick(layer, row, col));
                        
                        layerElement.appendChild(charElement);
                    } else {
                        // 添加空占位符
                        const emptyElement = document.createElement('div');
                        emptyElement.style.visibility = 'hidden';
                        layerElement.appendChild(emptyElement);
                    }
                }
            }
        }
    }

    handleCharacterClick(layer, row, col) {
        if (!this.isGameRunning) return;
        
        const charItem = this.board[layer][row][col];
        
        // 如果已经被选中，取消选择
        if (charItem.isSelected) {
            this.deselectCharacter(layer, row, col);
            return;
        }
        
        // 如果已经选择了两个字符，不允许再选择
        if (this.selected.length >= 2) {
            return;
        }
        
        // 选择当前字符
        this.selectCharacter(layer, row, col);
        
        // 如果选择了两个字符，检查是否匹配
        if (this.selected.length === 2) {
            setTimeout(() => this.checkMatch(), 300);
        }
    }

    selectCharacter(layer, row, col) {
        const charItem = this.board[layer][row][col];
        charItem.isSelected = true;
        this.selected.push({ layer, row, col });
        
        // 更新UI
        this.renderBoard();
        this.updateSelectedDisplay();
    }

    deselectCharacter(layer, row, col) {
        const charItem = this.board[layer][row][col];
        charItem.isSelected = false;
        
        // 从selected数组中移除
        const index = this.selected.findIndex(item => 
            item.layer === layer && item.row === row && item.col === col
        );
        if (index > -1) {
            this.selected.splice(index, 1);
        }
        
        // 更新UI
        this.renderBoard();
        this.updateSelectedDisplay();
    }

    checkMatch() {
        const [char1, char2] = this.selected;
        const item1 = this.board[char1.layer][char1.row][char1.col];
        const item2 = this.board[char2.layer][char2.row][char2.col];
        
        // 检查是否是相同的字符
        if (item1.char === item2.char) {
            // 匹配成功
            this.handleMatch(char1, char2);
        } else {
            // 匹配失败，取消选择
            this.deselectCharacter(char1.layer, char1.row, char1.col);
            this.deselectCharacter(char2.layer, char2.row, char2.col);
        }
    }

    handleMatch(char1, char2) {
        // 标记为不可见
        this.board[char1.layer][char1.row][char1.col].isVisible = false;
        this.board[char2.layer][char2.row][char2.col].isVisible = false;
        
        // 清除选择
        this.selected = [];
        
        // 更新分数
        this.score += 10;
        this.updateScore();
        
        // 添加匹配动画
        this.addMatchAnimation(char1, char2);
        
        // 检查游戏是否结束
        setTimeout(() => {
            this.renderBoard();
            this.checkGameEnd();
        }, 600);
    }

    addMatchAnimation(char1, char2) {
        // 获取对应的DOM元素
        const layer1Element = document.getElementById(`layer${char1.layer + 1}`);
        const layer2Element = document.getElementById(`layer${char2.layer + 1}`);
        
        const index1 = char1.row * this.cols + char1.col;
        const index2 = char2.row * this.cols + char2.col;
        
        const charElement1 = layer1Element.children[index1];
        const charElement2 = layer2Element.children[index2];
        
        // 添加匹配动画类
        if (charElement1) charElement1.classList.add('matched');
        if (charElement2) charElement2.classList.add('matched');
    }

    checkGameEnd() {
        // 检查是否所有字符都被消除
        let allCleared = true;
        for (let layer = 0; layer < this.layers; layer++) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[layer][row][col].isVisible) {
                        allCleared = false;
                        break;
                    }
                }
                if (!allCleared) break;
            }
            if (!allCleared) break;
        }
        
        if (allCleared) {
            // 玩家获胜
            this.endGame(true);
        } else if (this.time <= 0) {
            // 时间到，游戏结束
            this.endGame(false);
        }
    }

    endGame(isWin) {
        this.isGameRunning = false;
        clearInterval(this.timer);
        
        const modal = document.getElementById('gameOverModal');
        const title = document.getElementById('gameOverTitle');
        const message = document.getElementById('gameOverMessage');
        const finalScore = document.getElementById('finalScore');
        
        finalScore.textContent = this.score;
        
        if (isWin) {
            title.textContent = '恭喜获胜！';
            message.innerHTML = `您在 <strong>${60 - this.time}</strong> 秒内完成了游戏！<br>最终得分: <span id="finalScore">${this.score}</span>`;
        } else {
            title.textContent = '时间到！';
            message.innerHTML = `游戏结束<br>最终得分: <span id="finalScore">${this.score}</span>`;
        }
        
        modal.classList.add('show');
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.time--;
            this.updateTime();
            
            if (this.time <= 0) {
                this.endGame(false);
            }
        }, 1000);
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
    }

    updateTime() {
        document.getElementById('time').textContent = this.time;
    }

    updateSelectedDisplay() {
        const selected1 = document.getElementById('selected1');
        const selected2 = document.getElementById('selected2');
        
        selected1.textContent = this.selected[0] ? 
            this.board[this.selected[0].layer][this.selected[0].row][this.selected[0].col].char : '无';
        
        selected2.textContent = this.selected[1] ? 
            this.board[this.selected[1].layer][this.selected[1].row][this.selected[1].col].char : '无';
    }

    showHint() {
        if (!this.isGameRunning) return;
        
        // 查找可匹配的字符对
        const visibleChars = [];
        
        // 收集所有可见字符
        for (let layer = 0; layer < this.layers; layer++) {
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    const charItem = this.board[layer][row][col];
                    if (charItem.isVisible) {
                        visibleChars.push({ layer, row, col, char: charItem.char });
                    }
                }
            }
        }
        
        // 查找匹配对
        for (let i = 0; i < visibleChars.length; i++) {
            for (let j = i + 1; j < visibleChars.length; j++) {
                if (visibleChars[i].char === visibleChars[j].char) {
                    // 高亮显示匹配对
                    this.highlightCharacters(visibleChars[i], visibleChars[j]);
                    return;
                }
            }
        }
    }

    highlightCharacters(char1, char2) {
        // 获取对应的DOM元素
        const layer1Element = document.getElementById(`layer${char1.layer + 1}`);
        const layer2Element = document.getElementById(`layer${char2.layer + 1}`);
        
        const index1 = char1.row * this.cols + char1.col;
        const index2 = char2.row * this.cols + char2.col;
        
        const charElement1 = layer1Element.children[index1];
        const charElement2 = layer2Element.children[index2];
        
        // 添加高亮类
        if (charElement1) charElement1.classList.add('highlighted');
        if (charElement2) charElement2.classList.add('highlighted');
        
        // 2秒后移除高亮
        setTimeout(() => {
            if (charElement1) charElement1.classList.remove('highlighted');
            if (charElement2) charElement2.classList.remove('highlighted');
        }, 2000);
    }

    hideGameOverModal() {
        const modal = document.getElementById('gameOverModal');
        modal.classList.remove('show');
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new CharacterMatchGame();
});