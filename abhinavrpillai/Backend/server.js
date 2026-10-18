const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const dotenv = require('dotenv');
const alawmulaw = require('alawmulaw');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3000;
const CONFIG_FILE = path.join(__dirname, 'config.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Default configuration
const DEFAULT_CONFIG = {
  profile: 'resume',
  instructions: "You are Abhinav (Abhinav R Pillai), a Software Engineer and Full Stack Developer. Act directly as the candidate yourself in a real interview (first-person voice). Do NOT say you are an assistant, and do NOT say you are speaking on behalf of someone. Answer all questions using 'I', 'me', and 'my' based on your resume. Explain your experience, projects, and skills in detail when answering questions. Do NOT answer in short sentences. Adopt a natural young Indian English accent, cadence, and vocabulary. Always speak in English. Only speak in another language (such as Malayalam, Hindi, or Tamil) if the user explicitly mentions or asks you to speak in that language.",
  context: "John Doe\nEmail: john.doe@example.com\nPhone: +1 555-0199\n\nEDUCATION:\n- B.S. in Computer Science, State University (Graduating 2026)\n\nTECHNICAL SKILLS:\n- Languages: JavaScript, Python, C++, HTML/CSS\n- Technologies: Node.js, Express, React, FastAPI, Git, SQL\n\nPROJECTS:\n1. AI Assistant Caller: A Node.js and Gemini-powered system that answers phone calls and simulates recruiter interviews in real-time.\n2. E-Commerce API: A microservices-based Express backend with JWT authentication and Stripe integration.\n\nEXPERIENCE:\n- Software Engineering Intern at TechCorp (Summer 2025): Developed internal dashboards using React and automated database backups using Python scripts."
};

// Ensure config file exists
if (!fs.existsSync(CONFIG_FILE)) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 2));
}

