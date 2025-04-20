const gameBoard = document.querySelector('.game-board');
const cells = document.querySelectorAll('[data-cell]');
const statusDisplay = document.getElementById('status');
const restartButton = document.getElementById('restartButton');
const xSound = document.getElementById('xSound');
const oSound = document.getElementById('oSound');
const victorySound = document.getElementById('victorySound');
const victoryLine = document.getElementById('victory-line');
const welcomeOverlay = document.getElementById('welcomeOverlay');
const startGameBtn = document.getElementById('startGameBtn');
const player1Input = document.getElementById('player1');
const player2Input = document.getElementById('player2');
const player1Label = document.getElementById('player1Label');
const player2Label = document.getElementById('player2Label');
const player1Symbol = document.getElementById('player1Symbol');
const player2Symbol = document.getElementById('player2Symbol');
const player1ScoreDisplay = document.getElementById('player1Score');
const player2ScoreDisplay = document.getElementById('player2Score');

let gameActive = true;
let currentPlayer = 'X';
let gameState = ['', '', '', '', '', '', '', '', ''];
let player1Name = '';
let player2Name = '';
let player1Score = 0;
let player2Score = 0;
let isPlayer1X = true; // Track which player is X

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function getCurrentPlayerName() {
    if (currentPlayer === 'X') {
        return isPlayer1X ? player1Name : player2Name;
    } else {
        return isPlayer1X ? player2Name : player1Name;
    }
}

const winningMessage = () => `${getCurrentPlayerName()} wins!`;
const drawMessage = () => `Game ended in a draw!`;
const currentPlayerTurn = () => `${getCurrentPlayerName()}'s turn`;

// Initialize game with welcome screen
statusDisplay.textContent = '';
document.querySelector('.container').style.display = 'none';

startGameBtn.addEventListener('click', () => {
    const p1Name = player1Input.value.trim();
    const p2Name = player2Input.value.trim();
    
    if (!p1Name || !p2Name) {
        alert('Both players must enter their names!');
        return;
    }
    
    player1Name = p1Name;
    player2Name = p2Name;
    player1Label.textContent = player1Name;
    player2Label.textContent = player2Name;
    
    welcomeOverlay.classList.add('hidden');
    document.querySelector('.container').style.display = 'block';
    statusDisplay.textContent = currentPlayerTurn();
    changeBackgroundImage();
});

function updateSymbols() {
    player1Symbol.textContent = isPlayer1X ? 'X' : 'O';
    player2Symbol.textContent = isPlayer1X ? 'O' : 'X';
}

function updateScores() {
    player1ScoreDisplay.textContent = player1Score;
    player2ScoreDisplay.textContent = player2Score;
}

function playSound(player) {
    const sound = player === 'X' ? xSound : oSound;
    sound.currentTime = 0;
    sound.play().catch(error => {
        console.log('Sound playback failed:', error);
    });
}

