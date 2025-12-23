
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, Blob, LiveServerMessage } from '@google/genai';
import { Mic, MicOff, Volume2, Info } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../utils/audio-helpers';

const LiveVoice: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState('Ready to talk');
  const [history, setHistory] = useState<string[]>([]);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close?.();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('Conversation ended');
    
    // Stop all playing sounds
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
  }, []);

  const startSession = async () => {
    try {
      setStatus('Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioContext;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Listening...');
            setIsActive(true);
            
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob: Blob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = outputAudioContext;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              
              const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e) => {
            console.error('Live API Error:', e);
            setStatus('Connection error');
          },
          onclose: () => {
            setIsActive(false);
          },
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are a highly helpful and concise conversational assistant. Use a warm, natural voice.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to access microphone');
    }
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, [stopSession]);

  return (
    <div className="flex flex-col h-full items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-white">Gemini Live Voice</h2>
          <p className="text-slate-400">Experience low-latency, real-time conversation.</p>
        </div>

        <div className="relative flex justify-center items-center">
          <div className={`absolute inset-0 bg-blue-500/20 rounded-full blur-3xl transition-opacity duration-500 ${isActive ? 'opacity-100 animate-pulse' : 'opacity-0'}`} />
          <button
            onClick={isActive ? stopSession : startSession}
            className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-500 shadow-2xl ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 scale-105' 
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            }`}
          >
            {isActive ? (
              <MicOff size={64} className="text-white mb-2" />
            ) : (
              <Mic size={64} className="text-white mb-2" />
            )}
            <span className="font-bold text-white uppercase tracking-widest text-sm">
              {isActive ? 'Stop' : 'Start'}
            </span>
          </button>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className={`px-4 py-2 rounded-full border ${isActive ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
              <span className="font-medium">{status}</span>
            </div>
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-left w-full">
            <div className="flex items-start gap-3 text-slate-400 text-sm">
              <Info size={18} className="shrink-0 mt-0.5" />
              <p>The model streams audio directly back to you. Make sure your volume is turned up and microphone permissions are granted.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVoice;
