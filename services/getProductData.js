const axios = require('axios');
const cheerio = require('cheerio');

async function getProductData(productLink) {
  try {
    const response = await axios.get(productLink);
    const html = response.data;
    const $ = cheerio.load(html);

    // Extract product name
    const productName = $('h1[itemprop="name"] strong').text().trim();
    const productDescription = $('p[itemprop="description"]').text().trim();
    // Extract product ID
    const productIDElement = $('.item.-artikul');
    const productIDFull = productIDElement.text().trim();
    const productIDParts = productIDFull.split(':');
    const productID =
      productIDParts.length === 2 ? productIDParts[1].trim() : '';

    const properties = [];
    $('.t1-item.t1-active table tr').each((index, row) => {
      const propertyName = $(row).find('td:first-child').text().trim();
      const propertyValue = $(row).find('td:nth-child(2)').text().trim();
      properties.push({ propertyName, propertyValue });
    });

    return { productID, productName, productDescription, properties };
  } catch (error) {
    throw new Error('Error fetching product description: ' + error.message);
  }
}
module.exports = getProductData;
