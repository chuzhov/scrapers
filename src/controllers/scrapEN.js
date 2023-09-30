const {
  getCategoryData,
  getAllProductLinks,
  getProductData,
  getSubcategoryData,
} = require('../services');
const { sendReportGenMsg } = require('../utils');
const logger = require('../config/logger.config');

const scrapEN = async (io, jobId) => {
  const TARGET = 'EN';
  const fetchedData = [];
  logger.info('🐙 Scraping data in PRODUCTION mode');

  try {
    const categoryData = await getCategoryData('/uk/');

    for (const category of categoryData) {
      console.log(`Category: ${category.name}`);

      const branch0 = {
        name: category.name,
        type:
          categoryData.indexOf(category) === categoryData.length - 1
            ? 'last'
            : 'middle',
        parent: 'last',
      };

      await sendReportGenMsg(io, jobId, TARGET, branch0);

      const subcategories = await getSubcategoryData(category.link);
      for (const subcategory of subcategories) {
        console.log(`- Subcategory: ${subcategory.name}`);
        const branch1 = {
          name: subcategory.name,
          type:
            subcategories.indexOf(subcategory) === subcategories.length - 1
              ? 'last'
              : 'middle',
          branch0: branch0.type === 'last' ? 'last' : 'middle',
        };
        await sendReportGenMsg(io, jobId, TARGET, branch1);

        const productLinks = await getAllProductLinks(subcategory.link);
        if (productLinks.length === 0) continue;

        const branch2 = {
          name: `Продуктів: ${productLinks.length}`,
          type: 'last',
          branch0: branch0.type === 'last' ? 'last' : 'middle',
          branch1: branch1.type === 'last' ? 'last' : 'middle',
        };

        await sendReportGenMsg(io, jobId, TARGET, branch2);

        for (let i = 0; i < Math.ceil(productLinks.length / 20); i++) {
          const requests = [];
          for (let j = 0; j < 21; j++) {
            if (productLinks[i * 20 + j]) {
              requests[j] = getProductData(productLinks[i * 20 + j]);
            }
          }

          const responses = await Promise.all(
            requests.map(promise => promise.catch(error => error))
          );

          //checking if some requests failed
          const rejectedIndexes = responses.reduce((acc, response, index) => {
            if (response instanceof Error) {
              acc.push(index);
            }
            return acc;
          }, []);

          if (rejectedIndexes.length > 0) {
            logger.warn('Some requests were failed:');
            logger.warn(
              `Total requests: ${requests.length} / failed: ${rejectedIndexes.length}`
            );
          }

          responses.forEach(product => {
            const resultObject = {
              category: category.name,
              subcategory: subcategory.name,
              id: product.productID,
              name: product.productName,
              description: product.productDescription,
            };
            product.properties.forEach((property, index) => {
              resultObject[`властивість-${index + 1}`] = property.propertyName;
              resultObject[`значення-${index + 1}`] = property.propertyValue;
            });
            fetchedData.push(resultObject);
          });
        }
      }
    } //001
    return { success: true, data: fetchedData };
  } catch (error) {
    logger.error(
      `Error in <scrapEN> function:  
        ${error?.message || error}`
    );
    return { succes: false, data: error.message, dateString: '' };
  }
};

module.exports = scrapEN;
