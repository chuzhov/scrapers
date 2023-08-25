const { getJob } = require('../services/jobFunctions');

function sendReportGenMsg(io, jobId, msg) {
  const { socketId, appStatus } = getJob({ jobId });
  if (appStatus === 'connected') {
    io.to(socketId).emit('reportGenStatus', msg);
  }
}

module.exports = sendReportGenMsg;
