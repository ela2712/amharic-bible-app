import { Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { VerseLocation } from '../types/bible';
import { formatReference } from '../data/bible';

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
