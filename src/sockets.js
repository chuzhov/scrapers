const logger = require('./config/logger.config');

const ctrl = require('./controllers/');
const {
  addJob,
  getJobs,
  updateJob,
  findJobsByCriteria,
} = require('./services/DBjobFunctions');
const { toShorterDate } = require('./utils');
const {
  clearUnnecessaryAcceptedJobs,
  clearCrushedJobs,
  getLatestJobs,
} = require('./services/DButils/');

async function handleSocketConnections(io) {
  await clearCrushedJobs();
  io.on('connection', async socket => {
    const email = socket.handshake.query.email;
    const targetsString = socket.handshake.query.targets;

    const targets = JSON.parse(targetsString);
    const previousJobs = await getLatestJobs(email, targets);
    io.to(socket.id).emit('previousJobs', previousJobs);

    const jobs = await findJobsByCriteria({
      criteria: { email },
      column: 'jobStatus',
      toExclude: ['accepted'],
      toInclude: [],
    });

    if (jobs.length === 0) {
      logger.info(
        `A user ${email} with id ${socket.id} connected. No unfinished jobs found`
      );
    } else {
      //update all unfinished jobs
      logger.info(
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
      logger.info(
        `Received generation request from ${email} for target ${target}`
      );

      //TODO WHAT ABOUT ANOTHER TARGETS?
      console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
      let scrData = [];
      if (process.env.NODE_ENV === 'production') {
        scrData = await ctrl.scrapEN(io, jobId);
      } else {
        scrData = await ctrl.scrapEN_DEV(io, jobId);
      }
      const { success, data } = scrData;

      // const { success, data } =
      //   process.env.NODE_ENV === 'production'
      //     ? await ctrl.scrapEN(io, jobId)
      //     : await ctrl.scrapEN_DEV(io, jobId);
      //const { success, data } = await ctrl.scrapEN(io, jobId);
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
      const job = await updateJob(jobId, {
        jobStatus: 'accepted',
        appStatus: '',
        socketId: '',
      });
      clearUnnecessaryAcceptedJobs(
        { email: job.email },
        { target: job.target }
      );
      logger.info(
        `User ${job.email} accepted ${job.target} report for job ${job.id}`
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
      logger.info(`User ${email} disconnected`);
    });
  });
}

module.exports = handleSocketConnections;
