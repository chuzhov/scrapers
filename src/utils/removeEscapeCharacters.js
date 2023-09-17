function removeSpecialCharacters(str = '') {
  if (!str) return '';
  const backslashRegex = /\n/g; // Match backslash followed by any character
  const result = str.replace(backslashRegex, '');
  return result;
}

module.exports = removeSpecialCharacters;
