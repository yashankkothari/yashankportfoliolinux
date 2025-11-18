import React, { useState, useEffect, useRef } from 'react';
import { TerminalMode, TerminalLine, ThemeName, ViewMode } from './types';
import { RESUME, ASCII_HEADER, NEOFETCH_ART, VIRTUAL_FILES, THEMES } from './constants';
import TerminalInput from './components/TerminalInput';
import ImageEditor from './components/ImageEditor';
import MatrixRain from './components/MatrixRain';
import DesktopEnvironment from './components/DesktopEnvironment';
import { chatWithGemini } from './services/geminiService';

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
            <p>Welcome to Yashank Kothari's interactive portfolio.</p>
            <p className="mt-2 opacity-80">Type <span className="text-yellow-300">help</span> to see available commands.</p>
            <p className="opacity-80">Try <span className="text-blue-400">chat</span> to talk to AI or <span className="text-purple-400">edit_image</span> for AI tools.</p>
            <p className="opacity-60 text-xs mt-2">Pro Tip: Use Up/Down arrows for history. Try 'neofetch' or 'startx'.</p>
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
      case 'ls': // 'ls' in root acts like help but maybe lists fake files too
        addOutput(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-2xl">
            {[
              { cmd: 'about', desc: 'Who am I?' },
              { cmd: 'experience', desc: 'Work history' },
              { cmd: 'projects', desc: 'Github highlights' },
              { cmd: 'skills', desc: 'Tech stack' },
              { cmd: 'education', desc: 'Academic background' },
              { cmd: 'contact', desc: 'Get in touch' },
              { cmd: 'neofetch', desc: 'System Info' },
              { cmd: 'cat [file]', desc: 'Read file' },
              { cmd: 'chat', desc: 'AI Assistant (Gemini 3 Pro)' },
              { cmd: 'edit_image', desc: 'Nano Banana Image Editor' },
              { cmd: 'startx / gui', desc: 'Launch Desktop GUI (Arch Mode)' },
              { cmd: 'theme [name]', desc: 'Change UI (retro, ubuntu, dracula)' },
              { cmd: 'matrix', desc: 'Toggle Matrix mode' },
              { cmd: 'sudo [cmd]', desc: 'Run as root' },
              { cmd: 'clear', desc: 'Clear terminal' },
            ].map(c => (
              <div key={c.cmd} className="flex justify-between border-b border-gray-800 py-1">
                <span className="text-yellow-300 font-bold">{c.cmd}</span>
                <span className="opacity-70">{c.desc}</span>
              </div>
            ))}
            {mainCmd === 'ls' && (
               <div className="mt-2 pt-2 border-t border-gray-700">
                  <p className="text-blue-300 font-bold">Files:</p>
                  <div className="flex gap-4 text-sm">
                     {Object.keys(VIRTUAL_FILES).map(f => <span key={f} className="text-gray-300">{f}</span>)}
                  </div>
               </div>
            )}
          </div>
        );
        break;
      
      case 'about':
        addOutput(
          <div>
            <p className="text-xl font-bold mb-2">{RESUME.name}</p>
            <p className="mb-2">Bachelor of Technology Computer Engineering student with Honours in Data Science.</p>
            <p>Passionate about AI, Machine Learning, and Full Stack Development.</p>
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
        addOutput(
          <div className="space-y-2">
            {Object.entries(RESUME.skills).map(([cat, val]) => (
              <div key={cat}>
                <span className="uppercase font-bold text-purple-400 w-32 inline-block">{cat}:</span>
                <span className="opacity-80">{val}</span>
              </div>
            ))}
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

      case 'contact':
        addOutput(
          <div className="space-y-1">
             <p>Email: <a href={`mailto:${RESUME.contact.email}`} className="text-blue-400 hover:underline">{RESUME.contact.email}</a></p>
             <p>Phone: {RESUME.contact.phone}</p>
             <p>LinkedIn: <a href={`https://${RESUME.contact.linkedin}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{RESUME.contact.linkedin}</a></p>
             <p>GitHub: <a href={`https://${RESUME.contact.github}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{RESUME.contact.github}</a></p>
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
              Theme not found. Available: standard, retro, ubuntu, dracula
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
                <p>Welcome to Yashank Kothari's interactive portfolio.</p>
                <p className="mt-2 opacity-80">Type <span className="text-yellow-300">help</span> to see available commands.</p>
                <p className="opacity-80">Try <span className="text-blue-400">chat</span> to talk to AI or <span className="text-purple-400">edit_image</span> for AI tools.</p>
                <p className="opacity-60 text-xs mt-2">Pro Tip: Use Up/Down arrows for history. Try 'neofetch' or 'startx'.</p>
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
        addOutput(<p className="text-red-400">Command not found: {cmd}. Type 'help' for options.</p>);
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
      // Image edit text commands usually ignored if UI is up, but we support exit
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