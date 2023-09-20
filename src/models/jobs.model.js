// Require sequelize
const { DataTypes } = require('sequelize');
// Create connection
const { sequelize } = require('../db/sequelize');

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
    console.log('Database synchronized successfully');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
})();
// Save to DB
//await Job.create(data);

// Get from DB
//const job = await Job.findByPk(data.jobId);

module.exports = Job;
