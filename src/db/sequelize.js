const { Sequelize } = require('sequelize');
const logger = require('../config/logger.config');

const { DB_NAME, DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

// Test connection
async function testDBConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Connection to DB has been established successfully.');
    return true;
  } catch (error) {
    logger.error(
      `[sequelize.js] Unable to connect to the DB , ${error?.message || error}`
    );
    return false;
  }
}

module.exports = {
  sequelize, // Export the Sequelize instance
  testDBConnection, // Export the testConnection function
};
