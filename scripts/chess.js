// 国际象棋游戏类
class ChessGame {
    constructor() {
        this.board = [];
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.scores = {
            white: 0,
            black: 0
        };
        this.pieceSymbols = {
            white: {
                king: '♔',
                queen: '♕',
                rook: '♖',
                bishop: '♗',
                knight: '♘',
                pawn: '♙'
            },
            black: {
                king: '♚',
                queen: '♛',
                rook: '♜',
                bishop: '♝',
                knight: '♞',
                pawn: '♟'
            }
        };
        
        this.initializeBoard();
        this.renderBoard();
        this.setupEventListeners();
        this.loadLeaderboard();
        this.updateScores();
    }
    
    // 初始化棋盘
    initializeBoard() {
        // 创建8x8的棋盘
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                this.board[row][col] = null;
            }
        }
        
        // 放置黑子
        this.board[0][0] = { type: 'rook', color: 'black' };
        this.board[0][1] = { type: 'knight', color: 'black' };
        this.board[0][2] = { type: 'bishop', color: 'black' };
        this.board[0][3] = { type: 'queen', color: 'black' };
        this.board[0][4] = { type: 'king', color: 'black' };
        this.board[0][5] = { type: 'bishop', color: 'black' };
        this.board[0][6] = { type: 'knight', color: 'black' };
        this.board[0][7] = { type: 'rook', color: 'black' };
        
        // 放置黑兵
        for (let col = 0; col < 8; col++) {
            this.board[1][col] = { type: 'pawn', color: 'black' };
        }
        
        // 放置白兵
        for (let col = 0; col < 8; col++) {
            this.board[6][col] = { type: 'pawn', color: 'white' };
        }
        
        // 放置白子
        this.board[7][0] = { type: 'rook', color: 'white' };
        this.board[7][1] = { type: 'knight', color: 'white' };
        this.board[7][2] = { type: 'bishop', color: 'white' };
        this.board[7][3] = { type: 'queen', color: 'white' };
        this.board[7][4] = { type: 'king', color: 'white' };
        this.board[7][5] = { type: 'bishop', color: 'white' };
        this.board[7][6] = { type: 'knight', color: 'white' };
        this.board[7][7] = { type: 'rook', color: 'white' };
    }
    
    // 渲染棋盘
    renderBoard() {
        const chessboard = document.getElementById('chessboard');
        chessboard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                // 添加棋子
                const piece = this.board[row][col];
                if (piece) {
                    square.textContent = this.pieceSymbols[piece.color][piece.type];
                    square.dataset.piece = `${piece.color}-${piece.type}`;
                }
                
                // 添加事件监听器
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                
                chessboard.appendChild(square);
            }
        }
        
        this.updateTurnIndicator();
    }
    
    // 更新回合指示器
    updateTurnIndicator() {
        const turnElement = document.getElementById('current-turn');
        turnElement.textContent = this.currentPlayer === 'white' ? '白方' : '黑方';
        turnElement.style.color = this.currentPlayer === 'white' ? '#f0d9b5' : '#b58863';
    }
    
    // 更新积分显示
    updateScores() {
        document.getElementById('white-score').textContent = this.scores.white;
        document.getElementById('black-score').textContent = this.scores.black;
    }
    
    // 获取玩家名称
    getPlayerNames() {
        return {
            white: document.getElementById('white-player').value || '白方',
            black: document.getElementById('black-player').value || '黑方'
        };
    }
    
    // 加载排行榜
    loadLeaderboard() {
        const leaderboard = localStorage.getItem('chessLeaderboard');
        return leaderboard ? JSON.parse(leaderboard) : [];
    }
    
    // 保存排行榜
    saveLeaderboard(leaderboard) {
        localStorage.setItem('chessLeaderboard', JSON.stringify(leaderboard));
    }
    
    // 更新玩家积分
    updatePlayerScore(playerName, isWinner) {
        let leaderboard = this.loadLeaderboard();
        
        // 查找玩家
        let playerIndex = leaderboard.findIndex(player => player.name === playerName);
        
        if (playerIndex === -1) {
            // 新玩家
            leaderboard.push({
                name: playerName,
                score: isWinner ? 10 : 0,
                wins: isWinner ? 1 : 0,
                losses: isWinner ? 0 : 1
            });
        } else {
            // 已有玩家
            if (isWinner) {
                leaderboard[playerIndex].score += 10;
                leaderboard[playerIndex].wins += 1;
            } else {
                leaderboard[playerIndex].score += 1; // 失败也有1分安慰奖
                leaderboard[playerIndex].losses += 1;
            }
        }
        
        // 按积分排序
        leaderboard.sort((a, b) => b.score - a.score);
        
        // 保存到本地存储
        this.saveLeaderboard(leaderboard);
        
        // 更新排行榜显示
        this.renderLeaderboard(leaderboard);
    }
    
    // 渲染排行榜
    renderLeaderboard(leaderboard) {
        const tbody = document.getElementById('leaderboard-body');
        tbody.innerHTML = '';
        
        leaderboard.slice(0, 10).forEach((player, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.score}</td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // 结束游戏
    endGame() {
        const playerNames = this.getPlayerNames();
        const winnerColor = prompt('游戏结束！请输入获胜方（white/black）：');
        
        if (winnerColor === 'white' || winnerColor === 'black') {
            const loserColor = winnerColor === 'white' ? 'black' : 'white';
            
            // 更新积分
            this.scores[winnerColor] += 10;
            this.scores[loserColor] += 1;
            
            // 更新本地排行榜
            this.updatePlayerScore(playerNames[winnerColor], true);
            this.updatePlayerScore(playerNames[loserColor], false);
            
            // 更新显示
            this.updateScores();
            
            alert(`${playerNames[winnerColor]} 获胜！恭喜！`);
        } else {
            alert('输入无效，请输入 "white" 或 "black"');
        }
    }
    
    // 处理格子点击
    handleSquareClick(row, col) {
        const square = this.getSquareElement(row, col);
        const piece = this.board[row][col];
        
        // 如果点击的是当前玩家的棋子，选中它
        if (piece && piece.color === this.currentPlayer) {
            this.selectSquare(row, col);
        } 
        // 如果已经选中了棋子，尝试移动
        else if (this.selectedSquare) {
            const [fromRow, fromCol] = this.selectedSquare;
            
            // 检查是否是有效的移动
            if (this.isValidMove(fromRow, fromCol, row, col)) {
                this.makeMove(fromRow, fromCol, row, col);
                this.clearSelection();
            } else {
                this.clearSelection();
                // 如果点击的是当前玩家的另一个棋子，选中它
                if (piece && piece.color === this.currentPlayer) {
                    this.selectSquare(row, col);
                }
            }
        }
    }
    
    // 选中格子
    selectSquare(row, col) {
        this.clearSelection();
        this.selectedSquare = [row, col];
        
        // 获取有效移动
        this.validMoves = this.getValidMoves(row, col);
        
        // 高亮选中的格子
        const square = this.getSquareElement(row, col);
        square.classList.add('selected');
        
        // 标记有效移动
        this.validMoves.forEach(([moveRow, moveCol]) => {
            const moveSquare = this.getSquareElement(moveRow, moveCol);
            if (this.board[moveRow][moveCol]) {
                moveSquare.classList.add('valid-capture');
            } else {
                moveSquare.classList.add('valid-move');
            }
        });
    }
    
    // 清除选择
    clearSelection() {
        this.selectedSquare = null;
        this.validMoves = [];
        
        // 移除所有高亮
        document.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move', 'valid-capture');
        });
    }
    
    // 获取有效移动
    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        
        let moves = [];
        
        switch (piece.type) {
            case 'pawn':
                moves = this.getPawnMoves(row, col);
                break;
            case 'rook':
                moves = this.getRookMoves(row, col);
                break;
            case 'knight':
                moves = this.getKnightMoves(row, col);
                break;
            case 'bishop':
                moves = this.getBishopMoves(row, col);
                break;
            case 'queen':
                moves = [...this.getRookMoves(row, col), ...this.getBishopMoves(row, col)];
                break;
            case 'king':
                moves = this.getKingMoves(row, col);
                break;
        }
        
        // 过滤掉无效移动（出界或移动到自己棋子上）
        return moves.filter(([moveRow, moveCol]) => {
            return this.isInBounds(moveRow, moveCol) && 
                   (!this.board[moveRow][moveCol] || this.board[moveRow][moveCol].color !== piece.color);
        });
    }
    
    // 兵的移动
    getPawnMoves(row, col) {
        const piece = this.board[row][col];
        const moves = [];
        const direction = piece.color === 'white' ? -1 : 1;
        const startRow = piece.color === 'white' ? 6 : 1;
        
        // 向前移动
        if (this.isInBounds(row + direction, col) && !this.board[row + direction][col]) {
            moves.push([row + direction, col]);
            
            // 初始位置可以移动两格
            if (row === startRow && !this.board[row + 2 * direction][col]) {
                moves.push([row + 2 * direction, col]);
            }
        }
        
        // 斜向吃子
        for (const colOffset of [-1, 1]) {
            const newRow = row + direction;
            const newCol = col + colOffset;
            if (this.isInBounds(newRow, newCol) && 
                this.board[newRow][newCol] && 
                this.board[newRow][newCol].color !== piece.color) {
                moves.push([newRow, newCol]);
            }
        }
        
        return moves;
    }
    
    // 车的移动
    getRookMoves(row, col) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        
        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;
            
            while (this.isInBounds(newRow, newCol)) {
                if (!this.board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else {
                    if (this.board[newRow][newCol].color !== this.board[row][col].color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        }
        
        return moves;
    }
    
    // 马的移动
    getKnightMoves(row, col) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        
        for (const [dRow, dCol] of knightMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            moves.push([newRow, newCol]);
        }
        
        return moves;
    }
    
    // 象的移动
    getBishopMoves(row, col) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
        
        for (const [dRow, dCol] of directions) {
            let newRow = row + dRow;
            let newCol = col + dCol;
            
            while (this.isInBounds(newRow, newCol)) {
                if (!this.board[newRow][newCol]) {
                    moves.push([newRow, newCol]);
                } else {
                    if (this.board[newRow][newCol].color !== this.board[row][col].color) {
                        moves.push([newRow, newCol]);
                    }
                    break;
                }
                newRow += dRow;
                newCol += dCol;
            }
        }
        
        return moves;
    }
    
    // 王的移动
    getKingMoves(row, col) {
        const moves = [];
        const kingMoves = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1], [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        
        for (const [dRow, dCol] of kingMoves) {
            const newRow = row + dRow;
            const newCol = col + dCol;
            moves.push([newRow, newCol]);
        }
        
        return moves;
    }
    
    // 检查是否在棋盘内
    isInBounds(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }
    
    // 检查移动是否有效
    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.validMoves.some(([row, col]) => row === toRow && col === toCol);
    }
    
    // 执行移动
    makeMove(fromRow, fromCol, toRow, toCol) {
        // 保存移动历史
        this.moveHistory.push({
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: this.board[fromRow][fromCol],
            capturedPiece: this.board[toRow][toCol]
        });
        
        // 执行移动
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // 重新渲染棋盘
        this.renderBoard();
    }
    
    // 悔棋
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        const [fromRow, fromCol] = lastMove.from;
        const [toRow, toCol] = lastMove.to;
        
        // 恢复移动
        this.board[fromRow][fromCol] = lastMove.piece;
        this.board[toRow][toCol] = lastMove.capturedPiece;
        
        // 切换回上一个玩家
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // 重新渲染棋盘
        this.renderBoard();
    }
    
    // 新游戏
    newGame() {
        this.initializeBoard();
        this.currentPlayer = 'white';
        this.selectedSquare = null;
        this.validMoves = [];
        this.moveHistory = [];
        this.renderBoard();
    }
    
    // 获取格子元素
    getSquareElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    // 设置事件监听器
    setupEventListeners() {
        document.getElementById('new-game').addEventListener('click', () => this.newGame());
        document.getElementById('undo-move').addEventListener('click', () => this.undoMove());
        document.getElementById('end-game').addEventListener('click', () => this.endGame());
        
        // 初始化排行榜显示
        this.renderLeaderboard(this.loadLeaderboard());
    }
}

// 游戏初始化
document.addEventListener('DOMContentLoaded', () => {
    new ChessGame();
});