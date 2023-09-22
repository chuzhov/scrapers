// Require sequelize
const { DataTypes } = require('sequelize');
// Create connection
const { sequelize } = require('../db/sequelize');
const logger = require('../config/logger.config');

// Define model
const Job = sequelize.define('Job', {
  target: DataTypes.STRING,
  email: DataTypes.STRING,
  socketId: DataTypes.STRING,
  jobStatus: DataTypes.STRING, // error, scrapping, finished, accepted
  appStatus: DataTypes.STRING, //connected, disconnected
  reportCreatedAt: DataTypes.DATE,
  data: DataTypes.JSONB,
  dataLength: {
    type: DataTypes.VIRTUAL,
    get() {
      const data = this.getDataValue('data');
      // Parse if needed
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          data = null;
        }
      }
      return Array.isArray(data) ? data.length : 0;
    },
  },
});

// Sync model to DB
(async () => {
  try {
    await Job.sync(); // Your Sequelize synchronization code here
    logger.info('Database synchronized successfully');
  } catch (error) {
    logger.error(
      `[job.model.js] Error synchronizing database: ${error?.message || error}`
    );
  }
})();

module.exports = Job;
