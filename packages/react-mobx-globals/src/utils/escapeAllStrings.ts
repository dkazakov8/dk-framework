import { escapeHelper } from './escapeHelper';

const htmlEscapes: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const reUnescapedHtml = new RegExp(`[${Object.keys(htmlEscapes).join('')}]`, 'g');

function escape(str: string) {
  return str && reUnescapedHtml.test(str)
    ? str.replace(reUnescapedHtml, (char) => htmlEscapes[char])
    : str;
}

export function escapeAllStrings(item: any): any {
  return escapeHelper(item, escape);
}
