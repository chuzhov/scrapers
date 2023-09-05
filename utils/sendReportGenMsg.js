const { getJobs } = require('../services/jobFunctions');

function sendReportGenMsg(io, jobId, target, msg) {
  const [job] = getJobs({ jobId });
  const { socketId, appStatus } = job;
  if (appStatus === 'connected') {
    io.to(socketId).emit('reportGenStatus', { target, msg });
  }
}

module.exports = sendReportGenMsg;
