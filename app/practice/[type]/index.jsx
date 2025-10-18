import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import CourseListGrid from '../../../components/PracticeScreen/CourseListGrid';
import Colors from '../../../constant/Colors';
import { PraticeOption } from '../../../constant/Option';
import { db } from './../../../config/firebaseConfig';
import { UserDetailContext } from './../../../context/UserDetailContext';

export default function PracticeTypeHomeScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const option = PraticeOption.find(item => item.name == type);
  console.log(option);
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const [loading,setLoading]=useState(false);
  const [courseList,setCourseList]=useState([]);
  useEffect(() => {
    if (userDetail) {
      GetCourseList();
    }
  }, [userDetail]);

  const GetCourseList = async () => {
    setLoading(true);
    setCourseList([]);
    try{
    const q = query(
      collection(db, 'Courses'),
      where('createdBy', '==', userDetail?.email),
      orderBy('createdOn','desc')
    );

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(doc => {
      //console.log(doc.data());
      setCourseList(prev=>[...prev,doc.data()])
    });
    setLoading(false);
  }
  catch(e){
    console.log(e)
    setLoading(false)
  }
  };

  return (
    <View>
      <Image
        source={option.image}
        style={{
          height: 200,
          width: '100%',
        }}
      />
      <View
        style={{
          position: 'absolute',
          padding: 10,
          marginTop: 20,
          display: 'flex',
          flexDirection: 'row',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="black"
            style={{
              backgroundColor: Colors.WHITE,
              padding: 8,
              borderRadius: 10,
            }}
          />
        </Pressable>
        <Text
          style={{
            fontFamily: 'outfit-bold',
            fontSize: 35,
            color: Colors.WHITE,
          }}
        >
          {type}
        </Text>
      </View>
      {loading&&<ActivityIndicator size={'large'}
      style={{
        marginTop:150
      }}
      color={Colors.PRIMARY}/>}

      <CourseListGrid courseList={courseList}
      option={option}
      />
    </View>
  );
}
