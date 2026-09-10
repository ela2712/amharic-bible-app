import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { getBook, getChapter } from '../data/bible';

export default function HomeScreen() {
  const book = getBook(0);
  const chapter = getChapter(0, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

        {/* Header */}

        <View style={styles.header}>
          <Text style={styles.greeting}>
            መጽሐፍ ቅዱስ
          </Text>

          <Text style={styles.subtitle}>
            ቃሉን ያንብቡ፣ ያስተውሉ፣ ይኑሩበት
          </Text>
        </View>

        {/* Continue Reading */}

        <Text style={styles.sectionTitle}>
          ማንበብ ይቀጥሉ
        </Text>

        <Pressable style={styles.continueCard}>
          <View>
            <Text style={styles.continueLabel}>
              መጽሐፍ ቅዱስ
            </Text>

            <Text style={styles.continueBook}>
              {book.title}
            </Text>

            <Text style={styles.continueChapter}>
              ምዕራፍ {chapter.chapter}
            </Text>
          </View>

          <View style={styles.readButton}>
            <Text style={styles.readButtonText}>
              አንብብ
            </Text>
          </View>
        </Pressable>

        {/* Daily Verse */}

        <Text style={styles.sectionTitle}>
          የዕለቱ ጥቅስ
        </Text>

        <View style={styles.verseCard}>
          <Text style={styles.verseText}>
            {chapter.verses[0]}
          </Text>

          <Text style={styles.reference}>
            — {book.title} 1:1
          </Text>

          <View style={styles.verseActions}>
            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>
                አጋራ
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton}>
              <Text style={styles.actionText}>
                አስቀምጥ
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Quick Access */}

        <Text style={styles.sectionTitle}>
          ፈጣን መዳረሻ
        </Text>

        <View style={styles.quickGrid}>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickIcon}>
              📖
            </Text>

            <Text style={styles.quickTitle}>
              መጽሐፍ ቅዱስ
            </Text>

            <Text style={styles.quickSubtitle}>
              ሁሉንም መጻሕፍት
            </Text>
          </Pressable>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickIcon}>
              🔍
            </Text>

            <Text style={styles.quickTitle}>
              ፍለጋ
            </Text>

            <Text style={styles.quickSubtitle}>
              ቃል ወይም ጥቅስ
            </Text>
          </Pressable>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickIcon}>
              🔖
            </Text>

            <Text style={styles.quickTitle}>
              የተመረጡ
            </Text>

            <Text style={styles.quickSubtitle}>
              ያስቀመጡት
            </Text>
          </Pressable>

          <Pressable style={styles.quickCard}>
            <Text style={styles.quickIcon}>
              📅
            </Text>

            <Text style={styles.quickTitle}>
              የንባብ ዕቅድ
            </Text>

            <Text style={styles.quickSubtitle}>
              የንባብ እቅዶች
            </Text>
          </Pressable>

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9f7',
  },

  content: {
    padding: 20,
    paddingBottom: 30,
  },

  header: {
    marginBottom: 28,
  },

  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#172117',
  },

  subtitle: {
    fontSize: 16,
    color: '#707870',
    marginTop: 6,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#172117',
    marginBottom: 12,
    marginTop: 8,
  },

  continueCard: {
    backgroundColor: '#2e7d32',
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  continueLabel: {
    color: '#d8efd9',
    fontSize: 14,
    marginBottom: 5,
  },

  continueBook: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  continueChapter: {
    color: '#d8efd9',
    fontSize: 16,
    marginTop: 4,
  },

  readButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  readButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },

  verseCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#e8ebe7',
  },

  verseText: {
    fontSize: 19,
    lineHeight: 34,
    color: '#202520',
  },

  reference: {
    marginTop: 12,
    fontSize: 14,
    color: '#687068',
    fontWeight: '600',
  },

  verseActions: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 10,
  },

  actionButton: {
    backgroundColor: '#edf5ed',
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 9,
  },

  actionText: {
    color: '#2e7d32',
    fontWeight: '600',
  },

  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 17,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8ebe7',
  },

  quickIcon: {
    fontSize: 25,
    marginBottom: 10,
  },

  quickTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#202520',
  },

  quickSubtitle: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
});