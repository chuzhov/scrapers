const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const fs = require('fs');
const cors = require('cors');
const shortid = require('shortid');

const scrapEN = require('.');
const { addJob, getJob, updateJob } = require('./services/jobFunctions');

const app = express();
const server = http.createServer(app);

// Enable CORS for the entire Express app
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

const io = socketIo(server, {
  cors: {
    origin: '*', // Allow connections from any origin
    methods: ['GET', 'POST'],
  },
});

// Serve the frontend files (adjust the path accordingly)
app.use(express.static('public'));

// Handle socket connections
io.on('connection', socket => {
  const email = socket.handshake.query.email;
  const { jobId } = getJob({ email });

  if (!jobId) {
    addJob({
      email: socket.handshake.query.email,
      socketId: socket.id,
      jobId: shortid.generate(),
      jobStatus: 'pending', // pending, scrapping, finished
      appStatus: 'connected', //connected, disconnected
    });
    console.log(`A user ${email} with ${socket.id} connected`);
  } else {
    updateJob(jobId, { socketId: socket.id, appStatus: 'connected' });
    console.log(`A user ${email} with ${socket.id} connected again`);
  }

  socket.on('generateReport', async () => {
    const { jobId, email } = getJob({ socketId: socket.id });
    updateJob(jobId, { jobStatus: 'scrapping' });

    const { success, data } = await scrapEN(io, jobId);

    console.log(`Received generation request from ${email}`);

    // Send the file path back to the frontend
    socket.emit('reportGenerated', { success, data });
  });

  socket.on('disconnect', () => {
    const { jobId, email } = getJob({ socketId: socket.id });
    updateJob(jobId, { appStatus: 'disconnected', socketId: '' });
    console.log(`User ${email} disconnected`);
  });
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
