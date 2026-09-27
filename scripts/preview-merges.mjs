import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('assets/bible/amharic_bible.txt', 'utf8'));

function compactAmharic(value) {
  return value.replace(/[“”"'()\s።፤፡፣፥·?؟]/g, '');
}

function preferredVerseText(a, b) {
  return b.trim().length >= a.trim().length ? b : a;
}

function versesShouldCombine(first, second) {
  const a = String(first ?? '').trim();
  const b = String(second ?? '').trim();
  if (!a || !b) {
    return true;
  }
  const ca = compactAmharic(a);
  const cb = compactAmharic(b);
  if (!ca || !cb) {
    return true;
  }
  const shorter = ca.length <= cb.length ? ca : cb;
  const longer = ca.length > cb.length ? ca : cb;
  const isProperPrefix =
    longer.startsWith(shorter) &&
    shorter.length >= 2 &&
    shorter.length < longer.length &&
    (shorter.length <= 32 || shorter.length / longer.length <= 0.72);
  if (isProperPrefix) {
    return true;
  }
  if (longer.length >= 40 && shorter.length / longer.length >= 0.88 && longer.includes(shorter)) {
    return true;
  }
  return false;
}

function getDisplayVerses(chapter) {
  const rows = [];
  chapter.verses.forEach((text, verseIndex) => {
    const n = verseIndex + 1;
    const clean = String(text ?? '').trim();
    const previous = rows[rows.length - 1];
    if (previous && versesShouldCombine(previous.text, clean)) {
      previous.end = n;
      previous.text = preferredVerseText(previous.text, clean);
      return;
    }
    if (!clean) {
      if (previous) {
        previous.end = n;
      }
      return;
    }
    rows.push({ start: n, end: n, text: clean });
  });
  return rows;
}

let n = 0;
d.books.forEach((book) => {
  book.chapters.forEach((ch) => {
    const vs = ch.verses;
    for (let i = 0; i < vs.length - 1; i += 1) {
      if (versesShouldCombine(vs[i], vs[i + 1])) {
        n += 1;
      }
    }
  });
});
console.log('merge pairs', n);

const matt = d.books.find((b) => b.englishTitle === 'Matthew');
const ch2 = matt.chapters.find((c) => String(c.chapter) === '2');
getDisplayVerses(ch2).forEach((row) => {
  const label = row.start === row.end ? row.start : `${row.start}–${row.end}`;
  console.log(`${label}\t${row.text.slice(0, 80)}`);
});
