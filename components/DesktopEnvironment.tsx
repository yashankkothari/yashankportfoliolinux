import React, { useState, useEffect, useRef } from 'react';
import { RESUME } from '../constants';
import TerminalInput from './TerminalInput';
import { TerminalMode, TerminalLine, ThemeColors } from '../types';

// --- Icons ---
const Icons = {
  Folder: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#89b4fa" className="w-full h-full drop-shadow-lg">
      <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
    </svg>
  ),
  FileText: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a6e3a1" className="w-full h-full drop-shadow-lg">
      <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
      <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
    </svg>
  ),
  Terminal: () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#313244" className="w-full h-full drop-shadow-lg">
        <rect x="2" y="4" width="20" height="16" rx="2" fill="#1e1e2e" stroke="#45475a" strokeWidth="2"/>
        <path d="M6 8l4 4-4 4" stroke="#89b4fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="16" x2="18" y2="16" stroke="#a6e3a1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Arch: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400 w-full h-full drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
      <path d="M11.266 1.733a1.733 1.733 0 0 1 2.955.71L22.92 21.21a.866.866 0 0 1-1.63.542l-1.914-5.74H5.99L3.39 21.553a.867.867 0 0 1-1.653-.507L11.266 1.733Zm9.29 13.15L12.762 3.022h-.024L7.013 14.883h13.543Z"/>
    </svg>
  ),
  Power: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
    </svg>
  ),
  Search: () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white/70">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  ),
  Chrome: () => (
    <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs border-2 border-white shadow-lg">
        WEB
    </div>
  )
};

// --- Components ---

