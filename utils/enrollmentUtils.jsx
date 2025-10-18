// utils/enrollmentUtils.js
import { arrayUnion, collection, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

// Generate unique enrollment ID
export const getEnrollmentId = (userId, courseId) => {
    return `${userId}_${courseId}`;
};

// Check if user is enrolled in a course
export const checkEnrollment = async (userId, courseId) => {
    try {
        const enrollmentId = getEnrollmentId(userId, courseId);
        const enrollmentRef = doc(db, 'Enrollments', enrollmentId);
        const enrollmentDoc = await getDoc(enrollmentRef);
        return enrollmentDoc.exists();
    } catch (error) {
        console.error('Error checking enrollment:', error);
        return false;
    }
};

// Enroll user in a course
export const enrollUserInCourse = async (userId, courseId, courseData) => {
    try {
        const enrollmentId = getEnrollmentId(userId, courseId);
        const enrollmentRef = doc(db, 'Enrollments', enrollmentId);
        
        await setDoc(enrollmentRef, {
            userId: userId,
            courseId: courseId,
            courseTitle: courseData.courseTitle,
            courseOwner: courseData.createdBy,
            enrolledAt: new Date(),
            completedChapters: [],
            progress: 0,
            totalChapters: courseData.chapters?.length || 0,
            lastAccessed: new Date()
        });
        
        return true;
    } catch (error) {
        console.error('Error enrolling user:', error);
        return false;
    }
};

// Update chapter completion
export const markChapterComplete = async (userId, courseId, chapterIndex, totalChapters) => {
    try {
        const enrollmentId = getEnrollmentId(userId, courseId);
        const enrollmentRef = doc(db, 'Enrollments', enrollmentId);
        
        const progress = ((chapterIndex + 1) / totalChapters) * 100;
        
        await updateDoc(enrollmentRef, {
            completedChapters: arrayUnion(chapterIndex),
            progress: progress,
            lastAccessed: new Date()
        });
        
        return true;
    } catch (error) {
        console.error('Error marking chapter complete:', error);
        return false;
    }
};

// Get user's enrollment progress
export const getEnrollmentProgress = async (userId, courseId) => {
    try {
        const enrollmentId = getEnrollmentId(userId, courseId);
        const enrollmentRef = doc(db, 'Enrollments', enrollmentId);
        const enrollmentDoc = await getDoc(enrollmentRef);
        
        if (enrollmentDoc.exists()) {
            return enrollmentDoc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting enrollment progress:', error);
        return null;
    }
};

// Get all enrollments for a user
export const getUserEnrollments = async (userId) => {
    try {
        const q = query(collection(db, 'Enrollments'), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const enrollments = [];
        
        querySnapshot.forEach((doc) => {
            enrollments.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return enrollments;
    } catch (error) {
        console.error('Error getting user enrollments:', error);
        return [];
    }
};