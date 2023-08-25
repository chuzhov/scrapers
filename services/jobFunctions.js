const sessions = require('../db/sessions');

function getJob(prop) {
  const key = Object.keys(prop)[0];
  const val = Object.values(prop)[0];
  return sessions.find(session => session[key] === val) ?? { jobId: null };
}

function addJob(data) {
  sessions.push(data);
}

function updateJob(id, data) {
  for (let i = 0; i < sessions.length; i++) {
    if (sessions[i].jobId === id) {
      sessions[i] = { ...sessions[i], ...data };
    }
  }
  return sessions;
}

module.exports = { addJob, getJob, updateJob };
