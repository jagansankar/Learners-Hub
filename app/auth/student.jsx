import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../config/firebaseConfig';
import Colors from './../../constant/Colors';
import { UserDetailContext } from './../../context/UserDetailContext';

export default function Student() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const { setUserDetail } = useContext(UserDetailContext);

  // 🔹 Password Rules Check
  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@$!%*?&]/.test(password),
  };

  const validateInputs = () => {
    let valid = true;

    if (!fullName.trim()) {
      setNameError("Full Name is required");
      valid = false;
    } else {
      setNameError("");
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    } else {
      setEmailError("");
    }

    // If any password condition fails
    if (Object.values(passwordChecks).includes(false)) {
      valid = false;
    }

    return valid;
  };

  const CreateNewAccount = () => {
    if (!validateInputs()) return;

    createUserWithEmailAndPassword(auth, email, password)
      .then(async (resp) => {
        const user = resp.user;
        await SaveUser(user);
      })
      .catch((e) => {
        setEmailError(e.message);
      });
  };

  const SaveUser = async (user) => {
    const data = {
      name: fullName,
      email: email,
      member: false,
      uid: user?.uid,
    };
    await setDoc(doc(db, "users", email), data);
    setUserDetail(data);

    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("./../../assets/images/logo.png")}
        style={styles.logo}
      />
      <Text style={styles.heading}>Create a New Account</Text>

      {/* Full Name Input */}
      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.TextInput}
        placeholderTextColor="black"
      />
      {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        value={email}
        keyboardType="email-address"
        autoCapitalize="none"
        onChangeText={setEmail}
        style={styles.TextInput}
        placeholderTextColor="black"
      />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
        style={styles.TextInput}
        placeholderTextColor="black"
      />

      {/* Password Checklist */}
      <View style={styles.checklist}>
        <Text style={passwordChecks.length ? styles.valid : styles.invalid}>
          {passwordChecks.length ? "✅" : "❌"} At least 8 characters
        </Text>
        <Text style={passwordChecks.upper ? styles.valid : styles.invalid}>
          {passwordChecks.upper ? "✅" : "❌"} At least 1 uppercase letter
        </Text>
        <Text style={passwordChecks.lower ? styles.valid : styles.invalid}>
          {passwordChecks.lower ? "✅" : "❌"} At least 1 lowercase letter
        </Text>
        <Text style={passwordChecks.number ? styles.valid : styles.invalid}>
          {passwordChecks.number ? "✅" : "❌"} At least 1 number
        </Text>
        <Text style={passwordChecks.special ? styles.valid : styles.invalid}>
          {passwordChecks.special ? "✅" : "❌"} At least 1 special character
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity onPress={CreateNewAccount} style={styles.button}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

      {/* Sign In Link */}
      <View style={styles.signInRow}>
        <Text style={{ fontFamily: "outfit" }}>Already have an account?</Text>
        <Pressable onPress={() => router.push("/auth/stdacc")}>
          <Text style={styles.signInLink}>Sign In Here</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    alignItems: "center",
    paddingTop: 20,
    flex: 1,
    padding: 25,
    backgroundColor: Colors.WHITE,
  },
  logo: {
    width: 250,
    height: 250,
    marginTop:25,
  },
  heading: {
    fontSize: 30,
    fontFamily: "outfit-bold",
  },
  TextInput: {
    borderWidth: 1,
    width: "100%",
    padding: 15,
    fontSize: 18,
    marginTop: 20,
    borderRadius: 8,
    color: Colors.BLACK,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginTop: 5,
    alignSelf: "flex-start",
  },
  checklist: {
    alignSelf: "flex-start",
    marginTop: 10,
  },
  valid: {
    color: "green",
    fontSize: 14,
  },
  invalid: {
    color: "red",
    fontSize: 14,
  },
  button: {
    padding: 15,
    backgroundColor: Colors.PRIMARY,
    width: "100%",
    marginTop: 25,
    borderRadius: 10,
  },
  buttonText: {
    fontFamily: "outfit",
    fontSize: 20,
    color: Colors.WHITE,
    textAlign: "center",
  },
  signInRow: {
    display: "flex",
    flexDirection: "row",
    gap: 5,
    marginTop: 20,
  },
  signInLink: {
    color: Colors.PRIMARY,
    fontFamily: "outfit-bold",
  },
});
