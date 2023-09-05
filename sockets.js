const fs = require('fs');

const scrapEN = require('.');
const { addJob, getJobs, updateJob } = require('./services/jobFunctions');
const { findFileById } = require('./utils');

function handleSocketConnections(io) {
  io.on('connection', socket => {
    const email = socket.handshake.query.email;
    const jobIds = getJobs({ email }); // an array of jobIds

    if (jobIds.length === 0) {
      console.log(`A user ${email} with id ${socket.id} connected`);
    } else {
      jobIds.forEach(jobId =>
        updateJob(jobId, { socketId: socket.id, appStatus: 'connected' })
      );
      console.log(`A user ${email} with ${socket.id} connected again`);
      const jobs = getJobs({ socketId: socket.id });

      jobs.forEach(job => {
        if (job.jobStatus === 'finished') {
          // routines for fineshed tasks
          //recovering screpping results from saved file
          const { filename, dateString } = findFileById(job.jobId);
          fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading file: ${err}`);
              io.to(socket.id).emit('reportGenerated', {
                target: job.target,
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
                target: job.target,
                success: true,
                data: parsedData,
                dateString,
              });
            } catch (jsonError) {
              // Handle JSON parsing error
              console.error(`Error parsing JSON: ${jsonError}`);
              io.to(socket.id).emit('reportGenerated', {
                target: job.target,
                success: false,
                error: 'JSON parsing error',
                dateString: '',
              });
            }
          });
        }
        if (job.jobStatus !== 'finished') {
          io.to(socket.id).emit('status', {
            target: job.target,
            status: job.jobStatus,
          });
        }
      });
    }

    socket.on('generateReport', async ({ target }) => {
      const jobId = addJob({
        target,
        email: socket.handshake.query.email,
        socketId: socket.id,
        jobStatus: 'scrapping', // error, scrapping, finished, accepted
        appStatus: 'connected', //connected, disconnected
      });
      console.log(
        `Received generation request from ${email} for target ${target}`
      );

      const { success, data, dateString } = await scrapEN(io, jobId);
      updateJob(jobId, { jobStatus: 'finished' });

      // Send the scrapped data to the frontend
      const { appStatus } = getJobs({ jobId });
      if (appStatus === 'connected') {
        io.to(socket.id).emit('reportGenerated', { success, data, dateString });
      }
    });

    socket.on('setJobDone', () => {
      const { jobIds, email } = getJobs({ socketId: socket.id });
      updateJob(jobIds, { jobStatus: 'accepted', socketId: '' });
      console.log(`User ${email} accepted the report`);
    });

    socket.on('disconnect', () => {
      const { jobIds, email } = getJobs({ socketId: socket.id });
      updateJob(jobIds, { appStatus: 'disconnected', socketId: '' });
      console.log(`User ${email} disconnected`);
    });
  });
}

module.exports = handleSocketConnections;
