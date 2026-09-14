import AsyncStorage from '@react-native-async-storage/async-storage';
import { EMPTY_USER_STORE, type UserStore } from '../types/user';
import { STORAGE_KEYS } from './keys';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseReadingPosition(raw: unknown): UserStore['readingPosition'] {
  if (!isObject(raw)) {
    return null;
  }
  if (
    typeof raw.bookIndex !== 'number' ||
    typeof raw.chapterIndex !== 'number' ||
    typeof raw.verseIndex !== 'number'
  ) {
    return null;
  }
  return {
    bookIndex: raw.bookIndex,
    chapterIndex: raw.chapterIndex,
    verseIndex: raw.verseIndex,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

function migrateStore(raw: unknown): UserStore {
  if (!isObject(raw)) {
    return { ...EMPTY_USER_STORE };
  }
  return {
    version: 1,
    readingPosition: parseReadingPosition(raw.readingPosition),
    readingHistory: Array.isArray(raw.readingHistory)
      ? (raw.readingHistory as UserStore['readingHistory'])
      : [],
    bookmarks: Array.isArray(raw.bookmarks) ? (raw.bookmarks as UserStore['bookmarks']) : [],
    highlights: Array.isArray(raw.highlights) ? (raw.highlights as UserStore['highlights']) : [],
    notes: Array.isArray(raw.notes) ? (raw.notes as UserStore['notes']) : [],
    settings: {
      ...EMPTY_USER_STORE.settings,
      ...(isObject(raw.settings) ? raw.settings : {}),
      reader: {
        ...EMPTY_USER_STORE.settings.reader,
        ...(isObject(raw.settings) && isObject(raw.settings.reader)
          ? raw.settings.reader
          : {}),
      },
    },
    searchHistory: Array.isArray(raw.searchHistory)
      ? (raw.searchHistory as string[]).filter((item) => typeof item === 'string')
      : [],
    planProgress: isObject(raw.planProgress)
      ? (raw.planProgress as UserStore['planProgress'])
      : {},
  };
}

export async function loadUserStore(): Promise<UserStore> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.userStore);
    if (!raw) {
      return { ...EMPTY_USER_STORE, settings: { ...EMPTY_USER_STORE.settings, reader: { ...EMPTY_USER_STORE.settings.reader } } };
    }
    return migrateStore(JSON.parse(raw));
  } catch {
    return { ...EMPTY_USER_STORE, settings: { ...EMPTY_USER_STORE.settings, reader: { ...EMPTY_USER_STORE.settings.reader } } };
  }
}

export async function saveUserStore(store: UserStore): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.userStore, JSON.stringify(store));
}

export async function clearUserStore(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.userStore);
}
