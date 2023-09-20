const logger = require('../../config/logger.config');
const { deleteJob, findJobsByCriteria } = require('../DBjobFunctions');

async function clearCrushedJobs(email, target) {
  try {
    // Find all records with status 'accepted' ordered by createdAt (oldest to newest)
    const jobs = await findJobsByCriteria({
      criteria: { ...email, ...target, jobStatus: 'scrapping' },
      column: 'createdAt',
      //   toExclude: [],
      //   toInclude: [],
      //   orderColumn: 'reportCreatedAt',
      //   sortOrder: 'DESC',
    });

    if (jobs.length === 0) {
      logger.info('No crushed jobs found in DB');
      return;
    }

    // Extract job IDs from the retrieved records
    const idsToDelete = jobs.map(job => job.id);
    idsToDelete.forEach(async id => {
      await deleteJob(id);
    });

    logger.info('IDs to delete:', idsToDelete);
  } catch (error) {
    logger.error('Error clearing crushed jobs: ', error?.message || error);
    throw error;
  }
}

module.exports = clearCrushedJobs;
