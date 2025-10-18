import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Shared/Button';
import Colors from '../../constant/Colors';

export default function Quizsummary() {
  const { quizResultParam } = useLocalSearchParams();
  const quizResult = JSON.parse(quizResultParam);
  const [correctAns, setCorrectAns] = useState(0);
  const [totalQuestion, setTotalQuestion] = useState(0);
  const router = useRouter();
  
  useEffect(() => {
    CalculateResult();
  }, []);

  const CalculateResult = () => {
    if (quizResult !== undefined) {
      const correctAns_ = Object.entries(quizResult)?.filter(([key, value]) => value?.isCorrect == true);
      const totalQues_ = Object.keys(quizResult).length;

      setCorrectAns(correctAns_.length);
      setTotalQuestion(totalQues_);
    }
  };

  const GetPercMark = () => {
    return ((correctAns / totalQuestion) * 100).toFixed(0);
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Image 
        source={require('./../../assets/images/wave.png')}
        style={styles.backgroundImage}
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>Quiz Summary</Text>
        
        <View style={styles.resultCard}>
          <Image 
            source={require('./../../assets/images/trophy.png')}
            style={styles.trophyImage}
          />
          <Text style={styles.resultTitle}>
            {GetPercMark() > 60 ? 'Congratulations!' : 'Try Again!'}
          </Text>
          <Text style={styles.resultSubtitle}>
            Your Gave {GetPercMark()}% Correct Answer
          </Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statText}>Q {totalQuestion}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>✅ {correctAns} Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statText}>❌ {totalQuestion - correctAns}     Incorrect</Text>
            </View>
          </View>
        </View>
        
        <Button 
          text={'Back to Home'} 
          onPress={() => router.replace('/(tabs)/home')} 
        />
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Summary:</Text>
          <View style={styles.questionsList}>
            {Object.entries(quizResult).map(([key, quizItem], index) => (
              <View 
                key={key}
                style={[
                  styles.questionItem,
                  {
                    backgroundColor: quizItem?.isCorrect == true ? Colors.LIGHT_GREEN : Colors.LIGHT_RED,
                    borderColor: quizItem?.isCorrect == true ? Colors.GREEN : Colors.RED
                  }
                ]}
              >
                <Text style={styles.questionText}>{quizItem.question}</Text>
                <Text style={styles.answerText}>Ans: {quizItem?.correctAns}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.WHITE,
  },
  contentContainer: {
    flexGrow: 1,
  },
  backgroundImage: {
    height: 700,
    width: '100%',
    position: 'absolute',
  },
  content: {
    width: '100%',
    padding: 35,
    marginTop: 20,
  },
  title: {
    textAlign: 'center',
    fontFamily: 'outfit-bold',
    fontSize: 30,
    color: Colors.WHITE,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: Colors.WHITE,
    padding: 20,
    borderRadius: 20,
    marginTop: 60,
    alignItems: 'center',
    marginBottom: 20,
  },
  trophyImage: {
    width: 100,
    height: 100,
    marginTop: -60,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 26,
    fontFamily: 'outfit-bold',
    marginBottom: 5,
  },
  resultSubtitle: {
    fontFamily: 'outfit',
    color: Colors.GRAY,
    fontSize: 17,
    marginBottom: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    padding: 10,
    backgroundColor: Colors.WHITE,
    elevation: 1,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
    
  },
  statText: {

    fontFamily: 'outfit',
    fontSize: 16,
    marginTop:10
  },
  summaryContainer: {
    marginTop: 25,
    flex: 1,
  },
  summaryTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 25,
    marginBottom: 15,
  },
  questionsList: {
    flex: 1,
  },
  questionItem: {
    padding: 15,
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 15,
  },
  questionText: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    marginBottom: 5,
  },
  answerText: {
    fontFamily: 'outfit',
    fontSize: 15,
  },
});