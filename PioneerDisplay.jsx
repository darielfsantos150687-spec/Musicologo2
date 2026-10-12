import React from 'react';

export const PioneerDisplay = ({ trackName, isPlaying, volume, subLevel }) => {
  return (
    <div className="bg-black border-2 border-cyan-500/50 rounded-md p-3 text-cyan-400 font-mono shadow-[inset_0_0_15px_rgba(6,182,212,0.3)]">
      <div className="flex justify-between text-xs text-cyan-600 border-b border-cyan-900 pb-1 mb-2">
        <span>PIONEER DEH-4250BT</span>
        <span>{isPlaying ? '▶ REPRODUCIENDO' : '⏸ PAUSADO'}</span>
      </div>
      <div className="h-10 flex items-center overflow-hidden whitespace-nowrap">
        <div className="animate-marquee text-sm font-bold tracking-wider text-cyan-300">
          {trackName || 'CARGUE UN ARCHIVO LOCAL (USB/AUX) ···'}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-cyan-500 mt-2 pt-1 border-t border-cyan-900/50">
        <span>VOL: {Math.round(volume * 100)}%</span>
        <span>SUB: {Math.round(subLevel * 100)}%</span>
        <span>USB: {trackName ? 'ACTIVO' : 'STANDBY'}</span>
      </div>
    </div>
  );
};
