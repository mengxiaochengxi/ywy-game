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
        // 记录棋子是否移动过（用于王车易位）
        this.piecesMoved = {
            white: {
                king: false,
                rook1: false, // 左上角车
                rook2: false  // 右上角车
            },
            black: {
                king: false,
                rook1: false,
                rook2: false
            }
        };
        // 记录吃过路兵的信息
        this.enPassantTarget = null;
        
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
            // 检查是否在棋盘内
            if (!this.isInBounds(moveRow, moveCol)) return false;
            
            // 检查目标位置的棋子
            const targetPiece = this.board[moveRow][moveCol];
            
            // 不能移动到自己棋子上
            if (targetPiece && targetPiece.color === piece.color) return false;
            
            // 不能直接吃掉对方国王（根据国际象棋规则，国王不能被吃，游戏应该在将死时结束）
            if (targetPiece && targetPiece.type === 'king') return false;
            
            return true;
        }).filter(([moveRow, moveCol]) => {
            // 过滤掉会导致自己被将军的移动
            return !this.wouldBeInCheck(row, col, moveRow, moveCol);
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
            if (this.isInBounds(newRow, newCol)) {
                // 普通吃子
                if (this.board[newRow][newCol] && this.board[newRow][newCol].color !== piece.color) {
                    moves.push([newRow, newCol]);
                }
                // 吃过路兵
                else if (this.enPassantTarget && this.enPassantTarget.row === newRow && this.enPassantTarget.col === newCol) {
                    moves.push([newRow, newCol]);
                }
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
        const piece = this.board[row][col];
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
        
        // 王车易位
        if (!this.piecesMoved[piece.color].king && !this.isInCheck(piece.color)) {
            // 短易位（王翼易位）
            if (!this.piecesMoved[piece.color].rook2 && 
                !this.board[row][col + 1] && 
                !this.board[row][col + 2] &&
                !this.isSquareAttacked(row, col + 1, piece.color) &&
                !this.isSquareAttacked(row, col + 2, piece.color)) {
                moves.push([row, col + 2]); // 王的目标位置
            }
            // 长易位（后翼易位）
            if (!this.piecesMoved[piece.color].rook1 && 
                !this.board[row][col - 1] && 
                !this.board[row][col - 2] &&
                !this.board[row][col - 3] &&
                !this.isSquareAttacked(row, col - 1, piece.color) &&
                !this.isSquareAttacked(row, col - 2, piece.color)) {
                moves.push([row, col - 2]); // 王的目标位置
            }
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
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // 保存移动历史
        this.moveHistory.push({
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            capturedPiece: capturedPiece,
            enPassantTarget: this.enPassantTarget,
            piecesMoved: JSON.parse(JSON.stringify(this.piecesMoved))
        });
        
        // 处理王车易位
        if (piece.type === 'king') {
            this.piecesMoved[piece.color].king = true;
            
            // 短易位
            if (toCol - fromCol === 2) {
                this.board[toRow][toCol - 1] = this.board[toRow][toCol + 1];
                this.board[toRow][toCol + 1] = null;
                this.piecesMoved[piece.color].rook2 = true;
            }
            // 长易位
            else if (fromCol - toCol === 2) {
                this.board[toRow][toCol + 1] = this.board[toRow][toCol - 2];
                this.board[toRow][toCol - 2] = null;
                this.piecesMoved[piece.color].rook1 = true;
            }
        }
        // 处理车的移动
        else if (piece.type === 'rook') {
            if (fromRow === (piece.color === 'white' ? 7 : 0)) {
                if (fromCol === 0) {
                    this.piecesMoved[piece.color].rook1 = true;
                } else if (fromCol === 7) {
                    this.piecesMoved[piece.color].rook2 = true;
                }
            }
        }
        
        // 处理吃过路兵
        let enPassantCapturedPiece = null;
        if (piece.type === 'pawn' && this.enPassantTarget && 
            this.enPassantTarget.row === toRow && this.enPassantTarget.col === toCol) {
            // 吃掉对方的兵
            const capturedRow = piece.color === 'white' ? toRow + 1 : toRow - 1;
            enPassantCapturedPiece = this.board[capturedRow][toCol];
            this.board[capturedRow][toCol] = null;
        }
        
        // 执行移动
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // 处理兵的升变
        if (piece.type === 'pawn' && (toRow === 0 || toRow === 7)) {
            // 默认升变为后
            this.board[toRow][toCol] = { type: 'queen', color: piece.color };
        }
        
        // 设置吃过路兵目标
        this.enPassantTarget = null;
        if (piece.type === 'pawn' && Math.abs(toRow - fromRow) === 2) {
            this.enPassantTarget = {
                row: (fromRow + toRow) / 2,
                col: toCol
            };
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        
        // 检查游戏状态（立即检查，确保游戏结束逻辑优先执行）
        this.checkGameState();
        
        // 重新渲染棋盘
        this.renderBoard();
    }
    
    // 悔棋
    undoMove() {
        if (this.moveHistory.length === 0) return;
        
        const lastMove = this.moveHistory.pop();
        const [fromRow, fromCol] = lastMove.from;
        const [toRow, toCol] = lastMove.to;
        
        // 恢复棋子位置
        this.board[fromRow][fromCol] = lastMove.piece;
        this.board[toRow][toCol] = lastMove.capturedPiece;
        
        // 恢复吃过路兵
        if (lastMove.piece.type === 'pawn' && 
            Math.abs(toRow - fromRow) === 1 && 
            Math.abs(toCol - fromCol) === 1 && 
            !lastMove.capturedPiece) {
            // 恢复被吃掉的兵
            const capturedRow = lastMove.piece.color === 'white' ? toRow + 1 : toRow - 1;
            this.board[capturedRow][toCol] = { type: 'pawn', color: lastMove.piece.color === 'white' ? 'black' : 'white' };
        }
        
        // 恢复王车易位
        if (lastMove.piece.type === 'king' && Math.abs(toCol - fromCol) === 2) {
            // 恢复车的位置
            if (toCol > fromCol) {
                // 短易位
                this.board[toRow][toCol + 1] = this.board[toRow][toCol - 1];
                this.board[toRow][toCol - 1] = null;
            } else {
                // 长易位
                this.board[toRow][toCol - 2] = this.board[toRow][toCol + 1];
                this.board[toRow][toCol + 1] = null;
            }
        }
        
        // 恢复棋子移动状态和吃过路兵目标
        this.piecesMoved = lastMove.piecesMoved;
        this.enPassantTarget = lastMove.enPassantTarget;
        
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
        this.enPassantTarget = null;
        // 重置棋子移动状态
        this.piecesMoved = {
            white: {
                king: false,
                rook1: false,
                rook2: false
            },
            black: {
                king: false,
                rook1: false,
                rook2: false
            }
        };
        this.renderBoard();
    }
    
    // 获取格子元素
    getSquareElement(row, col) {
        return document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }
    
    // 检查是否被将军
    isInCheck(color) {
        // 找到王的位置
        let kingPos = null;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king' && piece.color === color) {
                    kingPos = [row, col];
                    break;
                }
            }
            if (kingPos) break;
        }
        
        if (!kingPos) return false;
        
        // 检查对方是否有棋子可以攻击王
        return this.isSquareAttacked(kingPos[0], kingPos[1], color);
    }
    
    // 检查指定位置是否被对方攻击
    isSquareAttacked(row, col, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        // 检查所有对方棋子的移动
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === opponentColor) {
                    // 保存当前状态
                    const originalPiece = this.board[row][col];
                    this.board[row][col] = null;
                    
                    // 检查是否可以移动到目标位置
                    const moves = this.getValidMoves(r, c);
                    const canAttack = moves.some(([moveRow, moveCol]) => moveRow === row && moveCol === col);
                    
                    // 恢复状态
                    this.board[row][col] = originalPiece;
                    
                    if (canAttack) return true;
                }
            }
        }
        
        return false;
    }
    
    // 检查移动后是否会被将军
    wouldBeInCheck(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        
        // 模拟移动
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;
        
        // 检查是否被将军
        const inCheck = this.isInCheck(piece.color);
        
        // 恢复状态
        this.board[fromRow][fromCol] = piece;
        this.board[toRow][toCol] = capturedPiece;
        
        return inCheck;
    }
    
    // 检查是否有合法移动
    hasValidMoves(color) {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.color === color) {
                    const moves = this.getValidMoves(row, col);
                    if (moves.length > 0) return true;
                }
            }
        }
        return false;
    }
    
    // 检查游戏状态（将军、将死、逼和、国王是否存在）
    checkGameState() {
        // 检查双方是否都还有国王（双重保险，防止意外情况）
        let whiteKingPos = null;
        let blackKingPos = null;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.board[row][col];
                if (piece && piece.type === 'king') {
                    if (piece.color === 'white') {
                        whiteKingPos = [row, col];
                    } else {
                        blackKingPos = [row, col];
                    }
                }
            }
        }
        
        // 如果一方国王不存在，游戏结束
        if (!whiteKingPos) {
            alert('白方国王被吃掉！黑方获胜！');
            this.endGame('black');
            return;
        }
        
        if (!blackKingPos) {
            alert('黑方国王被吃掉！白方获胜！');
            this.endGame('white');
            return;
        }
        
        const currentPlayerColor = this.currentPlayer;
        const opponentColor = currentPlayerColor === 'white' ? 'black' : 'white';
        
        // 检查当前玩家是否被将军（因为玩家刚刚移动过）
        if (this.isInCheck(currentPlayerColor)) {
            // 检查当前玩家是否有合法移动
            if (!this.hasValidMoves(currentPlayerColor)) {
                // 将死
                alert(`${currentPlayerColor === 'white' ? '白方' : '黑方'}被将死！${opponentColor === 'white' ? '白方' : '黑方'}获胜！`);
                this.endGame(opponentColor);
            } else {
                // 将军
                alert(`${currentPlayerColor === 'white' ? '白方' : '黑方'}被将军！`);
            }
        } else {
            // 检查是否逼和
            if (!this.hasValidMoves(currentPlayerColor)) {
                alert('逼和！游戏结束。');
                this.newGame();
            }
        }
    }
    
    // 结束游戏（带自动判定获胜方）
    endGame(winnerColor = null) {
        const playerNames = this.getPlayerNames();
        
        if (!winnerColor) {
            winnerColor = prompt('游戏结束！请输入获胜方（white/black）：');
        }
        
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
            
            // 显示获胜信息
            alert(`${playerNames[winnerColor]} 获胜！恭喜！\n\n得分情况：\n${playerNames[winnerColor]}: +10分\n${playerNames[loserColor]}: +1分`);
            
            // 重置游戏（可选，根据需求调整）
            setTimeout(() => {
                this.newGame();
            }, 1000);
        } else {
            alert('输入无效，请输入 "white" 或 "black"');
        }
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