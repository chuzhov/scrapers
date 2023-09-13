// Require sequelize
const { DataTypes } = require('sequelize');
// Create connection
const sequelize = require('../db/sequelize');

// Define model
const Job = sequelize.define('Job', {
  jobId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  user: DataTypes.STRING,
  createdAt: DataTypes.DATE,
  dateString: DataTypes.STRING,
  data: DataTypes.JSONB,
  dataLength: {
    type: DataTypes.INTEGER,
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
await Job.sync();
// Save to DB
//await Job.create(data);

// Get from DB
//const job = await Job.findByPk(data.jobId);

module.exports = Job;
