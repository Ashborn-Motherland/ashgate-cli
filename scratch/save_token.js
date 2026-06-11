const axios = require('axios');
const { walletConfig } = require('../dist/config/config');

async function run() {
  try {
    const res = await axios.post('http://localhost:8080/realms/ash/protocol/openid-connect/token', new URLSearchParams({
      grant_type: 'password',
      client_id: 'ash-wallet-cli',
      username: 'georges.ayeni@epitech.eu',
      password: 'Georges987'
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, refresh_token, expires_in, refresh_expires_in } = res.data;
    const payloadB64 = access_token.split('.')[1];
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString());

    const tokenStore = {
      accessToken: access_token,
      refreshToken: refresh_token,
      expiresAt: Date.now() + expires_in * 1000,
      refreshExpiresAt: Date.now() + (refresh_expires_in || 259200) * 1000,
      keycloakId: payload.sub,
      email: payload.email,
    };

    walletConfig.setTokens(tokenStore);
    console.log('Successfully saved tokens to configstore!');
  } catch (err) {
    console.error('Failed:', err.response?.data || err.message);
  }
}

run();
