import fs from 'node:fs';

const source = JSON.parse(fs.readFileSync(`${process.env.TEMP}/en_web.json`, 'utf8'));
const amharic = JSON.parse(fs.readFileSync('assets/bible/amharic_bible.txt', 'utf8'));

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

const byEnglish = new Map();
source.forEach((book, index) => {
  const english = PROTESTANT_ENGLISH[index];
  if (english) {
    byEnglish.set(
      english,
      (book.chapters || []).map((verses) =>
        verses.map((text) => String(text || '').replace(/\s+/g, ' ').trim()),
      ),
    );
  }
});

const books = amharic.books.map((book) => byEnglish.get(book.englishTitle) ?? []);

const payload = {
  id: 'web',
  name: 'World English Bible',
  language: 'en',
  source: 'World English Bible (public domain)',
  books,
};

const outPath = 'assets/bible/english_web.txt';
fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(
  JSON.stringify(
    {
      books: books.filter((item) => item.length > 0).length,
      empty: books.filter((item) => item.length === 0).length,
      bytes: fs.statSync(outPath).size,
      gen11: books[0]?.[0]?.[0]?.slice(0, 80),
    },
    null,
    2,
  ),
);
