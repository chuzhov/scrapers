const { Sequelize } = require('sequelize');
const logger = require('../config/logger.config');

const { DB_NAME, DB_PORT = '', DB_USER, DB_PASSWORD, DB_HOST } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
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
    logger.info(
      `🗄 Connection to ${DB_NAME}|${DB_HOST} has been established successfully.`
    );
    return true;
  } catch (error) {
    console.log('DB_HOST: ', DB_HOST);
    logger.error(
      `[sequelize.js] Unable to connect to ${DB_HOST} , ${
        error?.message || error
      }`
    );
    throw error;
  }
}

module.exports = {
  sequelize, // Export the Sequelize instance
  testDBConnection, // Export the testConnection function
};
