
import { GoogleGenAI, Modality, Type } from "@google/genai";

// --- State Management ---
type AppMode = 'DASHBOARD' | 'PRACTICE' | 'CREATE' | 'PROGRESS' | 'IDENTITY';
let currentMode: AppMode = 'DASHBOARD';

let userStats = {
  acting: 68,
  direction: 42,
  writing: 85,
  disciplineScore: 92,
  streak: 14,
  habits: [
    { name: "Emotion Drill: Sorrow", done: true },
    { name: "Scene Rewrite: Intro", done: false },
    { name: "Watch: Pather Panchali", done: false }
  ]
};

// --- Core App Functionality ---

function render() {
  const main = document.getElementById('main-content');
  if (!main) return;
  main.innerHTML = '';
  
  switch(currentMode) {
    case 'DASHBOARD': renderDashboard(main); break;
    case 'PRACTICE': renderPractice(main); break;
    case 'CREATE': renderCreate(main); break;
    case 'PROGRESS': renderProgress(main); break;
    case 'IDENTITY': renderIdentity(main); break;
  }
}

function renderDashboard(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-8 lg:p-12 space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
      <header class="flex justify-between items-end">
        <div class="space-y-1">
          <h1 class="text-5xl font-black tracking-tighter text-white">Good Morning, Gopinath</h1>
          <p class="text-slate-500 font-medium italic">"Consistency beats talent when talent doesn't work hard."</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
           <div class="text-right">
              <p class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Streak</p>
              <p class="text-2xl font-black text-amber-500">${userStats.streak} Days</p>
           </div>
           <div class="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c1.2 0 2.3.4 3.2 1.1.2.2.3.5.1.7-.2.2-.5.3-.7.1C13.9 3.4 13 3 12 3c-5 0-9 4-9 9s4 9 9 9 9-4 9-9c0-.4-.1-.8-.2-1.2-.1-.3 0-.6.3-.7s.6 0 .7.3c.1.5.2 1 .2 1.6 0 5.5-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2Z"/></svg>
           </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <!-- Daily Mission Card -->
        <section class="lg:col-span-2 bg-slate-900/40 border border-slate-800/60 rounded-[40px] p-10 space-y-8 backdrop-blur-xl relative overflow-hidden group">
          <div class="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
             <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          
          <h2 class="text-2xl font-bold flex items-center gap-3">
            <span class="w-2 h-8 bg-amber-500 rounded-full"></span>
            Today's Mission
          </h2>
          
          <div class="space-y-4">
            ${userStats.habits.map((h, i) => `
              <div class="flex items-center gap-5 p-6 rounded-3xl bg-slate-950/40 border border-slate-800/50 hover:border-amber-500/30 transition-all cursor-pointer group/item" onclick="toggleHabit(${i})">
                <div class="w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${h.done ? 'bg-amber-500 border-amber-500' : 'border-slate-700 group-hover/item:border-amber-500'}">
                  ${h.done ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="text-black"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
                </div>
                <div class="flex-1">
                  <span class="text-lg ${h.done ? 'text-slate-500 line-through' : 'text-slate-200 font-semibold'}">${h.name}</span>
                  <p class="text-xs text-slate-600">${h.done ? 'Completed' : 'Priority Task'}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </section>

        <!-- Discipline Analytics -->
        <section class="bg-slate-900/40 border border-slate-800/60 rounded-[40px] p-10 space-y-10">
          <h2 class="text-xl font-bold">Discipline Score</h2>
          <div class="relative w-48 h-48 mx-auto flex items-center justify-center">
             <svg class="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" stroke-width="12" fill="transparent" class="text-slate-800" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" stroke-width="12" fill="transparent" stroke-dasharray="502.4" stroke-dashoffset="${502.4 - (502.4 * userStats.disciplineScore / 100)}" class="text-amber-500 transition-all duration-1000" />
             </svg>
             <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-black text-white">${userStats.disciplineScore}%</span>
                <span class="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Growth Index</span>
             </div>
          </div>
          
          <div class="space-y-4">
             <div class="flex justify-between items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <span class="text-xs font-bold text-slate-500 uppercase">Acting</span>
                <span class="text-slate-200 font-bold">${userStats.acting}%</span>
             </div>
             <div class="flex justify-between items-center p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <span class="text-xs font-bold text-slate-500 uppercase">Direction</span>
                <span class="text-slate-200 font-bold">${userStats.direction}%</span>
             </div>
          </div>
        </section>
      </div>

      <!-- Quick Entry Points -->
      <section class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <button class="p-8 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:bg-slate-900 transition-all text-center space-y-4 group" onclick="setMode('PRACTICE')">
          <div class="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto text-amber-500 group-hover:scale-110 transition-transform shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </div>
          <p class="font-bold text-slate-200 text-lg">Practice</p>
        </button>
        <button class="p-8 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:bg-slate-900 transition-all text-center space-y-4 group" onclick="setMode('CREATE')">
          <div class="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto text-red-500 group-hover:scale-110 transition-transform shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <p class="font-bold text-slate-200 text-lg">Direct</p>
        </button>
        <button class="p-8 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:bg-slate-900 transition-all text-center space-y-4 group" onclick="setMode('PROGRESS')">
          <div class="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto text-blue-500 group-hover:scale-110 transition-transform shadow-inner">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
          </div>
          <p class="font-bold text-slate-200 text-lg">Insights</p>
        </button>
        <button class="p-8 bg-slate-900/40 border border-slate-800 rounded-[32px] hover:bg-slate-900 transition-all text-center space-y-4 group" onclick="setMode('IDENTITY')">
          <div class="w-16 h-16 rounded-2xl bg-slate-500/10 flex items-center justify-center mx-auto text-slate-400 group-hover:scale-110 transition-transform shadow-inner">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
          </div>
          <p class="font-bold text-slate-200 text-lg">Identity</p>
        </button>
      </section>
    </div>
  `;
}

function renderPractice(container: HTMLElement) {
  container.innerHTML = `
    <div class="h-full flex flex-col p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">Practice Suite</h2>
          <p class="text-slate-500">Mirror Mode: Master your craft with AI analysis.</p>
        </div>
        <div class="flex gap-4">
           <span id="acting-timer" class="px-4 py-2 bg-red-600/10 border border-red-500/20 text-red-500 font-mono font-bold rounded-xl hidden">00:00:00</span>
           <button class="px-6 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold uppercase text-slate-300">Monologue Library</button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 min-h-0">
        <!-- The Mirror -->
        <div class="bg-black rounded-[48px] border border-slate-800 overflow-hidden relative group shadow-2xl">
          <video id="practice-video" class="w-full h-full object-cover scale-x-[-1]" autoplay playsinline></video>
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>
          
          <div class="absolute inset-x-0 bottom-10 flex flex-col items-center gap-6">
             <div id="recording-status" class="hidden px-4 py-1.5 bg-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse text-white">Live Recording</div>
             <button id="record-btn" class="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-2xl hover:scale-110 transition-all border-8 border-slate-900 group">
                <div id="record-icon" class="w-6 h-6 rounded-sm bg-red-600 group-hover:rounded-full transition-all"></div>
             </button>
          </div>
          
          <div id="ai-gaze" class="absolute top-10 right-10 hidden">
             <div class="flex items-center gap-2 px-4 py-2 bg-amber-500/90 rounded-full text-black font-black text-[10px] uppercase tracking-widest shadow-lg">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                AI Observing
             </div>
          </div>
          <canvas id="practice-canvas" class="hidden"></canvas>
        </div>

        <!-- Feedback & Settings -->
        <div class="flex flex-col space-y-8">
           <section class="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 space-y-6">
              <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Target Emotion</h3>
              <div class="grid grid-cols-3 gap-3">
                 ${['Neutral', 'Sorrow', 'Rage', 'Subtle Joy', 'Fear', 'Contempt'].map(e => `
                    <button class="emotion-chip px-4 py-3 rounded-2xl border border-slate-800 bg-slate-950/50 text-xs font-bold text-slate-400 hover:text-white hover:border-amber-500/50 transition-all" onclick="selectEmotion('${e}', this)">${e}</button>
                 `).join('')}
              </div>
           </section>

           <section class="flex-1 bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 flex flex-col overflow-hidden">
              <div class="flex justify-between items-center mb-6">
                 <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Director's Notes</h3>
                 <span id="analysis-timestamp" class="text-[10px] text-slate-700 font-mono">WAITING_FOR_INPUT</span>
              </div>
              
              <div id="feedback-stream" class="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                 <div class="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <p class="text-sm max-w-xs font-medium">Hit record and perform. AI will critique your subtext and delivery.</p>
                 </div>
              </div>
           </section>
        </div>
      </div>
    </div>
  `;

  // Init
  const video = document.getElementById('practice-video') as HTMLVideoElement;
  navigator.mediaDevices.getUserMedia({ video: true }).then(s => video.srcObject = s);
  
  const recordBtn = document.getElementById('record-btn');
  let isRecording = false;

  recordBtn!.onclick = async () => {
    isRecording = !isRecording;
    const icon = document.getElementById('record-icon')!;
    const status = document.getElementById('recording-status')!;
    const gaze = document.getElementById('ai-gaze')!;
    const feedback = document.getElementById('feedback-stream')!;

    if(isRecording) {
      icon.classList.replace('bg-red-600', 'bg-black');
      status.classList.remove('hidden');
      gaze.classList.remove('hidden');
      feedback.innerHTML = `<div class="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl animate-pulse text-amber-500 text-sm font-bold text-center">AI Analysis Active. Keep performing...</div>`;
      
      // Analysis Logic
      setTimeout(async () => {
        if (!isRecording) return;
        const canvas = document.getElementById('practice-canvas') as HTMLCanvasElement;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png').split(',')[1];
        
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const emotion = (document.querySelector('.emotion-chip.bg-amber-500') as HTMLElement)?.innerText || 'Neutral';
          const resp = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [
              { inlineData: { data: dataUrl, mimeType: 'image/png' } },
              { text: `Acting Coach Mode: This actor is attempting "${emotion}". Critically analyze micro-expressions, eye-lines, and jaw tension. Give 2 cinematic tips. Be direct and use Tamil-English mix if possible.` }
            ] }
          });
          
          feedback.innerHTML = `
            <div class="space-y-6 animate-in slide-in-from-top-4">
              <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-3">
                 <p class="text-slate-300 leading-relaxed font-medium italic">"${resp.text}"</p>
                 <div class="flex gap-2">
                    <span class="px-2 py-1 bg-green-500/10 text-green-500 text-[10px] font-bold rounded">FOCUS: OK</span>
                    <span class="px-2 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-bold rounded">INTENSITY: HIGH</span>
                 </div>
              </div>
              <p class="text-[10px] text-slate-700 font-mono text-center">--- PERFORMANCE LOG END ---</p>
            </div>
          `;
        } catch (e) {
          feedback.innerHTML = `<p class="text-red-500 text-center">Analysis Timeout.</p>`;
        } finally {
          gaze.classList.add('hidden');
          status.classList.add('hidden');
          icon.classList.replace('bg-black', 'bg-red-600');
          isRecording = false;
        }
      }, 4000);
    }
  };
}

