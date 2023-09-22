const {
  getCategoryData,
  getAllProductLinks,
  getProductData,
  getSubcategoryData,
} = require('../services');
const { newFilename, sendReportGenMsg } = require('../utils');
const logger = require('../config/logger.config');

const scrapEN_DEV = async (io, jobId) => {
  const TARGET = 'EN';
  const fetchedData = [];
  logger.info('Scraping data in development mode');

  try {
    const categoryData = await getCategoryData('/uk/');

    //  for (const category of categoryData) {  //001

    const category = categoryData[10]; //001
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
          console.warn('Some requests were failed:');
          console.log(
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
    //  } //001

    // const [{ email }] = await getJobs({ id: jobId });
    // const { filename, dateString } = newFilename(
    //   `${email} EN ${jobId}`,
    //   'json'
    // );
    // const filePath = path.join(__dirname, 'public', filename);

    // fs.writeFileSync(filePath, JSON.stringify(fetchedData, null, 2), 'utf-8');

    // console.log('File saved successfully.');
    logger.info(`🎯 Scraped successfully. Data length: ${fetchedData.length}`);
    return { success: true, data: fetchedData };
  } catch (error) {
    logger.error(
      `Error in <scrappEN-DEV> function : 
        ${error?.message || error}`
    );
    return { succes: false, data: error.message, dateString: '' };
  }
};

module.exports = scrapEN_DEV;
