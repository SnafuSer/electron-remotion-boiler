'use client';

import { useState } from 'react';

export default function Home() {
  const [status, setStatus] = useState('💤 En attente');

  const handleGenerate = async () => {
    setStatus('⏳ Génération...');
    const videoPath = await window.electronAPI.generateVideo({ text: 'Hello ClipForge!' });
    setStatus(`✅ Vidéo générée : ${videoPath}`);
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>ClipForge</h1>
      <button onClick={handleGenerate}>🎬 Générer une vidéo</button>
      <button onClick={() => window.electronAPI.openLogFile()}>
        📄 Voir les logs
      </button>
      <p>{status}</p>
    </main>
  );
}
