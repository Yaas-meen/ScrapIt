/**
 * @param {string}  text
 * @param {number}  maxLength   
 * @param {string}  ellipsis    
 * @returns {string}
 * @example
 */
export function truncate(text, maxLength = 80, ellipsis = '…') {
  if (!text || typeof text !== 'string') return '';
  const str = text.trim();
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + ellipsis;
}

/**
 * @param {string}  text
 * @param {number}  maxLength
 * @param {string}  ellipsis
 * @returns {string}
 *
 * @example
 */
export function truncateMiddle(text, maxLength = 40, ellipsis = '…') {
  if (!text || typeof text !== 'string') return '';
  const str = text.trim();
  if (str.length <= maxLength) return str;

  const half  = Math.floor((maxLength - ellipsis.length) / 2);
  const start = str.slice(0, half).trimEnd();
  const end   = str.slice(str.length - half).trimStart();
  return `${start}${ellipsis}${end}`;
}

/**
 * @param {string}  text
 * @param {number}  maxWords
 * @param {string}  ellipsis
 * @returns {string}
 *
 * @example
 */
export function truncateWords(text, maxWords = 10, ellipsis = '…') {
  if (!text || typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + ellipsis;
}

/**
 * @param {string}  filename  
 * @param {number}  maxLength
 * @returns {string}
 * @example
 */
export function truncateFilename(filename, maxLength = 24) {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return truncate(filename, maxLength);

  const name = filename.slice(0, lastDot);
  const ext  = filename.slice(lastDot); 
  const available = maxLength - ext.length - 1;

  if (name.length <= available) return filename;
  return name.slice(0, available).trimEnd() + '…' + ext;
}

export function truncateAddress(address, maxLength = 35) {
  return truncate(address, maxLength);
}
export default truncate;