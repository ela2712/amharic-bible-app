// Isolated so Metro can split this asset out of the first JS bundle.
// A top-level require in bible.ts keeps Expo Go stuck at "bundling 99%".
// Source: EOTCOpenSource/BibleAPI data/80-weahadu.json (81-book Amharic canon).
export const packedBible = require('../../assets/bible/amharic_bible.txt') as
  | number
  | { uri: string };
