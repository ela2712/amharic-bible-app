import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import type { CrossReference } from '../types/study';
import type { VerseRef } from '../types/bible';
import { verseKey } from '../types/user';
import { packedCrossRefs } from '../data/crossrefAsset';

let byFrom: Record<string, string> | null = null;
let loading: Promise<void> | null = null;
let sourceLabel = 'Treasury of Scripture Knowledge';

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
  throw new Error('Cross-reference asset is invalid.');
}

async function readPacked(): Promise<{ source?: string; byFrom?: Record<string, string> }> {
  const asset = Asset.fromModule(resolveAssetModule(packedCrossRefs));
  await asset.downloadAsync();
  const uri = asset.localUri ?? asset.uri;
  if (!uri) {
    throw new Error('Cross-reference asset could not be resolved.');
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

export function hasCrossReferences(): boolean {
  return true;
}

export function crossReferenceSource(): string {
  return sourceLabel;
}

export async function ensureCrossReferences(): Promise<void> {
  if (byFrom) {
    return;
  }
  if (!loading) {
    loading = readPacked()
      .then((payload) => {
        byFrom = payload.byFrom ?? {};
        if (payload.source) {
          sourceLabel = payload.source;
        }
      })
      .catch((error) => {
        loading = null;
        throw error;
      });
  }
  await loading;
}

function parseTarget(token: string): VerseRef | null {
  const parts = token.split('.').map((item) => Number(item));
  if (parts.length !== 3 || parts.some((item) => !Number.isFinite(item))) {
    return null;
  }
  return { bookIndex: parts[0], chapterIndex: parts[1], verseIndex: parts[2] };
}

export function getCrossReferences(ref: VerseRef): CrossReference[] {
  if (!byFrom) {
    return [];
  }
  const packed = byFrom[verseKey(ref)];
  if (!packed) {
    return [];
  }
  return packed
    .split(' ')
    .map(parseTarget)
    .filter((item): item is VerseRef => item !== null)
    .map((to) => ({ from: ref, to }));
}
