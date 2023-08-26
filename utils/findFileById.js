const fs = require('fs');
const path = require('path');

function findFileById(id) {
  const rootDir = path.resolve(__dirname, '..'); // Go up one directory to the root
  const publicFolderPath = path.join(rootDir, 'public');

  const files = fs.readdirSync(publicFolderPath);

  for (const file of files) {
    if (file.includes(id) && file.endsWith('.json')) {
      const datePattern = /\d{4}-\d{2}-\d{2} \d{2}-\d{2}/;
      const match = file.match(datePattern);
      const dateString = match[0];
      return { filename: path.join(publicFolderPath, file), dateString };
    }
  }

  throw new Error(`Файл с id ${id} не найден.`);
}

module.exports = findFileById;
