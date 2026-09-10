import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import type { UserStore } from '../types/user';
import { EMPTY_USER_STORE } from '../types/user';

export async function exportUserStore(store: UserStore): Promise<void> {
  const fileUri = `${FileSystem.cacheDirectory}amharic-bible-backup.json`;
  await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(store, null, 2));
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'የግል መረጃ ምትኬ',
  });
}

export async function importUserStoreFile(): Promise<UserStore | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets[0]) {
    return null;
  }
  const contents = await FileSystem.readAsStringAsync(result.assets[0].uri);
  const parsed = JSON.parse(contents) as Partial<UserStore>;
  return {
    ...EMPTY_USER_STORE,
    ...parsed,
    version: 1,
    settings: {
      ...EMPTY_USER_STORE.settings,
      ...parsed.settings,
      reader: {
        ...EMPTY_USER_STORE.settings.reader,
        ...parsed.settings?.reader,
      },
    },
  };
}
