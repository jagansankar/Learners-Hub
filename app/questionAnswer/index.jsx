import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constant/Colors';

export default function QuestionAnswer() {
  const { courseParams } = useLocalSearchParams();
  const course = JSON.parse(courseParams);
  const qaList = course?.qa;
  const [selectedQuestion, setSelectedQuestion] = useState();
  const router = useRouter();
  
  const OnQuestionSelect = (index) => {
    if (selectedQuestion == index) {
      setSelectedQuestion(null);
    } else {
      setSelectedQuestion(index);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('./../../assets/images/wave.png')}
        style={styles.backgroundImage}
      />
      
      <View style={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} >
              <Ionicons name="arrow-back" size={30} color="white" />
            </Pressable>
            <Text style={styles.headerTitle}>Question & Answer</Text>
          </View>
          <Text style={styles.courseTitle}>{course?.courseTitle}</Text>
        </View>

        {/* Scrollable Q&A List */}
        <View style={styles.listContainer}>
          <FlatList
            data={qaList}
            renderItem={({ item, index }) => (
              <Pressable 
                style={styles.card}
                onPress={() => OnQuestionSelect(index)}
              >
                <Text style={styles.questionText}>{item?.question}</Text>
                {selectedQuestion == index && (
                  <View style={styles.answerContainer}>
                    <Text style={styles.answerText}>
                      Answer: {item?.answer}
                    </Text>
                  </View>
                )}
              </Pressable>
            )}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.listContent}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  backgroundImage: {
    height: 800,
    width: '100%',
    position: 'absolute',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
    paddingTop: 60, // Added padding for status bar
  },
  header: {
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 25,
    color: Colors.WHITE,
  },
  courseTitle: {
    fontFamily: 'outfit',
    color: Colors.WHITE,
    fontSize: 20,
  },
  listContainer: {
    flex: 1, // This makes the list take all available space
  },
  listContent: {
    paddingBottom: 20, // Added padding at bottom for better scrolling
  },
  card: {
    padding: 20,
    backgroundColor: Colors.WHITE,
    marginTop: 15,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  questionText: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
  },
  answerContainer: {
    borderTopWidth: 0.4,
    marginVertical: 10,
    marginBottom: 10,
    paddingTop: 10,
  },
  answerText: {
    fontFamily: 'outfit',
    fontSize: 17,
    color: Colors.GREEN,
  },
});