import React, { useState, useEffect, useRef } from 'react';
import { RESUME } from '../constants';
import TerminalInput from './TerminalInput';
import { TerminalMode, TerminalLine, ThemeColors } from '../types';

interface DraggableWindowProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  initialPosition?: { x: number; y: number };
  width?: string;
  height?: string;
  zIndex: number;
  onFocus: () => void;
}

const DraggableWindow: React.FC<DraggableWindowProps> = ({ 
  title, 
  isOpen, 
  onClose, 
  children, 
  icon, 
  initialPosition = { x: 100, y: 100 },
  width = "w-1/2",
  height = "max-h-[80vh]",
  zIndex,
  onFocus
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const windowRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (windowRef.current) {
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
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        // Basic bounds check can be added here if needed
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  if (!isOpen) return null;

  return (
    <div 
      ref={windowRef}
      className={`absolute ${width} bg-[#1e1e2e] rounded-lg shadow-2xl border border-[#313244] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-100`}
      style={{ 
        left: position.x, 
        top: position.y, 
        zIndex: zIndex,
        height: height === 'auto' ? 'auto' : undefined,
        maxHeight: '85vh'
      }}
      onMouseDown={onFocus}
    >
      {/* Title Bar (Draggable) */}
      <div 
        className="bg-[#181825] p-3 flex justify-between items-center border-b border-[#313244] select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-[#cdd6f4]">
          {icon}
          <span className="font-bold text-sm">{title}</span>
        </div>
        <div className="flex gap-2" onMouseDown={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></button>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      {/* Content */}
      <div className="p-6 overflow-y-auto text-[#cdd6f4] font-sans flex-1 cursor-default">
        {children}
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
  const [time, setTime] = useState(new Date());
  const [openWindows, setOpenWindows] = useState<Record<string, boolean>>({
    about: false,
    projects: false,
    resume: true,
    contact: false,
    terminal: false, // Terminal window state
  });

  // Window Z-Index Management
  const [windowOrder, setWindowOrder] = useState<string[]>(['resume', 'terminal']);

  const bringToFront = (key: string) => {
    setWindowOrder(prev => {
      const filtered = prev.filter(k => k !== key);
      return [...filtered, key];
    });
  };

  const getZIndex = (key: string) => {
    return 10 + windowOrder.indexOf(key);
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleWindow = (key: string) => {
    setOpenWindows(prev => ({ ...prev, [key]: !prev[key] }));
    bringToFront(key);
  };

  // Scroll ref for terminal window
  const terminalScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (openWindows.terminal && terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [terminalProps.history, openWindows.terminal]);

  // Icons
  const Icons = {
    Folder: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#89b4fa" className="w-12 h-12 mb-1">
        <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
      </svg>
    ),
    FileText: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#a6e3a1" className="w-12 h-12 mb-1">
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
      </svg>
    ),
    Terminal: () => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#313244" className="w-12 h-12 mb-1 p-1 bg-[#cdd6f4] rounded">
        <path fillRule="evenodd" d="M2.25 6a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V6Zm3.97 4.03a.75.75 0 0 1 1.06 0l3 3a.75.75 0 0 1 0 1.06l-3 3a.75.75 0 1 1-1.06-1.06l2.47-2.47-2.47-2.47a.75.75 0 0 1 0-1.06Zm6.53 5.47a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 0 1.5h-3a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
      </svg>
    ),
    Arch: () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
        <path d="M11.266 1.733a1.733 1.733 0 0 1 2.955.71L22.92 21.21a.866.866 0 0 1-1.63.542l-1.914-5.74H5.99L3.39 21.553a.867.867 0 0 1-1.653-.507L11.266 1.733Zm9.29 13.15L12.762 3.022h-.024L7.013 14.883h13.543Z"/>
      </svg>
    ),
    Power: () => (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
      </svg>
    )
  };

  return (
    <div className="min-h-screen bg-[#11111b] font-sans text-[#cdd6f4] overflow-hidden relative bg-[url('https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center">
      {/* Wallpaper Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

      {/* Top Bar (Gnome Style) */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-[#181825]/90 backdrop-blur-md border-b border-[#313244] flex justify-between items-center px-4 z-50 text-xs md:text-sm font-medium shadow-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 hover:bg-[#313244] px-2 py-1 rounded cursor-pointer transition-colors">
            <Icons.Arch />
            <span>Activities</span>
          </div>
          <span className="hidden md:inline text-[#6c7086]">Portfolio OS</span>
        </div>
        
        <div className="absolute left-1/2 transform -translate-x-1/2 text-[#cdd6f4] bg-[#1e1e2e] px-4 py-1 rounded-full shadow-inner border border-[#313244]">
           {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} &nbsp; {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            <span className="text-xs">System Stable</span>
          </div>
          <div className="flex gap-3 text-[#cdd6f4] items-center">
             <span>EN</span>
             <span>▼</span>
             <span>🔋 100%</span>
             <button onClick={onExit} className="hover:bg-red-500/20 p-1 rounded text-red-400 transition-colors" title="Log Out">
               <Icons.Power />
             </button>
          </div>
        </div>
      </div>

      {/* Desktop Icons */}
      <div className="absolute top-12 left-4 flex flex-col gap-6 z-10">
        <div 
          className="flex flex-col items-center w-24 p-2 rounded hover:bg-[#cdd6f4]/10 cursor-pointer transition-colors group"
          onClick={() => toggleWindow('resume')}
        >
          <Icons.FileText />
          <span className="text-xs text-center bg-black/50 px-2 py-0.5 rounded group-hover:bg-blue-500/80 transition-colors shadow-sm">resume.pdf</span>
        </div>

        <div 
          className="flex flex-col items-center w-24 p-2 rounded hover:bg-[#cdd6f4]/10 cursor-pointer transition-colors group"
          onClick={() => toggleWindow('projects')}
        >
          <Icons.Folder />
          <span className="text-xs text-center bg-black/50 px-2 py-0.5 rounded group-hover:bg-blue-500/80 transition-colors shadow-sm">Projects</span>
        </div>

        <div 
          className="flex flex-col items-center w-24 p-2 rounded hover:bg-[#cdd6f4]/10 cursor-pointer transition-colors group"
          onClick={() => toggleWindow('about')}
        >
          <Icons.FileText />
          <span className="text-xs text-center bg-black/50 px-2 py-0.5 rounded group-hover:bg-blue-500/80 transition-colors shadow-sm">About Me</span>
        </div>

        <div 
          className="flex flex-col items-center w-24 p-2 rounded hover:bg-[#cdd6f4]/10 cursor-pointer transition-colors group"
          onClick={() => toggleWindow('contact')}
        >
          <Icons.Folder />
          <span className="text-xs text-center bg-black/50 px-2 py-0.5 rounded group-hover:bg-blue-500/80 transition-colors shadow-sm">Contact_Info</span>
        </div>

        <div 
          className="flex flex-col items-center w-24 p-2 rounded hover:bg-[#cdd6f4]/10 cursor-pointer transition-colors group"
          onClick={() => toggleWindow('terminal')}
        >
          <Icons.Terminal />
          <span className="text-xs text-center bg-black/50 px-2 py-0.5 rounded group-hover:bg-blue-500/80 transition-colors shadow-sm">Terminal</span>
        </div>
      </div>

      {/* WINDOWS */}

      {/* Resume Window */}
      <DraggableWindow 
        title="Resume.pdf (Preview)" 
        isOpen={openWindows.resume} 
        onClose={() => toggleWindow('resume')}
        icon={<Icons.FileText />}
        zIndex={getZIndex('resume')}
        onFocus={() => bringToFront('resume')}
        initialPosition={{ x: 120, y: 80 }}
      >
        <div className="space-y-6 text-[#cdd6f4]">
          <div className="border-b border-[#313244] pb-4">
            <h1 className="text-2xl font-bold text-[#89b4fa]">{RESUME.name}</h1>
            <p className="text-[#a6adc8]">Full Stack Developer & AI Enthusiast</p>
            <p className="text-sm text-[#6c7086] mt-1">{RESUME.education[0].degree}</p>
          </div>

          <div>
             <h2 className="text-lg font-bold text-[#f9e2af] mb-2 border-b border-[#313244] inline-block">Experience</h2>
             <div className="space-y-4 mt-2">
                {RESUME.experience.map((exp, i) => (
                   <div key={i}>
                      <div className="flex justify-between items-center">
                         <h3 className="font-bold">{exp.role}</h3>
                         <span className="text-xs bg-[#313244] px-2 py-0.5 rounded">{exp.period}</span>
                      </div>
                      <p className="text-sm text-[#89b4fa]">{exp.company} - {exp.location}</p>
                      <ul className="list-disc list-inside text-sm text-[#a6adc8] mt-1 pl-2">
                         {exp.details.map((d, idx) => <li key={idx}>{d}</li>)}
                      </ul>
                   </div>
                ))}
             </div>
          </div>
          
          <div>
             <h2 className="text-lg font-bold text-[#a6e3a1] mb-2 border-b border-[#313244] inline-block">Technical Skills</h2>
             <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                {Object.entries(RESUME.skills).map(([k, v]) => (
                   <div key={k} className="bg-[#181825] p-2 rounded border border-[#313244]">
                      <span className="block text-[#cba6f7] font-bold capitalize mb-1">{k}</span>
                      <span className="text-[#a6adc8]">{v}</span>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </DraggableWindow>

      {/* Projects Window */}
      <DraggableWindow 
        title="~/Projects" 
        isOpen={openWindows.projects} 
        onClose={() => toggleWindow('projects')}
        icon={<Icons.Folder />}
        zIndex={getZIndex('projects')}
        onFocus={() => bringToFront('projects')}
        initialPosition={{ x: 200, y: 150 }}
      >
        <div className="grid grid-cols-1 gap-4">
          {RESUME.projects.map((proj, i) => (
            <div key={i} className="bg-[#181825] p-4 rounded-lg border border-[#313244] hover:border-[#89b4fa] transition-colors cursor-default">
               <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-[#313244] rounded">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#89b4fa]">
                         <path fillRule="evenodd" d="M3 6a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3v2.25a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3V6ZM3 15.75a3 3 0 0 1 3-3h2.25a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-2.25Zm9.75 0a3 3 0 0 1 3-3H18a3 3 0 0 1 3 3V18a3 3 0 0 1-3 3h-2.25a3 3 0 0 1-3-3v-2.25Z" clipRule="evenodd" />
                       </svg>
                     </div>
                     <h3 className="font-bold text-[#cdd6f4]">{proj.name}</h3>
                  </div>
                  <span className="text-xs text-[#6c7086]">{proj.year}</span>
               </div>
               <p className="text-xs text-[#fab387] mb-2 font-mono">{proj.tech}</p>
               <p className="text-sm text-[#a6adc8]">{proj.description[0]}</p>
            </div>
          ))}
        </div>
      </DraggableWindow>

      {/* About Window */}
      <DraggableWindow 
        title="About Me" 
        isOpen={openWindows.about} 
        onClose={() => toggleWindow('about')}
        icon={<Icons.FileText />}
        zIndex={getZIndex('about')}
        onFocus={() => bringToFront('about')}
        initialPosition={{ x: 400, y: 100 }}
        width="w-96"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-3xl font-bold shadow-lg">
             YK
          </div>
          <div className="text-center">
             <p className="text-lg text-[#cdd6f4]">Hi, I'm Yashank.</p>
             <p className="text-[#a6adc8] max-w-md mt-2">
               I'm a student at K.J. Somaiya College of Engineering, Mumbai. 
               I love linux, open source, and building cool things with code.
             </p>
          </div>
          <div className="w-full bg-[#181825] p-4 rounded border border-[#313244] font-mono text-sm">
            <p className="text-[#a6e3a1]">$ neofetch</p>
            <div className="flex gap-4 mt-2">
               <div className="text-blue-400 hidden md:block">
                 {`
       /\\
      /  \\
     /    \\
    /      \\
   /   ,,   \\
  /   |  |   \\
 /_-''    ''-_\\
                 `}
               </div>
               <div className="text-[#cdd6f4]">
                  <p><span className="text-blue-400 font-bold">Host:</span> Yashank</p>
                  <p><span className="text-blue-400 font-bold">OS:</span> Arch Linux</p>
                  <p><span className="text-blue-400 font-bold">Kernel:</span> 6.8.9-arch1-1</p>
                  <p><span className="text-blue-400 font-bold">Shell:</span> zsh 5.9</p>
                  <p><span className="text-blue-400 font-bold">DE:</span> Hyprland (Simulated)</p>
               </div>
            </div>
          </div>
        </div>
      </DraggableWindow>

      {/* Contact Window */}
      <DraggableWindow
        title="~/Contact"
        isOpen={openWindows.contact}
        onClose={() => toggleWindow('contact')}
        icon={<Icons.Folder />}
        zIndex={getZIndex('contact')}
        onFocus={() => bringToFront('contact')}
        initialPosition={{ x: 500, y: 300 }}
        width="w-80"
      >
        <div className="space-y-2">
            <h3 className="text-[#cdd6f4] font-bold border-b border-[#313244] pb-2 mb-4">Links</h3>
            <a href={`mailto:${RESUME.contact.email}`} className="block p-3 bg-[#181825] rounded border border-[#313244] hover:border-[#89b4fa] transition-colors group">
               <span className="text-[#89b4fa] font-bold group-hover:underline">Email</span>
               <span className="block text-sm text-[#a6adc8]">{RESUME.contact.email}</span>
            </a>
            <a href={`https://${RESUME.contact.github}`} target="_blank" rel="noreferrer" className="block p-3 bg-[#181825] rounded border border-[#313244] hover:border-[#89b4fa] transition-colors group">
               <span className="text-[#89b4fa] font-bold group-hover:underline">GitHub</span>
               <span className="block text-sm text-[#a6adc8]">{RESUME.contact.github}</span>
            </a>
            <a href={`https://${RESUME.contact.linkedin}`} target="_blank" rel="noreferrer" className="block p-3 bg-[#181825] rounded border border-[#313244] hover:border-[#89b4fa] transition-colors group">
               <span className="text-[#89b4fa] font-bold group-hover:underline">LinkedIn</span>
               <span className="block text-sm text-[#a6adc8]">{RESUME.contact.linkedin}</span>
            </a>
        </div>
      </DraggableWindow>

      {/* Terminal Window */}
      <DraggableWindow
        title="Terminal"
        isOpen={openWindows.terminal}
        onClose={() => toggleWindow('terminal')}
        icon={<Icons.Terminal />}
        zIndex={getZIndex('terminal')}
        onFocus={() => bringToFront('terminal')}
        initialPosition={{ x: 150, y: 150 }}
        width="w-3/4"
        height="h-[500px]"
      >
         <div 
            className={`h-full overflow-y-auto font-mono p-1 space-y-1 ${terminalProps.currentTheme.text}`}
            ref={terminalScrollRef}
            onClick={() => (document.querySelector('#gui-terminal-container input') as HTMLInputElement)?.focus()}
         >
            {terminalProps.history.map((line) => {
                if (line.type === 'input') {
                    return (
                        <div key={line.id} className="flex items-start">
                             <span className={`mr-2 font-bold whitespace-nowrap ${
                                 line.promptLabel?.includes('ai') ? 'text-blue-400' : 
                                 line.promptLabel?.includes('nano') ? 'text-purple-400' : 
                                 terminalProps.currentTheme.prompt
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
            
            {terminalProps.loading && (
                 <div className="flex items-center opacity-60 animate-pulse">
                    <span className="mr-2">...</span>
                    <span>Processing</span>
                 </div>
            )}

            <div id="gui-terminal-container">
               <TerminalInput 
                  value={terminalProps.input} 
                  onChange={terminalProps.setInput} 
                  onSubmit={terminalProps.onSubmit} 
                  mode={terminalProps.mode}
                  loading={terminalProps.loading}
                  history={terminalProps.commandHistory}
                  promptColor={terminalProps.currentTheme.prompt}
               />
            </div>
         </div>
      </DraggableWindow>

    </div>
  );
};

export default DesktopEnvironment;