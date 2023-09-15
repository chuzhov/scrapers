const axios = require('axios');
const https = require('https');

// Create an agent with custom configuration to handle SSL certificate errors
const agent = new https.Agent({
  rejectUnauthorized: false,
});

// Create and configure your Axios instance with the custom agent
const en_api = axios.create({
  baseURL: 'https://enext.ua',
  httpsAgent: agent, // Add this line to use the custom agent
});

// Export the configured Axios instance
module.exports = { en_api };
