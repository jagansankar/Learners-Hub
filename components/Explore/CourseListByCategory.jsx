import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { db } from '../../config/firebaseConfig';
import Colors from '../../constant/Colors';
import CourseList from '../Home/CourseList';

export default function CourseListByCategory({category}) {
    const [courseList,setCourseList]=useState([]);
    const [loading,setLoading]=useState(false);
    
    useEffect(()=>{
        GetCourseListByCategory();
    },[])

    const GetCourseListByCategory=async()=>{
        setCourseList([]);
        setLoading(true)
        const q=query(collection(db,'Courses'), where('category','==',category),orderBy('createdOn','desc'))
        const querySnapshot=await getDocs(q);

        querySnapshot?.forEach((doc)=>{
            console.log(doc.data());
            setCourseList(prev=>[...prev,{
                ...doc.data(),
                docId: doc.id // Add document ID to course object
            }])
        })
        setLoading(false);
    }
    
    return (
        <View>
        {courseList?.length>0 && <CourseList courseList={courseList} heading={category}
        enroll={true}/>}
        </View>
    )
}

const styles = StyleSheet.create({
    courseContainer:{
        padding:10,
        backgroundColor: Colors.BG_GRAY,
        margin: 6,
        borderRadius: 15,
        width:260
    }
})