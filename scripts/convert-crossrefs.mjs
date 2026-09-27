import fs from 'node:fs';

const tsvPath = `${process.env.TEMP}/crossreferences_kjv.tsv`;
const bible = JSON.parse(fs.readFileSync('assets/bible/amharic_bible.txt', 'utf8'));
const outPath = 'assets/bible/crossrefs.txt';
const MAX_REFS = 8;

const ABBREV_TO_ENGLISH = {
  Gen: 'Genesis',
  Exod: 'Exodus',
  Lev: 'Leviticus',
  Num: 'Numbers',
  Deut: 'Deuteronomy',
  Josh: 'Joshua',
  Judg: 'Judges',
  Ruth: 'Ruth',
  '1 Sam': '1 Samuel',
  '2 Sam': '2 Samuel',
  '1 Kgs': '1 Kings',
  '2 Kgs': '2 Kings',
  '1 Chr': '1 Chronicles',
  '2 Chr': '2 Chronicles',
  Ezra: 'Ezra',
  Neh: 'Nehemiah',
  Esth: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Prov: 'Proverbs',
  Eccl: 'Ecclesiastes',
  Song: 'Song of Solomon',
  Isa: 'Isaiah',
  Jer: 'Jeremiah',
  Lam: 'Lamentations',
  Ezek: 'Ezekiel',
  Dan: 'Daniel',
  Hos: 'Hosea',
  Joel: 'Joel',
  Amos: 'Amos',
  Obad: 'Obadiah',
  Jonah: 'Jonah',
  Mic: 'Micah',
  Nah: 'Nahum',
  Hab: 'Habakkuk',
  Zeph: 'Zephaniah',
  Hag: 'Haggai',
  Zech: 'Zechariah',
  Mal: 'Malachi',
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  '1 Cor': '1 Corinthians',
  '2 Cor': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Phil: 'Philippians',
  Col: 'Colossians',
  '1 Thess': '1 Thessalonians',
  '2 Thess': '2 Thessalonians',
  '1 Tim': '1 Timothy',
  '2 Tim': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Heb: 'Hebrews',
  Jas: 'James',
  '1 Pet': '1 Peter',
  '2 Pet': '2 Peter',
  '1 John': '1 John',
  '2 John': '2 John',
  '3 John': '3 John',
  Jude: 'Jude',
  Rev: 'Revelation',
};

const englishIndex = new Map();
bible.books.forEach((book, index) => {
  if (book.englishTitle) {
    englishIndex.set(book.englishTitle, index);
  }
});

function locate(abbrev, chapter, verse) {
  const english = ABBREV_TO_ENGLISH[abbrev];
  if (!english) {
    return null;
  }
  const bookIndex = englishIndex.get(english);
  if (bookIndex == null) {
    return null;
  }
  const book = bible.books[bookIndex];
  const chapterIndex = chapter - 1;
  const verseIndex = verse - 1;
  const packed = book.chapters[chapterIndex];
  if (!packed || verseIndex < 0 || verseIndex >= packed.verses.length) {
    return null;
  }
  return [bookIndex, chapterIndex, verseIndex];
}

function parseTargets(raw) {
  const out = [];
  if (!raw) {
    return out;
  }
  for (const token of raw.split('|')) {
    const match = token.trim().match(/^((?:[1-3] )?[A-Za-z]+)\s+(\d+):(.+)$/);
    if (!match) {
      continue;
    }
    const abbrev = match[1];
    const chapter = Number(match[2]);
    for (const part of match[3].split(',')) {
      const range = part.trim().match(/^(\d+)(?:-(\d+))?$/);
      if (!range) {
        continue;
      }
      const start = Number(range[1]);
      const ref = locate(abbrev, chapter, start);
      if (ref) {
        out.push(ref);
      }
    }
  }
  return out;
}

function key(ref) {
  return `${ref[0]}:${ref[1]}:${ref[2]}`;
}

const byFrom = {};
const lines = fs.readFileSync(tsvPath, 'utf8').split(/\r?\n/).slice(1);
let skipped = 0;
for (const line of lines) {
  if (!line.trim()) {
    continue;
  }
  const cols = line.split('\t');
  const from = locate(cols[0], Number(cols[1]), Number(cols[2]));
  if (!from) {
    skipped += 1;
    continue;
  }
  const fromKey = key(from);
  if (!byFrom[fromKey]) {
    byFrom[fromKey] = [];
  }
  const seen = new Set(byFrom[fromKey].map(key));
  for (const target of parseTargets(cols[4])) {
    const targetKey = key(target);
    if (targetKey === fromKey || seen.has(targetKey)) {
      continue;
    }
    if (byFrom[fromKey].length >= MAX_REFS) {
      break;
    }
    seen.add(targetKey);
    byFrom[fromKey].push(target);
  }
}

Object.keys(byFrom).forEach((fromKey) => {
  if (byFrom[fromKey].length === 0) {
    delete byFrom[fromKey];
    return;
  }
  byFrom[fromKey] = byFrom[fromKey].map((ref) => ref.join('.')).join(' ');
});

const payload = {
  source: 'CrossReferences.org / Treasury of Scripture Knowledge (CC BY 4.0)',
  byFrom,
};

fs.writeFileSync(outPath, JSON.stringify(payload));
console.log(
  JSON.stringify(
    {
      verses: Object.keys(byFrom).length,
      links: Object.values(byFrom).reduce(
        (sum, rows) => sum + String(rows).split(' ').filter(Boolean).length,
        0,
      ),
      skippedRows: skipped,
      bytes: fs.statSync(outPath).size,
      sample: byFrom['54:2:15'] || byFrom['0:0:0'],
    },
    null,
    2,
  ),
);
