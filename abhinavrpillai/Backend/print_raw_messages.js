const WebSocket = require('ws');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('ERROR: No API key found in .env');
    process.exit(1);
}

const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;
const ws = new WebSocket(url);

ws.on('open', () => {
    console.log('Connected. Sending setup...');
    const setupMessage = {
      setup: {
        model: 'models/gemini-2.5-flash-native-audio-latest',
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        generationConfig: {
          responseModalities: ['AUDIO']
        }
      }
    };
    ws.send(JSON.stringify(setupMessage));
});

ws.on('message', (data) => {
    try {
        const response = JSON.parse(data.toString());
        console.log('\n--- MESSAGE START ---');
        console.log(JSON.stringify(response, null, 2));
        console.log('--- MESSAGE END ---');
        
        if (response.setupComplete) {
            console.log('Setup complete! Sending greeting request...');
            ws.send(JSON.stringify({
                clientContent: {
                    turns: [{ role: 'user', parts: [{ text: 'Please say "Welcome to John\'s resume AI assistant!"' }] }],
                    turnComplete: true
                }
            }));
        }
    } catch (e) {
        console.error('Error:', e);
    }
});

ws.on('close', (code, reason) => {
    console.log(`Closed: ${code} - ${reason.toString()}`);
});

setTimeout(() => {
    ws.close();
    process.exit(0);
}, 6000);
