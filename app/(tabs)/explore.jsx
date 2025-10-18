import { FlatList, Text, View } from 'react-native'
import CourseListByCategory from '../../components/Explore/CourseListByCategory'
import Colors from '../../constant/Colors'
import { CourseCategory } from '../../constant/Option'

export default function Explore() {
  return (
    <FlatList data={[]}
    style={{
      flex:1,
      backgroundColor:Colors.WHITE,
    }}
    ListHeaderComponent={
    <View style={{
      padding:25,
      backgroundColor:Colors.WHITE,
      flex:1
    }}>
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:30,
        padding:20
      }}>Explore More Courses</Text>
      {CourseCategory.map((item,index)=>(
        <View key={index} style={{
          marginTop:10
        }}>
          {/*<Text style={{
            fontFamily:'outfit-bold',
            fontSize:20
          }}>{item}</Text>*/}
          <CourseListByCategory category={item}/>
        </View> 
      ))}
    </View>}/>
  )
}