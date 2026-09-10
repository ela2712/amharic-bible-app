import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadUserStore, saveUserStore } from '../storage/persistence';
import {
  EMPTY_USER_STORE,
  verseKey,
  type AppSettings,
  type Bookmark,
  type Highlight,
  type HighlightColor,
  type PlanProgress,
  type ReaderSettings,
  type ThemeName,
  type UserStore,
  type VerseNote,
} from '../types/user';
import type { ReadingPosition, VerseRef, VerseLocation } from '../types/bible';
import { formatReference, getVerse } from '../data/bible';

interface StudyContextValue {
  ready: boolean;
  store: UserStore;
  settings: AppSettings;
  setTheme: (theme: ThemeName) => void;
  updateReader: (patch: Partial<ReaderSettings>) => void;
  setReadingPosition: (position: ReadingPosition) => void;
  addHistory: (bookIndex: number, chapterIndex: number) => void;
  toggleBookmark: (verse: VerseLocation) => void;
  isBookmarked: (ref: VerseRef) => boolean;
  setHighlight: (verse: VerseLocation, color: HighlightColor | null) => void;
  getHighlight: (ref: VerseRef) => Highlight | undefined;
  upsertNote: (verse: VerseLocation, content: string) => void;
  deleteNote: (ref: VerseRef) => void;
  getNote: (ref: VerseRef) => VerseNote | undefined;
  addSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  setPlanProgress: (planId: string, updater: (current?: PlanProgress) => PlanProgress) => void;
  replaceStore: (store: UserStore) => void;
  resetStore: () => void;
}

const StudyContext = createContext<StudyContextValue | null>(null);

function nowIso(): string {
  return new Date().toISOString();
}

