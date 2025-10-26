import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useContext, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { UserDetailContext } from '../../context/UserDetailContext';
import { auth, db } from './../../config/firebaseConfig';
import Colors from './../../constant/Colors';

export default function Stdacc() {
  const router=useRouter();
  const [email,setEmail]=useState();
  const [password,setPassword]=useState();
  const { userDetail,setUserDetail}=useContext(UserDetailContext);
  const [loading,setLoading]=useState(false);
  const onStdaccClick=()=>{
      setLoading(true)
      signInWithEmailAndPassword(auth,email,password)
      .then(async(resp)=>{
        const user=resp.user
        console.log(user)
        await getUserDetail();
        setLoading(false);
        router.replace('/(tabs)/home')
      }).catch(e=>{
        console.log(e)
        setLoading(false);
        ToastAndroid.show('Incorrect Email & Password',ToastAndroid.BOTTOM)
      })
  }

  const getUserDetail=async()=>{
    const result=await getDoc(doc(db,'users',email));
    console.log(result.data())
    setUserDetail(result.data())
  }
  return (

    <View style={{
      display:'flex',
      alignItems:'center',
      paddingTop:100,
      fles:1,
      padding: 25,
      backgroundColor:Colors.WHITE
    }
      

    }>
      <Image source={require('./../../assets/images/logo.png')}
      style={{
        width:250,
        height:250,
        
      }}
      ></Image>
      <Text style={{
        fontSize:30,
        fontFamily:'outfit-bold'
      }}>Welcome Back</Text>

      
      <TextInput placeholder='Email'
      placeholderTextColor="black" 
      onChangeText={(value)=>setEmail(value)}
      style={styles.TextInput}></TextInput>
      <TextInput placeholder='Password' 
      placeholderTextColor="black"
      onChangeText={(value)=>setPassword(value)}
      secureTextEntry={true} style={styles.TextInput}></TextInput>
      <TouchableOpacity 
      onPress={onStdaccClick}
      disabled={loading}
      style={{
        padding:15,
        backgroundColor:Colors.PRIMARY,
        width:'100%',
        marginTop: 25,
        borderRadius:10
      }}>

      {!loading?  <Text style={{
          fontFamily: 'outfit',
          fontSize:20,
          color: Colors.WHITE,
          textAlign:'center'
        }}>Sign In</Text>:
        <ActivityIndicator size={'large'} color={Colors.WHITE}/>
      
      }
      </TouchableOpacity>

      <View style={{
        display:'flex',
        flexDirection:'row', gap:5,
        marginTop:20,
        
      }}>
      <Text style={{
        fontFamily:'outfit'
      }}>Don't have an account?</Text>
      <Pressable
      onPress={()=>router.push('/auth/student')}>
        <Text style={{
          color:Colors.PRIMARY,
          fontFamily:'outfit-bold'
        }}>Create New Here</Text>
        </Pressable>
      </View>

    </View>
  )
}

const styles=StyleSheet.create({
  TextInput:{
    borderWidth: 1,
    width:'100%',
    padding: 15,
    fontSize: 18,
    marginTop: 20,
    borderRadius:8,
    color: Colors.BLACK,
  }
})