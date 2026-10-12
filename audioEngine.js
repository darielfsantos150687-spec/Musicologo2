class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.audioElement = null;
    this.sourceNode = null;
    this.analyser = null;
    this.filters = [];
    this.subGainNode = null;
    this.masterGainNode = null;

    // Frecuencias exactas del modelo Pioneer DEH
    this.frequencies = [50, 125, 316, 750, 2200, 6000, 16000];
  }

  init() {
    if (this.audioContext) return;
    
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new AudioContextClass();

    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous";

    this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;

    // Crear nodos de ecualización (BiquadFilterNode de tipo peaking)
    let lastNode = this.sourceNode;
    this.filters = this.frequencies.map(freq => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      filter.Q.setValueAtTime(1.4, this.audioContext.currentTime);
      filter.gain.setValueAtTime(0, this.audioContext.currentTime);
      
      lastNode.connect(filter);
      lastNode = filter;
      return filter;
    });

    // Nodo para Sub Level de Bajos
    this.subGainNode = this.audioContext.createGain();
    this.subGainNode.gain.setValueAtTime(1.0, this.audioContext.currentTime);
    lastNode.connect(this.subGainNode);

    // Nodo Master Volume
    this.masterGainNode = this.audioContext.createGain();
    this.subGainNode.connect(this.masterGainNode);
    this.masterGainNode.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }

  loadTrack(fileObject) {
    this.init();
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    const fileURL = URL.createObjectURL(fileObject);
    this.audioElement.src = fileURL;
    this.audioElement.load();
    return this.audioElement.play();
  }

  playPause() {
    if (!this.audioElement) return false;
    if (this.audioElement.paused) {
      this.audioElement.play();
      return true;
    } else {
      this.audioElement.pause();
      return false;
    }
  }

  setBandGain(index, gainValue) {
    if (this.filters[index]) {
      this.filters[index].gain.setValueAtTime(gainValue, this.audioContext.currentTime);
    }
  }

  setSubLevel(value) {
    if (this.subGainNode) {
      this.subGainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
    }
  }

  setVolume(value) {
    if (this.masterGainNode) {
      this.masterGainNode.gain.setValueAtTime(value, this.audioContext.currentTime);
    }
  }

  getBassEnergy() {
    if (!this.analyser) return 0;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < 5; i++) {
      sum += dataArray[i];
    }
    return sum / 5;
  }
}

export const audioEngine = new AudioEngine();
