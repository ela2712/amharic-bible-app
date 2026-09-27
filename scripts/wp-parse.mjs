export async function parseWordProjectChapter(bookNumber, chapterNumber) {
  const book = String(bookNumber).padStart(2, '0');
  const url = `https://www.wordproject.org/bibles/am/${book}/${chapterNumber}.htm`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} ${response.status}`);
  }
  const html = await response.text();
  const bodyMatch = html.match(/id="textBody"[\s\S]*?<\/div>/i);
  if (!bodyMatch) return [];
  const body = bodyMatch[0].replace(
    /<!--span class="verse" id="(\d+)">[\s\S]*?<\/span-->/gi,
    '<span class="verse" id="$1">$1 </span>',
  );
  const verses = [];
  const re = /<span class="verse" id="(\d+)">[\s\S]*?<\/span>([\s\S]*?)(?=<span class="verse"|<\/p>)/gi;
  let match;
  while ((match = re.exec(body))) {
    const num = Number(match[1]);
    verses[num - 1] = match[2]
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
  return verses;
}
