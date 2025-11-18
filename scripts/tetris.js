// 于闻言俄罗斯方块游戏
class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetrisCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.nextPieceCanvas = document.createElement('canvas');
        this.nextPieceCtx = this.nextPieceCanvas.getContext('2d');
        document.getElementById('nextPiece').appendChild(this.nextPieceCanvas);
        
        // 游戏配置
        this.gridSize = 30;
        this.rows = 20;
        this.cols = 10;
        
        // 游戏状态
        this.gameGrid = this.createGrid();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.dropInterval = 1000;
        this.lastDropTime = 0;
        
        // 方块定义
        this.tetrominoes = {
            I: { shape: [[1, 1, 1, 1]], color: '#00FFFF' },
            O: { shape: [[1, 1], [1, 1]], color: '#FFFF00' },
            T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#800080' },
            S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00FF00' },
            Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#FF0000' },
            J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#0000FF' },
            L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#FFA500' }
        };
        
        // 初始化
        this.setupEventListeners();
        this.updateUI();
        this.generateNextPiece();
        this.startGame();
        
        // 绘制初始状态
        this.draw();
    }
    
    // 创建游戏网格
    createGrid() {
        return Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    }
    
    // 生成新方块
    generatePiece() {
        const keys = Object.keys(this.tetrominoes);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        const tetromino = this.tetrominoes[randomKey];
        
        return {
            shape: tetromino.shape,
            color: tetromino.color,
            x: Math.floor((this.cols - tetromino.shape[0].length) / 2),
            y: 0
        };
    }
    
    // 生成下一个方块
    generateNextPiece() {
        this.nextPiece = this.generatePiece();
        this.drawNextPiece();
    }
    
    // 绘制游戏
    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格
        this.drawGrid();
        
        // 绘制已放置的方块
        this.drawGameGrid();
        
        // 绘制当前方块
        if (this.currentPiece) {
            this.drawPiece(this.currentPiece, this.ctx);
        }
    }
    
    // 绘制网格线
    drawGrid() {
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 0.5;
        
        for (let x = 0; x <= this.cols; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.rows; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    // 绘制游戏网格中的方块
    drawGameGrid() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.gameGrid[row][col]) {
                    this.drawCell(col, row, this.gameGrid[row][col], this.ctx);
                }
            }
        }
    }
    
    // 绘制单个方块
    drawPiece(piece, ctx) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    this.drawCell(
                        piece.x + col,
                        piece.y + row,
                        piece.color,
                        ctx
                    );
                }
            }
        }
    }
    
    // 绘制单个单元格
    drawCell(x, y, color, ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        
        // 绘制边框
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        
        // 绘制高光效果
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize / 2);
    }
    
    // 绘制下一个方块
    drawNextPiece() {
        const size = 20;
        const piece = this.nextPiece;
        const width = piece.shape[0].length * size;
        const height = piece.shape.length * size;
        
        this.nextPieceCanvas.width = 120;
        this.nextPieceCanvas.height = 120;
        this.nextPieceCtx.clearRect(0, 0, 120, 120);
        
        // 居中绘制
        const offsetX = (120 - width) / 2;
        const offsetY = (120 - height) / 2;
        
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    this.nextPieceCtx.fillStyle = piece.color;
                    this.nextPieceCtx.fillRect(
                        offsetX + col * size,
                        offsetY + row * size,
                        size,
                        size
                    );
                    
                    // 绘制边框
                    this.nextPieceCtx.strokeStyle = '#000';
                    this.nextPieceCtx.lineWidth = 1;
                    this.nextPieceCtx.strokeRect(
                        offsetX + col * size,
                        offsetY + row * size,
                        size,
                        size
                    );
                }
            }
        }
    }
    
    // 检查碰撞
    checkCollision(piece, offsetX = 0, offsetY = 0) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const newX = piece.x + col + offsetX;
                    const newY = piece.y + row + offsetY;
                    
                    // 检查边界
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return true;
                    }
                    
                    // 检查是否与已有方块碰撞
                    if (newY >= 0 && this.gameGrid[newY][newX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    // 旋转方块
    rotatePiece() {
        if (!this.currentPiece) return;
        
        const rotated = this.currentPiece.shape[0].map((_, index) => 
            this.currentPiece.shape.map(row => row[index]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        // 如果旋转后碰撞，恢复原状
        if (this.checkCollision(this.currentPiece)) {
            this.currentPiece.shape = originalShape;
        }
    }
    
    // 移动方块
    movePiece(dx, dy) {
        if (!this.currentPiece || !this.gameRunning || this.gamePaused) return;
        
        if (!this.checkCollision(this.currentPiece, dx, dy)) {
            this.currentPiece.x += dx;
            this.currentPiece.y += dy;
        } else if (dy > 0) {
            // 到底部或碰到其他方块，锁定当前方块
            this.lockPiece();
            this.clearLines();
            this.spawnPiece();
        }
    }
    
    // 锁定方块到网格
    lockPiece() {
        for (let row = 0; row < this.currentPiece.shape.length; row++) {
            for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
                if (this.currentPiece.shape[row][col]) {
                    const newY = this.currentPiece.y + row;
                    const newX = this.currentPiece.x + col;
                    
                    if (newY >= 0) {
                        this.gameGrid[newY][newX] = this.currentPiece.color;
                    }
                }
            }
        }
    }
    
    // 消除完整行
    clearLines() {
        let linesCleared = 0;
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.gameGrid[row].every(cell => cell !== 0)) {
                // 移除当前行并在顶部添加新行
                this.gameGrid.splice(row, 1);
                this.gameGrid.unshift(Array(this.cols).fill(0));
                row++;
                linesCleared++;
            }
        }
        
        if (linesCleared > 0) {
            this.updateScore(linesCleared);
            this.lines += linesCleared;
            this.updateLevel();
        }
    }
    
    // 更新分数
    updateScore(lines) {
        const points = [0, 40, 100, 300, 1200]; // 对应1-4行的分数
        this.score += points[lines] * this.level;
        this.updateUI();
    }
    
    // 更新等级
    updateLevel() {
        const newLevel = Math.floor(this.lines / 10) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.dropInterval = Math.max(100, 1000 - (this.level - 1) * 100);
            this.updateUI();
        }
    }
    
    // 生成新方块
    spawnPiece() {
        this.currentPiece = this.nextPiece;
        this.generateNextPiece();
        
        // 检查游戏是否结束
        if (this.checkCollision(this.currentPiece)) {
            this.gameOver();
        }
    }
    
    // 游戏结束
    gameOver() {
        this.gameRunning = false;
        this.showGameOverModal();
    }
    
    // 显示游戏结束模态框
    showGameOverModal() {
        document.getElementById('finalScore').textContent = `最终分数: ${this.score}`;
        document.getElementById('gameOverModal').style.display = 'block';
    }
    
    // 开始游戏
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.lastDropTime = performance.now();
            this.gameLoop();
        }
    }
    
    // 暂停游戏
    pauseGame() {
        this.gamePaused = !this.gamePaused;
    }
    
    // 重置游戏
    resetGame() {
        this.gameGrid = this.createGrid();
        this.score = 0;
        this.lines = 0;
        this.level = 1;
        this.dropInterval = 1000;
        this.gameRunning = false;
        this.gamePaused = false;
        this.currentPiece = null;
        this.generateNextPiece();
        this.updateUI();
        this.draw();
    }
    
    // 游戏主循环
    gameLoop() {
        if (!this.gameRunning) return;
        
        const currentTime = performance.now();
        
        if (currentTime - this.lastDropTime > this.dropInterval && !this.gamePaused) {
            this.movePiece(0, 1);
            this.lastDropTime = currentTime;
        }
        
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    // 更新UI
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('level').textContent = this.level;
        document.getElementById('lines').textContent = this.lines;
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.movePiece(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                    this.movePiece(1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    this.movePiece(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    this.rotatePiece();
                    e.preventDefault();
                    break;
                case ' ':
                    // 快速下落
                    while (!this.checkCollision(this.currentPiece, 0, 1)) {
                        this.currentPiece.y++;
                    }
                    this.lockPiece();
                    this.clearLines();
                    this.spawnPiece();
                    e.preventDefault();
                    break;
            }
        });
        
        // 按钮控制
        document.getElementById('startBtn').addEventListener('click', () => {
            if (!this.currentPiece) {
                this.spawnPiece();
            }
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        // 排行榜按钮
        document.getElementById('leaderboardBtn').addEventListener('click', () => {
            this.showLeaderboard();
        });
        
        // 关闭排行榜
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('leaderboardModal').style.display = 'none';
        });
        
        document.getElementById('closeLeaderboard').addEventListener('click', () => {
            document.getElementById('leaderboardModal').style.display = 'none';
        });
        
        // 保存分数
        document.getElementById('saveScore').addEventListener('click', () => {
            this.saveScore();
        });
        
        // 再玩一次
        document.getElementById('playAgain').addEventListener('click', () => {
            document.getElementById('gameOverModal').style.display = 'none';
            this.resetGame();
            this.startGame();
        });
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('leaderboardModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // 按Enter保存分数
        document.getElementById('playerName').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveScore();
            }
        });
    }
    
    // 获取排行榜
    getLeaderboard() {
        const leaderboard = localStorage.getItem('tetrisLeaderboard');
        return leaderboard ? JSON.parse(leaderboard) : [];
    }
    
    // 保存分数到排行榜
    saveScore() {
        const playerName = document.getElementById('playerName').value || '匿名';
        if (playerName.trim() && this.score > 0) {
            const leaderboard = this.getLeaderboard();
            
            // 添加新分数
            leaderboard.push({
                name: playerName.trim(),
                score: this.score,
                date: new Date().toLocaleDateString()
            });
            
            // 按分数排序（降序）
            leaderboard.sort((a, b) => b.score - a.score);
            
            // 只保留前5名
            const top5 = leaderboard.slice(0, 5);
            
            // 保存到localStorage
            localStorage.setItem('tetrisLeaderboard', JSON.stringify(top5));
            
            // 关闭游戏结束模态框
            document.getElementById('gameOverModal').style.display = 'none';
            
            // 显示排行榜
            this.showLeaderboard();
        }
    }
    
    // 显示排行榜
    showLeaderboard() {
        const leaderboard = this.getLeaderboard();
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p>暂无记录</p>';
        } else {
            leaderboard.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                item.innerHTML = `
                    <span>${index + 1}. ${entry.name}</span>
                    <span>${entry.score}分</span>
                `;
                leaderboardList.appendChild(item);
            });
        }
        
        document.getElementById('leaderboardModal').style.display = 'block';
    }
}

// 游戏初始化
window.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});