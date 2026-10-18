// Frontend Logic for AI Voice Assistant and Dialer

let currentProfile = 'resume';
let isCalling = false;
let callTimerInterval = null;
let callStartTime = null;

// Audio context and nodes
let audioCtx = null;
let micStream = null;
let scriptProcessor = null;
let mediaStreamSource = null;
let ws = null;

// Local Voice Activity Detection (VAD) state for acknowledgement hum
let localUserSpeaking = false;
let lastVoiceTime = 0;
const VOICE_THRESHOLD = 0.015; // Volume threshold to detect user speaking

// Playback queue tracking
let nextPlayTime = 0;
let activeSources = [];
const GEMINI_OUTPUT_SAMPLE_RATE = 24000; // Gemini Live API outputs 24kHz audio

// Audio Visualizer Analyser Node
let analyser = null;
let canvas = null;
let canvasCtx = null;
let animationFrameId = null;

// Fetch config from server on load
document.addEventListener('DOMContentLoaded', () => {
  fetchConfiguration();
  canvas = document.getElementById('waveCanvas');
  canvasCtx = canvas.getContext('2d');
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  // Set default Lucide icon in phone avatar
  updatePhoneUI();
});

function resizeCanvas() {
  if (canvas) {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
  }
}

// Fetch configuration from the backend
async function fetchConfiguration() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    
    currentProfile = config.profile;
    document.getElementById('systemInstructions').value = config.instructions;
    document.getElementById('contextData').value = config.context;
    
    // Toggle active classes on profile buttons
    if (currentProfile === 'resume') {
      document.getElementById('btnResumeProfile').classList.add('active');
      document.getElementById('btnSupportProfile').classList.remove('active');
    } else {
      document.getElementById('btnSupportProfile').classList.add('active');
      document.getElementById('btnResumeProfile').classList.remove('active');
    }
    
    updatePhoneUI();
    updateSystemStatus("Ready");
  } catch (error) {
    console.error('Error fetching config:', error);
    updateSystemStatus("Config Load Error", true);
  }
}

// Select a profile and load its defaults locally (temporarily before save)
function selectProfile(profile) {
  currentProfile = profile;
  
  const resumeInstructions = "You are the candidate itself (first-person voice). Do NOT say you are an assistant, and do NOT say you are speaking on behalf of someone. Act directly as the person described in the Context Data. Answer all questions using 'I', 'me', and 'my' (e.g. 'I worked at...', 'My projects are...'). Answer extremely briefly and concisely (1 to 2 short sentences max). Do not give long answers. Get straight to the point to keep the conversation fast. If recruiters ask to contact you or schedule an interview, politely tell them they can reach you at your email or you can take down their details. DETECT USER LANGUAGE: Speak and respond to the user in the exact same language they use to talk to you (e.g. if they speak in Hindi, reply in Hindi; if English, reply in English; if Tamil, reply in Tamil; if Telugu, reply in Telugu).";
  const resumeContext = "Name: [Your Name Here]\nEmail: [Your Email Here]\nPhone: [Your Phone Here]\n\nEDUCATION:\n- B.S. in Computer Science (Graduating 2026)\n\nTECHNICAL SKILLS:\n- Languages: JavaScript, Python, C++, HTML/CSS\n- Technologies: Node.js, Express, React, FastAPI, Git, SQL\n\nPROJECTS:\n1. AI Assistant Caller: A Node.js and Gemini-powered system that answers phone calls and simulates recruiter interviews in real-time.\n2. E-Commerce API: A microservices-based Express backend with JWT authentication and Stripe integration.\n\nEXPERIENCE:\n- Software Engineering Intern at TechCorp (Summer 2025): Developed internal dashboards using React and automated database backups using Python scripts.";

  const supportInstructions = "You are a customer support agent for 'ByteStore', an online electronics retailer. Your tone should be polite, patient, and helpful. Guide users using the FAQ context. If they ask about something not in the FAQs, politely explain that you don't have that information but can file a support ticket. In that case, ask for their Name, Email, and Brief Issue description, then say 'I have filed that ticket for you, someone will reach out soon.'";
  const supportContext = "FAQ KNOWLEDGE BASE:\n\nQ: What is your return policy?\nA: We offer a 30-day money-back guarantee. Items must be in their original packaging.\n\nQ: Do you ship internationally?\nA: Yes, we ship to over 50 countries. Shipping fees are calculated at checkout.\n\nQ: How can I track my order?\nA: Once shipped, you will receive an email containing a tracking link.\n\nQ: What forms of payment do you accept?\nA: We accept Visa, Mastercard, AMEX, PayPal, and Apple Pay.";

  if (profile === 'resume') {
    document.getElementById('btnResumeProfile').classList.add('active');
    document.getElementById('btnSupportProfile').classList.remove('active');
    document.getElementById('systemInstructions').value = resumeInstructions;
    document.getElementById('contextData').value = resumeContext;
  } else {
    document.getElementById('btnSupportProfile').classList.add('active');
    document.getElementById('btnResumeProfile').classList.remove('active');
    document.getElementById('systemInstructions').value = supportInstructions;
    document.getElementById('contextData').value = supportContext;
  }
  
  updatePhoneUI();
}

