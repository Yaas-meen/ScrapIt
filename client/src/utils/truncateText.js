

const DEFAULT_ELLIPSIS = '…';

/**
   @param {string} text
   @param {number} [max=80]
   @param {{ ellipsis?: string, wordBoundary?: boolean }} [opts]
   @returns {string}
*/
export function truncateText(text, max = 80, { ellipsis = DEFAULT_ELLIPSIS, wordBoundary = true } = {}) {
  if (text == null) return '';
  const s = String(text);
  if (s.length <= max) return s;

  let cut = s.slice(0, max);
  if (wordBoundary) {
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > Math.floor(max * 0.5)) cut = cut.slice(0, lastSpace);
  }
  return cut.replace(/[\s,;:.-]+$/, '') + ellipsis;
}

export function truncateMiddle(text, head = 6, tail = 4, ellipsis = DEFAULT_ELLIPSIS) {
  if (text == null) return '';
  const s = String(text);
  if (s.length <= head + tail + ellipsis.length) return s;
  return `${s.slice(0, head)}${ellipsis}${s.slice(-tail)}`;
}

export default truncateText;