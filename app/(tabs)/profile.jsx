// profile.jsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { db } from '../../config/firebaseConfig';
import Colors from '../../constant/Colors';
import { UserDetailContext } from '../../context/UserDetailContext';

export default function Profile() {
  const router = useRouter();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  
  const [courseStats, setCourseStats] = useState({
    total: 0,
    inProgress: 0,
    completed: 0
  });
  
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    if (!userDetail?.uid) {
      console.log('No user UID found');
      setLoading(false);
      return;
    }

    console.log('Setting up listener for user courses:', userDetail.uid);

    let unsubscribe = null;
    let isMounted = true;

    const processUserCourses = async (enrollments) => {
      if (!isMounted) return;

      console.log('Processing user courses:', enrollments.length);

      // If no enrollments, set default values and return early
      if (!enrollments || enrollments.length === 0) {
        console.log('No courses found for user');
        setCourseStats({
          total: 0,
          inProgress: 0,
          completed: 0
        });
        setLoading(false);
        return;
      }

      // Use Set to track unique course IDs
      const uniqueCourseIds = new Set();
      let inProgress = 0;
      let completed = 0;

      // Process each enrollment to determine progress status and count unique courses
      for (const enrollment of enrollments) {
        try {
          // Validate enrollment data
          if (!enrollment.courseId) {
            console.log('Skipping enrollment with no courseId:', enrollment);
            continue;
          }

          // Add to unique courses set
          uniqueCourseIds.add(enrollment.courseId);

          const courseRef = doc(db, 'Courses', enrollment.courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            const courseData = courseDoc.data();
            
            // Determine course status based on enrollment progress
            const totalChapters = courseData?.chapters?.length || 0;
            
            // Safely handle completedChapters - ensure it's an array
            const completedChapters = Array.isArray(enrollment.completedChapters) 
              ? enrollment.completedChapters.length 
              : 0;
            
            console.log(`Course: ${courseData.courseTitle || 'Unknown'}, Completed: ${completedChapters}/${totalChapters}`);
            
            if (totalChapters > 0 && completedChapters === totalChapters) {
              completed++;
              console.log('-> Marked as COMPLETED');
            } else if (completedChapters > 0 || totalChapters > 0) {
              inProgress++;
              console.log('-> Marked as IN PROGRESS');
            } else {
              // Course with no chapters or not started
              inProgress++;
              console.log('-> Marked as IN PROGRESS (not started)');
            }
          } else {
            console.log('Course not found for ID:', enrollment.courseId);
          }
        } catch (error) {
          console.error('Error processing course:', error);
          // Continue with next enrollment even if one fails
        }
      }

      if (!isMounted) return;

      const total = uniqueCourseIds.size; // Count UNIQUE courses only

      console.log('Final Stats - Total:', total, 'In Progress:', inProgress, 'Completed:', completed);
      
      setCourseStats({
        total: Math.max(0, total),
        inProgress: Math.max(0, inProgress),
        completed: Math.max(0, completed)
      });
      
      setLoading(false);
    };

    // Set up real-time listener for ALL user courses (no status filter)
    try {
      const coursesQuery = query(
        collection(db, 'Enrollments'),
        where('userId', '==', userDetail.uid)
      );

      unsubscribe = onSnapshot(
        coursesQuery,
        (snapshot) => {
          if (!isMounted) return;

          console.log('Courses snapshot updated, processing...');
          
          if (snapshot.empty) {
            console.log('No courses found for user in real-time update');
            setCourseStats({
              total: 0,
              inProgress: 0,
              completed: 0
            });
            setLoading(false);
            return;
          }

          const userCourses = [];
          snapshot.forEach((doc) => {
            userCourses.push({
              id: doc.id,
              ...doc.data()
            });
          });

          console.log('Real-time user courses:', userCourses.length);
          processUserCourses(userCourses);
        },
        (error) => {
          console.error('Error in courses listener:', error);
          if (!isMounted) return;
          
          setCourseStats({
            total: 0,
            inProgress: 0,
            completed: 0
          });
          setLoading(false);
        }
      );

      // Initial load - separate from the listener to prevent loops
      const initialLoad = async () => {
        try {
          if (!isMounted) return;
          
          setLoading(true);
          const snapshot = await getDocs(coursesQuery);
          
          if (!isMounted) return;
          
          if (snapshot.empty) {
            setCourseStats({
              total: 0,
              inProgress: 0,
              completed: 0
            });
            setLoading(false);
            return;
          }

          const userCourses = [];
          snapshot.forEach((doc) => {
            userCourses.push({
              id: doc.id,
              ...doc.data()
            });
          });

          console.log('Initial user courses:', userCourses.length);
          await processUserCourses(userCourses);
        } catch (error) {
          console.error('Error in initial load:', error);
          if (!isMounted) return;
          
          setCourseStats({
            total: 0,
            inProgress: 0,
            completed: 0
          });
          setLoading(false);
        }
      };

      initialLoad();

    } catch (error) {
      console.error('Error setting up courses listener:', error);
      if (!isMounted) return;
      
      setCourseStats({
        total: 0,
        inProgress: 0,
        completed: 0
      });
      setLoading(false);
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up courses listener');
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userDetail?.uid]);

  const handleMenuPress = (item) => {
    if (item.name === 'Logout') {
      setUserDetail(null);
      router.replace('/auth/stdacc');
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const menuItems = [
    { 
      name: 'My Courses', 
      icon: 'book-outline', 
      path: '/(tabs)/home',
      hasCheckmark: false,
      description: 'View and manage your courses'
    },
    { 
      name: 'Course Progress', 
      icon: 'analytics-outline', 
      path: '/(tabs)/progress',
      hasCheckmark: courseStats.inProgress > 0,
      description: 'Track your learning journey'
    },
    { 
      name: 'Logout', 
      icon: 'log-out-outline', 
      path: '/login',
      hasCheckmark: false,
      description: 'Sign out of your account'
    }
  ];

  const displayName = userDetail?.name || 'Learners Hub';
  const displayEmail = userDetail?.email || 'admin@learnershub.com';

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Gradient Background */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Profile</Text>
            {userDetail?.name && (
              <View style={styles.profileBadge}>
                <Ionicons name="person" size={16} color={Colors.WHITE} />
                <Text style={styles.profileBadgeText}>{userDetail.name}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Card */}
        <Animated.View style={[styles.profileCard, { opacity: fadeAnim }]}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../assets/images/profile.png')} 
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.PRIMARY} />
            </View>
          </View>
          
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{displayEmail}</Text>
          
          {/* Stats Row with Loading State */}
          <View style={styles.statsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.PRIMARY} />
                <Text style={styles.loadingText}>Loading your courses...</Text>
              </View>
            ) : (
              <>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{courseStats.total}</Text>
                  <Text style={styles.statLabel}>Courses</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{courseStats.inProgress}</Text>
                  <Text style={styles.statLabel}>In Progress</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{courseStats.completed}</Text>
                  <Text style={styles.statLabel}>Completed</Text>
                </View>
              </>
            )}
          </View>

          {/* New User Guidance */}
          {!loading && courseStats.total === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="school-outline" size={40} color={Colors.LIGHT_GRAY} />
              <Text style={styles.emptyStateTitle}>No courses yet</Text>
              <Text style={styles.emptyStateText}>
                Start your learning journey by enrolling in your first course!
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/addCourse')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.LIGHT_PRIMARY || '#E8F0FE' }]}>
              <Ionicons name="add" size={24} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.actionText}>Add Course</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/progress')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.LIGHT_GREEN || '#E8F5E9' }]}>
              <Ionicons name="trending-up" size={24} color={Colors.GREEN || '#4CAF50'} />
            </View>
            <Text style={styles.actionText}>Progress</Text>
          </Pressable>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => router.push('/explore')}
          >
            <View style={[styles.actionIcon, { backgroundColor: Colors.LIGHT_PRIMARY || '#E8F0FE' }]}>
              <Ionicons name="search-circle-outline" size={24} color={Colors.PRIMARY} />
            </View>
            <Text style={styles.actionText}>Explore</Text>
          </Pressable>
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <Pressable 
                key={index}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed
                ]}
                onPress={() => handleMenuPress(item)}
              >
                <View style={styles.menuLeft}>
                  <View style={[
                    styles.menuIcon,
                    { backgroundColor: item.name === 'Logout' ? (Colors.LIGHT_RED || '#FFEBEE') : (Colors.LIGHT_GRAY || '#F5F5F5') }
                  ]}>
                    <Ionicons 
                      name={item.icon} 
                      size={20} 
                      color={item.name === 'Logout' ? (Colors.RED || '#F44336') : Colors.PRIMARY}
                    />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[
                      styles.menuText,
                      item.hasCheckmark && styles.activeMenuText
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={styles.menuDescription}>{item.description}</Text>
                  </View>
                </View>
                
                <View style={styles.menuRight}>
                  {item.hasCheckmark && (
                    <View style={styles.progressBadge}>
                      <Text style={styles.progressBadgeText}>Active</Text>
                    </View>
                  )}
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={Colors.LIGHT_GRAY || '#BDBDBD'} 
                  />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Welcome Banner for New Users */}
        {!loading && courseStats.total === 0 && (
          <View style={styles.welcomeBanner}>
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeIcon}>
                <Ionicons name="rocket" size={32} color={Colors.WHITE} />
              </View>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>Start Your Learning Journey! 🚀</Text>
                <Text style={styles.welcomeText}>
                  Explore courses and start learning today!
                </Text>
              </View>
            </View>
            <Pressable 
              style={styles.getStartedButton}
              onPress={() => router.push('/(tabs)/explore')}
            >
              <Text style={styles.getStartedText}>Explore Courses</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.WHITE} />
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ... KEEP ALL YOUR EXISTING STYLES EXACTLY THE SAME ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BG_GRAY || '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: Colors.PRIMARY || '#6200EE',
    paddingHorizontal: 25,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 32,
    color: Colors.WHITE || '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 15,
    left: 130
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(91, 89, 89, 0.61)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: -20,
  },
  profileBadgeText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
    color: Colors.WHITE || '#FFFFFF',
    marginLeft: 4,
  },
  profileCard: {
    backgroundColor: Colors.WHITE || '#FFFFFF',
    marginHorizontal: 25,
    marginTop: -50,
    borderRadius: 20,
    padding: 25,
    shadowColor: Colors.PRIMARY || '#6200EE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.LIGHT_GRAY || '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.WHITE || '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.GREEN || '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.WHITE || '#FFFFFF',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: Colors.WHITE || '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  name: {
    fontFamily: 'outfit-bold',
    fontSize: 24,
    color: Colors.BLACK || '#000000',
    marginBottom: 4,
    textAlign: 'center',
  },
  email: {
    fontFamily: 'outfit',
    fontSize: 16,
    color: Colors.GRAY || '#757575',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
    minHeight: 50,
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: Colors.PRIMARY || '#6200EE',
  },
  statLabel: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY || '#757575',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.LIGHT_GRAY || '#E0E0E0',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: Colors.LIGHT_GRAY || '#F5F5F5',
    borderRadius: 12,
    width: '100%',
  },
  emptyStateTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.GRAY,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyStateText: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 25,
    marginVertical: 25,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: Colors.WHITE || '#FFFFFF',
    padding: 15,
    borderRadius: 15,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontFamily: 'outfit-medium',
    fontSize: 12,
    color: Colors.BLACK || '#000000',
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 25,
    marginBottom: 25,
  },
  sectionTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 20,
    color: Colors.BLACK || '#000000',
    marginBottom: 15,
  },
  menuContainer: {
    backgroundColor: Colors.WHITE || '#FFFFFF',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.LIGHT_GRAY || '#E0E0E0',
  },
  menuItemPressed: {
    backgroundColor: Colors.LIGHT_GRAY || '#F5F5F5',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontFamily: 'outfit-medium',
    fontSize: 16,
    color: Colors.BLACK || '#000000',
    marginBottom: 2,
  },
  activeMenuText: {
    color: Colors.PRIMARY || '#6200EE',
  },
  menuDescription: {
    fontFamily: 'outfit',
    fontSize: 12,
    color: Colors.GRAY || '#757575',
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBadge: {
    backgroundColor: Colors.LIGHT_GREEN || '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  progressBadgeText: {
    fontFamily: 'outfit-medium',
    fontSize: 10,
    color: Colors.GREEN || '#4CAF50',
  },
  welcomeBanner: {
    backgroundColor: Colors.PRIMARY || '#6200EE',
    marginHorizontal: 25,
    marginBottom: 25,
    borderRadius: 20,
    padding: 20,
    shadowColor: Colors.PRIMARY || '#6200EE',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 5,
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    color: Colors.WHITE || '#FFFFFF',
    marginBottom: 4,
  },
  welcomeText: {
    fontFamily: 'outfit',
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  getStartedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.WHITE || '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  getStartedText: {
    fontFamily: 'outfit-bold',
    fontSize: 16,
    color: Colors.PRIMARY || '#6200EE',
    marginRight: 8,
  },
});