// Update the phone display texts depending on config
function updatePhoneUI() {
  const contactName = document.getElementById('contactName');
  const avatar = document.getElementById('phoneAvatar');
  
  if (currentProfile === 'resume') {
    contactName.textContent = "Job Candidate Line";
    avatar.innerHTML = '<i data-lucide="user-round"></i>';
  } else {
    contactName.textContent = "ByteStore Support";
    avatar.innerHTML = '<i data-lucide="headset"></i>';
  }
  lucide.createIcons();
}

// Save active configuration to backend database (config.json)
async function saveConfiguration() {
  const instructions = document.getElementById('systemInstructions').value;
  const context = document.getElementById('contextData').value;
  
  updateSystemStatus("Saving...");
  
  try {
    const response = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: currentProfile,
        instructions,
        context
      })
    });
    
    if (response.ok) {
      updateSystemStatus("Config Saved");
      showSaveSuccessNotification();
    } else {
      updateSystemStatus("Save Failed", true);
    }
  } catch (error) {
    console.error('Error saving config:', error);
    updateSystemStatus("Save Error", true);
  }
}

function showSaveSuccessNotification() {
  const btn = document.querySelector('.save-btn');
  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="check-circle"></i> Applied to Phone Line!';
  btn.style.background = '#10b981';
  lucide.createIcons();
  
  setTimeout(() => {
    btn.innerHTML = originalHTML;
    btn.style.background = '';
    lucide.createIcons();
  }, 2000);
}

function updateSystemStatus(text, isError = false) {
  const badge = document.getElementById('backendStatus');
  badge.textContent = text;
  
  const dot = badge.previousElementSibling;
  if (isError) {
    dot.style.backgroundColor = '#ef4444';
    badge.parentElement.style.borderColor = 'rgba(239, 68, 68, 0.2)';
    badge.parentElement.style.color = '#ef4444';
  } else {
    dot.style.backgroundColor = '';
    badge.parentElement.style.borderColor = '';
    badge.parentElement.style.color = '';
  }
}

