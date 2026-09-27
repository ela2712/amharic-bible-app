import fs from 'node:fs';
import path from 'node:path';

const amharic = JSON.parse(fs.readFileSync('assets/bible/amharic_bible.txt', 'utf8'));
const kjvSource = JSON.parse(fs.readFileSync(`${process.env.TEMP}/en_kjv.json`, 'utf8'));
const geezRoot = path.join(process.env.TEMP, 'eotc-gez', 'chapters');

const PROTESTANT_ENGLISH = [
  'Genesis',
  'Exodus',
  'Leviticus',
  'Numbers',
  'Deuteronomy',
  'Joshua',
  'Judges',
  'Ruth',
  '1 Samuel',
  '2 Samuel',
  '1 Kings',
  '2 Kings',
  '1 Chronicles',
  '2 Chronicles',
  'Ezra',
  'Nehemiah',
  'Esther',
  'Job',
  'Psalms',
  'Proverbs',
  'Ecclesiastes',
  'Song of Solomon',
  'Isaiah',
  'Jeremiah',
  'Lamentations',
  'Ezekiel',
  'Daniel',
  'Hosea',
  'Joel',
  'Amos',
  'Obadiah',
  'Jonah',
  'Micah',
  'Nahum',
  'Habakkuk',
  'Zephaniah',
  'Haggai',
  'Zechariah',
  'Malachi',
  'Matthew',
  'Mark',
  'Luke',
  'John',
  'Acts',
  'Romans',
  '1 Corinthians',
  '2 Corinthians',
  'Galatians',
  'Ephesians',
  'Philippians',
  'Colossians',
  '1 Thessalonians',
  '2 Thessalonians',
  '1 Timothy',
  '2 Timothy',
  'Titus',
  'Philemon',
  'Hebrews',
  'James',
  '1 Peter',
  '2 Peter',
  '1 John',
  '2 John',
  '3 John',
  'Jude',
  'Revelation',
];

const GEEZ_FOLDER = {
  Genesis: 'Gen',
  Exodus: 'Exod',
  Leviticus: 'Lev',
  Numbers: 'Num',
  Deuteronomy: 'Deut',
  Joshua: 'Josh',
  Judges: 'Judg',
  Ruth: 'Ruth',
  '1 Samuel': '1Sam',
  '2 Samuel': '2Sam',
  '1 Chronicles': '1Chr',
  '2 Chronicles': '2Chr',
  Jubilees: 'Jub',
  Enoch: '1En',
  Ezra: 'Ezra',
  Nehemiah: 'Neh',
  '3 Book of Ezra': 'ApEz',
  'Book of Tobit': 'Tob',
  'Book of Judith': 'Jdt',
  Esther: 'Esth',
  '1 Meqabyan': '1Meq',
  '2 Meqabyan': '2Meq',
  '3 Meqabyan': '3Meq',
  Job: 'Job',
  Psalms: 'Ps',
  Proverbs: 'Prov',
  'Wisdom of Solomon': 'Wis',
  Ecclesiastes: 'Eccl',
  'Song of Solomon': 'Song',
  'book of sirach': 'Sir',
  Isaiah: 'Isa',
  Jeremiah: 'Jer',
  Lamentations: 'Lam',
  'Teref Baruch': '4Bar',
  Ezekiel: 'Ezek',
  Daniel: 'Dan',
  Hosea: 'Hos',
  Amos: 'Amos',
  Micah: 'Mic',
  Joel: 'Joel',
  Obadiah: 'Obad',
  Jonah: 'Jonah',
  Nahum: 'Nah',
  Habakkuk: 'Hab',
  Zephaniah: 'Zeph',
  Haggai: 'Hag',
  Zechariah: 'Zech',
  Malachi: 'Mal',
  Matthew: 'Matt',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Romans: 'Rom',
  '1 Corinthians': '1Cor',
  '2 Corinthians': '2Cor',
  Galatians: 'Gal',
  Ephesians: 'Eph',
  Philippians: 'Phil',
  Colossians: 'Col',
  '1 Thessalonians': '1Thess',
  '2 Thessalonians': '2Thess',
  '1 Timothy': '1Tim',
  '2 Timothy': '2Tim',
  Titus: 'Tit',
  Philemon: 'Phlm',
  Hebrews: 'Heb',
  '1 Peter': '1Pet',
  '2 Peter': '2Pet',
  '1 John': '1John',
  '2 John': '2John',
  '3 John': '3John',
  James: 'Jas',
  Jude: 'Jude',
  Revelation: 'Rev',
};

