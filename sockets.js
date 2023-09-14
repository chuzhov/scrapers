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
    const jobIds = await findJobsByCriteria({ email }, ['accepted']); // an array of jobIds for our user

    if (jobIds.length === 0) {
      console.log(
        `A user ${email} with id ${socket.id} connected. No unfinished jobs found`
      );
    } else {
      //update all unfinished jobs
      console.log(`A user ${email} with ${socket.id} connected`);
      jobIds.forEach(async jobId => {
        //update app status for all unfinished jobs
        await updateJob(jobId.id, {
          socketId: socket.id,
          appStatus: 'connected',
        });
        // emit reports for task(s) were finished when the user was disconnected
        if (jobId.jobStatus === 'finished') {
          // routines for a
          //recovering screpping results from DB
          //const [{ data, dateString }] = await getJobs({ id: jobId.id }); //TODO DEBUG RESULT
          io.to(socket.id).emit('reportGenerated', {
            jobId: jobId.id,
            target: jobId.target,
            success: true,
            data: jobId.data,
            dateString: toShorterDate(jobId.reportCreatedAt),
          });
        }
        if (jobId.jobStatus === 'scrapping') {
          io.to(socket.id).emit('status', {
            target: jobId.target,
            jobStatus: jobId.jobStatus,
          });
        }
      });

      //   const jobs = await getJobs({ socketId: socket.id });

      //    jobs.forEach(async job => {

      // if (job.jobStatus !== 'finished') {
      //   io.to(socket.id).emit('status', {
      //     target: job.target,
      //     status: job.jobStatus,
      //   });
      // }
      //     });
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
      //  const [{ appStatus }] = await getJobs({ id: jobId });
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
      const jobIds = await getJobs({ socketId: socket.id });
      if (jobIds.length > 0) {
        jobIds.forEach(
          async jobId =>
            await updateJob(jobId.id, {
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