// DIAL PHONE CALL SIMULATOR (Start Call)
async function startCall() {
  if (isCalling) return;
  isCalling = true;
  
  // Clear any old logs from previous calls
  resetTranscript();
  
  document.getElementById('callStatus').textContent = "Connecting...";
  document.getElementById('phoneMock').classList.add('calling');
  document.getElementById('btnDial').style.display = 'none';
  document.getElementById('btnHangup').style.display = 'flex';
  
  try {
    // Request device orientation permission for iOS devices asynchronously (non-blocking)
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => console.log('iOS DeviceOrientation permission state:', state))
        .catch(e => console.warn('Could not request DeviceOrientation permission:', e));
    }

    // 1. Initialize Audio Context (let browser choose native hardware rate for stability)
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Resume audio context if suspended (browser security requirement)
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }

    // Create Analyser Node for drawing wave visualizer
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    analyser.connect(audioCtx.destination);
    
    // 2. Request Microphone Access
    micStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        channelCount: 1
      }
    });

    mediaStreamSource = audioCtx.createMediaStreamSource(micStream);
    
    // Create ScriptProcessor to capture microphone buffer blocks (use 8192 buffer size to optimize network throughput)
    scriptProcessor = audioCtx.createScriptProcessor(8192, 1, 1);
    mediaStreamSource.connect(scriptProcessor);
    scriptProcessor.connect(audioCtx.destination);

    // 3. Establish WebSocket Connection to Server
    const wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProto}//${window.location.host}/web-stream`;
    ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      console.log('Web Dialer connected to backend server.');
      document.getElementById('callStatus').textContent = "Connected (Call Active)";
      document.getElementById('phoneMock').classList.remove('calling');
      document.getElementById('phoneMock').classList.add('active-call');
      document.getElementById('chatInputArea').style.display = 'flex';
      
      // Start call timer clock
      startCallTimer();
      // Start draw loop
      drawWaveform();

      // Start capture loop
      scriptProcessor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const inputData = e.inputBuffer.getChannelData(0);
          
          // Calculate RMS volume for local VAD
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          
          const nowMs = Date.now();
          if (rms > VOICE_THRESHOLD) {
            if (!localUserSpeaking) {
              localUserSpeaking = true;
            }
            lastVoiceTime = nowMs;
          } else if (localUserSpeaking && (nowMs - lastVoiceTime > 800)) {
            // User stopped speaking (800ms of silence detected after voice)
            localUserSpeaking = false;
            
            // Only play the acknowledgement hum if AI is not currently speaking
            if (activeSources.length === 0) {
              playAcknowledgeHum();
            }
          }

          // Downsample user microphone input dynamically to 16kHz for Gemini
          const resampledData = resampleBuffer(inputData, audioCtx.sampleRate, 16000);
          const pcm16Buffer = float32ToPcm16(resampledData);
          ws.send(pcm16Buffer);
        }
      };
    };

    ws.onmessage = (event) => {
      if (typeof event.data === 'string') {
        // Handle JSON control signals (like barge-in clear buffer)
        try {
          const signal = JSON.parse(event.data);
          if (signal.event === 'clear') {
            console.log("Interrupt signal: Clearing audio playback queue.");
            clearAudioQueue();
          } else if (signal.event === 'transcription') {
            // Append incoming live debug transcriptions
            appendTranscription(signal.sender, signal.text);
          }
        } catch (e) {
          console.error("Failed to parse socket string message:", e);
        }
      } else {
        // Handle incoming binary audio blocks (24kHz PCM from Gemini via server)
        const float32Audio = pcm16ToFloat32(event.data);
        queueAudioChunk(float32Audio);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket Dial Error:", err);
      document.getElementById('callStatus').textContent = "Network Error";
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed.");
      endCall();
    };

  } catch (error) {
    console.error("Failed to initialize call:", error);
    alert("Microphone access is required to use the Phone Simulator!");
    endCall();
  }
}

// Resample floating point buffer from input rate to output rate
function resampleBuffer(inputBuffer, inputSampleRate, outputSampleRate) {
  if (inputSampleRate === outputSampleRate) {
    return inputBuffer;
  }
  const ratio = inputSampleRate / outputSampleRate;
  const newLength = Math.round(inputBuffer.length / ratio);
  const result = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const nextIndex = Math.round(i * ratio);
    if (nextIndex < inputBuffer.length) {
      result[i] = inputBuffer[nextIndex];
    }
  }
  return result;
}

// Convert float32 [-1.0, 1.0] samples to 16-bit signed PCM ArrayBuffer with 2.0x gain
function float32ToPcm16(float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32Array.length; i++) {
    // Apply a 4.0x digital pre-gain to boost quiet microphone signals for faster VAD trigger
    let s = Math.max(-1, Math.min(1, float32Array[i] * 4.0));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true); // true for little endian
  }
  return buffer;
}

