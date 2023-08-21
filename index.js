const json2xls = require('json2xls');
const fs = require('fs');
const fetchedData = [];

const {
  getCategoryData,
  getAllProductLinks,
  getProductData,
  getSubcategoryData,
} = require('./services');

const url = 'https://enext.ua/uk/';

(async () => {
  try {
    const categoryData = await getCategoryData(url);

    for (const category of categoryData) {
      //const category = categoryData[3];
      console.log(`Category: ${category.name}`);

      const subcategories = await getSubcategoryData(
        `https://enext.ua${category.link}`
      );
      for (const subcategory of subcategories) {
        //const subcategory = subcategories[1]; //for quick testing
        console.log(`- Subcategory: ${subcategory.name}`);

        const productLinks = await getAllProductLinks(subcategory.link);

        // for (const productLink of productLinks) {
        //   const productData = await getProductData(
        //     `https://enext.ua${productLink}`
        //   );

        //   process.stdout.write(`${productData.productName}\r`);

        //   const resultObject = {
        //     category: category.name,
        //     subcategory: subcategory.name,
        //     id: productData.productID,
        //     name: productData.productName,
        //   };
        //   productData.properties.forEach((property, index) => {
        //     resultObject[`свойство-${index + 1}`] = property.propertyName;
        //     resultObject[`значение-${index + 1}`] = property.propertyValue;
        //   });

        //   fetchedData.push(resultObject);

        // const requests = productLinks.map(url =>
        //   getProductData(`https://enext.ua${url}`)
        // );

        for (let i = 0; i < Math.ceil(productLinks.length / 20); i++) {
          const requests = [];
          for (let j = 0; j < 21; j++) {
            if (productLinks[i * 20 + j]) {
              requests[j] = getProductData(
                `https://enext.ua${productLinks[i * 20 + j]}`
              );
            }
          }

          const responses = await Promise.all(
            requests.map(promise => promise.catch(error => error))
          );

          responses.forEach(product => {
            const resultObject = {
              category: category.name,
              subcategory: subcategory.name,
              id: product.productID,
              name: product.productName,
              description: product.productDescription,
            };
            product.properties.forEach((property, index) => {
              resultObject[`свойство-${index + 1}`] = property.propertyName;
              resultObject[`значение-${index + 1}`] = property.propertyValue;
            });
            fetchedData.push(resultObject);
          });
        }

        console.log('---');
      }
    }
    fs.writeFileSync(
      'data.json',
      JSON.stringify(fetchedData, null, 2),
      'utf-8'
    );

    console.log('File saved successfully.');
  } catch (error) {
    console.error(error.message);
  }
})();
