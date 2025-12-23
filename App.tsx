
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LiveVoice from './components/LiveVoice';
import ImageEditor from './components/ImageEditor';
import VideoGenerator from './components/VideoGenerator';
import SearchChat from './components/SearchChat';
import { AppMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AppMode>(AppMode.LIVE_VOICE);

  const renderContent = () => {
    switch (currentMode) {
      case AppMode.LIVE_VOICE:
        return <LiveVoice />;
      case AppMode.IMAGE_EDIT:
        return <ImageEditor />;
      case AppMode.VIDEO_GEN:
        return <VideoGenerator />;
      case AppMode.SEARCH_CHAT:
        return <SearchChat />;
      default:
        return <LiveVoice />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar currentMode={currentMode} setMode={setCurrentMode} />
      <main className="flex-1 relative overflow-hidden bg-slate-950">
        {/* Subtle background effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -ml-48 -mb-48" />
        
        <div className="h-full relative z-10">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
