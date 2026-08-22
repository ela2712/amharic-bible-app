import bibleData from '../../assets/bible/amharic_bible.json';

export const bible = bibleData as any;

// Get a book by index (0 = Genesis)
export function getBook(bookIndex: number) {
  return bible.books[bookIndex];
}

// Get a chapter
export function getChapter(bookIndex: number, chapterIndex: number) {
  return bible.books[bookIndex].chapters[chapterIndex];
}

// Get all books
export function getBooks() {
  return bible.books;
}