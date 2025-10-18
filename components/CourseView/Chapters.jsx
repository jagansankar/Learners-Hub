// components/CourseView/Chapters.jsx
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useRouter } from 'expo-router';
import { useContext, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constant/Colors';
import { UserDetailContext } from '../../context/UserDetailContext';
import { checkEnrollment, enrollUserInCourse, getEnrollmentProgress } from '../../utils/enrollmentUtils';
export default function Chapters({ course }) {
    const router = useRouter();
    const { userDetail } = useContext(UserDetailContext);
    const [completedChapters, setCompletedChapters] = useState([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);

    useEffect(() => {
        checkEnrollmentStatus();
    }, [course, userDetail]);

    const checkEnrollmentStatus = async () => {
        if (!userDetail?.uid || !course?.docId) {
            setCompletedChapters([]);
            setIsEnrolled(false);
            return;
        }

        try {
            const enrolled = await checkEnrollment(userDetail.uid, course.docId);
            setIsEnrolled(enrolled);

            if (enrolled) {
                const enrollmentData = await getEnrollmentProgress(userDetail.uid, course.docId);
                setCompletedChapters(enrollmentData?.completedChapters || []);
            } else {
                setCompletedChapters([]);
            }
        } catch (error) {
            console.error('Error checking enrollment status:', error);
            setCompletedChapters([]);
            setIsEnrolled(false);
        }
    };

    const handleEnroll = async () => {
        if (!userDetail?.uid || !course?.docId) {
            console.warn('Missing user ID or course ID for enrollment');
            return;
        }

        setEnrollmentLoading(true);
        try {
            const success = await enrollUserInCourse(userDetail.uid, course.docId, course);
            if (success) {
                setIsEnrolled(true);
                setCompletedChapters([]);
                console.log('Successfully enrolled in course');
            } else {
                console.error('Failed to enroll in course');
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
        } finally {
            setEnrollmentLoading(false);
        }
    };

    const isChapterCompleted = (index) => {
        if (!Array.isArray(completedChapters)) {
            return false;
        }
        return completedChapters.includes(index);
    };

    const handleChapterPress = (item, index) => {
        if (!course?.docId || !userDetail?.uid) {
            console.warn('Missing docId or user ID! Cannot navigate.');
            return;
        }

        if (!isEnrolled) {
            console.warn('User is not enrolled in this course');
            // Auto-enroll when clicking on a chapter
            handleEnroll();
            return;
        }

        console.log('Navigating to chapterView with:', {
            docId: course.docId,
            chapterIndex: index,
            userId: userDetail.uid,
        });

        router.push({
            pathname: '/chapterView',
            params: {
                chapterParams: JSON.stringify(item),
                docId: course.docId,
                chapterIndex: index,
                userId: userDetail.uid,
            },
        });
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontFamily: 'outfit-bold', fontSize: 25 }}>Chapters</Text>
            
            {!isEnrolled && (
                <Text style={{ 
                    fontFamily: 'outfit', 
                    fontSize: 16, 
                    color: Colors.GRAY,
                    marginTop: 10,
                    marginBottom: 10,
                    fontStyle: 'italic'
                }}>
                    Click on any chapter to enroll and start learning
                </Text>
            )}

            <FlatList
                data={course?.chapters}
                keyExtractor={(_, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => handleChapterPress(item, index)}
                        style={[
                            styles.chapterContainer,
                            !isEnrolled && styles.disabledChapter
                        ]}
                        disabled={enrollmentLoading}
                    >
                        <View style={styles.chapterRow}>
                            <Text style={styles.chapterText}>{index + 1}.</Text>
                            <Text style={styles.chapterText}>{item?.chapterName}</Text>
                        </View>

                        {isEnrolled ? (
                            isChapterCompleted(index) ? (
                                <Ionicons name="checkmark-circle" size={24} color={Colors.GREEN} />
                            ) : (
                                <Ionicons name="play" size={24} color={Colors.PRIMARY} />
                            )
                        ) : (
                            <MaterialCommunityIcons name="book-lock-outline" size={24} color="black" />
                        )}
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    chapterText: {
        fontFamily: 'outfit',
        fontSize: 20,
    },
    chapterContainer: {
        padding: 18,
        borderWidth: 0.5,
        borderRadius: 15,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    disabledChapter: {
        opacity: 0.8,
    },
    chapterRow: {
        flexDirection: 'row',
        gap: 10,
        width:280
    },
});