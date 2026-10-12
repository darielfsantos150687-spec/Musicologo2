import React, { useState, useEffect } from 'react';
import { audioEngine } from './services/audioEngine';
import { PioneerDisplay } from './components/PioneerDisplay';
import { EqualizerPanel } from './components/EqualizerPanel';

export function App() {
  const [trackName, setTrackName] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [subLevel, setSubLevel] = useState(1);
  const [blurActive, setBlurActive] = useState(true);
  const [streamingMode, setStreamingMode] = useState(false);
  const [bassPulse, setBassPulse] = useState(0);
  const [illumiColor, setIllumiColor] = useState('#06b6d4');

  useEffect(() => {
    let animationId;
    const updateVisuals = () => {
      if (isPlaying && blurActive) {
        const energy = audioEngine.getBassEnergy();
        setBassPulse(energy / 15);
      } else {
        setBassPulse(0);
      }
      animationId = requestAnimationFrame(updateVisuals);
    };
    animationId = requestAnimationFrame(updateVisuals);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying, blurActive]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTrackName(file.name);
      audioEngine.loadTrack(file).then(() => {
        setIsPlaying(true);
      }).catch(err => console.error("Error al reproducir archivo local:", err));
    }
  };

  const togglePlay = () => {
    const playingState = audioEngine.playPause();
    setIsPlaying(playingState);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    audioEngine.setVolume(val);
  };

  const handleSubChange = (e) => {
    const val = parseFloat(e.target.value);
    setSubLevel(val);
    audioEngine.setSubLevel(val);
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Fondo con Blur Reactivo a los Bajos */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none transition-all duration-75"
        style={{
          background: `radial-gradient(circle, ${illumiColor} 0%, transparent 70%)`,
          filter: `blur(${20 + bassPulse * 2}px)`,
          transform: `scale(${1 + bassPulse * 0.01})`
        }}
      />

      {/* Chasis Principal Radio Pioneer */}
      <div className="relative z-10 w-full max-w-xl bg-neutral-900 border-4 border-neutral-800 rounded-xl shadow-2xl p-5 flex flex-col gap-4">
        
        {/* Cabecera / Marca */}
        <div className="flex justify-between items-center px-1">
          <div className="text-xs font-bold tracking-widest text-neutral-400">PIONEER DEH-4250BT (LOCAL EDITION)</div>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: illumiColor }}></span>
            <span className="text-xs text-neutral-500">D'Ricky Diseño Style</span>
          </div>
        </div>

        {/* Pantalla LCD */}
        <PioneerDisplay trackName={trackName} isPlaying={isPlaying} volume={volume} subLevel={subLevel} />

        {/* Ecualizador Gráfico */}
        {!streamingMode ? (
          <EqualizerPanel />
        ) : (
          <div className="bg-neutral-950 p-6 rounded-lg text-center text-neutral-600 text-xs border border-neutral-800">
            🔒 MODO STREAMING ACTIVO (Seteos Ocultos)
          </div>
        )}

        {/* Controles de Audio y Archivos */}
        <div className="grid grid-cols-2 gap-4 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
          
          {/* Carga de Archivo Local */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] text-neutral-400 font-semibold">SELECCIONAR MÚSICA (LOCAL):</label>
            <input 
              type="file" 
              accept="audio/*" 
              onChange={handleFileUpload}
              className="text-xs text-neutral-400 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-500 cursor-pointer"
            />
            <button 
              onClick={togglePlay}
              disabled={!trackName}
              className="mt-2 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-cyan-400 font-bold rounded text-xs transition"
            >
              {isPlaying ? '⏸ PAUSAR' : '▶ REPRODUCIR'}
            </button>
          </div>

          {/* Perillas Generales de Volumen y Subwoofer */}
          <div className="flex flex-col justify-around gap-2">
            <div className="flex flex-col">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>VOLUMEN MASTER</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.01" value={volume} 
                onChange={handleVolumeChange}
                className="accent-cyan-500 cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>SUB LEVEL (BASS)</span>
                <span>{Math.round(subLevel * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="2" step="0.05" value={subLevel} 
                onChange={handleSubChange}
                className="accent-cyan-500 cursor-pointer"
              />
            </div>
          </div>

        </div>

        {/* Panel de Opciones y Configuración */}
        <div className="flex flex-wrap gap-2 justify-between items-center pt-2 border-t border-neutral-800 text-xs">
          
          <div className="flex items-center gap-2">
            <label className="text-neutral-400">Color Illumi:</label>
            <input 
              type="color" value={illumiColor} onChange={(e) => setIllumiColor(e.target.value)}
              className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setBlurActive(!blurActive)}
              className={`px-2.5 py-1 rounded border text-[11px] transition ${blurActive ? 'bg-cyan-950 border-cyan-600 text-cyan-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
            >
              Blur: {blurActive ? 'ON' : 'OFF'}
            </button>
            <button 
              onClick={() => setStreamingMode(!streamingMode)}
              className={`px-2.5 py-1 rounded border text-[11px] transition ${streamingMode ? 'bg-amber-950 border-amber-600 text-amber-300' : 'bg-neutral-800 border-neutral-700 text-neutral-400'}`}
            >
              Modo Streaming: {streamingMode ? 'ON' : 'OFF'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default App;
