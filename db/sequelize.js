const { Sequelize } = require('sequelize');

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
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log(
      '%cConnection has been established successfully.',
      'color: rgb(53,101,137)'
    );
    return true;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    return false;
  }
}

module.exports = {
  sequelize, // Export the Sequelize instance
  testConnection, // Export the testConnection function
};
