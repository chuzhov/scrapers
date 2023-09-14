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

async function findJobsByCriteria(criteria, statusesToExclude = []) {
  try {
    const whereClause = { ...criteria };

    if (statusesToExclude.length > 0) {
      whereClause.jobStatus = {
        [Op.notIn]: statusesToExclude,
      };
    }

    const jobs = await Job.findAll({
      where: whereClause,
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs with exclusion:', error);
    throw error;
  }
}

async function addJob(data) {
  try {
    //  await Job.sync();
    const { id } = await Job.create(data);
    console.log(id);
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
