const Job = require('../../models/jobs.model');
const { NUMBER_OF_JOBS_TO_DISPLAY } = require('../../config/front.config');
const { findJobsByCriteria } = require('../DBjobFunctions');

async function getLatestJobs(email, targets) {
  try {
    const jobsPromises = targets.map(async target => {
      //TODO Check if there is no records with status 'accepted'
      const resultArray = await findJobsByCriteria({
        //    const [{ dataValues }] = await findJobsByCriteria({
        criteria: { email, target, jobStatus: 'accepted' },
        orderColumn: 'reportCreatedAt',
        sortOrder: 'DESC',
        limit: NUMBER_OF_JOBS_TO_DISPLAY,
        returnColumns: ['target', 'reportCreatedAt', 'data'],
      });

      return [...resultArray.map(job => job.dataValues)];
    });

    // Wait for all promises to resolve (or reject)
    const jobs = await Promise.all(jobsPromises);
    return jobs; // Array of arrays: [[target], [jobs]]
  } catch (error) {
    // Handle errors that may occur during Promise.all
    console.error('Error:', error?.message || error);
    throw error;
  }
}

module.exports = getLatestJobs;
