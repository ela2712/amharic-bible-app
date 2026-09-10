const HOMOPHONE_MAP: Record<string, string> = {
  ሀ: 'ሀ',
  ሁ: 'ሁ',
  ሂ: 'ሂ',
  ሃ: 'ሀ',
  ሄ: 'ሄ',
  ህ: 'ህ',
  ሆ: 'ሆ',
  ኀ: 'ሀ',
  ኁ: 'ሁ',
  ኂ: 'ሂ',
  ኃ: 'ሀ',
  ኄ: 'ሄ',
  ኅ: 'ህ',
  ኆ: 'ሆ',
  ኋ: 'ሏ',
  ሐ: 'ሀ',
  ሑ: 'ሁ',
  ሒ: 'ሂ',
  ሓ: 'ሀ',
  ሔ: 'ሄ',
  ሕ: 'ህ',
  ሖ: 'ሆ',
  ሠ: 'ሰ',
  ሡ: 'ሱ',
  ሢ: 'ሲ',
  ሣ: 'ሳ',
  ሤ: 'ሴ',
  ሥ: 'ስ',
  ሦ: 'ሶ',
  ዐ: 'አ',
  ዑ: 'ኡ',
  ዒ: 'ኢ',
  ዓ: 'አ',
  ዔ: 'ኤ',
  ዕ: 'እ',
  ዖ: 'ኦ',
  ጸ: 'ፀ',
  ጹ: 'ፁ',
  ጺ: 'ፂ',
  ጻ: 'ፃ',
  ጼ: 'ፄ',
  ጽ: 'ፅ',
  ጾ: 'ፆ',
};

export function normalizeAmharic(input: string): string {
  let out = '';
  for (const ch of input.trim().toLowerCase()) {
    out += HOMOPHONE_MAP[ch] ?? ch;
  }
  return out.replace(/\s+/g, ' ');
}

export function includesNormalized(haystack: string, needle: string): boolean {
  return normalizeAmharic(haystack).includes(normalizeAmharic(needle));
}