function renderCreate(container: HTMLElement) {
  container.innerHTML = `
    <div class="h-full flex flex-col p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
       <div class="flex justify-between items-center">
        <div>
          <h2 class="text-4xl font-black text-white tracking-tight">Director Studio</h2>
          <p class="text-slate-500">From Logline to Call Sheet. Your AI Co-Director.</p>
        </div>
        <div class="flex gap-4">
          <button id="gen-idea" class="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 rounded-xl text-xs font-black uppercase text-black transition-all">Generate Spark</button>
        </div>
      </div>

      <div class="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-10 min-h-0">
        <!-- Script Area -->
        <div class="lg:col-span-2 flex flex-col space-y-4">
           <div class="flex items-center justify-between px-4">
              <span class="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Draft: Untitled_Indie_Project.fdx</span>
              <div class="flex gap-2">
                 <button class="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/></svg></button>
              </div>
           </div>
           <textarea id="script-editor" placeholder="INT. DARK ROOM - NIGHT\n\nMAN stares at the flickering TV screen..." class="flex-1 bg-slate-900/40 border border-slate-800 rounded-[48px] p-10 text-slate-200 focus:ring-2 focus:ring-amber-500 outline-none resize-none font-mono text-xl leading-relaxed custom-scrollbar shadow-inner"></textarea>
        </div>

        <!-- AI Director's Sidebar -->
        <div class="flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
           <section class="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 space-y-6">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div> Shot List Preview
              </h3>
              <div id="shot-list" class="space-y-3">
                 <div class="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-[11px] text-slate-500 italic">Highlight a scene to generate technical breakdown.</div>
              </div>
              <button id="breakdown-btn" class="w-full py-4 bg-red-600/10 border border-red-500/20 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Breakdown Scene</button>
           </section>

           <section class="flex-1 bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 space-y-6 flex flex-col min-h-0">
              <h3 class="text-xs font-bold text-slate-500 uppercase tracking-widest">Vision Board AI</h3>
              <div id="vision-feed" class="flex-1 overflow-y-auto space-y-4">
                 <div class="p-6 bg-slate-950/40 border border-slate-800 rounded-3xl text-[11px] text-slate-600 text-center">AI will suggest lighting schemes and color palettes here.</div>
              </div>
           </section>
        </div>
      </div>
    </div>
  `;

  // Actions
  const ideaBtn = document.getElementById('gen-idea');
  const breakdownBtn = document.getElementById('breakdown-btn');
  const scriptArea = document.getElementById('script-editor') as HTMLTextAreaElement;
  const visionFeed = document.getElementById('vision-feed');
  const shotList = document.getElementById('shot-list');

  ideaBtn!.onclick = async () => {
    ideaBtn!.innerText = 'CONSULTING...';
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Act as a world-class film consultant. Provide 3 extremely unique and gritty cinematic premises for a Tamil/Indian context. Focus on 'Reality Grounded' or 'Noir' vibes."
      });
      visionFeed!.innerHTML = `
        <div class="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl space-y-4">
           <h4 class="text-xs font-bold text-amber-500 uppercase">New Sparks</h4>
           <div class="text-slate-300 text-xs leading-relaxed prose prose-invert">${resp.text}</div>
        </div>
      `;
    } finally { ideaBtn!.innerText = 'Generate Spark'; }
  };

  breakdownBtn!.onclick = async () => {
    if(!scriptArea.value) return;
    breakdownBtn!.innerText = 'ANALYZING...';
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const resp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Break down this script for a Cinematographer. Mention Shot Types, Lighting Atmosphere, and Sound Design: \n\n ${scriptArea.value}`
      });
      shotList!.innerHTML = `<div class="p-6 bg-red-600/10 border border-red-500/20 rounded-3xl text-[11px] text-slate-200 leading-relaxed whitespace-pre-wrap">${resp.text}</div>`;
    } finally { breakdownBtn!.innerText = 'Breakdown Scene'; }
  };
}

function renderProgress(container: HTMLElement) {
  container.innerHTML = `
    <div class="p-12 space-y-12 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <header>
        <h2 class="text-5xl font-black text-white tracking-tighter">Growth Analytics</h2>
        <p class="text-slate-500">Your evolution from enthusiast to master.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
         <section class="bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 space-y-8">
            <h3 class="text-xl font-bold">Discipline Heatmap</h3>
            <div class="grid grid-cols-7 gap-2">
               ${Array.from({length: 28}).map((_, i) => `
                  <div class="aspect-square rounded-lg ${i % 3 === 0 ? 'bg-amber-500' : 'bg-slate-800'} opacity-${Math.random() > 0.5 ? '100' : '40'}"></div>
               `).join('')}
            </div>
            <p class="text-xs text-slate-600">This map shows your last 4 weeks of consistent activity. You are peak active on Tuesdays.</p>
         </section>

         <section class="bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 space-y-8">
            <h3 class="text-xl font-bold">Skill Breakdown</h3>
            <div class="space-y-6">
               <div>
                  <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2"><span>Acting Precision</span><span>${userStats.acting}%</span></div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-amber-500" style="width: ${userStats.acting}%"></div></div>
               </div>
               <div>
                  <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2"><span>Dialogue Rhythm</span><span>${userStats.writing}%</span></div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-red-500" style="width: ${userStats.writing}%"></div></div>
               </div>
               <div>
                  <div class="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-2"><span>Visionary Alignment</span><span>${userStats.direction}%</span></div>
                  <div class="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div class="h-full bg-blue-500" style="width: ${userStats.direction}%"></div></div>
               </div>
            </div>
         </section>
      </div>

      <div class="p-10 bg-amber-500/5 border border-amber-500/10 rounded-[40px] flex items-center gap-8">
         <div class="w-20 h-20 rounded-3xl bg-amber-500 flex items-center justify-center text-black">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
         </div>
         <div>
            <h4 class="text-xl font-bold text-amber-500 uppercase tracking-tighter">Level 4 Master Architect</h4>
            <p class="text-slate-400 text-sm max-w-xl leading-relaxed">You've unlocked high-intensity direction mode. Your script analysis speed has improved by 22% this week. Keep the momentum.</p>
         </div>
      </div>
    </div>
  `;
}

function renderIdentity(container: HTMLElement) {
  container.innerHTML = `
    <div class="h-full flex flex-col p-12 space-y-12 animate-in zoom-in-95 duration-500">
       <div class="flex gap-12 items-start">
          <div class="w-64 h-80 rounded-[40px] bg-slate-800 border-8 border-slate-900 overflow-hidden shadow-2xl group relative cursor-pointer">
             <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400&h=600" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
             <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                <span class="text-white text-[10px] font-black uppercase tracking-widest bg-red-600 px-4 py-2 rounded-full">Update Headshot</span>
             </div>
          </div>
          <div class="space-y-6 flex-1">
             <div class="flex justify-between items-start">
                <div>
                   <h2 class="text-7xl font-black text-white tracking-tighter">GOPINATH</h2>
                   <p class="text-2xl text-amber-500 font-medium tracking-tight">Actor | Emerging Director | Screenwriter</p>
                </div>
                <button class="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500 transition-all text-blue-500"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg></button>
             </div>
             
             <div class="flex flex-wrap gap-3">
                ${['Method Acting', 'Kurosawa Fan', 'Indie Cinema', 'Dialogue First', 'Dubbing Pro'].map(s => `
                   <span class="px-5 py-2.5 bg-slate-950 border border-slate-800 rounded-full text-xs font-bold text-slate-400 tracking-wide">${s}</span>
                `).join('')}
             </div>

             <div class="p-8 bg-slate-900/40 border border-slate-800 rounded-[40px] space-y-4">
                <h3 class="text-sm font-bold text-slate-500 uppercase tracking-widest">Career Vision</h3>
                <p class="text-slate-200 text-lg font-medium leading-relaxed italic">"To tell stories that breathe in the silence of the night. Crafting cinema that doesn't just show, but makes you feel the weight of existence."</p>
             </div>
          </div>
       </div>

       <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <section class="md:col-span-2 bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 space-y-6">
             <h3 class="text-xl font-bold flex items-center gap-3">
                <div class="w-2 h-6 bg-red-600 rounded-full"></div> Portfolio Reel
             </h3>
             <div class="aspect-video rounded-[32px] bg-slate-950 border border-slate-800 flex items-center justify-center group cursor-pointer overflow-hidden relative">
                <img src="https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800" class="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div class="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform relative z-10"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg></div>
             </div>
          </section>

          <section class="bg-slate-900/40 border border-slate-800 rounded-[40px] p-10 space-y-8">
             <h3 class="text-xl font-bold">Industry Feed</h3>
             <div class="space-y-4">
                ${[
                  { role: "Lead Actor", film: "The Red Cue", loc: "Chennai" },
                  { role: "Script Writer", film: "Web Series X", loc: "Remote" }
                ].map(item => `
                   <div class="p-5 bg-slate-950/60 border border-slate-800 rounded-3xl hover:border-amber-500/50 cursor-pointer transition-all group">
                      <p class="text-[10px] font-black text-amber-500 uppercase mb-1">Casting Call</p>
                      <h5 class="font-bold text-white">${item.role}</h5>
                      <p class="text-xs text-slate-600">${item.film} • ${item.loc}</p>
                   </div>
                `).join('')}
             </div>
             <button class="w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase transition-all tracking-widest">Discover Opportunities</button>
          </section>
       </div>
    </div>
  `;
}

// --- Global Utilities & Listeners ---

(window as any).setMode = (mode: AppMode) => {
  if (currentMode === mode) return;
  currentMode = mode;
  
  // Update sidebar active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const btnMode = btn.getAttribute('data-mode');
    if (btnMode === mode) {
      btn.classList.add('bg-white', 'text-black', 'shadow-2xl', 'scale-105');
      btn.classList.remove('text-slate-400');
    } else {
      btn.classList.remove('bg-white', 'text-black', 'shadow-2xl', 'scale-105');
      btn.classList.add('text-slate-400');
    }
  });

  render();
};

(window as any).toggleHabit = (index: number) => {
  userStats.habits[index].done = !userStats.habits[index].done;
  render();
};

(window as any).selectEmotion = (emotion: string, el: HTMLElement) => {
  document.querySelectorAll('.emotion-chip').forEach(c => c.classList.remove('bg-amber-500', 'text-black', 'border-amber-500'));
  el.classList.add('bg-amber-500', 'text-black', 'border-amber-500');
};

// Initial Render
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.getAttribute('data-mode') as AppMode;
    (window as any).setMode(mode);
  });
});

render();
