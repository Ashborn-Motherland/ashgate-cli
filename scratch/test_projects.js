const axios = require('axios');
const { walletConfig } = require('../dist/config/config');

async function run() {
  const tokens = walletConfig.getTokens();
  const cfg = walletConfig.get();
  console.log('Sending request to:', `${cfg.cloudUrl}/projects`);
  console.log('Token:', tokens.accessToken.substring(0, 30) + '...');
  try {
    const res = await axios.get(`${cfg.cloudUrl}/projects`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`
      }
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

run();
