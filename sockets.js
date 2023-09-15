const fs = require('fs');

const scrapEN = require('.');
const {
  addJob,
  getJobs,
  updateJob,
  findJobsByCriteria,
} = require('./services/DBjobFunctions');
const { toShorterDate } = require('./utils');

async function handleSocketConnections(io) {
  io.on('connection', async socket => {
    const email = socket.handshake.query.email;
    const jobs = await findJobsByCriteria({
      criteria: { email },
      column: 'jobStatus',
      toExclude: ['accepted'],
      toInclude: [],
    });

    if (jobs.length === 0) {
      console.log(
        `A user ${email} with id ${socket.id} connected. No unfinished jobs found`
      );
    } else {
      //update all unfinished jobs
      console.log(
        `A user ${email} with ${socket.id} connected with ${jobs.length} unfinished jobs`
      );
      jobs.forEach(async job => {
        //update app status for all unfinished jobs
        await updateJob(job.id, {
          socketId: socket.id,
          appStatus: 'connected',
        });
        // emit reports for task(s) were finished when the user was disconnected
        if (job.jobStatus === 'finished') {
          // Send the scrapped data to the frontend
          // recovering screpping results from DB
          io.to(socket.id).emit('reportGenerated', {
            jobId: job.id,
            target: job.target,
            success: true,
            data: job.data,
            dateString: toShorterDate(job.reportCreatedAt),
          });
        }
        if (job.jobStatus === 'scrapping') {
          io.to(socket.id).emit('status', {
            target: job.target,
            jobStatus: job.jobStatus,
          });
        }
      });
    }

    socket.on('generateReport', async ({ target }) => {
      const jobId = await addJob({
        target,
        email: socket.handshake.query.email,
        socketId: socket.id,
        jobStatus: 'scrapping', // error, scrapping, finished, accepted
        appStatus: 'connected', //connected, disconnected
      });
      console.log(
        `Received generation request from ${email} for target ${target}`
      );

      //TODO WHAT ABOUT ANOTHER TARGETS?
      const { success, data } = await scrapEN(io, jobId);
      const job = await updateJob(jobId, {
        jobStatus: 'finished',
        data,
        reportCreatedAt: Date.now(),
      });

      // Send the scrapped data to the frontend
      if (job.appStatus === 'connected') {
        io.to(socket.id).emit('reportGenerated', {
          jobId: job.id,
          target: job.target,
          success,
          data: job.data,
          dateString: toShorterDate(job.reportCreatedAt),
        });
      }
    });

    socket.on('setJobDone', async jobId => {
      //const [{ jobIds }] = await getJobs({ email, target });
      const result = await updateJob(jobId, {
        jobStatus: 'accepted',
        appStatus: '',
        socketId: '',
      });
      console.log(
        `User ${result.email} accepted ${result.target} report for job ${result.id}`
      );
    });

    socket.on('disconnect', async () => {
      const jobs = await getJobs({ socketId: socket.id });
      if (jobs.length > 0) {
        jobs.forEach(
          async job =>
            await updateJob(job.id, {
              appStatus: 'disconnected',
              socketId: '',
            })
        );
      }
      console.log(`User ${email} disconnected`);
    });
  });
}

module.exports = handleSocketConnections;
