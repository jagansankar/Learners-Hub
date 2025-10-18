import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Colors from './../../constant/Colors';

export default function Student() {
  const router=useRouter();
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

      
      <TextInput placeholder='Email' style={styles.TextInput}></TextInput>
      <TextInput placeholder='Password' secureTextEntry={true} style={styles.TextInput}></TextInput>
      <TouchableOpacity style={{
        padding:15,
        backgroundColor:Colors.PRIMARY,
        width:'100%',
        marginTop: 25,
        borderRadius:10
      }}>
        <Text style={{
          fontFamily: 'outfit',
          fontSize:20,
          color: Colors.WHITE,
          textAlign:'center'
        }}>Sign In</Text>

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
      onPress={()=>router.push('/auth/teachacc')}>
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
    borderRadius:8
  }
})