// Get config endpoint
app.get('/api/config', (req, res) => {
  try {
    const configData = fs.readFileSync(CONFIG_FILE, 'utf8');
    res.json(JSON.parse(configData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to read config' });
  }
});

// Save config endpoint
app.post('/api/config', (req, res) => {
  try {
    const { profile, instructions, context } = req.body;
    const newConfig = { profile, instructions, context };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    res.json({ message: 'Configuration saved successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save config' });
  }
});

// Get API key for direct client-to-Gemini low-latency connection
app.get('/api/key', (req, res) => {
  res.json({ apiKey: process.env.GEMINI_API_KEY });
});

// Twilio webhook endpoint for voice calls
app.post('/twilio/voice', (req, res) => {
  const publicDomain = process.env.PUBLIC_DOMAIN || req.headers.host;
  res.type('text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Say voice="Polly.Joanna">Connecting you to the AI voice agent. Please wait.</Say>
      <Connect>
        <Stream url="wss://${publicDomain}/media-stream" />
      </Connect>
    </Response>
  `);
});

// Audio Transcoding Helper Functions
function twilioToGemini(base64Payload) {
  const mulawBuffer = Buffer.from(base64Payload, 'base64');
  
  // Decode 8kHz mu-law to 8kHz PCM (16-bit)
  const pcm8k = alawmulaw.mulaw.decode(mulawBuffer);
  
  // Upsample from 8kHz to 16kHz by duplicating samples (simple nearest-neighbor resampling)
  const pcm16k = new Int16Array(pcm8k.length * 2);
  for (let i = 0; i < pcm8k.length; i++) {
    pcm16k[i * 2] = pcm8k[i];
    pcm16k[i * 2 + 1] = pcm8k[i];
  }
  
  return Buffer.from(pcm16k.buffer, pcm16k.byteOffset, pcm16k.byteLength);
}

function geminiToTwilio(pcm24kBuffer) {
  // Safe conversion: copy buffer contents to a new aligned ArrayBuffer to prevent RangeError
  const arrayBuffer = pcm24kBuffer.buffer.slice(
    pcm24kBuffer.byteOffset,
    pcm24kBuffer.byteOffset + pcm24kBuffer.byteLength
  );
  const pcm24k = new Int16Array(arrayBuffer);
  
  // Downsample 24kHz to 8kHz (take every 3rd sample)
  const pcm8k = new Int16Array(Math.floor(pcm24k.length / 3));
  for (let i = 0; i < pcm8k.length; i++) {
    pcm8k[i] = pcm24k[i * 3];
  }
  
  // Encode 8kHz PCM (16-bit) to 8kHz mu-law
  const mulawBuffer = alawmulaw.mulaw.encode(pcm8k);
  
  return Buffer.from(mulawBuffer).toString('base64');
}

// WebSocket Connection Handler
wss.on('connection', (ws, req) => {
  const urlPath = req.url;
  console.log(`New WebSocket connection established for route: ${urlPath}`);

  if (urlPath !== '/media-stream' && urlPath !== '/web-stream') {
    ws.close(4000, 'Invalid stream route');
    return;
  }

  // Load latest configuration instructions
  let config = DEFAULT_CONFIG;
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error loading config, using defaults:', err);
  }

  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (!geminiApiKey || geminiApiKey === 'your_gemini_api_key_here') {
    console.error('CRITICAL: Gemini API Key is missing. Configure it in .env');
    ws.close(4001, 'Gemini API Key missing');
    return;
  }

  // Gemini Live API WebSocket endpoint (using v1beta)
  const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${geminiApiKey}`;
  const geminiWs = new WebSocket(geminiUrl);

  let twilioStreamSid = null;
  let lastGeminiAudioChunkAt = 0;


  // Handle connection to Gemini Live API
  geminiWs.on('open', () => {
    console.log('Connected to Google Gemini Live API');

    // Send initial configuration to Gemini
    const fullSystemInstruction = `${config.instructions}\n\nUSE THIS CONTEXT DATA TO ANSWER QUESTIONS:\n${config.context}`;
    
    const setupMessage = {
      setup: {
        model: 'models/gemini-2.5-flash-native-audio-latest',
        inputAudioTranscription: {},
        outputAudioTranscription: {}, // Enabled to receive text transcripts of AI spoken audio
        realtimeInputConfig: {
          automaticActivityDetection: {
            disabled: false,
            silenceDurationMs: 300 // Lower silence detection threshold to 300ms for ultra-fast VAD trigger
          }
        },
        generationConfig: {
          responseModalities: ['AUDIO'],
          temperature: 0.4, // Lower temperature makes generation faster and more deterministic
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck' // Puck is a youthful, energetic male voice
              }
            }
          }
        },
        systemInstruction: {
          parts: [{ text: fullSystemInstruction }]
        }
      }
    };
    
    geminiWs.send(JSON.stringify(setupMessage));
  });

  // Handle messages coming from Gemini Live API
  geminiWs.on('message', (messageData) => {
    try {
      const response = JSON.parse(messageData.toString());

      // Handle user's speech transcript from Gemini
      if (response.inputTranscription && response.inputTranscription.text) {
        console.log(`User transcript: ${response.inputTranscription.text}`);
        if (urlPath === '/web-stream' && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            event: 'transcription',
            sender: 'user',
            text: response.inputTranscription.text
          }));
        }
      }

      // Handle AI's spoken speech transcript from Gemini (outputTranscription)
      if (response.serverContent && response.serverContent.outputTranscription && response.serverContent.outputTranscription.text) {
        console.log(`AI transcript: ${response.serverContent.outputTranscription.text}`);
        if (urlPath === '/web-stream' && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            event: 'transcription',
            sender: 'ai',
            text: response.serverContent.outputTranscription.text
          }));
        }
      }
      
      // If setup is complete, trigger the initial greeting automatically
      if (response.setupComplete) {
        console.log('Gemini Live API setup complete! Triggering initial greeting...');
        const greetingText = config.profile === 'resume'
          ? "Hello, please start the call by saying: 'Hello! This is John's Resume AI assistant. How can I help you today?' in a warm, professional voice."
          : "Hello, please start the call by saying: 'Hello, thank you for calling ByteStore Customer Support. How can I help you today?' in a helpful and polite voice.";
        
        const greetingMessage = {
          clientContent: {
            turns: [
              {
                role: 'user',
                parts: [{ text: greetingText }]
              }
            ],
            turnComplete: true
          }
        };
        geminiWs.send(JSON.stringify(greetingMessage));
      }
      
      // Check if Gemini returned audio content
      if (response.serverContent && response.serverContent.modelTurn) {
        const parts = response.serverContent.modelTurn.parts;
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const rawPcm24kBase64 = part.inlineData.data;
            const rawPcm24kBuffer = Buffer.from(rawPcm24kBase64, 'base64');

            // Enable with AUDIO_DEBUG=true on Render to identify whether gaps
            // occur before audio reaches this server or after it is forwarded.
            if (process.env.AUDIO_DEBUG === 'true') {
              const now = Date.now();
              const gapMs = lastGeminiAudioChunkAt ? now - lastGeminiAudioChunkAt : 0;
              console.log(
                `[audio-debug] Gemini chunk: ${rawPcm24kBuffer.length} bytes; ` +
                `${gapMs ? `${gapMs}ms since previous chunk` : 'first chunk'}`
              );
              lastGeminiAudioChunkAt = now;
            }

            if (urlPath === '/media-stream') {
              // Twilio: Transcode 24kHz PCM -> 8kHz mu-law
              const twilioPayload = geminiToTwilio(rawPcm24kBuffer);
              const twilioMessage = {
                event: 'media',
                streamSid: twilioStreamSid,
                media: {
                  payload: twilioPayload
                }
              };
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(twilioMessage));
              }
            } else if (urlPath === '/web-stream') {
              // Web Simulator: Forward raw 24kHz PCM bytes directly
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(rawPcm24kBuffer, (err) => {
                  if (err) {
                    console.error('[audio-debug] Failed to forward audio chunk:', err.message);
                  }
                });
              }
            }
          }
        }
      }

      // Handle interrupt (barge-in) from Gemini
      // If the user starts talking, Gemini detects it and sends an interruption signal.
      // We should tell Twilio / Web-client to clear their playback buffers.
      if (response.serverContent && response.serverContent.interrupted) {
        console.log('Gemini interrupted. Telling client to clear audio buffer.');
        if (urlPath === '/media-stream') {
          const clearMessage = {
            event: 'clear',
            streamSid: twilioStreamSid
          };
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(clearMessage));
          }
        } else if (urlPath === '/web-stream') {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ event: 'clear' }));
          }
        }
      }

    } catch (error) {
      console.error('Error handling Gemini message:', error);
    }
  });

  // Handle messages coming from the caller (Twilio or Web Simulator)
  ws.on('message', (messageData, isBinary) => {
    try {
      if (urlPath === '/media-stream') {
        // Twilio protocol is JSON
        const data = JSON.parse(messageData.toString());

        if (data.event === 'start') {
          twilioStreamSid = data.start.streamSid;
          console.log(`Twilio Media Stream started. StreamSid: ${twilioStreamSid}`);
        } else if (data.event === 'media') {
          // Process Twilio audio chunk
          const twilioPayload = data.media.payload;
          const pcm16kBuffer = twilioToGemini(twilioPayload);
          
          const geminiMessage = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: 'audio/pcm',
                data: pcm16kBuffer.toString('base64')
              }]
            }
          };

          if (geminiWs.readyState === WebSocket.OPEN) {
            geminiWs.send(JSON.stringify(geminiMessage));
          }
        }
      } else if (urlPath === '/web-stream') {
        // Web Simulator protocol
        // If it's binary, it's raw 16kHz PCM audio from browser microphone
        if (isBinary) {
          const buffer = Buffer.from(messageData);
          const geminiMessage = {
            realtimeInput: {
              mediaChunks: [{
                mimeType: 'audio/pcm',
                data: buffer.toString('base64')
              }]
            }
          };
          if (geminiWs.readyState === WebSocket.OPEN) {
            geminiWs.send(JSON.stringify(geminiMessage));
          }
        } else {
          // If it's a string, check if it's control JSON
          const data = JSON.parse(messageData.toString());
          if (data.event === 'chat') {
            console.log(`[DEBUG] Forwarding chat message to Gemini: ${data.text}`);
            const chatMessage = {
              clientContent: {
                turns: [
                  {
                    role: 'user',
                    parts: [{ text: data.text }]
                  }
                ],
                turnComplete: true
              }
            };
            if (geminiWs.readyState === WebSocket.OPEN) {
              geminiWs.send(JSON.stringify(chatMessage));
            }
          } else {
            console.log('Web-stream control message:', data);
          }
        }
      }
    } catch (error) {
      console.error('Error handling incoming client message:', error);
    }
  });

  ws.on('close', () => {
    console.log(`Client WebSocket closed (${urlPath})`);
    if (geminiWs.readyState === WebSocket.OPEN || geminiWs.readyState === WebSocket.CONNECTING) {
      geminiWs.close();
    }
  });

  geminiWs.on('close', () => {
    console.log('Gemini Live API WebSocket closed');
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(4002, 'Gemini connection lost');
    }
  });

  geminiWs.on('error', (err) => {
    console.error('Gemini WebSocket Error:', err);
  });

  ws.on('error', (err) => {
    console.error('Client WebSocket Error:', err);
  });
});

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  AI Voice Assistant Call Project is running!`);
  console.log(`  Local URL:   http://localhost:${PORT}`);
  console.log(`====================================================`);
});
