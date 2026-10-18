const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('ERROR: No API key found in .env');
  process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      if (result.models) {
        console.log('Models supporting bidiGenerateContent:');
        result.models.forEach(model => {
          if (model.supportedMethods && model.supportedMethods.includes('bidiGenerateContent')) {
            console.log(`- ${model.name}`);
          }
        });
      } else {
        console.log('No models list. Full response:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
