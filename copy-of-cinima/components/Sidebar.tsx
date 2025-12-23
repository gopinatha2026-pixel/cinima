
import React from 'react';
import { Mic, Image as ImageIcon, Video, Search, LayoutDashboard } from 'lucide-react';
import { AppMode } from '../types';

interface SidebarProps {
  currentMode: AppMode;
  setMode: (mode: AppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, setMode }) => {
  const navItems = [
    { mode: AppMode.LIVE_VOICE, icon: Mic, label: 'Live Voice' },
    { mode: AppMode.IMAGE_EDIT, icon: ImageIcon, label: 'Image Editor' },
    { mode: AppMode.VIDEO_GEN, icon: Video, label: 'Veo Video' },
    { mode: AppMode.SEARCH_CHAT, icon: Search, label: 'Search Grounding' },
  ];

  return (
    <div className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <LayoutDashboard size={24} className="text-white" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight">Gemini Pro</span>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map(({ mode, icon: Icon, label }) => (
          <button
            key={mode}
            onClick={() => setMode(mode)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentMode === mode 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Icon size={22} className={currentMode === mode ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
            <span className="hidden md:block font-medium">{label}</span>
          </button>
        ))}
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 hidden md:block">
        &copy; 2025 AI Studio Multimodal
      </div>
    </div>
  );
};

export default Sidebar;
