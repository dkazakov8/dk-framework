import { escapeHelper } from './escapeHelper';

const htmlUnescapes: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
};

const reEscapedHtml = /&(?:amp|lt|gt|quot|#39);/g;

function unescape(str: string) {
  return str && reEscapedHtml.test(str)
    ? str.replace(reEscapedHtml, (char) => htmlUnescapes[char])
    : str;
}

export function unescapeAllStrings(item: any): any {
  return escapeHelper(item, unescape);
}
