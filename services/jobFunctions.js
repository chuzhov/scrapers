const shortid = require('shortid');
const sessions = require('../db/sessions');

function getJobs(prop) {
  const key = Object.keys(prop)[0];
  const val = Object.values(prop)[0];
  // returns an array of sessions
  //return sessions.find(session => session[key] === val) ?? { jobId: null };
  return sessions.filter(session => session[key] === val);
}

function addJob(data) {
  data.jobId = shortid.generate();
  sessions.push(data);
  return data.jobId;
}

function updateJob(id, data) {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].jobId === id) {
      sessions[i] = { ...sessions[i], ...data };
    }
  }
  return sessions;
}

module.exports = { addJob, getJobs, updateJob };
