import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import Chapters from '../../../components/CourseView/Chapters';
import Intro from '../../../components/CourseView/Intro';
import { db } from '../../../config/firebaseConfig';
import Colors from '../../../constant/Colors';
import { UserDetailContext } from '../../../context/UserDetailContext';

export default function CourseView() {
    const { courseParams, courseId, enroll } = useLocalSearchParams();
    const [course, setCourse] = useState(null);
    const { userDetail } = useContext(UserDetailContext);

    // Load course data on mount or when courseId changes
    useEffect(() => {
        if (!courseParams) {
            GetCourseById();
        } else {
            const parsedCourse = JSON.parse(courseParams);
            setCourse(parsedCourse);
        }
    }, [courseId, userDetail]);

    // Refresh course data on screen focus
    useFocusEffect(
        useCallback(() => {
            if (!courseParams) {
                GetCourseById();
            }
        }, [courseId, userDetail])
    );

    // Fetch course from Firestore
    const GetCourseById = async () => {
        try {
            const docRef = await getDoc(doc(db, 'Courses', courseId));
            if (docRef.exists()) {
                setCourse({
                    ...docRef.data(),
                    docId: docRef.id,
                });
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        }
    };

    if (!course) return null;

    return (
        <FlatList
            data={[]}
            ListHeaderComponent={
                <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
                    <Intro course={course} enroll={enroll}/>
                    <Chapters course={course} />
                </View>
            }
        />
    );
}