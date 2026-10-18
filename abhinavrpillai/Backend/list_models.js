const https = require('https');
const dotenv = require('dotenv');

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('No API key found');
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
        console.log('--- Models supporting bidiGenerateContent ---');
        result.models.forEach(model => {
          const methods = model.supportedMethods || [];
          if (methods.includes('bidiGenerateContent')) {
            console.log(`- Name: ${model.name}`);
            console.log(`  Description: ${model.description}`);
            console.log(`  Methods: ${methods.join(', ')}`);
          }
        });
      } else {
        console.error('No models list found. Response:', JSON.stringify(result, null, 2));
      }
    } catch (e) {
      console.error('Failed to parse response:', e.message);
      console.log('Raw response excerpt:', data.substring(0, 1000));
    }
  });
}).on('error', (err) => {
  console.error('Request failed:', err.message);
});
