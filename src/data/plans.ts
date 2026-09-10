import type { ReadingPlan, ReadingPlanDay, ReadingAssignment } from '../types/study';
import { bible, getTestament } from './bible';

function chaptersInRange(startBook: number, endBook: number): ReadingAssignment[] {
  const assignments: ReadingAssignment[] = [];
  for (let bookIndex = startBook; bookIndex <= endBook; bookIndex += 1) {
    const book = bible.books[bookIndex];
    if (!book) {
      continue;
    }
    book.chapters.forEach((_chapter, chapterIndex) => {
      assignments.push({ bookIndex, chapterIndex });
    });
  }
  return assignments;
}

function chunkAssignments(
  assignments: ReadingAssignment[],
  dayCount: number,
): ReadingPlanDay[] {
  const safeDays = Math.max(1, dayCount);
  const days: ReadingPlanDay[] = [];
  const total = assignments.length;
  let cursor = 0;
  for (let day = 1; day <= safeDays; day += 1) {
    const remainingDays = safeDays - day + 1;
    const remainingItems = total - cursor;
    const take = Math.max(1, Math.ceil(remainingItems / remainingDays));
    const slice = assignments.slice(cursor, cursor + take);
    if (slice.length === 0) {
      break;
    }
    days.push({ day, assignments: slice });
    cursor += slice.length;
  }
  return days;
}

function oneChapterPerDay(assignments: ReadingAssignment[]): ReadingPlanDay[] {
  return assignments.map((assignment, index) => ({
    day: index + 1,
    assignments: [assignment],
  }));
}

/**
 * Reading-plan datasets are generated from this project's canonical Amharic Bible
 * chapter list (book order). A historical "chronological" plan is not included
 * because no independent chronology dataset is shipped with the app.
 */
export const READING_PLANS: ReadingPlan[] = [
  {
    id: 'gospels-30',
    title: 'ወንጌላት በ30 ቀን',
    description: 'የማቴዎስ፣ ማርቆስ፣ ሉቃስ እና ዮሐንስ ወንጌሎች በሠላሳ ቀን።',
    days: chunkAssignments(chaptersInRange(39, 42), 30),
  },
  {
    id: 'proverbs-31',
    title: 'ምሳሌ በ31 ቀን',
    description: 'በየቀኑ አንድ የምሳሌ ምዕራፍ።',
    days: oneChapterPerDay(chaptersInRange(19, 19)),
  },
  {
    id: 'psalms-150',
    title: 'መዝሙረ ዳዊት',
    description: 'በየቀኑ አንድ መዝሙር።',
    days: oneChapterPerDay(chaptersInRange(18, 18)),
  },
  {
    id: 'nt-90',
    title: 'ሐዲስ ኪዳን በ90 ቀን',
    description: 'መላው ሐዲስ ኪዳን በሰማንያ ዘጠኝ እስከ ዘጠና ቀን።',
    days: chunkAssignments(
      bible.books.flatMap((book, bookIndex) =>
        getTestament(bookIndex) === 'nt'
          ? book.chapters.map((_chapter, chapterIndex) => ({ bookIndex, chapterIndex }))
          : [],
      ),
      90,
    ),
  },
  {
    id: 'bible-365',
    title: 'መጽሐፍ ቅዱስ በአንድ ዓመት',
    description: 'ሁሉም መጻሕፍት በመጽሐፉ ቅደም ተከተል በ365 ቀን።',
    days: chunkAssignments(
      bible.books.flatMap((book, bookIndex) =>
        book.chapters.map((_chapter, chapterIndex) => ({ bookIndex, chapterIndex })),
      ),
      365,
    ),
  },
];

export function getReadingPlan(planId: string): ReadingPlan | null {
  return READING_PLANS.find((plan) => plan.id === planId) ?? null;
}