function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function emptyBooks() {
  return amharic.books.map(() => []);
}

function loadGeezChapter(folder, chapterNumber) {
  const file = path.join(geezRoot, folder, `${chapterNumber}.json`);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function folderToChapters(folder) {
  const dir = path.join(geezRoot, folder);
  if (!fs.existsSync(dir)) {
    return [];
  }
  const nums = fs
    .readdirSync(dir)
    .map((name) => Number(name.replace(/\.json$/, '')))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  const max = nums[nums.length - 1] ?? 0;
  const chapters = Array.from({ length: max }, () => []);
  nums.forEach((n) => {
    const raw = loadGeezChapter(folder, n);
    if (!raw?.verses) {
      return;
    }
    const verses = [];
    raw.verses.forEach((verse) => {
      const index = Number(verse.num) - 1;
      if (index < 0) {
        return;
      }
      verses[index] = {
        geez: clean(verse.geez),
        kjv: clean(verse.translations?.kjv || verse.translation),
      };
    });
    chapters[n - 1] = verses;
  });
  return chapters;
}

const byKjv = new Map();
kjvSource.forEach((book, index) => {
  const english = PROTESTANT_ENGLISH[index];
  if (!english) {
    return;
  }
  byKjv.set(
    english,
    (book.chapters || []).map((verses) => verses.map((text) => clean(text))),
  );
});

const englishBooks = emptyBooks();
const geezBooks = emptyBooks();
let geezVerses = 0;
let extraEnglish = 0;

amharic.books.forEach((book, bookIndex) => {
  const kjv = byKjv.get(book.englishTitle);
  if (kjv) {
    englishBooks[bookIndex] = kjv.map((chapter) => chapter.slice());
  }
  const folder = GEEZ_FOLDER[book.englishTitle];
  if (!folder) {
    return;
  }
  const packed = folderToChapters(folder);
  geezBooks[bookIndex] = packed.map((chapter) => chapter.map((verse) => verse?.geez || ''));
  packed.forEach((chapter, chapterIndex) => {
    chapter.forEach((verse, verseIndex) => {
      if (verse?.geez) {
        geezVerses += 1;
      }
      if (!verse?.kjv) {
        return;
      }
      if (!englishBooks[bookIndex][chapterIndex]) {
        englishBooks[bookIndex][chapterIndex] = [];
      }
      if (!englishBooks[bookIndex][chapterIndex][verseIndex]) {
        englishBooks[bookIndex][chapterIndex][verseIndex] = verse.kjv;
        extraEnglish += 1;
      }
    });
  });
});

const englishPath = 'assets/bible/english_kjv.txt';
const geezPath = 'assets/bible/geez.txt';
fs.writeFileSync(
  englishPath,
  JSON.stringify({
    id: 'kjv',
    name: 'King James Version',
    language: 'en',
    source: 'King James Version (public domain); extra Ethiopian books filled from manuscript KJV layer where present',
    books: englishBooks,
  }),
);
fs.writeFileSync(
  geezPath,
  JSON.stringify({
    id: 'gez',
    name: 'ግዕዝ',
    language: 'gez',
    source: 'Geʽez manuscript text via cpradmin/ethiopian-bible (CC BY-NC-SA 4.0)',
    books: geezBooks,
  }),
);

if (fs.existsSync('assets/bible/english_web.txt')) {
  fs.unlinkSync('assets/bible/english_web.txt');
}

function filledBooks(rows) {
  return rows.filter((book) => book.some((chapter) => chapter.some((verse) => Boolean(verse)))).length;
}

console.log(
  JSON.stringify(
    {
      kjvBooks: filledBooks(englishBooks),
      geezBooks: filledBooks(geezBooks),
      geezVerses,
      extraEnglishVerses: extraEnglish,
      kjvBytes: fs.statSync(englishPath).size,
      geezBytes: fs.statSync(geezPath).size,
      genKjv: englishBooks[0][0][0],
      genGeez: geezBooks[0][0][0],
      enochGeez: geezBooks[15]?.[0]?.[0]?.slice(0, 60),
    },
    null,
    2,
  ),
);
