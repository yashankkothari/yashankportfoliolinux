
import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SnakeGameProps {
  onExit: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20; // CSS pixels (approx char width)
const BOARD_WIDTH = 30; // cells
const BOARD_HEIGHT = 20; // cells

type Point = { x: number; y: number };

const SnakeGame: React.FC<SnakeGameProps> = ({ onExit }) => {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Point>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Point>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load high score
  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore');
    if (saved) setHighScore(parseInt(saved));
  }, []);

  const generateFood = useCallback((): Point => {
    return {
      x: Math.floor(Math.random() * BOARD_WIDTH),
      y: Math.floor(Math.random() * BOARD_HEIGHT)
    };
  }, []);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) {
        if (e.key === 'r' || e.key === 'R') resetGame();
        if (e.key === 'q' || e.key === 'Q' || e.key === 'Escape') onExit();
        return;
      }

      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
        case 'p': setIsPaused(prev => !prev); break;
        case 'Escape': onExit(); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, onExit]);

  useEffect(() => {
    if (gameOver || isPaused) return;

    gameLoopRef.current = setInterval(() => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y
        };

        // Collision detection (Walls)
        if (
          newHead.x < 0 || 
          newHead.x >= BOARD_WIDTH || 
          newHead.y < 0 || 
          newHead.y >= BOARD_HEIGHT
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Collision detection (Self)
        for (let i = 0; i < prevSnake.length; i++) {
          if (newHead.x === prevSnake[i].x && newHead.y === prevSnake[i].y) {
            setGameOver(true);
            return prevSnake;
          }
        }

        const newSnake = [newHead, ...prevSnake];

        // Eat Food
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > highScore) {
              setHighScore(newScore);
              localStorage.setItem('snake_highscore', newScore.toString());
            }
            return newScore;
          });
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, 100);

    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [direction, food, gameOver, isPaused, highScore, generateFood]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black/90 p-4 font-mono text-green-500 border-2 border-green-500/50 rounded">
      <div className="flex justify-between w-full max-w-xl mb-2">
        <div>SCORE: {score}</div>
        <div>HIGH SCORE: {highScore}</div>
      </div>
      
      <div 
        className="relative bg-slate-900 border border-green-700"
        style={{ 
          width: BOARD_WIDTH * CELL_SIZE, 
          height: BOARD_HEIGHT * CELL_SIZE 
        }}
      >
        {/* Food */}
        <div 
          className="absolute bg-red-500 rounded-full animate-pulse"
          style={{
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
            width: CELL_SIZE,
            height: CELL_SIZE
          }}
        />

        {/* Snake */}
        {snake.map((segment, i) => (
          <div 
            key={i}
            className={`absolute ${i === 0 ? 'bg-green-400 z-10' : 'bg-green-600'}`}
            style={{
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
              border: '1px solid #000'
            }}
          >
            {i === 0 && (
                <>
                    <div className="absolute top-1 left-1 w-1 h-1 bg-black rounded-full"></div>
                    <div className="absolute top-1 right-1 w-1 h-1 bg-black rounded-full"></div>
                </>
            )}
          </div>
        ))}

        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
            <h2 className="text-3xl font-bold text-red-500 mb-4">GAME OVER</h2>
            <p className="mb-2">Final Score: {score}</p>
            <div className="flex gap-4 text-sm">
              <span className="border border-green-500 px-2 py-1 cursor-pointer hover:bg-green-500 hover:text-black" onClick={resetGame}>[R] RESTART</span>
              <span className="border border-red-500 px-2 py-1 cursor-pointer hover:bg-red-500 hover:text-black" onClick={onExit}>[Q] QUIT</span>
            </div>
          </div>
        )}

        {isPaused && !gameOver && (
           <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
              <h2 className="text-2xl font-bold text-yellow-500">PAUSED</h2>
           </div>
        )}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Use <span className="text-white">Arrow Keys</span> to move • <span className="text-white">[P]</span> Pause • <span className="text-white">[ESC]</span> Quit
      </div>
    </div>
  );
};

export default SnakeGame;
