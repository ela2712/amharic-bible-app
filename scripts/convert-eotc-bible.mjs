import fs from 'node:fs';

const sourcePath = `${process.env.TEMP}/80-weahadu.json`;
const outPath = 'assets/bible/amharic_bible.txt';

const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));

function chapterVerses(chapter) {
  const rows = [];
  for (const section of chapter.sections || []) {
    for (const verse of section.verses || []) {
      const n = Number(verse.verse);
      const text = String(verse.text || '').trim();
      if (!Number.isFinite(n) || !text) {
        continue;
      }
      rows.push({ n, text });
    }
  }
  rows.sort((a, b) => a.n - b.n);
  return {
    verses: rows.map((row) => row.text),
    verseNumbers: rows.map((row) => row.n),
    title: typeof chapter.sections?.[0]?.title === 'string' ? chapter.sections[0].title : '',
  };
}

const books = source.map((book) => ({
  title: book.book_name_am,
  abbv: book.book_short_name_am || '',
  englishTitle: book.book_name_en || '',
  testament: book.testament === 'new' ? 'nt' : 'ot',
  chapters: (book.chapters || []).map((chapter) => {
    const parsed = chapterVerses(chapter);
    return {
      chapter: String(chapter.chapter),
      title: parsed.title,
      verses: parsed.verses,
      verseNumbers: parsed.verseNumbers,
    };
  }),
}));

const dataset = {
  title: 'ሠማንያ ወአሐዱ',
  source: 'EOTCOpenSource/BibleAPI 80-weahadu',
  books,
};

let empty = 0;
let verses = 0;
books.forEach((book) =>
  book.chapters.forEach((chapter) => {
    verses += chapter.verses.length;
    empty += chapter.verses.filter((text) => !String(text).trim()).length;
  }),
);

fs.writeFileSync(outPath, JSON.stringify(dataset));
console.log(
  JSON.stringify(
    {
      books: books.length,
      verses,
      empty,
      bytes: fs.statSync(outPath).size,
      ot: books.filter((book) => book.testament === 'ot').length,
      nt: books.filter((book) => book.testament === 'nt').length,
    },
    null,
    2,
  ),
);
