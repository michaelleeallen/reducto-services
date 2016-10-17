module.exports = (str, obj) => str.replace(/(?:{)([0-9a-zA-Z]+?)(?:})/g, (match, p1) => obj[p1] || '');