interface DraggableWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  initialPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  zIndex: number;
  onFocus: () => void;
  isTerminal?: boolean;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({ 
  title, 
  isOpen, 
  onClose, 
  children, 
  initialPosition = { x: 100, y: 100 },
  width = "w-[600px]",
  height = "h-[400px]",
  zIndex,
  onFocus,
  isTerminal = false
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current && !isMaximized) {
      setIsDragging(true);
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      onFocus();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  const baseClasses = "absolute flex flex-col rounded-xl overflow-hidden shadow-2xl transition-all duration-200 ease-out border border-white/10 backdrop-blur-2xl bg-slate-900/60 ring-1 ring-white/5";
  const sizeClasses = isMaximized ? "inset-0 w-full h-full rounded-none !top-0 !left-0" : `${width} ${height}`;

  return (
    <div 
      ref={windowRef}
      className={`${baseClasses} ${sizeClasses} animate-in fade-in zoom-in-95 duration-300`}
      style={!isMaximized ? { left: position.x, top: position.y, zIndex } : { zIndex }}
      onMouseDown={onFocus}
    >
      {/* Window Header */}
      <div 
        className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 justify-between select-none backdrop-blur-3xl"
        onMouseDown={handleMouseDown}
        onDoubleClick={() => setIsMaximized(!isMaximized)}
      >
        {/* Traffic Lights */}
        <div className="flex gap-2 group">
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:bg-[#ff5f56]/80 flex items-center justify-center text-[8px] text-black/0 hover:text-black/60 font-bold transition-colors">×</button>
          <button onClick={(e) => { e.stopPropagation(); /* Minimize logic could go here */ }} className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123] hover:bg-[#ffbd2e]/80 flex items-center justify-center text-[8px] text-black/0 hover:text-black/60 font-bold transition-colors">−</button>
          <button onClick={(e) => { e.stopPropagation(); setIsMaximized(!isMaximized); }} className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29] hover:bg-[#27c93f]/80 flex items-center justify-center text-[8px] text-black/0 hover:text-black/60 font-bold transition-colors">+</button>
        </div>
        
        <span className="text-xs font-medium text-white/50 tracking-wide">{title}</span>
        <div className="w-14"></div> {/* Spacer for centering */}
      </div>

      {/* Window Content */}
      <div className={`flex-1 overflow-y-auto relative ${isTerminal ? 'bg-[#0e1016]/90' : 'bg-slate-900/40'}`}>
        {children}
      </div>
    </div>
  );
};

const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [lines, setLines] = useState<string[]>([]);
    
    useEffect(() => {
        const bootLines = [
            "Arch Linux Boot Loader v2025.02.24",
            "Loading Linux linux-lts ...",
            "Loading initial ramdisk ...",
            "[    0.000000] Linux version 6.8.9-arch1-1 (linux@archlinux) (gcc (GCC) 13.2.1 20230801, GNU ld (GNU Binutils) 2.42.0) #1 SMP PREEMPT_DYNAMIC Thu, 02 May 2025 17:49:46 +0000",
            "[    0.234120] ACPI: Added _OSI(Linux-Dell-Video)",
            "[    0.451230] pci 0000:00:02.0: vgaarb: setting as boot VGA device",
            "[    0.892310] nvme 0000:04:00.0: platform quirk: setting simple suspend",
            "[    1.231231] systemd[1]: Detected architecture x86-64.",
            "Welcome to Arch Linux!",
            "[  OK  ] Started Show Plymouth Boot Screen.",
            "[  OK  ] Reached target Paths.",
            "[  OK  ] Reached target Basic System.",
            "Starting Display Manager...",
            "[  OK  ] Started Display Manager."
        ];

        let delay = 0;
        bootLines.forEach((line, index) => {
            delay += Math.random() * 300;
            setTimeout(() => {
                setLines(prev => [...prev, line]);
                if (index === bootLines.length - 1) {
                    setTimeout(onComplete, 800);
                }
            }, delay);
        });
    }, [onComplete]);

    return (
        <div className="fixed inset-0 bg-black z-[100] p-8 font-mono text-sm text-gray-400 overflow-hidden cursor-none select-none">
            {lines.map((line, i) => (
                <div key={i} className="mb-0.5">
                    {line.includes('[  OK  ]') ? (
                        <span>
                            [  <span className="text-green-500">OK</span>  ] {line.replace('[  OK  ] ', '')}
                        </span>
                    ) : (
                        line
                    )}
                </div>
            ))}
            <div className="animate-pulse mt-2">_</div>
        </div>
    );
};

const Spotlight: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onLaunch: (app: string) => void 
}> = ({ isOpen, onClose, onLaunch }) => {
    const [query, setQuery] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
            setQuery("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Enter' && query) {
            // Simple logic to launch matching app
            const q = query.toLowerCase();
            if (q.includes('term')) onLaunch('terminal');
            else if (q.includes('res')) onLaunch('resume');
            else if (q.includes('proj')) onLaunch('projects');
            else if (q.includes('about')) onLaunch('about');
            else if (q.includes('cont')) onLaunch('contact');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center" onClick={onClose}>
            <div 
                className="w-[600px] bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-4 border-b border-white/5 gap-3">
                    <Icons.Search />
                    <input 
                        ref={inputRef}
                        type="text" 
                        className="flex-1 bg-transparent outline-none text-xl text-white placeholder-white/30 font-light"
                        placeholder="Spotlight Search"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <span className="text-xs text-white/30 bg-white/10 px-2 py-1 rounded">ESC to close</span>
                </div>
                {query && (
                    <div className="px-2 py-2">
                        <div className="text-xs uppercase text-white/30 font-bold px-2 py-1 mb-1">Top Hit</div>
                        <div className="flex items-center gap-3 px-2 py-2 hover:bg-blue-500/20 rounded cursor-pointer transition-colors" onClick={() => { /* Mock launch */ }}>
                            <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                <span className="text-white text-xs font-bold">APP</span>
                            </div>
                            <div className="text-white">
                                <p className="text-sm font-medium">Run "{query}"</p>
                                <p className="text-xs text-white/50">Application</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

interface DesktopEnvironmentProps {
  onExit: () => void;
  terminalProps: {
    history: TerminalLine[];
    input: string;
    setInput: (v: string) => void;
    onSubmit: () => void;
    mode: TerminalMode;
    loading: boolean;
    commandHistory: string[];
    currentTheme: ThemeColors;
  };
}

const DesktopEnvironment: React.FC<DesktopEnvironmentProps> = ({ onExit, terminalProps }) => {
  const [isBooting, setIsBooting] = useState(true);
  const [time, setTime] = useState(new Date());
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    about: false,
    projects: false,
    resume: true,
    contact: false,
    terminal: false,
  });
  const [windowOrder, setWindowOrder] = useState<string[]>(['resume', 'terminal']);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Global Key listener for Spotlight
    const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.code === 'Space') {
            e.preventDefault();
            setSpotlightOpen(prev => !prev);
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
        clearInterval(timer);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const bringToFront = (key: string) => {
    setWindowOrder(prev => {
      const filtered = prev.filter(k => k !== key);
      return [...filtered, key];
    });
  };

  const toggleWindow = (key: string) => {
    setOpenWindows(prev => {
        const newState = !prev[key];
        if (newState) bringToFront(key);
        return { ...prev, [key]: newState };
    });
  };

  const getZIndex = (key: string) => 10 + windowOrder.indexOf(key);

  // Terminal scroll fix
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (openWindows.terminal && terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalProps.history, openWindows.terminal]);

  if (isBooting) {
      return <BootSequence onComplete={() => setIsBooting(false)} />;
  }

  return (
    <div className="h-screen w-screen overflow-hidden relative font-sans text-slate-200 bg-black selection:bg-blue-500/30">
      
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#312e81] animate-gradient-slow"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-8 flex justify-between items-center px-4 bg-transparent text-xs md:text-sm font-medium z-50 text-white/80 hover:bg-black/20 transition-colors duration-300">
        <div className="flex items-center gap-4">
            <div className="font-bold flex items-center gap-2 hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer">
                <Icons.Arch />
                <span>Arch Linux</span>
            </div>
            <span className="hidden md:inline font-light opacity-70">Finder</span>
            <span className="hidden md:inline font-light opacity-70">File</span>
            <span className="hidden md:inline font-light opacity-70">Edit</span>
            <span className="hidden md:inline font-light opacity-70">View</span>
        </div>
        <div className="flex items-center gap-4">
            <div className="hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer" onClick={() => setSpotlightOpen(true)}>
                <Icons.Search />
            </div>
            <span className="hover:bg-white/10 px-2 py-1 rounded transition-colors cursor-pointer">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp; {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <button onClick={onExit} className="hover:bg-red-500/20 hover:text-red-400 px-2 py-1 rounded transition-colors">
                <Icons.Power />
            </button>
        </div>
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="w-full h-full relative pointer-events-auto">
            
            {/* Resume */}
            <DraggableWindow 
                title="Resume.pdf - Preview" 
                isOpen={openWindows.resume} 
                onClose={() => toggleWindow('resume')}
                zIndex={getZIndex('resume')}
                onFocus={() => bringToFront('resume')}
                width="w-full md:w-[800px]"
                height="h-[600px]"
                initialPosition={{ x: window.innerWidth / 2 - 400, y: 100 }}
            >
                <div className="p-8 text-slate-200">
                    <div className="mb-8 border-b border-white/10 pb-4">
                        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{RESUME.name}</h1>
                        <p className="text-lg text-white/60 mt-2 font-light">Full Stack Developer & AI Enthusiast</p>
                        <div className="flex gap-4 mt-4 text-sm text-blue-300">
                            <a href={`mailto:${RESUME.contact.email}`} className="hover:underline">{RESUME.contact.email}</a>
                            <span>•</span>
                            <a href={`https://${RESUME.contact.github}`} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
                            <span>•</span>
                            <a href={`https://${RESUME.contact.linkedin}`} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn</a>
                        </div>
                    </div>
                    
                    <div className="grid gap-8">
                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-blue-500 rounded-full"></span> Experience
                            </h2>
                            <div className="space-y-6 pl-4 border-l border-white/10 ml-1">
                                {RESUME.experience.map((exp, i) => (
                                    <div key={i} className="relative">
                                        <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-blue-500 border-2 border-slate-900"></span>
                                        <div className="flex justify-between items-baseline mb-1">
                                            <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                                            <span className="text-xs text-white/50 font-mono">{exp.period}</span>
                                        </div>
                                        <p className="text-blue-300 mb-2">{exp.company} • {exp.location}</p>
                                        <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                                            {exp.details.map((d, idx) => <li key={idx}>{d}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <span className="w-2 h-8 bg-purple-500 rounded-full"></span> Education
                            </h2>
                             {RESUME.education.map((edu, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-lg border border-white/5">
                                    <h3 className="font-bold">{edu.institution}</h3>
                                    <p className="text-purple-300">{edu.degree}</p>
                                    <p className="text-sm text-white/50 mt-1">{edu.period}</p>
                                </div>
                            ))}
                        </section>
                    </div>
                </div>
            </DraggableWindow>

            {/* Projects */}
            <DraggableWindow
                title="~/Projects"
                isOpen={openWindows.projects}
                onClose={() => toggleWindow('projects')}
                zIndex={getZIndex('projects')}
                onFocus={() => bringToFront('projects')}
                initialPosition={{ x: 150, y: 150 }}
                width="w-[700px]"
                height="h-[500px]"
            >
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {RESUME.projects.map((proj, i) => (
                        <div key={i} className="group bg-slate-800/50 hover:bg-slate-800/80 p-4 rounded-xl border border-white/5 transition-all hover:-translate-y-1 hover:shadow-lg cursor-default">
                            <div className="flex justify-between items-start mb-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 group-hover:text-blue-300 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"/><line x1="2" y1="20" x2="2" y2="20"/></svg>
                                </div>
                                <span className="text-xs font-mono text-white/40 bg-white/5 px-2 py-1 rounded">{proj.year}</span>
                            </div>
                            <h3 className="font-bold text-lg mb-1 text-white">{proj.name}</h3>
                            <p className="text-xs text-blue-300 mb-3 font-mono">{proj.tech}</p>
                            <p className="text-sm text-white/70 line-clamp-3">{proj.description.join(' ')}</p>
                        </div>
                    ))}
                </div>
            </DraggableWindow>

            {/* Terminal */}
            <DraggableWindow
                title="zsh — 80x24"
                isOpen={openWindows.terminal}
                onClose={() => toggleWindow('terminal')}
                zIndex={getZIndex('terminal')}
                onFocus={() => bringToFront('terminal')}
                initialPosition={{ x: 300, y: 200 }}
                width="w-[600px]"
                height="h-[400px]"
                isTerminal={true}
            >
                <div 
                    className={`h-full overflow-y-auto font-mono p-4 space-y-1 text-sm ${terminalProps.currentTheme.text}`}
                    ref={terminalScrollRef}
                    onClick={() => (document.querySelector('#gui-terminal-container input') as HTMLInputElement)?.focus()}
                >
                    {terminalProps.history.map((line) => (
                        <div key={line.id} className={`${line.type === 'input' ? 'flex items-start mt-2' : 'whitespace-pre-wrap break-words opacity-90'}`}>
                             {line.type === 'input' && (
                                 <span className={`mr-2 font-bold whitespace-nowrap ${
                                     line.promptLabel?.includes('ai') ? 'text-blue-400' : 
                                     line.promptLabel?.includes('nano') ? 'text-purple-400' : 
                                     'text-green-400'
                                 }`}>
                                    ➜  ~
                                 </span>
                             )}
                             <span className={line.type === 'input' ? 'text-white' : ''}>{line.content}</span>
                        </div>
                    ))}
                    
                    <div id="gui-terminal-container" className="mt-2">
                       <TerminalInput 
                          value={terminalProps.input} 
                          onChange={terminalProps.setInput} 
                          onSubmit={terminalProps.onSubmit} 
                          mode={terminalProps.mode}
                          loading={terminalProps.loading}
                          history={terminalProps.commandHistory}
                          promptColor="text-green-400" // ZSH style green arrow
                       />
                    </div>
                </div>
            </DraggableWindow>
            
             {/* About */}
             <DraggableWindow
                title="About Me"
                isOpen={openWindows.about}
                onClose={() => toggleWindow('about')}
                zIndex={getZIndex('about')}
                onFocus={() => bringToFront('about')}
                initialPosition={{ x: 500, y: 150 }}
                width="w-[400px]"
             >
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 p-1 mb-4 shadow-xl">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
                             {/* Placeholder Avatar */}
                             <span className="text-4xl font-bold text-white">YK</span>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Yashank Kothari</h2>
                    <p className="text-blue-300 mb-6">Code • Design • AI</p>
                    <p className="text-white/70 text-sm leading-relaxed mb-6">
                        I build accessible, pixel-perfect, and performant web experiences. 
                        Currently studying Computer Engineering and exploring the depths of Large Language Models.
                    </p>
                    <div className="w-full bg-black/30 rounded-lg p-4 text-left font-mono text-xs text-gray-400 border border-white/5">
                        <div className="flex justify-between"><span>OS:</span> <span className="text-white">Arch Linux x86_64</span></div>
                        <div className="flex justify-between"><span>Host:</span> <span className="text-white">Portfolio v2.0</span></div>
                        <div className="flex justify-between"><span>Uptime:</span> <span className="text-white">Forever</span></div>
                        <div className="flex justify-between"><span>Shell:</span> <span className="text-white">zsh</span></div>
                    </div>
                </div>
            </DraggableWindow>

            {/* Contact */}
             <DraggableWindow
                title="Contact"
                isOpen={openWindows.contact}
                onClose={() => toggleWindow('contact')}
                zIndex={getZIndex('contact')}
                onFocus={() => bringToFront('contact')}
                initialPosition={{ x: 400, y: 350 }}
                width="w-[300px]"
                height="h-auto"
             >
                <div className="p-4 space-y-2">
                    {[
                        { label: 'Email', val: RESUME.contact.email, href: `mailto:${RESUME.contact.email}`, color: 'bg-red-500' },
                        { label: 'GitHub', val: 'yashankkothari', href: `https://${RESUME.contact.github}`, color: 'bg-gray-800' },
                        { label: 'LinkedIn', val: 'in/yashankkothari', href: `https://${RESUME.contact.linkedin}`, color: 'bg-blue-600' },
                    ].map((c, i) => (
                        <a 
                            key={i} 
                            href={c.href} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group border border-white/5"
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${c.color} shadow-lg`}>
                                {c.label[0]}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{c.label}</div>
                                <div className="text-xs text-white/50 truncate w-32">{c.val}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </DraggableWindow>
        </div>
      </div>

      {/* Dock */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 flex gap-4 items-end shadow-2xl ring-1 ring-white/5">
          
          {[
            { id: 'resume', icon: <Icons.FileText />, label: 'Resume' },
            { id: 'projects', icon: <Icons.Folder />, label: 'Projects' },
            { id: 'about', icon: <Icons.Chrome />, label: 'About' }, // Using chrome icon as 'about' for variety
            { id: 'contact', icon: <div className="w-full h-full rounded bg-green-500 flex items-center justify-center text-white font-bold text-[10px]">MAIL</div>, label: 'Contact' },
            { id: 'terminal', icon: <Icons.Terminal />, label: 'Terminal' },
          ].map((app) => (
             <div key={app.id} className="group relative flex flex-col items-center gap-2">
                {openWindows[app.id] && <div className="w-1 h-1 rounded-full bg-white absolute -bottom-2"></div>}
                <div 
                    className="w-12 h-12 md:w-14 md:h-14 transition-all duration-200 hover:scale-110 hover:-translate-y-2 cursor-pointer"
                    onClick={() => toggleWindow(app.id)}
                >
                    {app.icon}
                </div>
                {/* Tooltip */}
                <div className="absolute -top-10 bg-slate-900/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm pointer-events-none whitespace-nowrap border border-white/10">
                    {app.label}
                </div>
             </div>
          ))}

        </div>
      </div>

      {/* Spotlight Overlay */}
      <Spotlight 
        isOpen={spotlightOpen} 
        onClose={() => setSpotlightOpen(false)} 
        onLaunch={(app) => toggleWindow(app)} 
      />

    </div>
  );
};

export default DesktopEnvironment;