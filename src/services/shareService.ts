import { Alert, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { VerseLocation } from '../types/bible';
import type { ReaderLanguage } from '../types/user';
import {
  formatReference,
  getBook,
  getChapter,
  getDisplayVerses,
} from '../data/bible';
import { ensureEnglishBible, getEnglishForDisplay, isEnglishReady } from '../data/english';
import { ensureGeezBible, getGeezForDisplay, isGeezReady } from '../data/geez';

export async function copyVerse(verse: VerseLocation, withReference = true): Promise<void> {
  const reference = formatReference(verse);
  const payload = withReference ? `${verse.text}\n\n${reference}` : verse.text;
  await Clipboard.setStringAsync(payload);
}

export async function shareVerse(verse: VerseLocation, withReference = true): Promise<void> {
  const reference = formatReference(verse);
  const message = withReference ? `${verse.text}\n\n— ${reference}` : verse.text;
  await Share.share({ message, title: reference });
}

export function formatChapterText(
  bookIndex: number,
  chapterIndex: number,
  language: ReaderLanguage = 'am',
): string | null {
  const book = getBook(bookIndex);
  const chapter = getChapter(bookIndex, chapterIndex);
  if (!book || !chapter) {
    return null;
  }
  const rows = getDisplayVerses(chapter);
  const heading =
    language === 'en'
      ? `${book.englishTitle ?? book.title} ${chapter.chapter}`
      : `${book.title} ${chapter.chapter}`;
  const lines = [heading, ''];
  rows.forEach((row) => {
    const label = row.start === row.end ? `${row.start}` : `${row.start}–${row.end}`;
    let body = row.text;
    if (language === 'en' && isEnglishReady()) {
      body = getEnglishForDisplay(bookIndex, chapterIndex, row) ?? '';
    }
    if (language === 'gez' && isGeezReady()) {
      body = getGeezForDisplay(bookIndex, chapterIndex, row) ?? '';
    }
    if (body) {
      lines.push(`${label}  ${body}`);
      lines.push('');
    }
  });
  return lines.join('\n').trim();
}

export async function copyChapter(
  bookIndex: number,
  chapterIndex: number,
  language: ReaderLanguage = 'am',
): Promise<void> {
  if (language === 'en') {
    await ensureEnglishBible().catch(() => undefined);
  }
  if (language === 'gez') {
    await ensureGeezBible().catch(() => undefined);
  }
  const text = formatChapterText(bookIndex, chapterIndex, language);
  if (!text) {
    throw new Error('Chapter is empty.');
  }
  await Clipboard.setStringAsync(text);
}

export async function shareChapter(
  bookIndex: number,
  chapterIndex: number,
  language: ReaderLanguage = 'am',
): Promise<void> {
  if (language === 'en') {
    await ensureEnglishBible().catch(() => undefined);
  }
  if (language === 'gez') {
    await ensureGeezBible().catch(() => undefined);
  }
  const book = getBook(bookIndex);
  const chapter = getChapter(bookIndex, chapterIndex);
  const text = formatChapterText(bookIndex, chapterIndex, language);
  if (!book || !chapter || !text) {
    throw new Error('Chapter is empty.');
  }
  const title = `${book.title} ${chapter.chapter}`;
  await Share.share({ message: text, title });
}

export function promptChapterShare(
  bookIndex: number,
  chapterIndex: number,
  language: ReaderLanguage = 'am',
): void {
  Alert.alert('ምዕራፍ', 'ምዕራፉን ቅዳ ወይ አጋራ', [
    { text: 'ተወው', style: 'cancel' },
    {
      text: 'ቅዳ',
      onPress: () => {
        copyChapter(bookIndex, chapterIndex, language).catch(() => {
          Alert.alert('ስህተት', 'ምዕራፉ ሊቀዳ አልቻለም።');
        });
      },
    },
    {
      text: 'አጋራ',
      onPress: () => {
        shareChapter(bookIndex, chapterIndex, language).catch(() => {
          Alert.alert('ስህተት', 'ምዕራፉ ሊጋራ አልቻለም።');
        });
      },
    },
  ]);
}
