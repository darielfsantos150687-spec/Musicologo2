// src/AudioEngine.js
// Motor de audio de Radio Musicólogos

export const EQ_BANDS = [
  { label: "50 Hz", frequency: 50 },
  { label: "125 Hz", frequency: 125 },
  { label: "315 Hz", frequency: 315 },
  { label: "750 Hz", frequency: 750 },
  { label: "2.2 kHz", frequency: 2200 },
  { label: "6 kHz", frequency: 6000 },
  { label: "16 kHz", frequency: 16000 },
];

export class AudioEngine {
  constructor() {
    this.context = null;
    this.source = null;
    this.audioElement = null;

    this.filters = [];
    this.analyser = null;
    this.masterGain = null;
    this.subGain = null;
    this.panner = null;

    this.eqEnabled = true;
    this.eqValues = Array(7).fill(0);
    this.volume = 0.8;
    this.subLevel = 0;
    this.balance = 0;

    this.initialized = false;
  }

  async initialize(audioElement) {
    if (!audioElement) {
      throw new Error("No se encontró el elemento de audio.");
    }

    // Evita conectar dos veces el mismo elemento.
    if (this.initialized) {
      if (audioElement !== this.audioElement) {
        throw new Error(
          "El motor ya está conectado a otro elemento de audio."
        );
      }

      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      return;
    }

    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (!AudioContextClass) {
      throw new Error(
        "Este navegador no admite Web Audio API."
      );
    }

    this.context = new AudioContextClass();
    this.audioElement = audioElement;

    this.source =
      this.context.createMediaElementSource(audioElement);

    // Control general de volumen.
    this.masterGain = this.context.createGain();
    this.masterGain.gain.value = this.volume;

    // Control adicional de graves.
    this.subGain = this.context.createBiquadFilter();
    this.subGain.type = "lowshelf";
    this.subGain.frequency.value = 60;
    this.subGain.gain.value = this.subLevel;

    // Ecualizador gráfico de siete bandas.
    this.filters = EQ_BANDS.map(({ frequency }) => {
      const filter = this.context.createBiquadFilter();

      filter.type = "peaking";
      filter.frequency.value = frequency;
      filter.Q.value = 1.1;
      filter.gain.value = 0;

      return filter;
    });

    // Balance izquierda/derecha.
    this.panner = this.context.createStereoPanner();
    this.panner.pan.value = this.balance;

    // Analizador para visualizar el sonido.
    this.analyser = this.context.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.82;

    // Cadena de procesamiento.
    let previousNode = this.source;

    previousNode.connect(this.subGain);
    previousNode = this.subGain;

    for (const filter of this.filters) {
      previousNode.connect(filter);
      previousNode = filter;
    }

    previousNode.connect(this.panner);
    this.panner.connect(this.analyser);
    this.analyser.connect(this.masterGain);
    this.masterGain.connect(this.context.destination);

    this.initialized = true;

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  ensureInitialized() {
    if (!this.initialized) {
      throw new Error(
        "Primero debes inicializar el motor con un elemento de audio."
      );
    }
  }

  async resume() {
    this.ensureInitialized();

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  setVolume(value) {
    this.volume = this.clamp(value, 0, 1);

    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.015
      );
    }
  }

  setSubLevel(value) {
    this.subLevel = this.clamp(value, -12, 12);

    if (this.subGain) {
      this.subGain.gain.setTargetAtTime(
        this.subLevel,
        this.context.currentTime,
        0.015
      );
    }
  }

  setBand(index, value) {
    if (index < 0 || index >= this.filters.length && this.initialized) {
      return;
    }

    if (index < 0 || index >= EQ_BANDS.length) {
      return;
    }

    this.eqValues[index] = this.clamp(value, -12, 12);

    if (this.filters[index]) {
      this.applyBand(index);
    }
  }

  applyBand(index) {
    if (!this.filters[index]) return;

    const gain = this.eqEnabled
      ? this.eqValues[index]
      : 0;

    this.filters[index].gain.setTargetAtTime(
      gain,
      this.context.currentTime,
      0.015
    );
  }

  setEQEnabled(enabled) {
    this.eqEnabled = Boolean(enabled);

    if (!this.initialized) return;

    this.filters.forEach((_, index) => {
      this.applyBand(index);
    });
  }

  resetEQ() {
    this.eqValues = Array(7).fill(0);

    if (this.initialized) {
      this.filters.forEach((_, index) => {
        this.applyBand(index);
      });
    }
  }

  setBalance(value) {
    this.balance = this.clamp(value, -1, 1);

    if (this.panner) {
      this.panner.pan.setTargetAtTime(
        this.balance,
        this.context.currentTime,
        0.015
      );
    }
  }

  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);

    const data = new Uint8Array(
      this.analyser.frequencyBinCount
    );

    this.analyser.getByteFrequencyData(data);

    return data;
  }

  getWaveformData() {
    if (!this.analyser) return new Uint8Array(0);

    const data = new Uint8Array(
      this.analyser.fftSize
    );

    this.analyser.getByteTimeDomainData(data);

    return data;
  }

  getBassLevel() {
    if (!this.analyser || !this.context) return 0;

    const data = this.getFrequencyData();
    const nyquist = this.context.sampleRate / 2;

    const lowIndex = Math.floor((30 / nyquist) * data.length);
    const highIndex = Math.ceil((150 / nyquist) * data.length);

    let total = 0;
    let count = 0;

    for (
      let i = Math.max(0, lowIndex);
      i < Math.min(data.length, highIndex);
      i++
    ) {
      total += data[i];
      count++;
    }

    return count ? total / count / 255 : 0;
  }

  getSettings() {
    return {
      volume: this.volume,
      subLevel: this.subLevel,
      balance: this.balance,
      eqEnabled: this.eqEnabled,
      eqValues: [...this.eqValues],
    };
  }

  loadSettings(settings = {}) {
    if (typeof settings.volume === "number") {
      this.setVolume(settings.volume);
    }

    if (typeof settings.subLevel === "number") {
      this.setSubLevel(settings.subLevel);
    }

    if (typeof settings.balance === "number") {
      this.setBalance(settings.balance);
    }

    if (Array.isArray(settings.eqValues)) {
      settings.eqValues.slice(0, 7).forEach((value, index) => {
        if (typeof value === "number") {
          this.setBand(index, value);
        }
      });
    }

    if (typeof settings.eqEnabled === "boolean") {
      this.setEQEnabled(settings.eqEnabled);
    }
  }

  clamp(value, min, max) {
    const number = Number(value);

    if (!Number.isFinite(number)) return min;

    return Math.min(max, Math.max(min, number));
  }

  async destroy() {
    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }

    this.context = null;
    this.source = null;
    this.audioElement = null;
    this.filters = [];
    this.analyser = null;
    this.masterGain = null;
    this.subGain = null;
    this.panner = null;
    this.initialized = false;
  }
}

export default AudioEngine;