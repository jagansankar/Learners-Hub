// components/Shared/CourseProgressCard.jsx
import { useContext, useEffect, useState } from 'react'
import { Image, Text, View } from 'react-native'
import * as Progress from 'react-native-progress'
import Colors from '../../constant/Colors'
import { imageAssets } from '../../constant/Option'
import { UserDetailContext } from '../../context/UserDetailContext'
import { getEnrollmentProgress } from '../../utils/enrollmentUtils'

export default function CourseProgressCard({item, width=300}) {
    const { userDetail } = useContext(UserDetailContext)
    const [enrollmentData, setEnrollmentData] = useState(null)

    useEffect(() => {
        loadEnrollmentData()
    }, [item, userDetail])

    const loadEnrollmentData = async () => {
        if (!userDetail?.uid || !item?.docId) return

        try {
            const data = await getEnrollmentProgress(userDetail.uid, item.docId)
            setEnrollmentData(data)
        } catch (error) {
            console.error('Error loading enrollment data:', error)
            setEnrollmentData(null)
        }
    }

    const getProgressPercentage = () => {
        if (!enrollmentData) return 0
        
        const completed = Array.isArray(enrollmentData.completedChapters) 
            ? enrollmentData.completedChapters.length 
            : 0
        const total = item?.chapters?.length || 1
        const percentage = completed / total
        return isNaN(percentage) ? 0 : percentage
    }

    const getCompletedChaptersCount = () => {
        if (!enrollmentData) return 0
        return Array.isArray(enrollmentData.completedChapters) 
            ? enrollmentData.completedChapters.length 
            : 0
    }

    const isEnrolled = enrollmentData !== null

    return (
        <View style={{
            margin: 7,
            padding: 15,
            borderRadius:15,
            backgroundColor: Colors.WHITE,
            width: width,
        }}>
            <View style={{
                display:'flex',
                flexDirection:'row',
                gap:8
            }}>
                <Image source={imageAssets[item?.banner_image]}
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 8
                }}
                />
                <View style={{
                    flex: 1,
                }}>
                    <Text 
                    numberOfLines={2}
                    style={{
                        fontFamily:'outfit-bold',
                        fontSize: 17,
                        flexWrap:'wrap'
                    }}>{item?.courseTitle}</Text>
                    <Text style={{
                        fontFamily:'outfit',
                        fontSize: 15
                    }}>{item?.chapters?.length || 0} Chapters</Text>
                    {!isEnrolled && (
                        <Text style={{
                            fontFamily:'outfit',
                            fontSize: 12,
                            color: Colors.GRAY,
                            fontStyle: 'italic'
                        }}>Not enrolled</Text>
                    )}
                </View>
            </View>
            
            {isEnrolled && (
                <View style={{ marginTop:10 }}>
                    <Progress.Bar 
                        progress={getProgressPercentage()} 
                        width={width-30} 
                        color={Colors.PRIMARY}
                    />
                    <Text style={{
                        fontFamily:'outfit',
                        marginTop: 2,
                        fontSize: 14
                    }}> 
                        {getCompletedChaptersCount()} of {item?.chapters?.length || 0} chapters completed
                        
                    </Text>
                </View>
            )}
        </View>
    )
}