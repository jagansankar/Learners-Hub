import { useRouter } from 'expo-router';
import { Image, Text, View } from 'react-native';
import Button from '../Shared/Button';

export default function NoCourse() {
  const router=useRouter();
  return (
    <View style={{
        marginTop: 40,
        display:'flex',
        alignItems:'center'
    }}>
      <Image source={require('./../../assets/images/book.png')}
      style={{
        height:200,
        width:200,
      }}
      />
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:25,
        textAlign:'center'
      }}>You Don't Have Any Course</Text>

      <Button text={'+ Add New Course'} onPress={()=>router.push('/addCourse')} />
      <Button text={'Explore Existing Courses'} onPress={()=>router.push('/(tabs)/explore')}
      type='outline'/>
    </View>
  )
}