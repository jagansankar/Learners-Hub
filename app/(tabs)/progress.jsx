// progress.jsx
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import CourseProgressCard from '../../components/Shared/CourseProgressCard';
import { db } from '../../config/firebaseConfig';
import Colors from '../../constant/Colors';
import { UserDetailContext } from '../../context/UserDetailContext';
import { getUserEnrollments } from '../../utils/enrollmentUtils';

export default function Progress() {
  const { userDetail } = useContext(UserDetailContext);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (userDetail) {
      loadEnrolledCourses();
    }
  }, [userDetail]);

  const loadEnrolledCourses = async () => {
    setLoading(true);
    try {
      const enrollments = await getUserEnrollments(userDetail.uid);
      const coursesWithDetails = [];

      // Get course details for each enrollment
      for (const enrollment of enrollments) {
        try {
          const courseRef = doc(db, 'Courses', enrollment.courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            coursesWithDetails.push({
              ...courseDoc.data(),
              docId: courseDoc.id,
              enrollmentData: enrollment
            });
          }
        } catch (error) {
          console.error('Error fetching course details:', error);
        }
      }

      setEnrolledCourses(coursesWithDetails);
    } catch (error) {
      console.error('Error loading enrolled courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Image 
        source={require('./../../assets/images/wave.png')}
        style={{
          position: 'absolute',
          width: '100%',
          height: 700
        }}
      />
      
      <View style={{
        flex: 1,
        padding: 20,
        paddingTop: 60
      }}>
        <Text style={{
          fontFamily: 'outfit-bold',
          fontSize: 30,
          color: Colors.WHITE,
          marginBottom: 20
        }}>My Learning Progress</Text>
        
        <FlatList
          data={enrolledCourses}
          showsVerticalScrollIndicator={false}
          onRefresh={loadEnrolledCourses}
          refreshing={loading}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({
                pathname: '/courseView/' + item.docId,
                params: {
                  courseParams: JSON.stringify(item)
                }
              })}
            >
              <CourseProgressCard item={item} width={'100%'} />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading && (
              <View style={{ alignItems: 'center', marginTop: 50 }}>
                <Text style={{
                  fontFamily: 'outfit',
                  fontSize: 18,
                  color: Colors.WHITE,
                  textAlign: 'center'
                }}>
                  No enrolled courses yet.{'\n'}Explore courses to start learning!
                </Text>
              </View>
            )
          }
          contentContainerStyle={{
            paddingBottom: 20
          }}
        />
      </View>
    </View>
  )
}