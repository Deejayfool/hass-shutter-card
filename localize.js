//Not in json because browsers do not support it natively for now : cf https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Statements/import
import * as en from './translations/en.js';
import * as fr from './translations/fr.js';

const languages = {
  en: en,
  fr: fr,
};

export function localize(
  string,
  locale
) {
  let translated;
  try {
    translated = string.split('.').reduce((o, i) => o[i], languages[locale.language].values);
    if (!translated) translated = string.split('.').reduce((o, i) => o[i], languages['en'].values);
  } catch (e) {
    try {
      translated = string.split('.').reduce((o, i) => o[i], languages['en'].values);
    } catch (e) {
      translated = '';
    }
  }

  if (!translated || translated == '') {
    console.log("Missing translation for : " + string);
  }
  return translated;
}