const axios = require('axios');

// Create and configure your Axios instance
const en_api = axios.create({
  baseURL: 'https://enext.ua',
  // other configuration options
});

// Export the configured Axios instance
module.exports = { en_api };
