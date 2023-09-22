const scrapEN = require('./scrapEN');
const scrapEN_DEV = require('./scrapEN');

async function modeDependentDecorator() {
  const originalFunction =
    process.env.NODE_ENV === 'production' ? scrapEN : scrapEN_DEV;
  return originalFunction;
}

module.exports = modeDependentDecorator;
