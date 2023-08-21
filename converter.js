const json2xls = require('json2xls');
const fs = require('fs');

// Read JSON data from the file
const rawData = fs.readFileSync('data.json', 'utf8');
const jsonData = JSON.parse(rawData);

// Convert JSON to XLS format
const xlsData = json2xls(jsonData);

// Write XLS data to a file
fs.writeFileSync('data.xlsx', xlsData, 'binary');

console.log(
  'JSON data from fetchedData.json converted to XLS format and saved as data.xlsx'
);
