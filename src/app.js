const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

// Serve the frontend files (adjust the path accordingly)
app.use(express.static('public'));

module.exports = app;