function freshEmptyStore(): UserStore {
  return {
    ...EMPTY_USER_STORE,
    settings: {
      ...EMPTY_USER_STORE.settings,
      reader: { ...EMPTY_USER_STORE.settings.reader },
    },
    bookmarks: [],
    highlights: [],
    notes: [],
    readingHistory: [],
    searchHistory: [],
    planProgress: {},
  };
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<UserStore>(freshEmptyStore);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadUserStore()
      .then((loaded) => {
        if (!cancelled) {
          setStore(loaded);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }
    saveUserStore(store).catch(() => undefined);
  }, [store, ready]);

  const setTheme = useCallback((theme: ThemeName) => {
    setStore((current) => ({
      ...current,
      settings: { ...current.settings, theme },
    }));
  }, []);

  const updateReader = useCallback((patch: Partial<ReaderSettings>) => {
    setStore((current) => ({
      ...current,
      settings: {
        ...current.settings,
        reader: { ...current.settings.reader, ...patch },
      },
    }));
  }, []);

  const setReadingPosition = useCallback((position: ReadingPosition) => {
    setStore((current) => ({ ...current, readingPosition: position }));
  }, []);

  const addHistory = useCallback((bookIndex: number, chapterIndex: number) => {
    setStore((current) => {
      const openedAt = nowIso();
      const next = [
        { bookIndex, chapterIndex, openedAt },
        ...current.readingHistory.filter(
          (item) => item.bookIndex !== bookIndex || item.chapterIndex !== chapterIndex,
        ),
      ].slice(0, 20);
      return { ...current, readingHistory: next };
    });
  }, []);

  const toggleBookmark = useCallback((verse: VerseLocation) => {
    setStore((current) => {
      const key = verseKey(verse);
      const exists = current.bookmarks.some((item) => verseKey(item.ref) === key);
      if (exists) {
        return {
          ...current,
          bookmarks: current.bookmarks.filter((item) => verseKey(item.ref) !== key),
        };
      }
      const bookmark: Bookmark = {
        id: key,
        ref: {
          bookIndex: verse.bookIndex,
          chapterIndex: verse.chapterIndex,
          verseIndex: verse.verseIndex,
        },
        bookTitle: verse.bookTitle,
        chapterNumber: verse.chapterNumber,
        verseNumber: verse.verseNumber,
        text: verse.text,
        createdAt: nowIso(),
      };
      return { ...current, bookmarks: [bookmark, ...current.bookmarks] };
    });
  }, []);

  const isBookmarked = useCallback(
    (ref: VerseRef) => store.bookmarks.some((item) => verseKey(item.ref) === verseKey(ref)),
    [store.bookmarks],
  );

  const setHighlight = useCallback((verse: VerseLocation, color: HighlightColor | null) => {
    setStore((current) => {
      const key = verseKey(verse);
      if (!color) {
        return {
          ...current,
          highlights: current.highlights.filter((item) => verseKey(item.ref) !== key),
        };
      }
      const existing = current.highlights.find((item) => verseKey(item.ref) === key);
      const highlight: Highlight = {
        id: key,
        ref: {
          bookIndex: verse.bookIndex,
          chapterIndex: verse.chapterIndex,
          verseIndex: verse.verseIndex,
        },
        bookTitle: verse.bookTitle,
        chapterNumber: verse.chapterNumber,
        verseNumber: verse.verseNumber,
        text: verse.text,
        color,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      return {
        ...current,
        highlights: [highlight, ...current.highlights.filter((item) => verseKey(item.ref) !== key)],
      };
    });
  }, []);

  const getHighlight = useCallback(
    (ref: VerseRef) => store.highlights.find((item) => verseKey(item.ref) === verseKey(ref)),
    [store.highlights],
  );

  const upsertNote = useCallback((verse: VerseLocation, content: string) => {
    setStore((current) => {
      const key = verseKey(verse);
      const trimmed = content.trim();
      if (!trimmed) {
        return {
          ...current,
          notes: current.notes.filter((item) => verseKey(item.ref) !== key),
        };
      }
      const existing = current.notes.find((item) => verseKey(item.ref) === key);
      const note: VerseNote = {
        id: key,
        ref: {
          bookIndex: verse.bookIndex,
          chapterIndex: verse.chapterIndex,
          verseIndex: verse.verseIndex,
        },
        bookTitle: verse.bookTitle,
        chapterNumber: verse.chapterNumber,
        verseNumber: verse.verseNumber,
        text: verse.text,
        content: trimmed,
        createdAt: existing?.createdAt ?? nowIso(),
        updatedAt: nowIso(),
      };
      return {
        ...current,
        notes: [note, ...current.notes.filter((item) => verseKey(item.ref) !== key)],
      };
    });
  }, []);

  const deleteNote = useCallback((ref: VerseRef) => {
    setStore((current) => ({
      ...current,
      notes: current.notes.filter((item) => verseKey(item.ref) !== verseKey(ref)),
    }));
  }, []);

  const getNote = useCallback(
    (ref: VerseRef) => store.notes.find((item) => verseKey(item.ref) === verseKey(ref)),
    [store.notes],
  );

  const addSearchHistory = useCallback((query: string) => {
    setStore((current) => {
      const trimmed = query.trim();
      if (!trimmed || current.searchHistory[0] === trimmed) {
        return current;
      }
      return {
        ...current,
        searchHistory: [trimmed, ...current.searchHistory.filter((item) => item !== trimmed)].slice(
          0,
          12,
        ),
      };
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setStore((current) => ({ ...current, searchHistory: [] }));
  }, []);

  const setPlanProgress = useCallback(
    (planId: string, updater: (current?: PlanProgress) => PlanProgress) => {
      setStore((current) => ({
        ...current,
        planProgress: {
          ...current.planProgress,
          [planId]: updater(current.planProgress[planId]),
        },
      }));
    },
    [],
  );

  const replaceStore = useCallback((next: UserStore) => {
    setStore(next);
  }, []);

  const resetStore = useCallback(() => {
    setStore(freshEmptyStore());
  }, []);

  const value = useMemo<StudyContextValue>(
    () => ({
      ready,
      store,
      settings: store.settings,
      setTheme,
      updateReader,
      setReadingPosition,
      addHistory,
      toggleBookmark,
      isBookmarked,
      setHighlight,
      getHighlight,
      upsertNote,
      deleteNote,
      getNote,
      addSearchHistory,
      clearSearchHistory,
      setPlanProgress,
      replaceStore,
      resetStore,
    }),
    [
      ready,
      store,
      setTheme,
      updateReader,
      setReadingPosition,
      addHistory,
      toggleBookmark,
      isBookmarked,
      setHighlight,
      getHighlight,
      upsertNote,
      deleteNote,
      getNote,
      addSearchHistory,
      clearSearchHistory,
      setPlanProgress,
      replaceStore,
      resetStore,
    ],
  );

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy(): StudyContextValue {
  const value = useContext(StudyContext);
  if (!value) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return value;
}

export function verseLabel(ref: VerseRef): string {
  const verse = getVerse(ref);
  return verse ? formatReference(verse) : '';
}
