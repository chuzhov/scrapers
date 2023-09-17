const cheerio = require('cheerio');

const { en_api } = require('./axios-config');
const { removeEscapeCharacters } = require('../utils');

async function getSubcategoryData(url) {
  try {
    const response = await en_api.get(url);
    const html = response.data;

    const categories = [];

    const $ = cheerio.load(html);

    // Select the list items within the ul with class "item-list"
    const listItems = $('li.catalog-item');

    // Loop through each list item and extract reference and text
    listItems.each((index, listItem) => {
      const anchorTag = $(listItem).find('a.item.-link');
      const link = anchorTag.attr('href');
      const name = anchorTag.text().trim();

      if (name && link)
        categories.push({ name: removeEscapeCharacters(name), link });
    });

    return categories;
  } catch (error) {
    throw new Error('Error fetching data: ' + error.message);
  }
}
module.exports = getSubcategoryData;