function drawVictoryLine(winningCombination) {
    const [a, b, c] = winningCombination;
    const victoryLine = document.getElementById('victory-line');
    
    const cell1 = cells[a];
    const cell2 = cells[c];
    const rect1 = cell1.getBoundingClientRect();
    const rect2 = cell2.getBoundingClientRect();
    const boardRect = gameBoard.getBoundingClientRect();

    // Calculate line properties based on winning combination
    let width, height, left, top, transform;
    
    // Check if it's a diagonal win
    const isDiagonal = (a === 0 && c === 8) || (a === 2 && c === 6);
    
    // Horizontal win
    if (!isDiagonal && Math.abs(a - b) === 1) {
        width = rect2.right - rect1.left;
        height = 8;
        left = rect1.left - boardRect.left;
        top = rect1.top + (rect1.height / 2) - (height / 2) - boardRect.top;
        transform = 'none';
    }
    // Vertical win
    else if (!isDiagonal && Math.abs(a - b) === 3) {
        width = 8;
        height = rect2.bottom - rect1.top;
        left = rect1.left + (rect1.width / 2) - (width / 2) - boardRect.left;
        top = rect1.top - boardRect.top;
        transform = 'none';
    }
    // Diagonal win
    else {
        const length = Math.sqrt(
            Math.pow(rect2.left - rect1.left, 2) + 
            Math.pow(rect2.top - rect1.top, 2)
        );
        width = length;
        height = 8;
        
        // Position for diagonal lines
        if (a === 0 && c === 8) {
            // Top-left to bottom-right diagonal
            left = rect1.left - boardRect.left;
            top = rect1.top - boardRect.top + (rect1.height / 2) - (height / 2);
            transform = 'rotate(45deg)';
        } else {
            // Top-right to bottom-left diagonal
            left = rect2.left - boardRect.left;
            top = rect1.top - boardRect.top + (rect1.height / 2) - (height / 2);
            transform = 'rotate(-45deg)';
        }
    }

    // Apply styles to victory line
    victoryLine.style.width = `${width}px`;
    victoryLine.style.height = `${height}px`;
    victoryLine.style.left = `${left}px`;
    victoryLine.style.top = `${top}px`;
    victoryLine.style.transform = transform;
    victoryLine.style.transformOrigin = 'left center';
    victoryLine.style.display = 'block';
    victoryLine.style.animation = 'drawLine 0.5s ease-out forwards';
}

function handleCellClick(clickedCellEvent) {
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = Array.from(cells).indexOf(clickedCell);

    if (gameState[clickedCellIndex] !== '' || !gameActive) {
        return;
    }

    handleCellPlayed(clickedCell, clickedCellIndex);
    handleResultValidation();
}

function handleCellPlayed(clickedCell, clickedCellIndex) {
    gameState[clickedCellIndex] = currentPlayer;
    clickedCell.textContent = currentPlayer;
    clickedCell.classList.add(currentPlayer.toLowerCase());
    playSound(currentPlayer);
}

function handleResultValidation() {
    let roundWon = false;
    let winningCombination = null;

    for (const condition of winningConditions) {
        const [a, b, c] = condition;
        if (gameState[a] && gameState[a] === gameState[b] && gameState[a] === gameState[c]) {
            roundWon = true;
            winningCombination = condition;
            break;
        }
    }

    if (roundWon) {
        statusDisplay.textContent = winningMessage();
        gameActive = false;
        
        // Update scores based on current X/O assignment
        if (currentPlayer === 'X') {
            if (isPlayer1X) {
                player1Score++;
            } else {
                player2Score++;
            }
        } else {
            if (isPlayer1X) {
                player2Score++;
            } else {
                player1Score++;
            }
        }
        updateScores();
        
        // Add winning animation to winning cells
        winningCombination.forEach(index => {
            cells[index].classList.add('winning-cell');
        });
        
        // Draw victory line
        drawVictoryLine(winningCombination);
        
        // Play victory sound
        victorySound.currentTime = 0;
        victorySound.play().catch(error => {
            console.log('Victory sound playback failed:', error);
        });
        
        return;
    }

    const roundDraw = !gameState.includes('');
    if (roundDraw) {
        statusDisplay.textContent = drawMessage();
        gameActive = false;
        return;
    }

    handlePlayerChange();
}

function handlePlayerChange() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDisplay.textContent = currentPlayerTurn();
}

function changeBackgroundImage() {
    const timestamp = new Date().getTime();
    // Using picsum.photos as a reliable alternative
    document.body.style.backgroundImage = `
        linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
        url('https://picsum.photos/1920/1080?random=${timestamp}')
    `;
}

function handleRestartGame() {
    gameActive = true;
    // Swap X and O between players
    isPlayer1X = !isPlayer1X;
    currentPlayer = 'X';
    gameState = ['', '', '', '', '', '', '', '', ''];
    updateSymbols();
    statusDisplay.textContent = currentPlayerTurn();
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winning-cell');
    });
    document.getElementById('victory-line').style.display = 'none';
    changeBackgroundImage();
}

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

restartButton.addEventListener('click', handleRestartGame);

// Change background on initial load
changeBackgroundImage(); 