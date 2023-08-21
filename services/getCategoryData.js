const axios = require('axios');
const cheerio = require('cheerio');
const { removeEscapeCharacters } = require('../utils');

async function getCategoryData(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const categories = [];
    $('.catalog-list .item').each((index, element) => {
      const link = $(element).find('a').attr('href');
      const name = $(element).find('a').text();
      if (name && link) {
        categories.push({ name: removeEscapeCharacters(name), link });
      }
    });

    return categories;
  } catch (error) {
    throw new Error('Error fetching data: ' + error.message);
  }
}
module.exports = getCategoryData;
