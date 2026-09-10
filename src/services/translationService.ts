import { AMHARIC_TRANSLATION } from '../data/bible';
import type { Translation } from '../types/bible';

/**
 * Translation abstraction. Only the bundled Amharic Bible exists today.
 * Additional translations can be registered without changing the reader.
 */
const translations: Translation[] = [AMHARIC_TRANSLATION];

export function listTranslations(): Translation[] {
  return translations;
}

export function getTranslation(id: string): Translation | null {
  return translations.find((item) => item.id === id) ?? null;
}

export function getActiveTranslation(): Translation {
  return translations[0];
}

export function registerTranslation(translation: Translation): void {
  if (translations.some((item) => item.id === translation.id)) {
    return;
  }
  translations.push(translation);
}
