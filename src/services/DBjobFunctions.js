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

async function findJobsByCriteria(options = {}) {
  try {
    const {
      criteria,
      column = 'jobStatus',
      toExclude = [],
      toInclude = [],
      orderColumn = 'createdAt',
      sortOrder = 'ASC',
      limit, // Added limit option
      returnColumns = [], // Renamed columns to returnColumns
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
        ...whereClause[column], // Preserve the existing criteria
        [Op.in]: toInclude, // Add the inclusion criteria
      };
    }

    await Job.sync();
    const queryOptions = {
      where: whereClause,
      cache: false, // Disable caching for this query
    };

    // Check if orderColumn is provided, if so, add ordering to the query
    if (orderColumn) {
      queryOptions.order = [[orderColumn, sortOrder]];
    }

    // Check if limit is provided, if so, add it to the query
    if (limit) {
      queryOptions.limit = limit;
    }

    // Check if returnColumns are provided, if so, include them in the query
    if (returnColumns.length > 0) {
      queryOptions.attributes = returnColumns;
    }

    const jobs = await Job.findAll(queryOptions);

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
}

async function deleteJob(id) {
  try {
    await Job.destroy({ where: { id } });
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = { addJob, getJobs, updateJob, findJobsByCriteria, deleteJob };
