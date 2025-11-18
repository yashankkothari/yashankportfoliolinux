import React, { useState, useRef } from 'react';
import { editImageWithGemini } from '../services/geminiService';

interface ImageEditorProps {
  onClose: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !prompt) return;

    setLoading(true);
    setError(null);
    try {
      const result = await editImageWithGemini(selectedImage, prompt);
      if (result) {
        setGeneratedImage(result);
      } else {
        setError("Failed to generate image. No data returned.");
      }
    } catch (err) {
        console.error(err);
      setError("Error processing image. Ensure API key is valid and model is available.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-purple-500 p-4 mt-2 mb-4 rounded bg-slate-900/80 max-w-3xl">
      <div className="flex justify-between items-center mb-4 border-b border-purple-500/30 pb-2">
        <h3 className="text-purple-400 font-bold text-lg">>> NANO_BANANA_IMG_EDITOR_V2.5</h3>
        <button onClick={onClose} className="text-red-400 hover:text-red-300 font-bold">[X] CLOSE</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase">Source Input</label>
          <div 
            className="border-2 border-dashed border-gray-600 rounded h-48 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
          >
            {selectedImage ? (
              <img src={selectedImage} alt="Source" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-500 text-sm text-center p-2">
                [CLICK TO UPLOAD]<br/>Target Subject
              </span>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>

        {/* Output Section */}
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-400 uppercase">Processed Output</label>
          <div className="border border-gray-600 rounded h-48 flex items-center justify-center bg-black/50 relative">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                 <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-purple-400 text-xs animate-pulse">PROCESSING_PIXELS...</span>
              </div>
            ) : generatedImage ? (
              <img src={generatedImage} alt="Generated" className="w-full h-full object-contain" />
            ) : (
              <span className="text-gray-600 text-xs">[AWAITING_DATA]</span>
            )}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex flex-col gap-2">
        <label className="text-xs text-purple-400">PROMPT_COMMAND:</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Add a cyberpunk neon filter, make it look like a sketch..."
            className="flex-1 bg-black border border-purple-500/50 p-2 text-sm text-purple-200 focus:outline-none focus:border-purple-400 placeholder-gray-700"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button 
            onClick={handleGenerate}
            disabled={!selectedImage || !prompt || loading}
            className={`px-4 py-2 text-sm font-bold uppercase border ${
              !selectedImage || !prompt || loading
                ? 'border-gray-700 text-gray-700 cursor-not-allowed'
                : 'border-purple-500 text-purple-400 hover:bg-purple-500/20'
            }`}
          >
            EXECUTE
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">! ERROR: {error}</p>}
      </div>
    </div>
  );
};

export default ImageEditor;
