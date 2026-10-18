const http = require('http');
const fs = require('fs');
const path = require('path');

function getTunnels() {
  http.get('http://127.0.0.1:4040/api/tunnels', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const tunnels = parsed.tunnels;
        if (!tunnels || tunnels.length === 0) {
          console.log('No active tunnels found. Retrying in 1s...');
          setTimeout(getTunnels, 1000);
          return;
        }
        
        // Look for the https tunnel
        const httpsTunnel = tunnels.find(t => t.public_url.startsWith('https://'));
        if (!httpsTunnel) {
          console.log('No HTTPS tunnel found.');
          process.exit(1);
        }
        
        const fullUrl = httpsTunnel.public_url;
        console.log('SUCCESS_URL:' + fullUrl);
        
        // Extract domain (remove https://)
        const domain = fullUrl.replace('https://', '');
        
        // Read .env
        const envPath = path.join(__dirname, '..', '.env');
        let envContent = fs.readFileSync(envPath, 'utf8');
        
        // Replace PUBLIC_DOMAIN value
        envContent = envContent.replace(/PUBLIC_DOMAIN=.*/g, `PUBLIC_DOMAIN=${domain}`);
        fs.writeFileSync(envPath, envContent);
        console.log('UPDATED_ENV_WITH_DOMAIN:' + domain);
        process.exit(0);
      } catch (e) {
        console.error('Error parsing tunnels JSON:', e.message);
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.log('Ngrok API not ready yet. Retrying in 1s...', err.message);
    setTimeout(getTunnels, 1000);
  });
}

// Start polling
getTunnels();
setTimeout(() => {
  console.log('Timeout waiting for Ngrok tunnels.');
  process.exit(1);
}, 8000);
