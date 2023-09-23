const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// Serve the frontend files (adjust the path accordingly)
app.use(express.static('public'));

app.get('/', (req, res) => {
  // Read the contents of the HTML file and send it as the response.
  res.sendFile('../public/index.html');
});

module.exports = app;
