import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { getBook, getChapter, getBooks } from '../data/bible';

export default function BibleScreen() {
  const [bookIndex, setBookIndex] = useState(0);
  const [chapterIndex, setChapterIndex] = useState(0);

  const [showBooks, setShowBooks] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  const books = getBooks();
  const book = getBook(bookIndex);
  const chapter = getChapter(bookIndex, chapterIndex);

  const selectBook = (index: number) => {
    setBookIndex(index);
    setChapterIndex(0);
    setShowBooks(false);
    setShowChapters(false);
  };

  const selectChapter = (index: number) => {
    setChapterIndex(index);
    setShowChapters(false);
  };

  const previousChapter = () => {
    if (chapterIndex > 0) {
      setChapterIndex(chapterIndex - 1);
    } else if (bookIndex > 0) {
      const previousBook = getBook(bookIndex - 1);

      setBookIndex(bookIndex - 1);
      setChapterIndex(previousBook.chapters.length - 1);
    }
  };

  const nextChapter = () => {
    if (chapterIndex < book.chapters.length - 1) {
      setChapterIndex(chapterIndex + 1);
    } else if (bookIndex < books.length - 1) {
      setBookIndex(bookIndex + 1);
      setChapterIndex(0);
    }
  };

  const isFirstChapter =
    bookIndex === 0 && chapterIndex === 0;

  const isLastChapter =
    bookIndex === books.length - 1 &&
    chapterIndex === book.chapters.length - 1;

  return (
    <View style={styles.container}>

      {/* Header */}

      <View style={styles.header}>

        <Pressable
          style={styles.bookButton}
          onPress={() => {
            setShowBooks(!showBooks);
            setShowChapters(false);
          }}
        >
          <Text style={styles.bookName}>
            {book.title}
          </Text>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </Pressable>

        <Pressable
          style={styles.chapterButtonHeader}
          onPress={() => {
            setShowChapters(!showChapters);
            setShowBooks(false);
          }}
        >
          <Text style={styles.chapterName}>
            ምዕራፍ {chapter.chapter}
          </Text>

          <Text style={styles.arrow}>
            ▼
          </Text>
        </Pressable>

      </View>

      {/* Book selector */}

      {showBooks && (
        <View style={styles.selector}>

          <Text style={styles.selectorTitle}>
            መጽሐፍ ይምረጡ
          </Text>

          <ScrollView>
            {books.map((item: any, index: number) => (
              <Pressable
                key={index}
                style={[
                  styles.bookOption,
                  index === bookIndex &&
                    styles.selectedOption,
                ]}
                onPress={() => selectBook(index)}
              >
                <Text
                  style={[
                    styles.bookOptionText,
                    index === bookIndex &&
                      styles.selectedOptionText,
                  ]}
                >
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

        </View>
      )}

      {/* Chapter selector */}

      {showChapters && (
        <View style={styles.chapterSelector}>

          <Text style={styles.selectorTitle}>
            ምዕራፍ ይምረጡ
          </Text>

          <ScrollView
            contentContainerStyle={styles.chapterGrid}
          >
            {book.chapters.map(
              (item: any, index: number) => (
                <Pressable
                  key={index}
                  style={[
                    styles.chapterOption,
                    index === chapterIndex &&
                      styles.selectedOption,
                  ]}
                  onPress={() => selectChapter(index)}
                >
                  <Text
                    style={[
                      styles.chapterOptionText,
                      index === chapterIndex &&
                        styles.selectedOptionText,
                    ]}
                  >
                    {item.chapter}
                  </Text>
                </Pressable>
              )
            )}
          </ScrollView>

        </View>
      )}

      {/* Bible text */}

      <ScrollView
        style={styles.textArea}
        contentContainerStyle={styles.content}
      >
        {chapter.verses.map(
          (verse: string, index: number) => (
            <Text
              key={index}
              style={styles.verse}
            >
              <Text style={styles.verseNumber}>
                {index + 1}{' '}
              </Text>

              {verse}
            </Text>
          )
        )}
      </ScrollView>

      {/* Navigation */}

      <View style={styles.navigation}>

        <Pressable
          style={[
            styles.navigationButton,
            isFirstChapter &&
              styles.disabledButton,
          ]}
          disabled={isFirstChapter}
          onPress={previousChapter}
        >
          <Text style={styles.navigationText}>
            ‹ ቀዳሚ
          </Text>
        </Pressable>

        <Text style={styles.counter}>
          {chapterIndex + 1} / {book.chapters.length}
        </Text>

        <Pressable
          style={[
            styles.navigationButton,
            isLastChapter &&
              styles.disabledButton,
          ]}
          disabled={isLastChapter}
          onPress={nextChapter}
        >
          <Text style={styles.navigationText}>
            ቀጣይ ›
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  header: {
    padding: 20,
    paddingTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  bookName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#111',
    flex: 1,
  },

  chapterButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },

  chapterName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#2e7d32',
  },

  arrow: {
    marginLeft: 8,
    color: '#777',
  },

  selector: {
    height: '60%',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  chapterSelector: {
    maxHeight: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },

  selectorTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },

  bookOption: {
    padding: 15,
    marginBottom: 6,
    borderRadius: 8,
    backgroundColor: '#f3f3f3',
  },

  bookOptionText: {
    fontSize: 18,
    color: '#222',
  },

  selectedOption: {
    backgroundColor: '#2e7d32',
  },

  selectedOptionText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },

  chapterOption: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f3f3f3',
    alignItems: 'center',
    justifyContent: 'center',
  },

  chapterOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },

  textArea: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  verse: {
    fontSize: 22,
    lineHeight: 40,
    color: '#111',
    marginBottom: 18,
  },

  verseNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  navigation: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },

  navigationButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },

  disabledButton: {
    backgroundColor: '#ccc',
  },

  navigationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  counter: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
});