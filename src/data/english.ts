import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import type { DisplayVerse } from './bible';
import { getChapter, printedVerseNumber } from './bible';

export interface EnglishBiblePayload {
  id: string;
  name: string;
  language: string;
  source: string;
  books: string[][][];
}

let payload: EnglishBiblePayload | null = null;
let loading: Promise<EnglishBiblePayload> | null = null;

function resolveAssetModule(mod: unknown): Parameters<typeof Asset.fromModule>[0] {
  if (typeof mod === 'number' || typeof mod === 'string') {
    return mod;
  }
  if (mod && typeof mod === 'object' && 'default' in mod) {
    return resolveAssetModule((mod as { default: unknown }).default);
  }
  if (mod && typeof mod === 'object' && 'uri' in mod && typeof (mod as { uri: unknown }).uri === 'string') {
    const packed = mod as { uri: string; width?: number; height?: number };
    return { uri: packed.uri, width: packed.width ?? 0, height: packed.height ?? 0 };
  }
  throw new Error('English Bible asset is invalid.');
}

async function readPacked(): Promise<EnglishBiblePayload> {
  const { packedEnglishBible } = await import('./englishAsset');
  const asset = Asset.fromModule(resolveAssetModule(packedEnglishBible));
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('English Bible asset could not be resolved.');
  }
  try {
    const response = await fetch(uri);
    if (response.ok) {
      return response.json();
    }
  } catch {
    // Native file:// URIs are not always fetchable.
  }
  const raw = await FileSystem.readAsStringAsync(uri);
  return JSON.parse(raw);
}

export async function ensureEnglishBible(): Promise<EnglishBiblePayload> {
  if (payload) {
    return payload;
  }
  if (!loading) {
    loading = readPacked()
      .then((next) => {
        payload = next;
        return next;
      })
      .catch((error) => {
        loading = null;
        throw error;
      });
  }
  return loading;
}

export function isEnglishReady(): boolean {
  return payload !== null;
}

export function getEnglishVerse(
  bookIndex: number,
  chapterIndex: number,
  verseNumber: number,
): string | null {
  const text = payload?.books[bookIndex]?.[chapterIndex]?.[verseNumber - 1];
  const clean = String(text ?? '').trim();
  return clean || null;
}

export function hasEnglishBook(bookIndex: number): boolean {
  return (payload?.books[bookIndex]?.length ?? 0) > 0;
}

export function getEnglishForDisplay(
  bookIndex: number,
  chapterIndex: number,
  row: DisplayVerse,
): string | null {
  const chapter = getChapter(bookIndex, chapterIndex);
  if (!chapter || !payload) {
    return null;
  }
  const parts: string[] = [];
  const seen = new Set<string>();
  for (let index = row.fromIndex; index <= row.toIndex; index += 1) {
    const number = printedVerseNumber(chapter, index);
    const text = getEnglishVerse(bookIndex, chapterIndex, number);
    if (text && !seen.has(text)) {
      seen.add(text);
      parts.push(text);
    }
  }
  return parts.length > 0 ? parts.join(' ') : null;
}
