
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Video, Upload, Play, Loader2, Key, Download } from 'lucide-react';
import { fileToBase64 } from '../utils/audio-helpers';

const VideoGenerator: React.FC = () => {
  const [hasKey, setHasKey] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      const active = await (window as any).aistudio?.hasSelectedApiKey();
      setHasKey(!!active);
    };
    checkKey();
  }, []);

  const openKeySelection = async () => {
    await (window as any).aistudio?.openSelectKey();
    setHasKey(true); // Proceed assuming success per requirements
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setImage(`data:${file.type};base64,${base64}`);
    }
  };

  const generateVideo = async () => {
    if (!image && !prompt) return;

    setIsGenerating(true);
    setStatus('Initializing generation...');
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const payload: any = {
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt || 'A cinematic high-quality animation',
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio,
        }
      };

      if (image) {
        payload.image = {
          imageBytes: image.split(',')[1],
          mimeType: image.split(';')[0].split(':')[1],
        };
      }

      let operation = await ai.models.generateVideos(payload);
      
      const messages = [
        "Capturing cinematic essence...",
        "Simulating physics...",
        "Rendering high-fidelity frames...",
        "Finishing touches...",
        "Optimizing for your view..."
      ];
      
      let msgIndex = 0;
      while (!operation.done) {
        setStatus(messages[msgIndex % messages.length]);
        msgIndex++;
        await new Promise(resolve => setTimeout(resolve, 8000));
        operation = await (ai as any).operations.getVideosOperation({ operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await videoResponse.blob();
        setVideoUrl(URL.createObjectURL(blob));
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      alert('Video generation failed. Please check your project billing or try again.');
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  if (!hasKey) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-6 text-center">
        <div className="bg-amber-500/10 p-6 rounded-full">
          <Key size={64} className="text-amber-500" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-bold">API Key Required for Veo</h2>
          <p className="text-slate-400">
            Veo video generation requires a paid API key from a Google Cloud project. 
            Please select an authorized project to continue.
          </p>
          <p className="text-xs text-slate-500 mt-2">
            See <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-500 underline">billing documentation</a>.
          </p>
        </div>
        <button 
          onClick={openKeySelection}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg"
        >
          Select Project API Key
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">Veo Video Studio</h2>
        <p className="text-slate-400">Transform static photos or prompts into high-quality videos.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Start with Image (Optional)</h3>
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-video border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer transition-all"
              >
                <Upload size={32} className="text-slate-500 mb-2" />
                <p className="text-slate-400">Reference Photo</p>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            ) : (
              <div className="relative group aspect-video rounded-2xl overflow-hidden border border-slate-800">
                <img src={image} alt="Ref" className="w-full h-full object-cover" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-red-500 text-white rounded-full transition-colors"
                >
                  <Upload size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Prompt & Settings</h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the action... e.g., 'A dramatic camera zoom as the character smiles at the sunset'"
              className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={() => setAspectRatio('16:9')}
                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${aspectRatio === '16:9' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                Landscape (16:9)
              </button>
              <button 
                onClick={() => setAspectRatio('9:16')}
                className={`flex-1 py-3 rounded-lg border flex items-center justify-center gap-2 transition-all ${aspectRatio === '9:16' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
              >
                Portrait (9:16)
              </button>
            </div>

            <button
              disabled={isGenerating || (!image && !prompt)}
              onClick={generateVideo}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg transition-all ${
                isGenerating || (!image && !prompt)
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/30'
              }`}
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Play size={20} />}
              {isGenerating ? 'Generating...' : 'Start Production'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-slate-300">Final Cut</h3>
          <div className={`relative ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'} w-full max-w-[500px] mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800 shadow-2xl`}>
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay loop className="w-full h-full object-cover" />
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 border-4 border-t-blue-500 border-slate-800 rounded-full animate-spin mb-6" />
                <p className="text-white font-medium mb-2">{status}</p>
                <p className="text-slate-500 text-sm">This can take up to 2 minutes. Please stay on this page.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-600">
                <Video size={64} className="mb-4 opacity-10" />
                <p>Awaiting production...</p>
              </div>
            )}
          </div>
          {videoUrl && (
            <a
              href={videoUrl}
              download="veo-masterpiece.mp4"
              className="w-full max-w-[500px] mx-auto py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all mt-4"
            >
              <Download size={20} />
              <span>Save Video</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
