import fs from 'node:fs';
import { parseWordProjectChapter } from './wp-parse.mjs';

const eotc = JSON.parse(fs.readFileSync('assets/bible/amharic_bible.txt', 'utf8'));
const protest = JSON.parse(fs.readFileSync(`${process.env.TEMP}/amharic_66.json`, 'utf8'));

const ENGLISH_TO_PROTESTANT = {
  Genesis: 0,
  Exodus: 1,
  Leviticus: 2,
  Numbers: 3,
  Deuteronomy: 4,
  Joshua: 5,
  Judges: 6,
  Ruth: 7,
  '1 Samuel': 8,
  '2 Samuel': 9,
  '1 Kings': 10,
  '2 Kings': 11,
  '1 Chronicles': 12,
  '2 Chronicles': 13,
  Ezra: 14,
  Nehemiah: 15,
  Esther: 16,
  Job: 17,
  Psalms: 18,
  Proverbs: 19,
  Ecclesiastes: 20,
  'Song of Solomon': 21,
  Isaiah: 22,
  Jeremiah: 23,
  Lamentations: 24,
  Ezekiel: 25,
  Daniel: 26,
  Hosea: 27,
  Joel: 28,
  Amos: 29,
  Obadiah: 30,
  Jonah: 31,
  Micah: 32,
  Nahum: 33,
  Habakkuk: 34,
  Zephaniah: 35,
  Haggai: 36,
  Zechariah: 37,
  Malachi: 38,
  Matthew: 39,
  Mark: 40,
  Luke: 41,
  John: 42,
  Acts: 43,
  Romans: 44,
  '1 Corinthians': 45,
  '2 Corinthians': 46,
  Galatians: 47,
  Ephesians: 48,
  Philippians: 49,
  Colossians: 50,
  '1 Thessalonians': 51,
  '2 Thessalonians': 52,
  '1 Timothy': 53,
  '2 Timothy': 54,
  Titus: 55,
  Philemon: 56,
  Hebrews: 57,
  James: 58,
  '1 Peter': 59,
  '2 Peter': 60,
  '1 John': 61,
  '2 John': 62,
  '3 John': 63,
  Jude: 64,
  Revelation: 65,
};

function verseMap(chapter) {
  const map = new Map();
  chapter.verses.forEach((text, index) => {
    const n = chapter.verseNumbers?.[index] ?? index + 1;
    const clean = String(text || '').trim();
    if (clean) map.set(n, clean);
  });
  return map;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fillFromWordProject(bookNumber, chapterNumber, needed) {
  try {
    const remote = await parseWordProjectChapter(bookNumber, chapterNumber);
    const filled = {};
    needed.forEach((n) => {
      if (remote[n - 1]) filled[n] = remote[n - 1];
    });
    return filled;
  } catch {
    return {};
  }
}

let filledFrom66 = 0;
let filledFromWp = 0;
const stillMissing = [];

for (const book of eotc.books) {
  const pIndex = ENGLISH_TO_PROTESTANT[book.englishTitle];
  const pBook = typeof pIndex === 'number' ? protest.books[pIndex] : null;
  for (let ci = 0; ci < book.chapters.length; ci += 1) {
    const chapter = book.chapters[ci];
    const map = verseMap(chapter);
    const pChapter = pBook?.chapters[ci];
    const pLen = pChapter?.verses?.length ?? 0;
    let max = Math.max(...map.keys(), pLen, 0);
    for (let n = 1; n <= max; n += 1) {
      if (map.has(n)) continue;
      const fallback = String(pChapter?.verses?.[n - 1] || '').trim();
      if (fallback) {
        map.set(n, fallback);
        filledFrom66 += 1;
      }
    }
    const holes = [];
    max = Math.max(...map.keys(), pLen, 0);
    for (let n = 1; n <= max; n += 1) {
      if (!map.has(n)) holes.push(n);
    }
    if (holes.length && typeof pIndex === 'number') {
      const extra = await fillFromWordProject(pIndex + 1, ci + 1, holes);
      holes.forEach((n) => {
        if (extra[n]) {
          map.set(n, extra[n]);
          filledFromWp += 1;
        }
      });
      await sleep(60);
    }
    max = Math.max(...map.keys(), 0);
    const verses = [];
    const verseNumbers = [];
    for (let n = 1; n <= max; n += 1) {
      const text = map.get(n);
      if (!text) {
        stillMissing.push(`${book.englishTitle} ${chapter.chapter}:${n}`);
        continue;
      }
      verses.push(text);
      verseNumbers.push(n);
    }
    // If we skipped holes, densify by inserting empty? User hates holes.
    // Rebuild dense 1..max using empty string only if truly missing, then drop trailing empties.
    const dense = [];
    for (let n = 1; n <= max; n += 1) dense.push(map.get(n) || '');
    while (dense.length && !dense[dense.length - 1]) dense.pop();
    chapter.verses = dense;
    chapter.verseNumbers = dense.map((_, i) => i + 1);
  }
}

fs.writeFileSync('assets/bible/amharic_bible.txt', JSON.stringify(eotc));
console.log(
  JSON.stringify(
    {
      filledFrom66,
      filledFromWp,
      stillMissing: stillMissing.length,
      sample: stillMissing.slice(0, 30),
      bytes: fs.statSync('assets/bible/amharic_bible.txt').size,
    },
    null,
    2,
  ),
);
