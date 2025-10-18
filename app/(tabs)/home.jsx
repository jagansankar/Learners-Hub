import { collection, getDocs, query, where } from 'firebase/firestore'
import { useContext, useEffect, useState } from 'react'
import { FlatList, Image, Platform, View } from 'react-native'
import CourseList from '../../components/Home/CourseList'
import CourseProgress from '../../components/Home/CourseProgress'
import Header from '../../components/Home/Header'
import NoCourse from '../../components/Home/NoCourse'
import PraticeSection from '../../components/Home/PraticeSection'
import { db } from '../../config/firebaseConfig'
import Colors from '../../constant/Colors'
import { UserDetailContext } from '../../context/UserDetailContext'
export default function Home() {

  const {userDetail,setUserDetail}=useContext(UserDetailContext);
  const [courseList, setCourseList]=useState([]);
  const [loading,setLoading]=useState(false);

 // In home.jsx, update the useEffect
useEffect(() => {
  if (userDetail) {
    GetCourseList();
  }
}, [userDetail?.email]); // Only re-fetch when email changes

  const GetCourseList=async()=>{
    setLoading(true)
    setCourseList([])
    const q=query(collection(db,'Courses'),where("createdBy",'==',userDetail?.email));
    const querySnapshot=await getDocs(q);

    querySnapshot.forEach((doc)=>{
      console.log("--",doc.data());
      setCourseList(prev => [...prev,doc.data()])
      setLoading(false)
    })
    
  }
  return (
    <FlatList 
      data={[]}
      onRefresh={()=>GetCourseList()}
      refreshing={loading}
      ListHeaderComponent={
      <View style={{
        flex:1,
        backgroundColor:Colors.WHITE
      }}>
        <Image source={require('./../../assets/images/wave.png')}
          style={{
            position:'absolute',
            width:'100%',
            height: 700
          }}
        />
      <View style={{
        padding:25,
        paddingTop: Platform.OS =='ios' && 45,
        //flex:1,
        //backgroundColor:Colors.WHITE
      }}>
        <Header />
        {courseList?.length==0 ?
        <NoCourse/>:
        <View>
        <CourseProgress 
        courseList={courseList}
        />
        <PraticeSection />
        <CourseList courseList={courseList}/>
        </View>
        }
      </View>
      </View>
      }/>
  )
}