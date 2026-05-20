/**
 * Truncate a string from the end and add an ellipsis.
 *
 * @param {string}  text
 * @param {number}  maxLength   Max characters before truncating (default 80)
 * @param {string}  ellipsis    Suffix appended when truncated (default '…')
 * @returns {string}
 *
 * @example
 * truncate('14 Admiralty Way, Lekki Phase 1, Lagos', 24)
 * // → '14 Admiralty Way, Lekki…'
 */
export function truncate(text, maxLength = 80, ellipsis = '…') {
  if (!text || typeof text !== 'string') return '';
  const str = text.trim();
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + ellipsis;
}

/**
 * Truncate in the middle — useful for addresses, long IDs, file paths.
 *
 * @param {string}  text
 * @param {number}  maxLength
 * @param {string}  ellipsis
 * @returns {string}
 *
 * @example
 * truncateMiddle('14 Admiralty Way, Lekki Phase 1, Victoria Island, Lagos', 30)
 * // → '14 Admiralty Way…Island, Lagos'
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
 * Truncate by word count.
 *
 * @param {string}  text
 * @param {number}  maxWords
 * @param {string}  ellipsis
 * @returns {string}
 *
 * @example
 * truncateWords('Image was too blurry please resubmit', 4)
 * // → 'Image was too blurry…'
 */
export function truncateWords(text, maxWords = 10, ellipsis = '…') {
  if (!text || typeof text !== 'string') return '';
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return text.trim();
  return words.slice(0, maxWords).join(' ') + ellipsis;
}

/**
 * Truncate a file name keeping the extension visible.
 *
 * @param {string}  filename   e.g. 'my-long-waste-photo.jpg'
 * @param {number}  maxLength
 * @returns {string}
 *
 * @example
 * truncateFilename('my-very-long-waste-photo-2024.jpg', 20)
 * // → 'my-very-long-was….jpg'
 */
export function truncateFilename(filename, maxLength = 24) {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return truncate(filename, maxLength);

  const name = filename.slice(0, lastDot);
  const ext  = filename.slice(lastDot); // e.g. '.jpg'
  const available = maxLength - ext.length - 1; // -1 for ellipsis

  if (name.length <= available) return filename;
  return name.slice(0, available).trimEnd() + '…' + ext;
}

export function truncateAddress(address, maxLength = 35) {
  return truncate(address, maxLength);
}

export default truncate;