// Convert 16-bit PCM ArrayBuffer to Float32Array
function pcm16ToFloat32(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) {
    return new Float32Array(0);
  }

  if (arrayBuffer.byteLength % 2 !== 0) {
    console.warn('PCM buffer length is not even; dropping trailing byte.', arrayBuffer.byteLength);
  }

  const int16Array = new Int16Array(arrayBuffer.slice(0, Math.floor(arrayBuffer.byteLength / 2) * 2));
  const float32Array = new Float32Array(int16Array.length);
  for (let i = 0; i < int16Array.length; i++) {
    const value = int16Array[i];
    float32Array[i] = value / 32768.0;
  }
  return float32Array;
}

// Queue incoming audio segments for continuous low-latency playback
function queueAudioChunk(float32Data) {
  if (!audioCtx || audioCtx.state === 'closed') return;
  if (!float32Data || float32Data.length === 0) return;

  const safeData = new Float32Array(float32Data.length);
  for (let i = 0; i < float32Data.length; i++) {
    const sample = float32Data[i];
    safeData[i] = Number.isFinite(sample) ? Math.max(-1, Math.min(1, sample)) : 0;
  }

  const audioBuffer = audioCtx.createBuffer(1, safeData.length, GEMINI_OUTPUT_SAMPLE_RATE);
  audioBuffer.getChannelData(0).set(safeData);

  const source = audioCtx.createBufferSource();
  source.buffer = audioBuffer;

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = 1.2;

  // Route audio through the analyser node to visualize AI speech waves
  source.connect(gainNode);
  gainNode.connect(analyser || audioCtx.destination);

  const curTime = audioCtx.currentTime;
  if (nextPlayTime < curTime) {
    nextPlayTime = curTime + 0.01; // 10ms safety offset for near-zero delay playback start
  }

  source.start(nextPlayTime);
  nextPlayTime += audioBuffer.duration;

  // Track sources to allow interrupting playback
  activeSources.push(source);
  source.onended = () => {
    activeSources = activeSources.filter(s => s !== source);
  };
}

// Interruption: stop all queue sources immediately
function clearAudioQueue() {
  activeSources.forEach(source => {
    try {
      source.stop();
    } catch (e) {
      // Node already finished playing
    }
  });
  activeSources = [];
  nextPlayTime = 0;
}

// HANG UP PHONE CALL (End Call)
function endCall() {
  if (!isCalling) return;
  isCalling = false;
  
  console.log("Ending phone call.");
  document.getElementById('callStatus').textContent = "Call Ended";
  document.getElementById('phoneMock').classList.remove('active-call');
  document.getElementById('phoneMock').classList.remove('calling');
  document.getElementById('chatInputArea').style.display = 'none';
  document.getElementById('btnDial').style.display = 'flex';
  document.getElementById('btnHangup').style.display = 'none';

  // Stop capture stream
  if (scriptProcessor) {
    scriptProcessor.onaudioprocess = null;
    scriptProcessor.disconnect();
    scriptProcessor = null;
  }
  if (mediaStreamSource) {
    mediaStreamSource.disconnect();
    mediaStreamSource = null;
  }
  if (micStream) {
    micStream.getTracks().forEach(track => track.stop());
    micStream = null;
  }

  // Clear audio queues
  clearAudioQueue();

  // Close sockets
  if (ws) {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
    ws = null;
  }

  // Close audio context
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }

  // Stop visual timers and draw animation loops
  stopCallTimer();
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  if (canvasCtx && canvas) {
    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
  }

  setTimeout(() => {
    if (!isCalling) {
      document.getElementById('callStatus').textContent = "Ready to Call";
    }
  }, 2000);
}

// Timer Functions
function startCallTimer() {
  callStartTime = Date.now();
  const timerLabel = document.getElementById('callTimer');
  timerLabel.textContent = "00:00";
  
  callTimerInterval = setInterval(() => {
    const elapsed = Date.now() - callStartTime;
    const totalSecs = Math.floor(elapsed / 1000);
    const mins = String(Math.floor(totalSecs / 60)).padStart(2, '0');
    const secs = String(totalSecs % 60).padStart(2, '0');
    timerLabel.textContent = `${mins}:${secs}`;
  }, 1000);
}

