import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';
import Colors from '../../constant/Colors';
import Button from './../../components/Shared/Button';

// ✅ Firebase imports
import { doc, updateDoc } from 'firebase/firestore'; // ✅ ADD THIS
import { db } from './../../config/firebaseConfig';

export default function Quiz() {
  const { courseParams } = useLocalSearchParams();
  const course = JSON.parse(courseParams);
  const quiz = course?.quiz;

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedOption, setSelectedOption] = useState();
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(false);

  const GetProgress = (currentPage) => {
    const perc= (currentPage / quiz?.length);
    return perc;
    };

  const OnOptionSelect = (selectedChoice) => {
    setResult((prev) => ({
      ...prev,
      [currentPage]: {
        userChoice: selectedChoice,
        isCorrect: quiz[currentPage]?.correctAns === selectedChoice,
        question: quiz[currentPage]?.question,
        correctAns: quiz[currentPage]?.correctAns,
      },
    }));
  };

  const onQuizFinish = async () => {
    setLoading(true);

    try {
      const cleanResult = JSON.parse(JSON.stringify(result)); // 🔄 Ensure data is serializable
      const courseRef = doc(db, 'Courses', course?.docId);

      await updateDoc(courseRef, {
        quizResult: cleanResult,
      });
      setLoading(false);
      router.replace({
        pathname:'/quiz/summary',
        params:{
          quizResultParam:JSON.stringify(result)
        }
      })
      console.log('Quiz result saved successfully.');
      // TODO: Redirect to quiz summary screen here
    } catch (e) {
      console.error('❌ Error saving quiz result:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Image
        source={require('./../../assets/images/wave.png')}
        style={{ height: 800 }}
      />

      <View style={{ position: 'absolute', width: '100%' }}>
        <View
          style={{
            marginTop: 30,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pressable onPress={()=>router.back()}>
            <Ionicons name="arrow-back" size={30} color="white" />
          </Pressable>

          <Text
            style={{
              fontFamily: 'outfit-bold',
              fontSize: 25,
              color: Colors.WHITE,
            }}
          >
            {currentPage + 1} of {quiz.length}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
          <Progress.Bar
            progress={GetProgress(currentPage)}
            width={Dimensions.get('window').width * 0.85}
            color={Colors.WHITE}
            height={10}
          />
        </View>

        <View
          style={{
            width: '90%',
            padding: 25,
            backgroundColor: Colors.WHITE,
            marginTop: 30,
            height: Dimensions.get('screen').height * 0.65,
            elevation: 1,
            borderRadius: 20,
            alignSelf: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 25,
              fontFamily: 'outfit-bold',
              textAlign: 'center',
            }}
          >
            {quiz[currentPage]?.question}
          </Text>

          {quiz[currentPage]?.options.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setSelectedOption(index);
                OnOptionSelect(item);
              }}
              style={{
                padding: 20,
                borderWidth: 1,
                borderRadius: 15,
                margin: 8,
                backgroundColor:
                  selectedOption === index ? Colors.LIGHT_GREEN : null,
                borderColor:
                  selectedOption === index ? Colors.GREEN : null,
              }}
            >
              <Text style={{ fontFamily: 'outfit', fontSize: 20 }}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedOption !== undefined && quiz?.length - 1 > currentPage && (
          <Button
            text={'Next'}
            onPress={() => {
              setCurrentPage(currentPage + 1);
              setSelectedOption(undefined);
            }}
          />
        )}

        {selectedOption !== undefined && quiz?.length - 1 === currentPage && (
          <Button text="Finish" loading={loading} onPress={onQuizFinish} />
        )}
      </View>
    </View>
  );
}
