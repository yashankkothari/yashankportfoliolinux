import React, { useEffect, useRef, useState } from 'react';
import { TerminalMode } from '../types';

interface TerminalInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: () => void;
  mode: TerminalMode;
  loading?: boolean;
  history?: string[];
  promptColor?: string;
}

const TerminalInput: React.FC<TerminalInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  mode, 
  loading, 
  history = [],
  promptColor = 'text-green-500'
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [historyIndex, setHistoryIndex] = useState<number>(history.length);

  useEffect(() => {
    // Reset history index when history changes (new command added)
    setHistoryIndex(history.length);
  }, [history.length]);

  useEffect(() => {
    // Auto-focus input
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
    return () => clearTimeout(timeout);
  }, [loading, mode]);

  const handleBlur = () => {
    if (!loading) {
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (loading) return;

    if (e.key === 'Enter') {
      onSubmit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        onChange(history[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        onChange(history[newIndex]);
      } else {
        setHistoryIndex(history.length);
        onChange('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic Tab Completion
      const commands = ['help', 'about', 'experience', 'projects', 'skills', 'education', 'contact', 'chat', 'edit_image', 'clear', 'neofetch', 'theme', 'whoami', 'history', 'weather', 'cat', 'ls', 'sudo', 'vim', 'sl', 'matrix', 'startx', 'gui'];
      const match = commands.find(c => c.startsWith(value));
      if (match) {
        onChange(match);
      }
    }
  };

  const getPrompt = () => {
    if (mode === TerminalMode.CHAT) return 'ai@yashank:~/chat$';
    if (mode === TerminalMode.IMAGE_EDIT) return 'nano@yashank:~/img$';
    return 'guest@yashank:~$';
  };

  // Allow overriding prompt color via props, otherwise infer from mode
  const getPromptColor = () => {
    if (mode === TerminalMode.CHAT) return 'text-blue-400';
    if (mode === TerminalMode.IMAGE_EDIT) return 'text-purple-400';
    return promptColor;
  };

  return (
    <div className="flex w-full items-center">
      <span className={`mr-2 font-bold whitespace-nowrap ${getPromptColor()}`}>
        {getPrompt()}
      </span>
      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full bg-transparent border-none outline-none font-mono caret-transparent text-inherit"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          disabled={loading}
        />
        {/* Custom cursor */}
        <span 
          className="absolute top-0 pointer-events-none"
          style={{ 
            left: `${value.length}ch`,
          }}
        >
          <span className="bg-slate-200 text-slate-900 opacity-70 w-[1ch] inline-block animate-pulse">
            &nbsp;
          </span>
        </span>
      </div>
    </div>
  );
};

export default TerminalInput;