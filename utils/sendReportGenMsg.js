const { getJobs } = require('../services/DBjobFunctions');

async function sendReportGenMsg(io, jobId, target, msg) {
  const [job] = await getJobs({ id: jobId });
  const { socketId, appStatus } = job;
  if (appStatus === 'connected') {
    io.to(socketId).emit('reportGenStatus', { target, msg });
  }
}

module.exports = sendReportGenMsg;
