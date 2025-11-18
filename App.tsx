
import React, { useState, useEffect, useRef } from 'react';
import { TerminalMode, TerminalLine, ThemeName, ViewMode } from './types';
import { RESUME, ASCII_HEADER, NEOFETCH_ART, VIRTUAL_FILES, THEMES } from './constants';
import TerminalInput from './components/TerminalInput';
import ImageEditor from './components/ImageEditor';
import MatrixRain from './components/MatrixRain';
import DesktopEnvironment from './components/DesktopEnvironment';
import SnakeGame from './components/SnakeGame';
import Minesweeper from './components/Minesweeper';
import TicTacToe from './components/TicTacToe';
import SystemMonitor from './components/SystemMonitor';
import { chatWithGemini } from './services/geminiService';
import { findBestMatch } from './utils';

const App: React.FC = () => {
  const [history, setHistory] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<TerminalMode>(TerminalMode.STANDARD);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.TERMINAL);
  const [loading, setLoading] = useState(false);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  
  // Feature States
  const [theme, setTheme] = useState<ThemeName>('standard');
  const [matrixEnabled, setMatrixEnabled] = useState(false);
  const [vimContent, setVimContent] = useState('');
  const [vimMessage, setVimMessage] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  const currentTheme = THEMES[theme];

  // Helper to add output to terminal
  const addOutput = (content: React.ReactNode, type: 'output' | 'component' = 'output') => {
    setHistory(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      type,
      content
    }]);
  };

  const addInputLine = (cmd: string, currentMode: TerminalMode) => {
    let promptLabel = 'guest@yashank:~$';
    if (currentMode === TerminalMode.CHAT) promptLabel = 'ai@yashank:~/chat$';
    else if (currentMode === TerminalMode.IMAGE_EDIT) promptLabel = 'nano@yashank:~/img$';

    setHistory(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      type: 'input',
      content: cmd,
      promptLabel
    }]);
  };

  // Scroll to bottom on history update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading, mode]);

  // Initial Welcome Message
  useEffect(() => {
    setHistory([
      {
        id: 'header',
        type: 'output',
        content: <pre className={`${currentTheme.text} font-bold leading-none text-xs md:text-base mb-4`}>{ASCII_HEADER}</pre>
      },
      {
        id: 'welcome',
        type: 'output',
        content: (
          <div className="mb-4">
            <p>Welcome to Yashank Kothari's interactive portfolio! (Version 1.7.0)</p>
            <p className="mt-2">Type <span className="text-yellow-300">'help'</span> to see the list of available commands.</p>
          </div>
        )
      }
    ]);
  }, []);

  // -------------------------------------------------------------------------
  // COMMAND HANDLERS
  // -------------------------------------------------------------------------

  const handleStandardCommand = async (cmdRaw: string) => {
    const cmd = cmdRaw.trim();
    const args = cmd.split(' ');
    const mainCmd = args[0].toLowerCase();

    // Add to command history
    if (cmd) {
      setCommandHistory(prev => [...prev, cmd]);
    }
    
    switch (mainCmd) {
      case 'help':
        addOutput(
          <div className="space-y-4 max-w-2xl">
            <div>
                <p className="text-yellow-300 font-bold text-lg mb-2">Available Commands:</p>
                <div className="grid grid-cols-1 gap-1 pl-2">
                    <div><span className="text-cyan-400 font-bold">[who]</span> or <span className="text-cyan-400 font-bold">[w]</span></div>
                    <div><span className="text-cyan-400 font-bold">[skills]</span> or <span className="text-cyan-400 font-bold">[s]</span></div>
                    <div><span className="text-cyan-400 font-bold">[projects]</span> or <span className="text-cyan-400 font-bold">[pj]</span></div>
                    <div><span className="text-cyan-400 font-bold">[miscellaneous]</span> or <span className="text-cyan-400 font-bold">[misc]</span></div>
                    <div><span className="text-cyan-400 font-bold">[games]</span> or <span className="text-cyan-400 font-bold">[g]</span></div>
                    <div><span className="text-cyan-400 font-bold">[blog]</span> or <span className="text-cyan-400 font-bold">[b]</span></div>
                    <div><span className="text-cyan-400 font-bold">[resume]</span> or <span className="text-cyan-400 font-bold">[cv]</span></div>
                    <div><span className="text-cyan-400 font-bold">[clear]</span></div>
                </div>
            </div>

            <div>
                <p className="text-yellow-300 font-bold text-lg mb-2 mt-4">Contact Me:</p>
                <div className="grid grid-cols-1 gap-1 pl-2">
                    <div><span className="text-cyan-400 font-bold">[email]</span></div>
                    <div><span className="text-cyan-400 font-bold">[linkedin]</span></div>
                    <div><span className="text-cyan-400 font-bold">[twitter]</span></div>
                    <div><span className="text-cyan-400 font-bold">[github]</span></div>
                </div>
            </div>
          </div>
        );
        break;
      
      case 'who':
      case 'w':
      case 'about':
        addOutput(
          <div>
            <p className="text-xl font-bold mb-2">{RESUME.name}</p>
            <p className="mb-2">Bachelor of Technology Computer Engineering student with Honours in Data Science.</p>
            <p>Passionate about AI, Machine Learning, and Full Stack Development.</p>
            <br/>
            <p className="text-sm opacity-80">Type 'experience' to see work history.</p>
          </div>
        );
        break;

      case 'experience':
        addOutput(
          <div className="space-y-4">
            {RESUME.experience.map((exp, i) => (
              <div key={i} className={`border-l-2 ${currentTheme.prompt.replace('text-', 'border-')} pl-4`}>
                <div className="flex justify-between flex-wrap">
                  <h3 className={`text-lg font-bold ${currentTheme.text}`}>{exp.role} @ {exp.company}</h3>
                  <span className="opacity-60 text-sm">{exp.period}</span>
                </div>
                <p className="text-sm opacity-80 mb-1">{exp.location}</p>
                <ul className="list-disc list-inside text-sm opacity-70 space-y-1 mt-2">
                  {exp.details.map((d, idx) => <li key={idx}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
        break;

      case 'projects':
      case 'pj':
        addOutput(
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {RESUME.projects.map((proj, i) => (
              <div key={i} className="border border-gray-700 p-3 rounded hover:border-opacity-100 transition-colors border-opacity-50">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-cyan-400">{proj.name}</h3>
                  <span className="text-xs opacity-60">{proj.year}</span>
                </div>
                <p className="text-xs text-yellow-600 mb-2">{proj.tech}</p>
                <ul className="text-xs opacity-80 list-disc list-inside">
                  {proj.description.slice(0, 2).map((d, idx) => <li key={idx}>{d}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
        break;

      case 'skills':
      case 's':
        // ASCII Progress Bars
        const renderBar = (percent: number) => {
            const filled = Math.floor((percent / 100) * 20);
            const empty = 20 - filled;
            return `[${'='.repeat(filled)}${'.'.repeat(empty)}] ${percent}%`;
        };

        addOutput(
          <div className="space-y-2 text-sm">
            <div><span className="font-bold text-purple-400 w-24 inline-block">Python</span> {renderBar(95)}</div>
            <div><span className="font-bold text-blue-400 w-24 inline-block">TypeScript</span> {renderBar(90)}</div>
            <div><span className="font-bold text-yellow-400 w-24 inline-block">React/Next</span> {renderBar(88)}</div>
            <div><span className="font-bold text-green-400 w-24 inline-block">AI/ML</span> {renderBar(85)}</div>
            <div><span className="font-bold text-orange-400 w-24 inline-block">Docker/K8s</span> {renderBar(75)}</div>
            <br/>
            <div className="opacity-70 text-xs">
                {Object.entries(RESUME.skills).map(([cat, val]) => (
                <div key={cat}>
                    <span className="uppercase font-bold w-24 inline-block">{cat}:</span> {val}
                </div>
                ))}
            </div>
          </div>
        );
        break;

      case 'resume':
      case 'cv':
        addOutput(
           <div>
              <p className="text-green-400 mb-2">>> Generating Resume Summary...</p>
              <div className="bg-slate-900 p-4 border border-gray-700 text-sm rounded">
                 <h1 className="text-xl font-bold text-white">{RESUME.name}</h1>
                 <p className="text-gray-400">{RESUME.contact.email} | {RESUME.contact.phone}</p>
                 <hr className="my-2 border-gray-700"/>
                 <h2 className="text-yellow-400 font-bold">Experience</h2>
                 {RESUME.experience.map((e,i) => <p key={i}>- {e.role} at {e.company}</p>)}
                 <br/>
                 <h2 className="text-yellow-400 font-bold">Education</h2>
                 {RESUME.education.map((e,i) => <p key={i}>- {e.degree}, {e.institution}</p>)}
              </div>
           </div>
        );
        break;

      case 'education':
        addOutput(
          <div className="space-y-2">
            {RESUME.education.map((edu, i) => (
              <div key={i}>
                <h3 className="font-bold">{edu.institution}</h3>
                <p className={currentTheme.accent}>{edu.degree}</p>
                <p className="text-sm opacity-60">{edu.period} | {edu.location}</p>
              </div>
            ))}
          </div>
        );
        break;

      // --- Contact Commands ---
      case 'contact':
        addOutput(
          <div className="space-y-1">
             <p>Type specific command to open:</p>
             <p className="ml-4 text-cyan-400">[email] [linkedin] [twitter] [github]</p>
          </div>
        );
        break;
      
      case 'email':
        addOutput(<p>>> Opening mail client...</p>);
        window.location.href = `mailto:${RESUME.contact.email}`;
        break;
      
      case 'linkedin':
        addOutput(<p>>> Opening LinkedIn profile...</p>);
        window.open(`https://${RESUME.contact.linkedin}`, '_blank');
        break;

      case 'github':
      case 'gh':
        addOutput(<p>>> Opening GitHub profile...</p>);
        window.open(`https://${RESUME.contact.github}`, '_blank');
        break;

      case 'twitter':
        // Assuming twitter is added to constants, otherwise using generic
        addOutput(<p>>> Opening Twitter...</p>);
        window.open(`https://twitter.com/yashankkothari`, '_blank'); // Fallback/Example
        break;
      
      case 'blog':
      case 'b':
        addOutput(<p className="text-yellow-300">>> Blog is currently under construction. Check back later!</p>);
        break;

      case 'misc':
      case 'miscellaneous':
        addOutput(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-xl">
             <div><span className="text-pink-400 font-bold">neofetch</span> - System Info</div>
             <div><span className="text-pink-400 font-bold">matrix</span> - Toggle Matrix Rain</div>
             <div><span className="text-pink-400 font-bold">monitor</span> - System Monitor</div>
             <div><span className="text-pink-400 font-bold">weather</span> - Current Weather</div>
             <div><span className="text-pink-400 font-bold">startx</span> - Launch GUI</div>
             <div><span className="text-pink-400 font-bold">theme</span> - Change colors</div>
             <div><span className="text-pink-400 font-bold">calc</span> - Calculator</div>
          </div>
        );
        break;

      case 'neofetch':
        addOutput(
          <pre className={`text-xs md:text-sm font-bold ${currentTheme.text} leading-snug`}>
            {NEOFETCH_ART}
          </pre>
        );
        break;
      
      case 'games':
      case 'g':
         addOutput(
            <div>
               <p className="mb-2">Available Games:</p>
               <div className="pl-2">
                  <div><span className="text-green-400 font-bold">[snake]</span> - Classic Snake</div>
                  <div><span className="text-green-400 font-bold">[minesweeper]</span> - Find Mines</div>
                  <div><span className="text-green-400 font-bold">[ttt]</span> - Tic-Tac-Toe</div>
               </div>
            </div>
         );
         break;

      case 'google':
        const googleQuery = args.slice(1).join(' ');
        if (!googleQuery) { addOutput(<p>Usage: google [query]</p>); break; }
        window.open(`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`, '_blank');
        addOutput(<p>>> Opening Google Search for: {googleQuery}</p>);
        break;

      case 'youtube':
      case 'yt':
        const ytQuery = args.slice(1).join(' ');
        if (!ytQuery) { addOutput(<p>Usage: youtube [query]</p>); break; }
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`, '_blank');
        addOutput(<p>>> Opening YouTube Search for: {ytQuery}</p>);
        break;

      case 'wiki':
        const wikiQuery = args.slice(1).join(' ');
        if (!wikiQuery) { addOutput(<p>Usage: wiki [query]</p>); break; }
        window.open(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiQuery)}`, '_blank');
        addOutput(<p>>> Opening Wikipedia for: {wikiQuery}</p>);
        break;

      case 'calc':
        const expr = args.slice(1).join(' ');
        if (!expr) { addOutput(<p>Usage: calc [expression] (e.g. calc 2 + 2 * 4)</p>); break; }
        try {
            // Safe-ish evaluation for simple math
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + expr.replace(/[^0-9+\-*/().Math\s]/g, ''))();
            addOutput(<p className="text-green-400">>> {result}</p>);
        } catch (e) {
            addOutput(<p className="text-red-400">Error: Invalid expression</p>);
        }
        break;

      case 'snake':
        setMode(TerminalMode.GAME);
        addOutput(<p className="text-green-400">>> Launching Snake.exe...</p>);
        break;

      case 'minesweeper':
      case 'mine':
        setMode(TerminalMode.MINESWEEPER);
        addOutput(<p className="text-yellow-400">>> Launching Minesweeper...</p>);
        break;

      case 'tictactoe':
      case 'ttt':
        setMode(TerminalMode.TICTACTOE);
        addOutput(<p className="text-blue-400">>> Launching Tic-Tac-Toe...</p>);
        break;

      case 'monitor':
      case 'htop':
      case 'top':
        setMode(TerminalMode.MONITOR);
        addOutput(<p className="text-green-400">>> Initializing System Monitor...</p>);
        break;

      case 'whoami':
        addOutput(<p>guest@yashank-portfolio</p>);
        break;

      case 'history':
        addOutput(
          <div>
            {commandHistory.map((c, i) => (
               <div key={i} className="text-sm opacity-80">{i + 1}  {c}</div>
            ))}
          </div>
        );
        break;

      case 'weather':
        addOutput(
          <div>
             <p>Mumbai, IN: 32°C ☀️ (Simulated)</p>
             <p className="text-xs opacity-60">Feels like: Productive</p>
          </div>
        );
        break;

      case 'cat':
        const fileName = args[1];
        if (!fileName) {
          addOutput(<p className="text-red-400">Usage: cat [filename]</p>);
        } else if (VIRTUAL_FILES[fileName]) {
          addOutput(<pre className="whitespace-pre-wrap font-sans text-sm text-gray-300">{VIRTUAL_FILES[fileName]}</pre>);
        } else {
          addOutput(<p className="text-red-400">cat: {fileName}: No such file or directory</p>);
        }
        break;
      
      case 'theme':
        const newTheme = args[1] as ThemeName;
        if (THEMES[newTheme]) {
          setTheme(newTheme);
          addOutput(<p className="text-yellow-300">>> Theme changed to {newTheme}.</p>);
        } else {
          addOutput(
            <p className="text-red-400">
              Theme not found. Available: {Object.keys(THEMES).join(', ')}
            </p>
          );
        }
        break;
      
      case 'matrix':
        setMatrixEnabled(prev => !prev);
        addOutput(<p className="text-green-400">>> Matrix mode {matrixEnabled ? 'DEACTIVATED' : 'ACTIVATED'}.</p>);
        break;

      case 'sudo':
        const sudoCmd = args.slice(1).join(' ');
        if (!sudoCmd) {
          addOutput(<p>usage: sudo [command]</p>);
          return;
        }
        if (sudoCmd.includes('rm -rf /')) {
          setLoading(true);
          addOutput(<p className="text-red-500 font-bold animate-pulse">>> SYSTEM DELETION INITIATED...</p>);
          await new Promise(r => setTimeout(r, 1500));
          addOutput(<p className="text-red-500">Deleting /bin...</p>);
          await new Promise(r => setTimeout(r, 800));
          addOutput(<p className="text-red-500">Deleting /usr...</p>);
          await new Promise(r => setTimeout(r, 800));
          addOutput(<p className="text-red-500">Deleting /home/guest...</p>);
          await new Promise(r => setTimeout(r, 1000));
          addOutput(<p className="text-red-600 font-bold text-xl bg-black">KERNEL PANIC: INIT KILLED.</p>);
          await new Promise(r => setTimeout(r, 2000));
          setHistory([]); // "Reboot"
          setLoading(false);
          addOutput(<p className="text-green-500">>> System recovered. Don't do that again.</p>);
        } else {
           addOutput(<p className="text-yellow-400">guest is not in the sudoers file. This incident will be reported.</p>);
        }
        break;

      case 'sl':
        // Steam Locomotive Easter Egg
        setLoading(true);
        addOutput(
           <div className="whitespace-pre font-bold text-white overflow-hidden w-full">
             <div className="animate-[slide_5s_linear_infinite] inline-block whitespace-pre">
               {`
      (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O
     (@@@)
    (    )
   (@@@@)
 
 (   )
 
 
    _________________________________________________
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |    |    |    |    |    |    |    |    |    |    |
   |____|____|____|____|____|____|____|____|____|____|
               `}
             </div>
             <style>{`
               @keyframes slide {
                 0% { transform: translateX(100%); }
                 100% { transform: translateX(-100%); }
               }
             `}</style>
           </div>, 'component'
        );
        setTimeout(() => setLoading(false), 5000);
        break;

      case 'startx':
      case 'gui':
        setLoading(true);
        addOutput(<p className="text-green-400">>> Starting X11 Server...</p>);
        await new Promise(r => setTimeout(r, 1000));
        addOutput(<p className="text-green-400">>> Loading Desktop Environment (Arch)...</p>);
        await new Promise(r => setTimeout(r, 800));
        setViewMode(ViewMode.GUI);
        setLoading(false);
        break;

      case 'vim':
      case 'vi':
      case 'nvin':
        setMode(TerminalMode.VIM);
        setVimMessage('"swp file found" [New File]');
        break;

      case 'clear':
        setHistory([
          {
            id: 'header',
            type: 'output',
            content: <pre className={`${currentTheme.text} font-bold leading-none text-xs md:text-base mb-4`}>{ASCII_HEADER}</pre>
          },
          {
            id: 'welcome',
            type: 'output',
            content: (
              <div className="mb-4">
                <p>Welcome to Yashank Kothari's interactive portfolio! (Version 1.7.0)</p>
                <p className="mt-2">Type <span className="text-yellow-300">'help'</span> to see the list of available commands.</p>
              </div>
            )
          }
        ]);
        break;

      case 'chat':
        setMode(TerminalMode.CHAT);
        addOutput(<p className="text-blue-400">>> Initializing Neural Link with Gemini 3.0 Pro Preview... Connected.</p>);
        addOutput(<p className="opacity-60">Type 'exit' to return to standard terminal.</p>);
        break;

      case 'edit_image':
        setMode(TerminalMode.IMAGE_EDIT);
        addOutput(<p className="text-purple-400">>> Booting Nano Banana (Gemini 2.5 Flash Image) Module...</p>);
        addOutput(
          <ImageEditor onClose={() => {
            setMode(TerminalMode.STANDARD);
            addOutput(<p className="opacity-60">>> Module Closed.</p>);
          }} />,
          'component'
        );
        break;

      case '':
        break;

      default:
        // Typo Correction Logic
        const availableCommands = [
           'help', 'about', 'experience', 'projects', 'skills', 'contact', 
           'neofetch', 'cat', 'chat', 'edit_image', 'startx', 'gui', 'theme', 'matrix', 
           'sudo', 'sl', 'vim', 'calc', 'google', 'youtube', 'wiki', 'snake', 'minesweeper',
           'who', 'w', 's', 'pj', 'g', 'b', 'misc', 'cv', 'monitor', 'ttt'
        ];
        const correction = findBestMatch(mainCmd, availableCommands);
        
        if (correction) {
             addOutput(
                <p className="text-red-400">
                    Command not found: {cmd}. Did you mean <span className="text-yellow-400 font-bold cursor-pointer border-b border-dashed" onClick={() => handleStandardCommand(correction)}>{correction}</span>?
                </p>
             );
        } else {
             addOutput(<p className="text-red-400">Command not found: {cmd}. Type 'help' for options.</p>);
        }
    }
  };

  // Handler for Chat Mode
  const handleChatMode = async (msg: string) => {
    const trimmed = msg.trim();
    if (trimmed.toLowerCase() === 'exit') {
      setMode(TerminalMode.STANDARD);
      addOutput(<p className="opacity-60">>> Disconnected from AI.</p>);
      return;
    }
    
    setLoading(true);
    try {
      const response = await chatWithGemini(trimmed);
      addOutput(<p className="text-blue-200 whitespace-pre-wrap">{response}</p>);
    } catch (err) {
      addOutput(<p className="text-red-400">Error communicating with AI.</p>);
    } finally {
      setLoading(false);
    }
  };

  // Handler for Vim Trap
  const handleVimMode = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // This is handled by the textarea directly in the render
  };

  const handleSubmit = () => {
    if (!input.trim() && mode !== TerminalMode.STANDARD) return;

    addInputLine(input, mode);
    
    if (mode === TerminalMode.STANDARD) {
      handleStandardCommand(input);
    } else if (mode === TerminalMode.CHAT) {
      handleChatMode(input);
    } else if (mode === TerminalMode.IMAGE_EDIT) {
      if (input.trim() === 'exit') {
         setMode(TerminalMode.STANDARD);
         addOutput(<p>>> Exited Image Editor.</p>);
      }
    }

    setInput('');
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------

  if (viewMode === ViewMode.GUI) {
    return <DesktopEnvironment 
      onExit={() => setViewMode(ViewMode.TERMINAL)}
      terminalProps={{
        history,
        input,
        setInput,
        onSubmit: handleSubmit,
        mode,
        loading,
        commandHistory,
        currentTheme
      }}
    />;
  }
  
  if (mode === TerminalMode.GAME) {
      return <SnakeGame onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-yellow-300">>> Game Over / Quit</p>);
      }} />;
  }

  if (mode === TerminalMode.MINESWEEPER) {
      return <Minesweeper onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-yellow-300">>> Minesweeper Closed.</p>);
      }} />;
  }

  if (mode === TerminalMode.TICTACTOE) {
      return <TicTacToe onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-yellow-300">>> Tic-Tac-Toe Closed.</p>);
      }} />;
  }

  if (mode === TerminalMode.MONITOR) {
      return <SystemMonitor onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-green-300">>> Monitor Stopped.</p>);
      }} />;
  }

  // Vim Mode Render
  if (mode === TerminalMode.VIM) {
    return (
      <div className="bg-black text-gray-300 font-mono h-screen flex flex-col p-1">
        <div className="flex-1 w-full relative">
            {/* Tildes */}
            <div className="absolute top-0 left-0 text-blue-700 select-none">
                {Array(30).fill('~').map((_, i) => <div key={i}>~</div>)}
            </div>
            <textarea 
                className="w-full h-full bg-transparent text-gray-300 border-none outline-none resize-none pl-4 z-10 relative"
                autoFocus
                value={vimContent}
                onChange={(e) => {
                    setVimContent(e.target.value);
                    // Check for exit command in content (simple trap)
                    const lines = e.target.value.split('\n');
                    const lastLine = lines[lines.length - 1];
                    
                    if (lastLine.trim() === ':q!' || lastLine.trim() === ':wq') {
                        setMode(TerminalMode.STANDARD);
                        setVimContent('');
                        addOutput(<p className="text-gray-500">>> Vim closed.</p>);
                    } else if (lastLine.startsWith(':')) {
                        setVimMessage(lastLine);
                    } else {
                        setVimMessage('-- INSERT --');
                    }
                }}
                onKeyDown={(e) => {
                    // Trap Ctrl+C
                    if (e.ctrlKey && e.key === 'c') {
                        e.preventDefault();
                        setVimMessage('Type :q<Enter> to exit vim');
                    }
                }}
            />
        </div>
        <div className="bg-gray-800 text-white text-xs p-1 flex justify-between">
            <span>{vimMessage || '[No Name]'}</span>
            <span>0,0-1 All</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme.background} ${currentTheme.text} font-mono p-2 md:p-4 lg:p-8 relative overflow-hidden transition-colors duration-300`}>
       {/* Matrix Effect */}
       {matrixEnabled && <MatrixRain />}
       
       {/* Scanline Effect */}
       <div className="scanline"></div>

      {/* Main Container */}
      <div className={`max-w-5xl mx-auto border border-slate-700 rounded-lg bg-slate-950/90 shadow-2xl h-[90vh] flex flex-col relative z-20 backdrop-blur-sm`}>
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 rounded-t-lg">
          <div className="flex items-center space-x-2">
             <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 cursor-pointer" onClick={() => setHistory([])}></div>
             <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 cursor-pointer" onClick={() => setMatrixEnabled(!matrixEnabled)}></div>
             <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 cursor-pointer" onClick={() => setTheme('standard')}></div>
          </div>
          <div className="text-slate-400 text-xs md:text-sm font-bold tracking-widest">
             yashank@portfolio:~/{mode === TerminalMode.STANDARD ? '' : mode.toLowerCase()}
          </div>
          <div className="w-10"></div>
        </div>

        {/* Terminal Body */}
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-2 text-sm md:text-base"
            onClick={() => document.querySelector('input')?.focus()}
        >
            {history.map((line) => {
                if (line.type === 'input') {
                    return (
                        <div key={line.id} className="flex items-start">
                             <span className={`mr-2 font-bold whitespace-nowrap ${
                                 line.promptLabel?.includes('ai') ? 'text-blue-400' : 
                                 line.promptLabel?.includes('nano') ? 'text-purple-400' : 
                                 currentTheme.prompt
                             }`}>
                                {line.promptLabel}
                             </span>
                             <span className="opacity-90">{line.content}</span>
                        </div>
                    );
                } else if (line.type === 'component') {
                    return <div key={line.id} className="w-full">{line.content}</div>;
                } else {
                    return <div key={line.id} className="break-words opacity-90">{line.content}</div>;
                }
            })}
            
            {loading && (
                 <div className="flex items-center opacity-60 animate-pulse">
                    <span className="mr-2">...</span>
                    <span>Processing</span>
                 </div>
            )}

            {/* Active Input Line */}
            <TerminalInput 
                value={input} 
                onChange={setInput} 
                onSubmit={handleSubmit} 
                mode={mode}
                loading={loading}
                history={commandHistory}
                promptColor={currentTheme.prompt}
            />
        </div>
      </div>
    </div>
  );
};

export default App;
