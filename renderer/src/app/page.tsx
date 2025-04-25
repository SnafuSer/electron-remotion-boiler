'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('💤 Waiting to start...');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatus('⏳ Generating video...');
    try {
      const videoPath = await window.electronAPI.generateVideo({ text: 'Hello from Electron Remotion Boilerplate!' });
      setStatus(`✅ Video successfully generated at: ${videoPath}`);
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed to generate the video.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleViewLogs = async () => {
    await window.electronAPI.openLogFile();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
      <h1 className="text-3xl font-bold">Electron Remotion Boilerplate</h1>

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={`px-6 py-3 rounded-2xl font-semibold shadow-md transition ${
            isGenerating
              ? 'bg-blue-300 cursor-not-allowed text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          🎬 Generate Video
        </button>

        <button
          onClick={handleViewLogs}
          className="px-6 py-3 rounded-2xl bg-gray-600 hover:bg-gray-700 text-white font-semibold shadow-md transition"
        >
          📄 Open Log File
        </button>
      </div>

      <p className="mt-6 text-lg">{status}</p>
    </main>
  );
}
