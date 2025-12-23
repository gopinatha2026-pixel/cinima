
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
// Fixed: Added Image as ImageIcon to imports to resolve the reference error on line 148
import { Upload, Wand2, RefreshCcw, Download, X, Image as ImageIcon } from 'lucide-react';
import { fileToBase64 } from '../utils/audio-helpers';

const ImageEditor: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setOriginalImage(`data:${file.type};base64,${base64}`);
      setEditedImage(null);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) return;

    setIsProcessing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const base64Data = originalImage.split(',')[1];
      const mimeType = originalImage.split(';')[0].split(':')[1];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: base64Data, mimeType } },
            { text: prompt }
          ],
        },
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setEditedImage(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (err) {
      console.error('Editing error:', err);
      alert('Failed to edit image. Check your prompt or image.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setEditedImage(null);
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Nano Banana Editor</h2>
          <p className="text-slate-400">Edit images using Gemini 2.5 Flash Image.</p>
        </div>
        {(originalImage || editedImage) && (
          <button 
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <RefreshCcw size={18} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {!originalImage ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 border-2 border-dashed border-slate-700 rounded-3xl flex flex-col items-center justify-center space-y-4 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer transition-all min-h-[400px]"
        >
          <div className="p-4 bg-blue-500/10 rounded-2xl">
            <Upload size={48} className="text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">Upload an image</p>
            <p className="text-slate-500">Drag and drop or click to browse</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange} 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Target Image</h3>
            <div className="relative group aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
              <img src={originalImage} alt="Original" className="max-h-full max-w-full object-contain" />
            </div>
            
            <div className="space-y-4 pt-4">
              <label className="block text-sm font-medium text-slate-400">Transformation Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., 'Add a red cyberpunk motorcycle next to the character' or 'Change the background to a sunset beach'"
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
              <button
                disabled={isProcessing || !prompt}
                onClick={handleEdit}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-lg transition-all ${
                  isProcessing || !prompt 
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/30'
                }`}
              >
                {isProcessing ? (
                  <>
                    <RefreshCcw size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Wand2 size={20} />
                    <span>Generate Edit</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-300">Result</h3>
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
              {editedImage ? (
                <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain" />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-600">
                  <ImageIcon size={64} className="mb-4 opacity-20" />
                  <p>Awaiting generation...</p>
                </div>
              )}
            </div>
            {editedImage && (
              <a
                href={editedImage}
                download="gemini-edit.png"
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-center gap-2 font-bold text-white transition-all"
              >
                <Download size={20} />
                <span>Download Result</span>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditor;
