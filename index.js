window.addEventListener('DOMContentLoaded', () => {
    const tiles = Array.from(document.querySelectorAll('.tile'));
    const playerDisplay = document.querySelector('.display-player');
    const resetButton = document.querySelector('#reset');
    const announcer = document.querySelector('.announcer');
    const clickSound = document.getElementById('click-sound');
    const winSound = document.getElementById('win-sound');
    const modeHumanBtn = document.getElementById('mode-human');
    const modeAIBtn = document.getElementById('mode-ai');

    let board = ['', '', '', '', '', '', '', '', ''];
    let currentPlayer = 'X';
    let isGameActive = true;
    let gameMode = 'HUMAN';

    const PLAYERX_WON = 'PLAYERX_WON';
    const PLAYERO_WON = 'PLAYERO_WON';
    const TIE = 'TIE';

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const announce = (type) => {
        switch (type) {
            case PLAYERO_WON:
                announcer.innerHTML = '🎉 Player <span class="playerO">O</span> Won!';
                break;
            case PLAYERX_WON:
                announcer.innerHTML = '🎉 Player <span class="playerX">X</span> Won!';
                break;
            case TIE:
                announcer.innerText = '🤝 It\'s a Tie!';
        }
        announcer.classList.remove('hide');
        winSound.play();
    };

    const handleResultValidation = () => {
        let roundWon = false;
        for (let condition of winningConditions) {
            const [a, b, c] = condition;
            if (board[a] && board[a] === board[b] && board[b] === board[c]) {
                tiles[a].classList.add('win-tile');
                tiles[b].classList.add('win-tile');
                tiles[c].classList.add('win-tile');
                roundWon = true;
                break;
            }
        }

        if (roundWon) {
            announce(currentPlayer === 'X' ? PLAYERX_WON : PLAYERO_WON);
            isGameActive = false;
            return true;
        } else if (!board.includes('')) {
            announce(TIE);
            return true;
        }
        return false;
    };

    const isValidAction = (tile) => tile.innerText === '';

    const updateBoard = (index) => board[index] = currentPlayer;

    const changePlayer = () => {
        playerDisplay.classList.remove(`player${currentPlayer}`);
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        playerDisplay.innerText = currentPlayer;
        playerDisplay.classList.add(`player${currentPlayer}`);
    };

    const aiBestMove = () => {
        const best = minimax(board, 'O');
        return best.index;
    };

    const minimax = (newBoard, player) => {
        const availSpots = newBoard.map((v, i) => v === '' ? i : null).filter(i => i !== null);

        // terminal states
        if (checkWin(newBoard, 'X')) return { score: -10 };
        if (checkWin(newBoard, 'O')) return { score: 10 };
        if (availSpots.length === 0) return { score: 0 };

        const moves = [];

        for (let i = 0; i < availSpots.length; i++) {
            const index = availSpots[i];
            const move = {};
            move.index = index;
            newBoard[index] = player;

            if (player === 'O') {
                const result = minimax(newBoard, 'X');
                move.score = result.score;
            } else {
                const result = minimax(newBoard, 'O');
                move.score = result.score;
            }

            newBoard[index] = '';
            moves.push(move);
        }

        let bestMove;
        if (player === 'O') {
            let bestScore = -Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score > bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].score < bestScore) {
                    bestScore = moves[i].score;
                    bestMove = i;
                }
            }
        }

        return moves[bestMove];
    };

    const checkWin = (b, p) => {
        return winningConditions.some(c => c.every(i => b[i] === p));
    };

    const aiMove = () => {
        if (!isGameActive) return;

        const bestIndex = aiBestMove();
        const tile = tiles[bestIndex];

        setTimeout(() => {
            tile.innerText = currentPlayer;
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(bestIndex);
            clickSound.play();

            if (!handleResultValidation()) changePlayer();
        }, 400);
    };

    const userAction = (tile, index) => {
        if (isValidAction(tile) && isGameActive) {
            tile.innerText = currentPlayer;
            tile.classList.add(`player${currentPlayer}`);
            updateBoard(index);
            clickSound.play();

            if (!handleResultValidation()) {
                changePlayer();
                if (gameMode === 'AI' && currentPlayer === 'O') aiMove();
            }
        }
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
        isGameActive = true;
        announcer.classList.add('hide');
        if (currentPlayer === 'O') changePlayer();

        tiles.forEach(tile => {
            tile.innerText = '';
            tile.classList.remove('playerX', 'playerO', 'win-tile');
        });

        if (gameMode === 'AI' && currentPlayer === 'O') aiMove();
    };

    const setGameMode = (mode) => {
        gameMode = mode;
        resetBoard();
    };

    tiles.forEach((tile, index) => {
        tile.addEventListener('click', () => userAction(tile, index));
    });

    resetButton.addEventListener('click', resetBoard);
    modeHumanBtn.addEventListener('click', () => setGameMode('HUMAN'));
    modeAIBtn.addEventListener('click', () => setGameMode('AI'));
});