function stopCallTimer() {
  if (callTimerInterval) {
    clearInterval(callTimerInterval);
    callTimerInterval = null;
  }
}

// Canvas Waveform Animation
function drawWaveform() {
  if (!isCalling || !analyser) return;

  animationFrameId = requestAnimationFrame(drawWaveform);

  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);

  canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

  canvasCtx.lineWidth = 3;
  // Create neon cyan/purple gradient
  const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
  gradient.addColorStop(0, '#06b6d4');
  gradient.addColorStop(0.5, '#8b5cf6');
  gradient.addColorStop(1, '#06b6d4');

  canvasCtx.strokeStyle = gradient;
  canvasCtx.beginPath();

  const sliceWidth = canvas.width / bufferLength;
  let x = 0;

  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = (v * canvas.height) / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvas.width, canvas.height / 2);
  canvasCtx.stroke();
}

// Live Call Transcription Logger
let lastSender = null;
let lastMessageElement = null;

function resetTranscript() {
  const log = document.getElementById('transcriptLog');
  if (log) {
    log.innerHTML = '<div style="color: var(--text-secondary); font-style: italic; text-align: center; padding: 15px 0;">Transcripts will appear here in real-time...</div>';
  }
  lastSender = null;
  lastMessageElement = null;
}

function appendTranscription(sender, text) {
  const log = document.getElementById('transcriptLog');
  if (!log) return;
  
  // Clear placeholder text on the first actual transcription entry
  const placeholder = log.querySelector('div');
  if (placeholder && placeholder.style.fontStyle === 'italic') {
    log.innerHTML = '';
  }
  
  const senderLabel = sender === 'user' ? 'Recruiter' : 'AI Assistant';
  const senderColor = sender === 'user' ? '#06b6d4' : '#8b5cf6';
  
  // Clean up formatting
  let cleanText = text.trim();
  if (!cleanText) return;

  if (sender === 'ai' && lastSender === 'ai' && lastMessageElement) {
    // Accumulate word chunks inside the existing AI block
    const textSpan = lastMessageElement.querySelector('.msg-text');
    if (textSpan) {
      // Add spaces as needed
      textSpan.textContent += (textSpan.textContent.endsWith(' ') || cleanText.startsWith(' ') ? '' : ' ') + cleanText;
    }
  } else {
    // Create a new transcript row entry
    const bubble = document.createElement('div');
    bubble.style.display = 'flex';
    bubble.style.flexDirection = 'column';
    bubble.style.gap = '2px';
    bubble.style.borderLeft = `3px solid ${senderColor}`;
    bubble.style.paddingLeft = '8px';
    bubble.style.marginBottom = '6px';
    
    bubble.innerHTML = `
      <span style="font-size: 11px; font-weight: 600; color: ${senderColor}; text-transform: uppercase;">${senderLabel}</span>
      <span class="msg-text" style="color: var(--text-primary); line-height: 1.4;">${cleanText}</span>
    `;
    
    log.appendChild(bubble);
    
    // Save element reference for AI speech chunk accumulation
    if (sender === 'ai') {
      lastMessageElement = bubble;
    }
  }
  
  lastSender = sender;
  
  // Scroll automatically to show latest text
  log.scrollTop = log.scrollHeight;
}

// Speaker Diagnostics Test Tone Generator
async function testSpeakers() {
  try {
    const testCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = testCtx.createOscillator();
    const gain = testCtx.createGain();
    
    osc.connect(gain);
    gain.connect(testCtx.destination);
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, testCtx.currentTime); // 440Hz (A4 note)
    
    gain.gain.setValueAtTime(0.1, testCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, testCtx.currentTime + 1.0);
    
    osc.start(testCtx.currentTime);
    osc.stop(testCtx.currentTime + 1.0);
    
    console.log("Speaker test tone triggered successfully!");
    alert("Test tone played! If you did not hear a beep, please check your computer volume, speakers, or browser tab permission.");
  } catch (e) {
    console.error("Speaker test failed:", e);
    alert("Audio Context Error: " + e.message);
  }
}

