const Job = require('../../models/jobs.model');
const { NUMBER_OF_JOBS_TO_KEEP } = require('../../config/db.config');
const { deleteJob, findJobsByCriteria } = require('../DBjobFunctions');
const logger = require('../../config/logger.config');

async function clearUnnecessaryAcceptedJobs(email, target) {
  try {
    // Find all records with status 'accepted' ordered by createdAt (oldest to newest)
    const jobs = await findJobsByCriteria({
      criteria: { ...email, ...target, jobStatus: 'accepted' },
      column: 'createdAt',
      toExclude: [],
      toInclude: [],
      orderColumn: 'reportCreatedAt',
      sortOrder: 'DESC',
    });

    if (jobs.length === 0) {
      console.log('No records found with jobStatus = "accepted".');
      return;
    }

    // Extract job IDs from the retrieved records
    const jobIds = jobs.map(job => job.id);
    if (jobIds.length <= NUMBER_OF_JOBS_TO_KEEP) {
      console.log('There are fewer records than NUMBER_OF_JOBS_TO_KEEP.');
      return;
    }

    // Exclude the first NUMBER_OF_JOBS_TO_KEEP IDs
    const idsToDelete = jobIds.slice(NUMBER_OF_JOBS_TO_KEEP);
    idsToDelete.forEach(async id => {
      await deleteJob(id);
    });

    logger.info(`IDs to delete:, ${idsToDelete}`);
  } catch (error) {
    logger.error(
      `<clearUnnecessaryAcceptedJobs> Error:', ${error?.message || error}`
    );
    throw error;
  }
}

module.exports = clearUnnecessaryAcceptedJobs;
