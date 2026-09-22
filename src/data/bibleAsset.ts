// Isolated so Metro can split this 5.5MB asset out of the first JS bundle.
// A top-level require in bible.ts keeps Expo Go stuck at "bundling 99%".
export const packedBible = require('../../assets/bible/amharic_bible.txt') as
  | number
  | { uri: string };
