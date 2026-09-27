import fs from 'node:fs';

const d = JSON.parse(fs.readFileSync('assets/bible/amharic_bible.txt', 'utf8'));
const gaps = [];
d.books.forEach((b) => {
  b.chapters.forEach((ch) => {
    const nums = ch.verseNumbers || ch.verses.map((_, i) => i + 1);
    const max = Math.max(...nums, 0);
    const set = new Set(nums);
    const missing = [];
    for (let n = 1; n <= max; n += 1) {
      if (!set.has(n)) missing.push(n);
    }
    if (missing.length) {
      gaps.push({
        book: b.englishTitle || b.title,
        ch: ch.chapter,
        have: nums.length,
        max,
        missing: missing.join(','),
      });
    }
  });
});
console.log('chapters with skipped numbers', gaps.length);
gaps.slice(0, 50).forEach((g) => {
  console.log(`${g.book} ${g.ch} have=${g.have} max=${g.max} miss=${g.missing}`);
});
console.log(
  'total missing numbers',
  gaps.reduce((s, g) => s + g.missing.split(',').filter(Boolean).length, 0),
);
const mt = d.books.find((b) => b.englishTitle === 'Matthew');
console.log(
  'Matthew',
  mt.chapters.map((c) => `${c.chapter}:${c.verses.length}/${Math.max(...c.verseNumbers)}`).join(' '),
);
