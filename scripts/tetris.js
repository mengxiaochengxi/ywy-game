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
        
        // Supabase配置
        this.supabaseConfig = {
            url: 'https://sbp-yguh4m36i3pmep80.supabase.opentrust.net',
            anonKey: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiYW5vbiIsInJlZiI6InNicC15Z3VoNG0zNmkzcG1lcDgwIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3NjMzODA5MTksImV4cCI6MjA3ODk1NjkxOX0.jf6hBCgxzvXplur-2MxdpVuNa0-UsOWR4rjFA5jebiU'
        };
        
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
        
        // 侧边栏排行榜
        this.sidebarLeaderboardList = document.getElementById('sidebarLeaderboardList');
        this.showSidebarLeaderboard();
        
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
        document.getElementById('leaderboardBtn').addEventListener('click', async () => {
            await this.showLeaderboard();
        });
        
        // 初始化侧边栏排行榜
        this.showSidebarLeaderboard();
        
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
    async getLeaderboard(limit = 10) {
        try {
            // 添加apikey头部，确保Supabase认证正确
            const response = await fetch(`${this.supabaseConfig.url}/rest/v1/tetris_leaderboard?select=name,score,date&order=score.desc&limit=${limit}`, {
                headers: {
                    'apikey': this.supabaseConfig.anonKey,
                    'Authorization': `Bearer ${this.supabaseConfig.anonKey}`,
                    'Content-Type': 'application/json'
                },
                // 添加超时设置
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                console.error('Supabase response not ok:', response.status, response.statusText);
                throw new Error(`Failed to fetch leaderboard: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Successfully fetched leaderboard from Supabase:', data);
            return data;
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            // 降级到localStorage
            console.log('Falling back to localStorage...');
            const leaderboard = localStorage.getItem('tetrisLeaderboard');
            const result = leaderboard ? JSON.parse(leaderboard) : [];
            console.log('Leaderboard from localStorage:', result);
            return result.slice(0, limit);
        }
    }
    
    // 保存分数到排行榜
    async saveScore() {
        const playerName = document.getElementById('playerName').value || '匿名';
        if (playerName.trim() && this.score > 0) {
            try {
                // 保存到Supabase
                const response = await fetch(`${this.supabaseConfig.url}/rest/v1/tetris_leaderboard`, {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseConfig.anonKey,
                        'Authorization': `Bearer ${this.supabaseConfig.anonKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        name: playerName.trim(),
                        score: this.score,
                        date: new Date().toISOString()
                    }),
                    // 添加超时设置
                    signal: AbortSignal.timeout(5000)
                });
                
                if (!response.ok) {
                    console.error('Supabase response not ok:', response.status, response.statusText);
                    throw new Error(`Failed to save score: ${response.status} ${response.statusText}`);
                }
                console.log('Score saved successfully to Supabase');
            } catch (error) {
                console.error('Error saving score to Supabase:', error);
                // 降级到localStorage
                console.log('Falling back to localStorage...');
                const leaderboard = JSON.parse(localStorage.getItem('tetrisLeaderboard') || '[]');
                leaderboard.push({
                    name: playerName.trim(),
                    score: this.score,
                    date: new Date().toISOString()
                });
                leaderboard.sort((a, b) => b.score - a.score);
                localStorage.setItem('tetrisLeaderboard', JSON.stringify(leaderboard.slice(0, 10)));
                console.log('Score saved to localStorage');
            }
            
            // 关闭游戏结束模态框
            document.getElementById('gameOverModal').style.display = 'none';
            
            // 更新侧边栏排行榜
            await this.showSidebarLeaderboard();
            
            // 显示排行榜
            await this.showLeaderboard();
        }
    }
    
    // 显示排行榜
    async showLeaderboard() {
        const leaderboard = await this.getLeaderboard();
        const leaderboardList = document.getElementById('leaderboardList');
        leaderboardList.innerHTML = '';
        
        if (leaderboard.length === 0) {
            leaderboardList.innerHTML = '<p>暂无记录</p>';
        } else {
            leaderboard.forEach((entry, index) => {
                const item = document.createElement('div');
                item.className = 'leaderboard-item';
                
                // 格式化日期
                const date = entry.date ? new Date(entry.date).toLocaleString() : '';
                
                item.innerHTML = `
                    <span class="rank">${index + 1}.</span>
                    <span class="name">${entry.name}</span>
                    <span class="score">${entry.score}分</span>
                    <span class="date">${date}</span>
                `;
                leaderboardList.appendChild(item);
            });
        }
        
        document.getElementById('leaderboardModal').style.display = 'block';
    }
    
    // 显示侧边栏排行榜（前5名）
    async showSidebarLeaderboard() {
        const leaderboard = await this.getLeaderboard(5);
        this.sidebarLeaderboardList.innerHTML = '';
        
        if (leaderboard.length === 0) {
            this.sidebarLeaderboardList.innerHTML = '<p style="color: #00ffcc; padding: 20px; text-align: center; font-size: 0.9rem;">暂无记录</p>';
            return;
        }
        
        leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            item.innerHTML = `
                <span class="rank">${index + 1}</span>
                <span class="name">${entry.name}</span>
                <span class="score">${entry.score}</span>
            `;
            this.sidebarLeaderboardList.appendChild(item);
        });
    }
}

// 游戏初始化
window.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});