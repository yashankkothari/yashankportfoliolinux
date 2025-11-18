
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

  const runCommand = (cmd: string) => {
    addInputLine(cmd, mode);
    handleStandardCommand(cmd);
  };

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
                <p className="text-yellow-300 font-bold text-lg mb-2">Portfolio Sections:</p>
                <div className="grid grid-cols-1 gap-1 pl-2">
                    <div>
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('who')}>[who]</span> or 
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline ml-1" onClick={() => runCommand('w')}>[w]</span> - About Me
                    </div>
                    <div>
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('skills')}>[skills]</span> or 
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline ml-1" onClick={() => runCommand('s')}>[s]</span> - Technical Skills
                    </div>
                    <div>
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('projects')}>[projects]</span> or 
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline ml-1" onClick={() => runCommand('pj')}>[pj]</span> - Key Projects
                    </div>
                    <div>
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('resume')}>[resume]</span> or 
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline ml-1" onClick={() => runCommand('cv')}>[cv]</span> - View Resume
                    </div>
                    <div>
                        <span className="text-cyan-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('contact')}>[contact]</span> - Email & Socials
                    </div>
                </div>
            </div>

            <div>
                <p className="text-yellow-300 font-bold text-lg mb-2 mt-4">System & Tools:</p>
                <div className="grid grid-cols-2 gap-1 pl-2">
                    <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('neofetch')}>[neofetch]</span> info</div>
                    <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('monitor')}>[monitor]</span> htop</div>
                    <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('games')}>[games]</span> play</div>
                    <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('startx')}>[startx]</span> gui</div>
                    <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('matrix')}>[matrix]</span> rain</div>
                    <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('chat')}>[chat]</span> ai</div>
                </div>
            </div>

            <div>
                <p className="text-yellow-300 font-bold text-lg mb-2 mt-4">Linux Basics:</p>
                 <div className="grid grid-cols-2 gap-1 pl-2 max-w-md">
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('ls')}>[ls]</span> list</div>
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('pwd')}>[pwd]</span> path</div>
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('date')}>[date]</span> time</div>
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('echo Hello')}>[echo]</span> print</div>
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('ping')}>[ping]</span> net</div>
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('cowsay Hi')}>[cowsay]</span> moo</div>
                    <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('fortune')}>[fortune]</span> quote</div>
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
              <p className="text-green-400 mb-2">&gt;&gt; Generating Resume Summary...</p>
              <div className="bg-slate-900 p-4 border border-gray-700 text-sm rounded">
                 <h1 className="text-xl font-bold text-white">{RESUME.name}</h1>
                 <p className="text-gray-400">{RESUME.contact.email}</p>
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
             <p className="ml-4 text-cyan-400">
                <span className="cursor-pointer hover:underline" onClick={() => runCommand('email')}>[email]</span>&nbsp;
                <span className="cursor-pointer hover:underline" onClick={() => runCommand('linkedin')}>[linkedin]</span>&nbsp;
                <span className="cursor-pointer hover:underline" onClick={() => runCommand('twitter')}>[twitter]</span>&nbsp;
                <span className="cursor-pointer hover:underline" onClick={() => runCommand('github')}>[github]</span>
             </p>
          </div>
        );
        break;
      
      case 'email':
        addOutput(<p>&gt;&gt; Opening mail client...</p>);
        window.location.href = `mailto:${RESUME.contact.email}`;
        break;
      
      case 'linkedin':
        addOutput(<p>&gt;&gt; Opening LinkedIn profile...</p>);
        window.open(`https://${RESUME.contact.linkedin}`, '_blank');
        break;

      case 'github':
      case 'gh':
        addOutput(<p>&gt;&gt; Opening GitHub profile...</p>);
        window.open(`https://${RESUME.contact.github}`, '_blank');
        break;

      case 'twitter':
        addOutput(<p>&gt;&gt; Opening Twitter...</p>);
        window.open(`https://${RESUME.contact.twitter}`, '_blank');
        break;
      
      case 'blog':
      case 'b':
        addOutput(<p className="text-yellow-300">&gt;&gt; Blog is currently under construction. Check back later!</p>);
        break;

      case 'misc':
      case 'miscellaneous':
        addOutput(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-xl">
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('neofetch')}>neofetch</span> - System Info</div>
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('matrix')}>matrix</span> - Toggle Matrix Rain</div>
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('monitor')}>monitor</span> - System Monitor</div>
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('weather')}>weather</span> - Current Weather</div>
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('startx')}>startx</span> - Launch GUI</div>
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('theme retro')}>theme</span> - Change colors</div>
             <div><span className="text-pink-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('calc 2+2')}>calc</span> - Calculator</div>
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
                  <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('snake')}>[snake]</span> - Classic Snake</div>
                  <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('minesweeper')}>[minesweeper]</span> - Find Mines</div>
                  <div><span className="text-green-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('ttt')}>[ttt]</span> - Tic-Tac-Toe</div>
               </div>
            </div>
         );
         break;

      // --- Linux Utilities ---
      
      case 'ls':
      case 'll':
        addOutput(
          <div className="grid grid-cols-3 gap-4 max-w-md text-sm">
            <span className="text-blue-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('projects')}>projects/</span>
            <span className="text-blue-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('experience')}>experience/</span>
            <span className="text-blue-400 font-bold cursor-pointer hover:underline" onClick={() => runCommand('skills')}>skills/</span>
            {Object.keys(VIRTUAL_FILES).map(f => (
              <span key={f} className="text-white">{f}</span>
            ))}
          </div>
        );
        break;

      case 'pwd':
        addOutput(<p>/home/guest</p>);
        break;
        
      case 'date':
        addOutput(<p>{new Date().toString()}</p>);
        break;

      case 'echo':
        addOutput(<p>{args.slice(1).join(' ')}</p>);
        break;

      case 'cowsay':
        const sayText = args.slice(1).join(' ') || "Moo! I'm a cow.";
        const len = sayText.length;
        const line = '-'.repeat(len + 2);
        const cow = `
 ${'_'.repeat(len + 2)}
< ${sayText} >
 ${line}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
        `;
        addOutput(<pre className="whitespace-pre text-yellow-300">{cow}</pre>);
        break;

      case 'fortune':
        const quotes = [
            "There is no place like 127.0.0.1",
            "It works on my machine.",
            "sudo make me a sandwich.",
            "To understand recursion you must first understand recursion.",
            "Linux is only free if your time has no value.",
            "Have you tried turning it off and on again?",
            "The cloud is just someone else's computer."
        ];
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        addOutput(<p className="text-purple-300 italic">"{randomQuote}"</p>);
        break;

      case 'ping':
        const host = args[1] || 'google.com';
        setLoading(true);
        addOutput(<p>PING {host} (127.0.0.1): 56 data bytes</p>);
        
        // Simulate async ping
        for (let i = 0; i < 4; i++) {
             await new Promise(r => setTimeout(r, 800));
             const time = (Math.random() * 50).toFixed(2);
             addOutput(<p>64 bytes from 127.0.0.1: icmp_seq={i} ttl=64 time={time} ms</p>);
        }
        await new Promise(r => setTimeout(r, 800));
        addOutput(
            <div>
                <p>--- {host} ping statistics ---</p>
                <p>4 packets transmitted, 4 packets received, 0.0% packet loss</p>
            </div>
        );
        setLoading(false);
        break;
      
      case 'reboot':
        setLoading(true);
        addOutput(<p className="text-red-400">System rebooting...</p>);
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        break;

      case 'man':
        const manCmd = args[1];
        if (!manCmd) {
            addOutput(<p>What manual page do you want?</p>);
        } else {
            const descriptions: Record<string, string> = {
                ls: 'List directory contents.',
                cat: 'Concatenate files and print on the standard output.',
                cowsay: 'Configurable speaking cow.',
                neofetch: 'A command-line system information tool.',
                sudo: 'Execute a command as another user.',
                ping: 'Send ICMP ECHO_REQUEST to network hosts.',
                who: 'Show who is logged on (about me).',
                grep: 'Print lines that match patterns.'
            };
            
            if (descriptions[manCmd]) {
                addOutput(
                    <div className="bg-gray-800 p-2 border border-gray-600 max-w-md">
                        <p className="font-bold uppercase">{manCmd}(1)</p>
                        <p className="mt-2 font-bold text-yellow-400">NAME</p>
                        <p className="pl-4">{manCmd} - {descriptions[manCmd]}</p>
                    </div>
                );
            } else {
                 addOutput(<p>No manual entry for {manCmd}</p>);
            }
        }
        break;

      // --- External/Misc ---
      case 'google':
        const googleQuery = args.slice(1).join(' ');
        if (!googleQuery) { addOutput(<p>Usage: google [query]</p>); break; }
        window.open(`https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`, '_blank');
        addOutput(<p>&gt;&gt; Opening Google Search for: {googleQuery}</p>);
        break;

      case 'youtube':
      case 'yt':
        const ytQuery = args.slice(1).join(' ');
        if (!ytQuery) { addOutput(<p>Usage: youtube [query]</p>); break; }
        window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(ytQuery)}`, '_blank');
        addOutput(<p>&gt;&gt; Opening YouTube Search for: {ytQuery}</p>);
        break;

      case 'wiki':
        const wikiQuery = args.slice(1).join(' ');
        if (!wikiQuery) { addOutput(<p>Usage: wiki [query]</p>); break; }
        window.open(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(wikiQuery)}`, '_blank');
        addOutput(<p>&gt;&gt; Opening Wikipedia for: {wikiQuery}</p>);
        break;

      case 'calc':
        const expr = args.slice(1).join(' ');
        if (!expr) { addOutput(<p>Usage: calc [expression] (e.g. calc 2 + 2 * 4)</p>); break; }
        try {
            // Safe-ish evaluation for simple math
            // eslint-disable-next-line no-new-func
            const result = new Function('return ' + expr.replace(/[^0-9+\-*/().Math\s]/g, ''))();
            addOutput(<p className="text-green-400">&gt;&gt; {result}</p>);
        } catch (e) {
            addOutput(<p className="text-red-400">Error: Invalid expression</p>);
        }
        break;

      case 'snake':
        setMode(TerminalMode.GAME);
        addOutput(<p className="text-green-400">&gt;&gt; Launching Snake.exe...</p>);
        break;

      case 'minesweeper':
      case 'mine':
        setMode(TerminalMode.MINESWEEPER);
        addOutput(<p className="text-yellow-400">&gt;&gt; Launching Minesweeper...</p>);
        break;

      case 'tictactoe':
      case 'ttt':
        setMode(TerminalMode.TICTACTOE);
        addOutput(<p className="text-blue-400">&gt;&gt; Launching Tic-Tac-Toe...</p>);
        break;

      case 'monitor':
      case 'htop':
      case 'top':
        setMode(TerminalMode.MONITOR);
        addOutput(<p className="text-green-400">&gt;&gt; Initializing System Monitor...</p>);
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
          addOutput(<p className="text-yellow-300">&gt;&gt; Theme changed to {newTheme}.</p>);
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
        addOutput(<p className="text-green-400">&gt;&gt; Matrix mode {matrixEnabled ? 'DEACTIVATED' : 'ACTIVATED'}.</p>);
        break;

      case 'sudo':
        const sudoCmd = args.slice(1).join(' ');
        if (!sudoCmd) {
          addOutput(<p>usage: sudo [command]</p>);
          return;
        }
        if (sudoCmd.includes('rm -rf /')) {
          setLoading(true);
          addOutput(<p className="text-red-500 font-bold animate-pulse">&gt;&gt; SYSTEM DELETION INITIATED...</p>);
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
          addOutput(<p className="text-green-500">&gt;&gt; System recovered. Don't do that again.</p>);
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
        addOutput(<p className="text-green-400">&gt;&gt; Starting X11 Server...</p>);
        await new Promise(r => setTimeout(r, 1000));
        addOutput(<p className="text-green-400">&gt;&gt; Loading Desktop Environment (Arch)...</p>);
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
        addOutput(<p className="text-blue-400">&gt;&gt; Initializing Neural Link with Gemini 3.0 Pro Preview... Connected.</p>);
        addOutput(<p className="opacity-60">Type 'exit' to return to standard terminal.</p>);
        break;

      case 'edit_image':
        setMode(TerminalMode.IMAGE_EDIT);
        addOutput(<p className="text-purple-400">&gt;&gt; Booting Nano Banana (Gemini 2.5 Flash Image) Module...</p>);
        addOutput(
          <ImageEditor onClose={() => {
            setMode(TerminalMode.STANDARD);
            addOutput(<p className="opacity-60">&gt;&gt; Module Closed.</p>);
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
           'who', 'w', 's', 'pj', 'g', 'b', 'misc', 'cv', 'monitor', 'ttt',
           'ls', 'pwd', 'date', 'echo', 'cowsay', 'fortune', 'ping', 'man', 'reboot'
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
      addOutput(<p className="opacity-60">&gt;&gt; Disconnected from AI.</p>);
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
         addOutput(<p>&gt;&gt; Exited Image Editor.</p>);
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
          addOutput(<p className="text-yellow-300">&gt;&gt; Game Over / Quit</p>);
      }} />;
  }

  if (mode === TerminalMode.MINESWEEPER) {
      return <Minesweeper onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-yellow-300">&gt;&gt; Minesweeper Closed.</p>);
      }} />;
  }

  if (mode === TerminalMode.TICTACTOE) {
      return <TicTacToe onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-yellow-300">&gt;&gt; Tic-Tac-Toe Closed.</p>);
      }} />;
  }

  if (mode === TerminalMode.MONITOR) {
      return <SystemMonitor onExit={() => {
          setMode(TerminalMode.STANDARD);
          addOutput(<p className="text-green-300">&gt;&gt; Monitor Stopped.</p>);
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
                        addOutput(<p className="text-gray-500">&gt;&gt; Vim closed.</p>);
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
