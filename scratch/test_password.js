const axios = require('axios');

async function testPassword(password) {
  try {
    const res = await axios.post('http://localhost:8080/realms/ash/protocol/openid-connect/token', new URLSearchParams({
      grant_type: 'password',
      client_id: 'ash-wallet-gate',
      username: 'georges.ayeni@epitech.eu',
      password: password
    }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    console.log(`SUCCESS with password: ${password}`);
    console.log(res.data);
    return true;
  } catch (err) {
    console.log(`Failed with password: ${password} - ${err.response?.data?.error_description || err.message}`);
    return false;
  }
}

async function run() {
  const pwds = ['password', 'georges', 'Georges987', 'admin', 'ashborn_secure_key_2026', 'ashborn_db_secret_2026', 'ashborn'];
  for (const pwd of pwds) {
    if (await testPassword(pwd)) break;
  }
}

run();
