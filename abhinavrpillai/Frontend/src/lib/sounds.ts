"use client";

// Plays a quiet tactile mechanical keyboard click sound
export const playKeycapClick = () => {
  if (typeof window === "undefined") return;
  
  try {
    const audio = new Audio("/assets/keycap-sounds/press.mp3");
    audio.volume = 0.05; // 5% volume for a subtle, satisfying click
    audio.play().catch(() => {
      // Catch browser blocking audio play
    });
  } catch {
    // Avoid console log clutter
  }
};

// Plays a gentle anime inhale breath sound ("Ah... ah...")
export const playInhaleSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const duration = 0.38;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + duration);
    filter.Q.setValueAtTime(3.5, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.28);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  } catch {
    // Ignore audio errors
  }
};

// Plays an adorable crisp anime sneeze sound ("ACHOO! 🤧")
export const playSneezeSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // 1. Transient sharp "TCH" burst (consonant attack)
    const attackLen = Math.floor(ctx.sampleRate * 0.12);
    const attackBuffer = ctx.createBuffer(1, attackLen, ctx.sampleRate);
    const attackData = attackBuffer.getChannelData(0);
    for (let i = 0; i < attackLen; i++) {
      attackData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
    }
    const attackSource = ctx.createBufferSource();
    attackSource.buffer = attackBuffer;

    const attackFilter = ctx.createBiquadFilter();
    attackFilter.type = "highpass";
    attackFilter.frequency.setValueAtTime(3600, now);

    const attackGain = ctx.createGain();
    attackGain.gain.setValueAtTime(0.28, now);
    attackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    attackSource.connect(attackFilter);
    attackFilter.connect(attackGain);
    attackGain.connect(ctx.destination);
    attackSource.start(now);

    // 2. Vocal Formant Tone ("-OO!" squeak)
    const vocalOsc = ctx.createOscillator();
    const vocalFilter = ctx.createBiquadFilter();
    const vocalGain = ctx.createGain();

    vocalOsc.type = "sawtooth";
    vocalOsc.frequency.setValueAtTime(900, now);
    vocalOsc.frequency.exponentialRampToValueAtTime(340, now + 0.18);

    vocalFilter.type = "lowpass";
    vocalFilter.frequency.setValueAtTime(2200, now);
    vocalFilter.frequency.exponentialRampToValueAtTime(750, now + 0.2);
    vocalFilter.Q.setValueAtTime(4, now);

    vocalGain.gain.setValueAtTime(0.18, now);
    vocalGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    vocalOsc.connect(vocalFilter);
    vocalFilter.connect(vocalGain);
    vocalGain.connect(ctx.destination);
    vocalOsc.start(now);
    vocalOsc.stop(now + 0.24);

    // 3. Trailing breath puff ("-HHH" release)
    const puffLen = Math.floor(ctx.sampleRate * 0.28);
    const puffBuffer = ctx.createBuffer(1, puffLen, ctx.sampleRate);
    const puffData = puffBuffer.getChannelData(0);
    for (let i = 0; i < puffLen; i++) {
      puffData[i] = Math.random() * 2 - 1;
    }
    const puffSource = ctx.createBufferSource();
    puffSource.buffer = puffBuffer;

    const puffFilter = ctx.createBiquadFilter();
    puffFilter.type = "bandpass";
    puffFilter.frequency.setValueAtTime(1800, now);
    puffFilter.frequency.exponentialRampToValueAtTime(900, now + 0.25);
    puffFilter.Q.setValueAtTime(2, now);

    const puffGain = ctx.createGain();
    puffGain.gain.setValueAtTime(0.2, now);
    puffGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    puffSource.connect(puffFilter);
    puffFilter.connect(puffGain);
    puffGain.connect(ctx.destination);
    puffSource.start(now);
  } catch {
    // Ignore audio errors
  }
};

// ============================================================================
// Indian Classical "Sa Re Ga Ma Pa Dha Ni Sa" Musical Scale Generator
// ============================================================================

export const SARGAM_NOTES = [
  { note: "Sa", freq: 261.63 }, // C4
  { note: "Re", freq: 293.66 }, // D4
  { note: "Ga", freq: 329.63 }, // E4
  { note: "Ma", freq: 349.23 }, // F4
  { note: "Pa", freq: 392.00 }, // G4
  { note: "Dha", freq: 440.00 }, // A4
  { note: "Ni", freq: 493.88 }, // B4
  { note: "Sa'", freq: 523.25 }, // C5
  { note: "Re'", freq: 587.33 }, // D5
  { note: "Ga'", freq: 659.25 }, // E5
  { note: "Ma'", freq: 698.46 }, // F5
  { note: "Pa'", freq: 783.99 }, // G5
  { note: "Dha'", freq: 880.00 }, // A5
  { note: "Ni'", freq: 987.77 }, // B5
  { note: "Sa''", freq: 1046.50 }, // C6
];

let sharedSargamCtx: AudioContext | null = null;

function getSargamContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedSargamCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedSargamCtx = new AudioCtx();
    }
  }
  if (sharedSargamCtx && sharedSargamCtx.state === "suspended") {
    sharedSargamCtx.resume();
  }
  return sharedSargamCtx;
}

/**
 * Plays a warm, soothing Indian Classical "Sa Re Ga Ma Pa" bell chime for the given skill index.
 */
export const playSargamNote = (index: number) => {
  try {
    const ctx = getSargamContext();
    if (!ctx) return;

    const noteItem = SARGAM_NOTES[Math.abs(index) % SARGAM_NOTES.length];
    const frequency = noteItem.freq;
    const now = ctx.currentTime;

    // 1. Fundamental warm sine tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.006); // Crisp, click-free attack
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45); // Gentle natural ring

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);

    // 2. Sweet melodic bell overtone (1st harmonic)
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = "triangle";
    overtone.frequency.setValueAtTime(frequency * 2, now);

    overtoneGain.gain.setValueAtTime(0.001, now);
    overtoneGain.gain.linearRampToValueAtTime(0.035, now + 0.004);
    overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    overtone.connect(overtoneGain);
    overtoneGain.connect(ctx.destination);
    overtone.start(now);
    overtone.stop(now + 0.25);
  } catch {
    // Graceful fallback
  }
};

// Plays a smooth skateboard rolling whoosh and energetic speed chime
export const playSkateRollSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // 1. Skateboard Wheel Rolling Rumble (textured pavement roll)
    const rollLen = Math.floor(ctx.sampleRate * 1.1);
    const rollBuf = ctx.createBuffer(1, rollLen, ctx.sampleRate);
    const rollData = rollBuf.getChannelData(0);
    for (let i = 0; i < rollLen; i++) {
      rollData[i] = (Math.random() * 2 - 1) * 0.45;
    }
    const rollSrc = ctx.createBufferSource();
    rollSrc.buffer = rollBuf;

    const rollFilter = ctx.createBiquadFilter();
    rollFilter.type = "lowpass";
    rollFilter.frequency.setValueAtTime(450, now);
    rollFilter.frequency.linearRampToValueAtTime(700, now + 0.5);
    rollFilter.frequency.linearRampToValueAtTime(320, now + 1.1);

    const rollGain = ctx.createGain();
    rollGain.gain.setValueAtTime(0.001, now);
    rollGain.gain.linearRampToValueAtTime(0.14, now + 0.1);
    rollGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.05);

    rollSrc.connect(rollFilter);
    rollFilter.connect(rollGain);
    rollGain.connect(ctx.destination);
    rollSrc.start(now);

    // 2. Upbeat Skater Speed Chime / Whoosh
    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();

    chimeOsc.type = "sine";
    chimeOsc.frequency.setValueAtTime(587.33, now + 0.08); // D5
    chimeOsc.frequency.exponentialRampToValueAtTime(880, now + 0.28); // A5

    chimeGain.gain.setValueAtTime(0.001, now);
    chimeGain.gain.linearRampToValueAtTime(0.12, now + 0.12);
    chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeOsc.start(now + 0.08);
    chimeOsc.stop(now + 0.48);
  } catch {
    // Ignore audio errors
  }
};

// Plays realistic skateboard Ollie pop & landing sound
export const playOllieSound = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;

    // 1. Ollie Tail Snap / Pop (Crisp wooden tail hit)
    const snapOsc = ctx.createOscillator();
    const snapGain = ctx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(220, now);
    snapOsc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

    snapGain.gain.setValueAtTime(0.28, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    snapOsc.connect(snapGain);
    snapGain.connect(ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.06);

    // 2. Air Whoosh
    const airLen = Math.floor(ctx.sampleRate * 0.35);
    const airBuf = ctx.createBuffer(1, airLen, ctx.sampleRate);
    const airData = airBuf.getChannelData(0);
    for (let i = 0; i < airLen; i++) {
      airData[i] = Math.random() * 2 - 1;
    }
    const airSrc = ctx.createBufferSource();
    airSrc.buffer = airBuf;

    const airFilter = ctx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.setValueAtTime(800, now);
    airFilter.frequency.exponentialRampToValueAtTime(1400, now + 0.2);
    airFilter.Q.setValueAtTime(3, now);

    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0.001, now);
    airGain.gain.linearRampToValueAtTime(0.12, now + 0.08);
    airGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    airSrc.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(ctx.destination);
    airSrc.start(now);

    // 3. Landing Wheels Thump (at ~0.65s when wheels touch ground)
    const landTime = now + 0.65;
    const landOsc = ctx.createOscillator();
    const landGain = ctx.createGain();
    landOsc.type = "triangle";
    landOsc.frequency.setValueAtTime(160, landTime);
    landOsc.frequency.exponentialRampToValueAtTime(40, landTime + 0.08);

    landGain.gain.setValueAtTime(0.001, now);
    landGain.gain.setValueAtTime(0.25, landTime);
    landGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.09);

    landOsc.connect(landGain);
    landGain.connect(ctx.destination);
    landOsc.start(landTime);
    landOsc.stop(landTime + 0.1);
  } catch {
    // Ignore audio errors
  }
};
