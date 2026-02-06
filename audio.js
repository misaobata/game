// ============================================
// Audio System - Sound Effects Generator
// Uses Web Audio API to generate retro sounds
// ============================================

class AudioSystem {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    this.init();
  }
  
  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }
  
  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }
  
  // Play a tone with given frequency and duration
  playTone(freq, duration, type = 'square', volumeMod = 1) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.type = type;
    osc.frequency.value = freq;
    
    const vol = this.volume * volumeMod;
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + duration);
  }
  
  // Play multiple tones in sequence
  playSequence(notes, noteLength = 0.1) {
    if (!this.enabled || !this.ctx) return;
    
    notes.forEach((note, i) => {
      setTimeout(() => {
        if (Array.isArray(note)) {
          this.playTone(note[0], note[1] || noteLength, note[2] || 'square');
        } else {
          this.playTone(note, noteLength);
        }
      }, i * noteLength * 1000);
    });
  }
  
  // === Sound Effects ===
  
  // Menu cursor move
  cursor() {
    this.playTone(800, 0.05, 'square', 0.5);
  }
  
  // Menu select
  select() {
    this.playSequence([[600, 0.08], [800, 0.08]], 0.08);
  }
  
  // Cancel/back
  cancel() {
    this.playTone(300, 0.1, 'square', 0.5);
  }
  
  // Player attack
  attack() {
    this.playTone(200, 0.05, 'sawtooth', 0.6);
    setTimeout(() => this.playTone(150, 0.1, 'sawtooth', 0.4), 50);
  }
  
  // Enemy attack / take damage
  damage() {
    this.playTone(100, 0.15, 'sawtooth', 0.5);
  }
  
  // Critical hit
  critical() {
    this.playSequence([[300, 0.05, 'sawtooth'], [200, 0.05, 'sawtooth'], [400, 0.1, 'sawtooth']], 0.05);
  }
  
  // Heal
  heal() {
    this.playSequence([[400, 0.1], [500, 0.1], [600, 0.15]], 0.1);
  }
  
  // Level up
  levelUp() {
    this.playSequence([
      [523, 0.15], [659, 0.15], [784, 0.15], [1047, 0.3]
    ], 0.15);
  }
  
  // Victory fanfare
  victory() {
    this.playSequence([
      [523, 0.1], [523, 0.1], [523, 0.1], [523, 0.3],
      [415, 0.3], [466, 0.3], [523, 0.2], [466, 0.1], [523, 0.5]
    ], 0.15);
  }
  
  // Defeat
  defeat() {
    this.playSequence([
      [400, 0.3], [350, 0.3], [300, 0.3], [250, 0.5]
    ], 0.3);
  }
  
  // Get item
  getItem() {
    this.playSequence([[600, 0.1], [800, 0.1], [1000, 0.15]], 0.1);
  }
  
  // Open chest
  chest() {
    this.playSequence([[400, 0.15], [600, 0.15], [800, 0.2]], 0.15);
  }
  
  // Door unlock
  unlock() {
    this.playSequence([[300, 0.1], [400, 0.1], [500, 0.1], [600, 0.2]], 0.1);
  }
  
  // Encounter enemy
  encounter() {
    this.playSequence([
      [200, 0.1, 'sawtooth'], [250, 0.1, 'sawtooth'], 
      [200, 0.1, 'sawtooth'], [300, 0.2, 'sawtooth']
    ], 0.1);
  }
  
  // Step/walk
  step() {
    this.playTone(100 + Math.random() * 50, 0.03, 'triangle', 0.2);
  }
  
  // Dialogue text
  text() {
    this.playTone(600 + Math.random() * 200, 0.02, 'square', 0.15);
  }
  
  // Boss appear
  bossAppear() {
    this.playSequence([
      [150, 0.2, 'sawtooth'], [100, 0.3, 'sawtooth'],
      [150, 0.2, 'sawtooth'], [100, 0.5, 'sawtooth']
    ], 0.25);
  }
  
  // Party member join
  partyJoin() {
    this.playSequence([
      [523, 0.1], [659, 0.1], [784, 0.1],
      [659, 0.1], [784, 0.1], [1047, 0.3]
    ], 0.12);
  }
  
  // Quest complete
  questComplete() {
    this.playSequence([
      [523, 0.15], [659, 0.15], [784, 0.2],
      [784, 0.1], [1047, 0.4]
    ], 0.15);
  }
  
  // Game clear
  gameClear() {
    this.playSequence([
      [523, 0.2], [523, 0.1], [523, 0.1], [523, 0.3],
      [415, 0.3], [466, 0.3], [523, 0.2],
      [659, 0.2], [784, 0.3], [1047, 0.5]
    ], 0.2);
  }
}

// Export
window.AudioSystem = AudioSystem;

