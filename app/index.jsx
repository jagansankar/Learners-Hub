// app/index.jsx
import { UserDetailContext } from "@/context/UserDetailContext";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from "firebase/firestore";
import { useContext, useEffect } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from '../constant/Colors';
import { auth, db } from './../config/firebaseConfig';

export default function Index() {
  const router = useRouter();
  const { userDetail, setUserDetail } = useContext(UserDetailContext);

  useEffect(() => {
    // Set up auth state listener only once when component mounts
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User authenticated:", user.email);
        try {
          const result = await getDoc(doc(db, 'users', user.email));
          if (result.exists()) {
            setUserDetail(result.data());
            console.log("User data set, navigating to home");
            // Use replace to prevent going back to this screen
            router.replace('/(tabs)/home');
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.log("No user authenticated");
        // User is not logged in, stay on this screen
      }
    });

    // Cleanup the listener when component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array means this runs only once on mount

  return (
    <View style={{ flex: 1, backgroundColor: Colors.WHITE }}>
      <Image 
        source={require('./../assets/images/landing.png')}
        style={{
          width: '100%',
          height: 300,
          marginTop: 70,
        }}
      />
      <View style={{
        padding: 25,
        backgroundColor: Colors.PRIMARY,
        height: '100%',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35
      }}>
        <Text style={{
          fontSize: 30,
          fontFamily: 'outfit-bold',
          textAlign: 'center',
          color: Colors.WHITE
        }}>Welcome To Learners Hub</Text>

        <Text style={{
          fontSize: 20,
          color: Colors.WHITE,
          marginTop: 20,
          textAlign: 'center',
          fontFamily: 'outfit'
        }}>Learn anywhere, anytime. Stay motivated every step of the way 🎯</Text>
      
        <TouchableOpacity 
          style={styles.button}
          onPress={() => router.push('/auth/student')}
        >
          <Text style={[styles.buttonText, { color: Colors.PRIMARY }]}>S T U D E N T</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push('/auth/stdacc')}
          style={[styles.button, {
            backgroundColor: Colors.PRIMARY,
            borderWidth: 1,
            borderColor: Colors.WHITE
          }]}
        >
          <Text style={[styles.buttonText, { color: Colors.WHITE }]}>
            Already have an account? Log in
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    backgroundColor: Colors.WHITE,
    marginTop: 20,
    borderRadius: 10
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 18,
    fontFamily: 'outfit'
  }
});