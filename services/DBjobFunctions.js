const sessions = require('../db/sessions');

const Job = require('../models/jobs.model');
const { Op } = require('sequelize');

async function getJobs(prop, options) {
  try {
    const result = await Job.findAll({ where: prop, options });
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function findJobsByCriteria(options) {
  try {
    const {
      criteria,
      column = 'jobStatus',
      toExclude = [],
      toInclude = [],
    } = options;
    const whereClause = { ...criteria };

    if (toExclude.length > 0) {
      whereClause[column] = {
        [Op.notIn]: toExclude,
      };
    }
    if (toInclude.length > 0) {
      // Merge the existing criteria with the inclusion criteria
      whereClause[column] = {
        ...whereClause[column],
        [Op.in]: toInclude,
      };
    }

    await Job.sync();
    const jobs = await Job.findAll({
      where: whereClause,
      cache: false, // Disable caching for this query
    });
    console.log(jobs);
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs with exclusion:', error.message);
    throw error;
  }
}

async function addJob(data) {
  try {
    //  await Job.sync();
    const { id } = await Job.create(data);

    return id;
  } catch (error) {
    return null;
  }
}

async function updateJob(id, data) {
  try {
    await Job.sync();
    const result = await Job.update(data, {
      where: { id },
      returning: true,
      plain: true,
    });
    [_, { dataValues }] = result;
    return dataValues;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating job: ${id}: `, error.message);
    } else {
      console.error(`Error updating job: ${id}: `, error);
    }
    return null;
  }

  //   for (let i = 0; i < sessions.length; i++) {
  //     if (sessions[i].jobId === id) {
  //       sessions[i] = { ...sessions[i], ...data };
  //     }
  //   }
  //   return sessions;
}

module.exports = { addJob, getJobs, updateJob, findJobsByCriteria };
