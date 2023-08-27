const fs = require('fs');
const shortid = require('shortid');

const scrapEN = require('.');
const { addJob, getJob, updateJob } = require('./services/jobFunctions');
const { findFileById } = require('./utils');

function handleSocketConnections(io) {
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
      console.log(`A user ${email} with id ${socket.id} connected`);
    } else {
      updateJob(jobId, { socketId: socket.id, appStatus: 'connected' });
      console.log(`A user ${email} with ${socket.id} connected again`);
      const { jobStatus } = getJob({ socketId: socket.id });

      if (jobStatus === 'finished') {
        //recovering screpping results from saved file
        const { filename, dateString } = findFileById(jobId);
        fs.readFile(filename, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file: ${err}`);
            io.to(socket.id).emit('reportGenerated', {
              success: false,
              error: 'File reading error',
              dateString: '',
            });
            return;
          }

          // Parse the JSON data
          try {
            const parsedData = JSON.parse(data);
            io.to(socket.id).emit('reportGenerated', {
              success: true,
              data: parsedData,
              dateString,
            });
          } catch (jsonError) {
            // Handle JSON parsing error
            console.error(`Error parsing JSON: ${jsonError}`);
            io.to(socket.id).emit('reportGenerated', {
              success: false,
              error: 'JSON parsing error',
              dateString: '',
            });
          }
        });
      }

      io.to(socket.id).emit('status', jobStatus);
    }

    socket.on('generateReport', async () => {
      const { jobId, email } = getJob({ socketId: socket.id });
      updateJob(jobId, { jobStatus: 'scrapping' });

      console.log(`Received generation request from ${email}`);
      const { success, data, dateString } = await scrapEN(io, jobId);
      updateJob(jobId, { jobStatus: 'finished' });

      // Send the scrapped data to the frontend
      const { appStatus } = getJob({ jobId });
      if (appStatus === 'connected') {
        io.to(socket.id).emit('reportGenerated', { success, data, dateString });
      }
    });

    socket.on('disconnect', () => {
      const { jobId, email } = getJob({ socketId: socket.id });
      updateJob(jobId, { appStatus: 'disconnected', socketId: '' });
      console.log(`User ${email} disconnected`);
    });
  });
}

module.exports = handleSocketConnections;
