// Game state
const WORD = 'HORSE';
const MAX_ATTEMPTS = 6;
let currentRow = 0;
let currentTile = 0;
let currentGuess = '';
let gameOver = false;

// Get DOM elements
const tiles = document.querySelectorAll('.tile');
const keys = document.querySelectorAll('.key');
const messageEl = document.getElementById('message');
const newGameBtn = document.getElementById('newGameBtn');

// Initialize game
function init() {
    // Add event listeners to keyboard
    keys.forEach(key => {
        key.addEventListener('click', () => handleKeyPress(key.dataset.key));
    });

    // Add physical keyboard listener
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            handleKeyPress('Enter');
        } else if (e.key === 'Backspace') {
            handleKeyPress('Backspace');
        } else if (/^[a-zA-Z]$/.test(e.key)) {
            handleKeyPress(e.key.toUpperCase());
        }
    });

    // New game button
    newGameBtn.addEventListener('click', resetGame);
}

// Handle key presses
function handleKeyPress(key) {
    if (gameOver) return;

    if (key === 'Enter') {
        submitGuess();
    } else if (key === 'Backspace') {
        deleteLetter();
    } else if (currentTile < 5) {
        addLetter(key);
    }
}

// Add letter to current guess
function addLetter(letter) {
    if (currentTile < 5) {
        const tileIndex = currentRow * 5 + currentTile;
        tiles[tileIndex].textContent = letter;
        tiles[tileIndex].classList.add('filled');
        currentGuess += letter;
        currentTile++;
    }
}

// Delete last letter
function deleteLetter() {
    if (currentTile > 0) {
        currentTile--;
        const tileIndex = currentRow * 5 + currentTile;
        tiles[tileIndex].textContent = '';
        tiles[tileIndex].classList.remove('filled');
        currentGuess = currentGuess.slice(0, -1);
    }
}

// Submit the current guess
function submitGuess() {
    if (currentTile !== 5) {
        showMessage('Not enough letters!');
        shakeTiles();
        return;
    }

    // Check the guess
    checkGuess();
    
    // Check if game is won
    if (currentGuess === WORD) {
        gameOver = true;
        setTimeout(() => {
            showMessage('🎉 Congratulations! You found HORSE! 🐴');
            celebrateWin();
        }, 1500);
        return;
    }

    // Move to next row
    currentRow++;
    currentTile = 0;
    currentGuess = '';

    // Check if game is lost
    if (currentRow === MAX_ATTEMPTS) {
        gameOver = true;
        setTimeout(() => {
            showMessage(`Game Over! The word was ${WORD} 🐴`);
        }, 1500);
    }
}

// Check the guess and update tiles
function checkGuess() {
    const guessArray = currentGuess.split('');
    const wordArray = WORD.split('');
    const letterCount = {};
    
    // Count letters in the target word
    wordArray.forEach(letter => {
        letterCount[letter] = (letterCount[letter] || 0) + 1;
    });

    // First pass: mark correct letters (green)
    const tileStates = Array(5).fill(null);
    for (let i = 0; i < 5; i++) {
        if (guessArray[i] === wordArray[i]) {
            tileStates[i] = 'correct';
            letterCount[guessArray[i]]--;
        }
    }

    // Second pass: mark present letters (yellow)
    for (let i = 0; i < 5; i++) {
        if (tileStates[i] === null) {
            if (letterCount[guessArray[i]] && letterCount[guessArray[i]] > 0) {
                tileStates[i] = 'present';
                letterCount[guessArray[i]]--;
            } else {
                tileStates[i] = 'absent';
            }
        }
    }

    // Apply states to tiles with animation delay
    for (let i = 0; i < 5; i++) {
        const tileIndex = currentRow * 5 + i;
        setTimeout(() => {
            tiles[tileIndex].classList.add(tileStates[i]);
            updateKeyboard(guessArray[i], tileStates[i]);
        }, i * 300);
    }
}

// Update keyboard colors
function updateKeyboard(letter, state) {
    const keyElement = Array.from(keys).find(key => key.dataset.key === letter);
    if (!keyElement) return;

    // Only update if the new state is "better" than the current state
    const currentState = keyElement.classList.contains('correct') ? 'correct' :
                        keyElement.classList.contains('present') ? 'present' :
                        keyElement.classList.contains('absent') ? 'absent' : null;

    const statePriority = { correct: 3, present: 2, absent: 1 };
    
    if (!currentState || statePriority[state] > statePriority[currentState]) {
        keyElement.classList.remove('correct', 'present', 'absent');
        keyElement.classList.add(state);
    }
}

// Show message to user
function showMessage(msg) {
    messageEl.textContent = msg;
    messageEl.classList.add('show');
    setTimeout(() => {
        messageEl.classList.remove('show');
        messageEl.textContent = '';
    }, 2000);
}

// Shake tiles animation
function shakeTiles() {
    const rowTiles = Array.from(tiles).slice(currentRow * 5, currentRow * 5 + 5);
    rowTiles.forEach(tile => {
        tile.style.animation = 'shake 0.5s';
        setTimeout(() => {
            tile.style.animation = '';
        }, 500);
    });
}

// Add shake animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Celebrate win with animation
function celebrateWin() {
    const rowTiles = Array.from(tiles).slice(currentRow * 5, currentRow * 5 + 5);
    rowTiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.style.animation = 'bounce 0.5s';
            setTimeout(() => {
                tile.style.animation = '';
            }, 500);
        }, index * 100);
    });
}

// Add bounce animation
const bounceStyle = document.createElement('style');
bounceStyle.textContent = `
    @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
    }
`;
document.head.appendChild(bounceStyle);

// Reset game
function resetGame() {
    currentRow = 0;
    currentTile = 0;
    currentGuess = '';
    gameOver = false;

    // Clear all tiles
    tiles.forEach(tile => {
        tile.textContent = '';
        tile.classList.remove('filled', 'correct', 'present', 'absent');
    });

    // Clear keyboard colors
    keys.forEach(key => {
        key.classList.remove('correct', 'present', 'absent');
    });

    // Clear message
    messageEl.textContent = '';
    messageEl.classList.remove('show');
}

// Start the game
init();
