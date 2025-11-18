
import React, { useState, useEffect } from 'react';

interface TicTacToeProps {
  onExit: () => void;
}

const TicTacToe: React.FC<TicTacToeProps> = ({ onExit }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [cursor, setCursor] = useState(4); // Center
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');

  // Check win condition
  useEffect(() => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        setWinner(board[a]);
        setGameStatus('won');
        return;
      }
    }

    if (!board.includes(null)) {
      setGameStatus('draw');
    }
  }, [board]);

  // AI Turn
  useEffect(() => {
    if (!isPlayerTurn && gameStatus === 'playing') {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameStatus]);

  const makeAIMove = () => {
    const emptyIndices = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
    
    if (emptyIndices.length === 0) return;

    // Simple AI: Random move
    // Ideally, minimax could be implemented here for an unbeatable AI
    const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    
    const newBoard = [...board];
    newBoard[randomIndex] = 'O';
    setBoard(newBoard);
    setIsPlayerTurn(true);
  };

  const handlePlayerMove = (index: number) => {
    if (board[index] || winner || !isPlayerTurn) return;

    const newBoard = [...board];
    newBoard[index] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }

      if (gameStatus !== 'playing') {
        if (e.key === 'r' || e.key === 'R') resetGame();
        return;
      }

      switch(e.key) {
        case 'ArrowUp': setCursor(c => c - 3 >= 0 ? c - 3 : c); break;
        case 'ArrowDown': setCursor(c => c + 3 < 9 ? c + 3 : c); break;
        case 'ArrowLeft': setCursor(c => c % 3 !== 0 ? c - 1 : c); break;
        case 'ArrowRight': setCursor(c => (c + 1) % 3 !== 0 ? c + 1 : c); break;
        case 'Enter':
        case ' ':
          handlePlayerMove(cursor);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursor, gameStatus, board, isPlayerTurn]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setGameStatus('playing');
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 font-mono">
      <h2 className="text-xl font-bold text-blue-400 mb-4">TIC-TAC-TOE</h2>
      
      <div className="grid grid-cols-3 gap-2 bg-slate-800 p-2 rounded border border-slate-700">
        {board.map((cell, idx) => (
          <div 
            key={idx}
            className={`w-20 h-20 flex items-center justify-center text-4xl font-bold cursor-pointer border border-slate-600
              ${idx === cursor ? 'bg-slate-700 ring-2 ring-blue-400' : 'bg-slate-900'}
              ${cell === 'X' ? 'text-green-400' : 'text-red-400'}
            `}
            onClick={() => isPlayerTurn && handlePlayerMove(idx)}
          >
            {cell}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center h-16">
        {gameStatus === 'playing' ? (
          <p className={`text-lg ${isPlayerTurn ? 'text-green-400' : 'text-red-400 animate-pulse'}`}>
            {isPlayerTurn ? ">> YOUR TURN (X)" : ">> AI THINKING..."}
          </p>
        ) : (
          <div className="animate-bounce">
            <p className={`text-xl font-bold ${winner === 'X' ? 'text-green-400' : winner === 'O' ? 'text-red-500' : 'text-yellow-400'}`}>
              {winner === 'X' ? "VICTORY!" : winner === 'O' ? "DEFEAT!" : "DRAW!"}
            </p>
            <p className="text-sm text-gray-500 mt-1">Press [R] to Restart</p>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-xs text-gray-600">
        [ARROWS] Move • [ENTER] Select • [ESC] Quit
      </div>
    </div>
  );
};

export default TicTacToe;
