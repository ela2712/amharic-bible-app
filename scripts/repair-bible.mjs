import fs from 'node:fs';

const biblePath = 'assets/bible/amharic_bible.txt';

function stripTags(value) {
  return value
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseWordProjectVerses(html) {
  const bodyMatch = html.match(/id="textBody"[\s\S]*?<\/div>/i);
  if (!bodyMatch) {
    return [];
  }
  let body = bodyMatch[0].replace(
    /<!--span class="verse" id="(\d+)">[\s\S]*?<\/span-->/gi,
    '<span class="verse" id="$1">$1 </span>',
  );
  const verses = [];
  const re = /<span class="verse" id="(\d+)">[\s\S]*?<\/span>([\s\S]*?)(?=<span class="verse"|<\/p>)/gi;
  let match;
  while ((match = re.exec(body))) {
    const num = Number(match[1]);
    verses[num - 1] = stripTags(match[2]);
  }
  return verses;
}

async function fetchChapter(bookNumber, chapterNumber) {
  const book = String(bookNumber).padStart(2, '0');
  const url = `https://www.wordproject.org/bibles/am/${book}/${chapterNumber}.htm`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} ${response.status}`);
  }
  return parseWordProjectVerses(await response.text());
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const data = JSON.parse(fs.readFileSync(biblePath, 'utf8'));
let filled = 0;
let stillEmpty = 0;
let chapterLabels = 0;
let fetchErrors = 0;

for (let bookIndex = 0; bookIndex < data.books.length; bookIndex += 1) {
  const book = data.books[bookIndex];
  for (let chapterIndex = 0; chapterIndex < book.chapters.length; chapterIndex += 1) {
    const chapter = book.chapters[chapterIndex];
    const expectedLabel = String(chapterIndex + 1);
    if (!/^[0-9]+$/.test(String(chapter.chapter))) {
      chapter.chapter = expectedLabel;
      chapterLabels += 1;
    }
    const needsFetch = chapter.verses.some((verse) => !String(verse || '').trim());
    if (!needsFetch) {
      continue;
    }
    try {
      const remote = await fetchChapter(bookIndex + 1, expectedLabel);
      chapter.verses = chapter.verses.map((verse, verseIndex) => {
        if (String(verse || '').trim()) {
          return verse;
        }
        const replacement = remote[verseIndex];
        if (replacement) {
          filled += 1;
          return replacement;
        }
        stillEmpty += 1;
        return verse;
      });
      await sleep(80);
    } catch (error) {
      fetchErrors += 1;
      console.error(String(error));
      stillEmpty += chapter.verses.filter((verse) => !String(verse || '').trim()).length;
    }
  }
}

fs.writeFileSync(biblePath, JSON.stringify(data));
console.log(
  JSON.stringify({ filled, stillEmpty, chapterLabels, fetchErrors, books: data.books.length }, null, 2),
);