// Helper to convert ArrayBuffer to Base64 string in browser JS
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Synthesize a soft double-oscillator hum locally to represent "mm-hmm" acknowledgement
function playAcknowledgeHum() {
  if (!audioCtx || audioCtx.state === 'closed') return;
  try {
    const now = audioCtx.currentTime;
    
    // Create a lowpass filter to cut high frequencies and make the synthesized sound soft/throat-like
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, now);
    filter.connect(audioCtx.destination);

    // Tone 1: "mm" (low frequency slide down)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle'; // Triangle wave has soft, warm harmonics
    osc1.frequency.setValueAtTime(130, now);
    osc1.frequency.linearRampToValueAtTime(115, now + 0.15);
    
    gain1.gain.setValueAtTime(0.0, now);
    gain1.gain.linearRampToValueAtTime(0.08, now + 0.04);
    gain1.gain.linearRampToValueAtTime(0.0, now + 0.15);
    
    osc1.connect(gain1);
    gain1.connect(filter);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2: "hmm" (slightly higher rising pitch slide after short gap)
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(125, now + 0.18);
    osc2.frequency.linearRampToValueAtTime(145, now + 0.35);
    
    gain2.gain.setValueAtTime(0.0, now + 0.18);
    gain2.gain.linearRampToValueAtTime(0.06, now + 0.22);
    gain2.gain.linearRampToValueAtTime(0.0, now + 0.35);
    
    osc2.connect(gain2);
    gain2.connect(filter);
    osc2.start(now + 0.18);
    osc2.stop(now + 0.35);
  } catch (e) {
    console.error("Failed to play acknowledge hum:", e);
  }
}

// Send Chat text prompt message directly to Gemini WebSocket
function sendChatMessage() {
  const input = document.getElementById('chatMessage');
  if (!input) return;
  const text = input.value.trim();
  if (!text || !ws || ws.readyState !== WebSocket.OPEN) return;
  
  // Append user bubble to transcript log locally immediately
  appendTranscription('user', text);
  
  // Forward to server
  const chatPayload = {
    event: 'chat',
    text: text
  };
  ws.send(JSON.stringify(chatPayload));
  
  // Clear input field
  input.value = '';
}

// Proximity Sensor Simulation state tracking
let isProximityActive = false;

// Proximity Sensor Simulation (Turn off screen when held to ear)
if (window.DeviceOrientationEvent) {
  window.addEventListener('deviceorientation', (event) => {
    // Only simulate proximity during an active phone call
    if (!isCalling) {
      if (isProximityActive) {
        document.getElementById('proximityOverlay').style.display = 'none';
        isProximityActive = false;
      }
      return;
    }

    const pitch = Math.abs(event.beta); // Front-to-back tilt (-180 to 180 degrees)
    const roll = Math.abs(event.gamma); // Left-to-right tilt (-90 to 90 degrees)

    // When the phone is held up vertically to the ear:
    // - The front-to-back tilt (pitch) is almost vertical (70 to 110 degrees)
    // - The left-to-right tilt (roll) is close to face alignment (less than 25 degrees)
    const shouldBeActive = (pitch > 70 && pitch < 110 && roll < 25);
    
    // Only update the DOM style when the state changes to prevent infinite reflow lags
    if (shouldBeActive !== isProximityActive) {
      isProximityActive = shouldBeActive;
      document.getElementById('proximityOverlay').style.display = shouldBeActive ? 'flex' : 'none';
      console.log('Proximity overlay state changed:', shouldBeActive);
    }
  });
}

// Tap proximity overlay to manually dismiss/reveal screen (fail-safe)
document.getElementById('proximityOverlay').addEventListener('click', () => {
  document.getElementById('proximityOverlay').style.display = 'none';
  isProximityActive = false;
});
