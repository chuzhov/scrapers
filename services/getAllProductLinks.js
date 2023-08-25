const cheerio = require('cheerio');

const { en_api } = require('../services/axios-config');

async function getProductLinksFromPage(pageUrl) {
  try {
    const response = await en_api.get(pageUrl);
    const html = response.data;
    const $ = cheerio.load(html);

    const productLinks = [];
    $('a.product-item').each((index, element) => {
      const link = $(element).attr('href');
      productLinks.push(link);
    });

    return productLinks;
  } catch (error) {
    throw new Error('Error fetching product links: ' + error.message);
  }
}

async function getAllProductLinks(categoryLink) {
  try {
    let page = 1;
    let allProductLinks = [];
    while (true) {
      process.stdout.write(`${page}\r`);

      const pageUrl = `${categoryLink}?PAGEN_1=${page}`;
      const productLinks = await getProductLinksFromPage(pageUrl);

      if (productLinks[0] === allProductLinks[0] || productLinks.length === 0) {
        break; // No more pages, exit loop
      }

      allProductLinks = allProductLinks.concat(productLinks);
      page++;
    }

    return allProductLinks;
  } catch (error) {
    throw new Error('Error fetching all product links: ' + error.message);
  }
}

module.exports = getAllProductLinks;
