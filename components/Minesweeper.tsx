
import React, { useState, useEffect } from 'react';

interface MinesweeperProps {
  onExit: () => void;
}

interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborCount: number;
}

const ROWS = 10;
const COLS = 15;
const MINES = 20;

const Minesweeper: React.FC<MinesweeperProps> = ({ onExit }) => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [mineCount, setMineCount] = useState(MINES);

  // Initialize Grid
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newGrid: Cell[][] = [];
    
    // Create empty grid
    for (let y = 0; y < ROWS; y++) {
      const row: Cell[] = [];
      for (let x = 0; x < COLS; x++) {
        row.push({
          x,
          y,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborCount: 0
        });
      }
      newGrid.push(row);
    }

    // Place mines
    let placedMines = 0;
    while (placedMines < MINES) {
      const rx = Math.floor(Math.random() * COLS);
      const ry = Math.floor(Math.random() * ROWS);
      if (!newGrid[ry][rx].isMine) {
        newGrid[ry][rx].isMine = true;
        placedMines++;
      }
    }

    // Calculate neighbors
    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (newGrid[y][x].isMine) continue;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS && newGrid[ny][nx].isMine) {
              count++;
            }
          }
        }
        newGrid[y][x].neighborCount = count;
      }
    }

    setGrid(newGrid);
    setCursor({ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) });
    setGameState('playing');
    setMineCount(MINES);
  };

  // Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExit();
        return;
      }
      
      if (gameState !== 'playing') {
        if (e.key === 'r' || e.key === 'R') initializeGame();
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          setCursor(prev => ({ ...prev, y: Math.max(0, prev.y - 1) }));
          break;
        case 'ArrowDown':
          setCursor(prev => ({ ...prev, y: Math.min(ROWS - 1, prev.y + 1) }));
          break;
        case 'ArrowLeft':
          setCursor(prev => ({ ...prev, x: Math.max(0, prev.x - 1) }));
          break;
        case 'ArrowRight':
          setCursor(prev => ({ ...prev, x: Math.min(COLS - 1, prev.x + 1) }));
          break;
        case ' ':
        case 'Enter':
        case 'z':
          revealCell(cursor.x, cursor.y);
          break;
        case 'f':
        case 'F':
        case 'x':
          toggleFlag(cursor.x, cursor.y);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cursor, gameState, grid]);

  const revealCell = (x: number, y: number) => {
    if (grid[y][x].isRevealed || grid[y][x].isFlagged) return;

    const newGrid = [...grid];
    const cell = newGrid[y][x];
    
    if (cell.isMine) {
      setGameState('lost');
      revealAllMines(newGrid);
      setGrid(newGrid);
      return;
    }

    const floodFill = (cx: number, cy: number) => {
      if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return;
      if (newGrid[cy][cx].isRevealed || newGrid[cy][cx].isFlagged) return;

      newGrid[cy][cx].isRevealed = true;

      if (newGrid[cy][cx].neighborCount === 0) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            floodFill(cx + dx, cy + dy);
          }
        }
      }
    };

    floodFill(x, y);
    setGrid(newGrid);
    checkWin(newGrid);
  };

  const toggleFlag = (x: number, y: number) => {
    if (grid[y][x].isRevealed) return;
    
    const newGrid = [...grid];
    newGrid[y][x].isFlagged = !newGrid[y][x].isFlagged;
    setGrid(newGrid);
    setMineCount(prev => newGrid[y][x].isFlagged ? prev - 1 : prev + 1);
  };

  const revealAllMines = (currentGrid: Cell[][]) => {
    currentGrid.forEach(row => {
      row.forEach(cell => {
        if (cell.isMine) cell.isRevealed = true;
      });
    });
  };

  const checkWin = (currentGrid: Cell[][]) => {
    let unrevealedSafeCells = 0;
    currentGrid.forEach(row => {
      row.forEach(cell => {
        if (!cell.isMine && !cell.isRevealed) unrevealedSafeCells++;
      });
    });

    if (unrevealedSafeCells === 0) {
      setGameState('won');
    }
  };

  const getCellContent = (cell: Cell) => {
    if (cell.isFlagged) return <span className="text-red-500">⚑</span>;
    if (!cell.isRevealed) return <span className="text-gray-600">■</span>;
    if (cell.isMine) return <span className="text-red-600 animate-pulse">✸</span>;
    
    if (cell.neighborCount === 0) return <span className="text-gray-800">·</span>;
    
    const colors = [
      'text-gray-400', 'text-blue-400', 'text-green-400', 'text-red-400', 
      'text-purple-400', 'text-yellow-400', 'text-cyan-400', 'text-white'
    ];
    return <span className={`${colors[cell.neighborCount]}`}>{cell.neighborCount}</span>;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 select-none">
      <div className="border-2 border-gray-700 bg-slate-900 p-4 rounded shadow-2xl">
        <div className="flex justify-between mb-4 text-green-400 font-mono text-sm">
          <div>MINES: {mineCount}</div>
          <div>STATUS: {gameState === 'playing' ? 'ACTIVE' : gameState === 'won' ? 'CLEARED' : 'FAILED'}</div>
        </div>

        <div className="grid gap-px bg-gray-800 border border-gray-600" style={{ gridTemplateColumns: `repeat(${COLS}, min-content)` }}>
          {grid.map((row, y) => (
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`w-8 h-8 flex items-center justify-center cursor-pointer text-lg font-bold
                  ${x === cursor.x && y === cursor.y ? 'bg-gray-700 ring-2 ring-green-500 z-10' : 'bg-slate-900'}
                  ${cell.isRevealed ? 'bg-slate-950' : 'hover:bg-gray-800'}
                `}
                onClick={() => revealCell(x, y)}
                onContextMenu={(e) => { e.preventDefault(); toggleFlag(x, y); }}
              >
                {getCellContent(cell)}
              </div>
            ))
          ))}
        </div>

        <div className="mt-4 text-xs text-gray-500 font-mono text-center">
          [ARROWS] Move • [ENTER/SPACE] Reveal • [F] Flag • [R] Restart • [ESC] Quit
        </div>

        {gameState !== 'playing' && (
          <div className={`mt-2 text-center font-bold animate-bounce ${gameState === 'won' ? 'text-green-400' : 'text-red-500'}`}>
            {gameState === 'won' ? '&gt;&gt; MISSION ACCOMPLISHED &lt;&lt;' : '&gt;&gt; DETONATION DETECTED &lt;&lt;'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Minesweeper;
