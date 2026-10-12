import React from 'react';
import { audioEngine } from '../services/audioEngine';

const BANDS = [
  { label: '50Hz', index: 0 },
  { label: '125Hz', index: 1 },
  { label: '316Hz', index: 2 },
  { label: '750Hz', index: 3 },
  { label: '2.2K', index: 4 },
  { label: '6KHz', index: 5 },
  { label: '16KHz', index: 6 },
];

export const EqualizerPanel = () => {
  const handleSliderChange = (index, e) => {
    const val = parseFloat(e.target.value);
    audioEngine.setBandGain(index, val);
  };

  return (
    <div className="grid grid-cols-7 gap-2 bg-neutral-900 p-3 rounded-lg border border-neutral-800">
      {BANDS.map((band) => (
        <div key={band.index} className="flex flex-col items-center">
          <span className="text-[10px] text-neutral-400 mb-1">{band.label}</span>
          <input
            type="range"
            min="-12"
            max="12"
            step="0.5"
            defaultValue="0"
            onChange={(e) => handleSliderChange(band.index, e)}
            className="h-24 accent-cyan-500 cursor-pointer [writing-mode:vertical-lr] [direction:rtl]"
          />
          <span className="text-[9px] text-neutral-500 mt-1">dB</span>
        </div>
      ))}
    </div>
  );
};
