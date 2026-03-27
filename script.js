const playBtn = document.getElementById('play-btn');
const friendBtn = document.getElementById('friend-btn');
const grid = document.querySelector('.grid');
const cells = Array.from(document.querySelectorAll('.cell'));
const message = document.getElementById('message');
const turnDisplay = document.getElementById('turn-display');

let friendMode = false;
let currentPlayer = 'X';
let aiTurn = false; // IMPORTANT FIX

function updateTurnDisplay() {
  if (!grid.style.display || grid.style.display === "none") {
    turnDisplay.style.display = "none";
    return;
  }

  turnDisplay.textContent = `Turn: ${currentPlayer}`;
  turnDisplay.style.display = "block";

  if (playBtn.style.display === "none") {
    turnDisplay.style.display = "none";
  }
}

playBtn.addEventListener('click', function () {
  playBtn.style.display = 'none';
  friendBtn.style.display = 'none';
  grid.style.display = 'grid';
  friendMode = false;

  if (Math.random() < 0.5) {
    aiTurn = false;
    currentPlayer = 'X';
  } else {
    aiTurn = true;
    currentPlayer = 'X';
  }

  resetBoard();
  updateTurnDisplay();

  // AI starts immediately
  if (aiTurn && !friendMode) {
    setTimeout(() => {
      let board = getBoard();
      let bestMove = findBestMove(board);
      if (bestMove !== -1) {
        cells[bestMove].textContent = 'X';
        cells[bestMove].classList.add('clicked');
        setTimeout(() => cells[bestMove].classList.remove('clicked'), 300);
      }
      aiTurn = false;
      currentPlayer = 'O';
      updateTurnDisplay();
    }, 300);
  }
});

friendBtn.addEventListener('click', function () {
  playBtn.style.display = 'none';
  friendBtn.style.display = 'none';
  grid.style.display = 'grid';
  friendMode = true;
  currentPlayer = 'X';
  resetBoard();
  updateTurnDisplay();
});

function getBoard() {
  return cells.map(cell => cell.textContent);
}

function isMovesLeft(board) {
  return board.some(cell => cell === "");
}

function evaluate(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for (let line of wins) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      if (board[a] === "O") return +10;
      if (board[a] === "X") return -10;
    }
  }
  return 0;
}

function minimax(board, depth, isMax) {
  const score = evaluate(board);
  if (score === 10) return score - depth;
  if (score === -10) return score + depth;
  if (!isMovesLeft(board)) return 0;

  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "O";
        best = Math.max(best, minimax(board, depth + 1, false));
        board[i] = "";
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (board[i] === "") {
        board[i] = "X";
        best = Math.min(best, minimax(board, depth + 1, true));
        board[i] = "";
      }
    }
    return best;
  }
}

function findBestMove(board) {
  let bestVal = -Infinity;
  let bestMove = -1;

  for (let i = 0; i < 9; i++) {
    if (board[i] === "") {
      board[i] = "O";
      let moveVal = minimax(board, 0, false);
      board[i] = "";
      if (moveVal > bestVal) {
        bestMove = i;
        bestVal = moveVal;
      }
    }
  }
  return bestMove;
}

function checkGameOver(board) {
  const score = evaluate(board);
  if (score === 10) return "O";
  if (score === -10) return "X";
  if (!isMovesLeft(board)) return "draw";
  return null;
}

function showMessage(text) {
  message.textContent = text;
  message.style.display = "block";
}

function hideMessage() {
  message.style.display = "none";
}

function resetBoard() {
  cells.forEach(cell => cell.textContent = "");
  hideMessage();
  updateTurnDisplay();
}

function handleGameEnd(winner) {
  if (winner === "X") showMessage(friendMode ? "Player X wins!" : "You win!");
  else if (winner === "O") showMessage(friendMode ? "Player O wins!" : "You lose!");
  else showMessage("Draw!");

  turnDisplay.style.display = "none";

  setTimeout(() => {
    resetBoard();
    grid.style.display = "none";
    playBtn.style.display = "inline-block";
    friendBtn.style.display = "inline-block";
  }, 3000);
}

cells.forEach(cell => {
  cell.addEventListener('click', function () {
    if (friendMode) {
      if (!cell.textContent && checkGameOver(getBoard()) === null) {
        cell.textContent = currentPlayer;
        cell.classList.add('clicked');
        setTimeout(() => cell.classList.remove('clicked'), 300);

        let board = getBoard();
        let winner = checkGameOver(board);
        if (winner) {
          handleGameEnd(winner);
          return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        updateTurnDisplay();
      }
    } else {
      if (aiTurn) return;

      if (!cell.textContent && checkGameOver(getBoard()) === null) {
        cell.textContent = 'X';
        cell.classList.add('clicked');
        setTimeout(() => cell.classList.remove('clicked'), 300);

        let board = getBoard();
        let winner = checkGameOver(board);
        if (winner) {
          handleGameEnd(winner);
          return;
        }

        aiTurn = true;
        let bestMove = findBestMove(board);

        if (bestMove !== -1) {
          setTimeout(() => {
            cells[bestMove].textContent = 'O';
            cells[bestMove].classList.add('clicked');
            setTimeout(() => cells[bestMove].classList.remove('clicked'), 300);

            let boardAfterO = getBoard();
            let winnerAfterO = checkGameOver(boardAfterO);
            aiTurn = false;

            if (winnerAfterO) {
              handleGameEnd(winnerAfterO);
            }
          }, 300);
        } else {
          aiTurn = false;
        }
      }
    }
  });
});
