
import React, { useState, useEffect } from 'react';

interface SystemMonitorProps {
  onExit: () => void;
}

const SystemMonitor: React.FC<SystemMonitorProps> = ({ onExit }) => {
  const [cpuUsage, setCpuUsage] = useState<number[]>(Array(4).fill(0));
  const [memoryUsage, setMemoryUsage] = useState(30); // Start at 30%
  const [tasks, setTasks] = useState([
    { pid: 1324, user: 'root', cpu: 0.0, mem: 0.1, time: '0:00.03', command: 'init' },
    { pid: 2451, user: 'guest', cpu: 12.4, mem: 8.2, time: '14:22.10', command: 'react-dom' },
    { pid: 2452, user: 'guest', cpu: 8.1, mem: 4.5, time: '5:10.05', command: 'chrome-gpu' },
    { pid: 3301, user: 'guest', cpu: 2.2, mem: 1.2, time: '1:05.22', command: 'zsh' },
    { pid: 4120, user: 'root', cpu: 0.0, mem: 0.0, time: '0:00.00', command: 'kworker' },
    { pid: 5502, user: 'guest', cpu: 45.1, mem: 12.4, time: '22:30.44', command: 'gemini-ai-engine' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      // Randomize CPU
      setCpuUsage(prev => prev.map(() => Math.random() * 100));
      
      // Randomize Memory slightly
      setMemoryUsage(prev => {
        const change = (Math.random() - 0.5) * 5;
        return Math.min(Math.max(prev + change, 20), 90);
      });

      // Randomize tasks cpu
      setTasks(prev => prev.map(t => ({
        ...t,
        cpu: t.command.includes('gemini') ? Math.random() * 50 + 20 : Math.random() * 10
      })).sort((a, b) => b.cpu - a.cpu));

    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'q') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExit]);

  const renderBar = (percent: number, colorClass: string = "bg-green-500") => {
    const width = Math.floor((percent / 100) * 30);
    return (
      <div className="flex items-center">
        <span className="text-xs font-mono w-12 text-right mr-2">{percent.toFixed(1)}%</span>
        <div className="flex-1 bg-gray-800 h-4 relative overflow-hidden rounded-sm">
            <div 
                className={`h-full ${percent > 80 ? 'bg-red-500' : percent > 50 ? 'bg-yellow-500' : colorClass} transition-all duration-500`}
                style={{ width: `${percent}%` }}
            ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full p-4 font-mono text-xs md:text-sm bg-black/80 text-gray-300 border border-gray-700 rounded">
      <div className="flex justify-between items-start mb-6">
        <div className="w-1/2 pr-4 space-y-2">
            {cpuUsage.map((usage, i) => (
                <div key={i} className="flex items-center">
                    <span className="w-10 font-bold text-cyan-400">CPU{i}</span>
                    <div className="flex-1">{renderBar(usage)}</div>
                </div>
            ))}
            <div className="flex items-center mt-2">
                <span className="w-10 font-bold text-purple-400">MEM</span>
                <div className="flex-1">{renderBar(memoryUsage, "bg-purple-500")}</div>
            </div>
            <div className="flex items-center">
                <span className="w-10 font-bold text-yellow-400">SWP</span>
                <div className="flex-1">{renderBar(5, "bg-yellow-600")}</div>
            </div>
        </div>
        
        <div className="w-1/2 pl-4 border-l border-gray-700">
            <div className="flex justify-between mb-1">
                <span className="font-bold">Tasks:</span> <span>{Math.floor(Math.random() * 50) + 100} total</span>
            </div>
            <div className="flex justify-between mb-1">
                <span className="font-bold">Uptime:</span> <span>42 days, 10:33:21</span>
            </div>
            <div className="flex justify-between mb-1">
                <span className="font-bold">Load Avg:</span> <span>1.24 0.88 0.56</span>
            </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-gray-800 text-black font-bold flex px-2 py-1 mb-1">
            <span className="w-16">PID</span>
            <span className="w-20">USER</span>
            <span className="w-16">CPU%</span>
            <span className="w-16">MEM%</span>
            <span className="w-24">TIME+</span>
            <span className="flex-1">COMMAND</span>
        </div>
        <div className="space-y-1">
            {tasks.map((t) => (
                <div key={t.pid} className="flex px-2 hover:bg-gray-800 transition-colors cursor-default">
                    <span className="w-16 text-green-400">{t.pid}</span>
                    <span className="w-20">{t.user}</span>
                    <span className={`w-16 ${t.cpu > 50 ? 'text-red-500' : 'text-gray-300'}`}>{t.cpu.toFixed(1)}</span>
                    <span className="w-16">{t.mem.toFixed(1)}</span>
                    <span className="w-24 text-blue-300">{t.time}</span>
                    <span className="flex-1 text-white font-bold">{t.command}</span>
                </div>
            ))}
        </div>
      </div>

      <div className="mt-4 text-gray-500 pt-2 border-t border-gray-800">
        F1Help  F2Setup  F3Search  F10Quit
      </div>
    </div>
  );
};

export default SystemMonitor;
