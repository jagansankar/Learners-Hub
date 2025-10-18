import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import FlipCard from 'react-native-flip-card';
import * as Progress from 'react-native-progress';
import Colors from '../../constant/Colors';
export default function FlashCards() {
    const {courseParams}=useLocalSearchParams();
    const course=JSON.parse(courseParams)
    const flashcard=course?.flashcards;
    const router=useRouter();
    const [currentPage,setCurrentPage]=useState(0);
    const width=Dimensions.get('screen').width
    console.log(flashcard)

    const onScroll=(event)=>{
        const index=Math.round(event?.nativeEvent?.contentOffset.x/width)
        console.log(index);
        setCurrentPage(index);
    }

    const GetProgress = (currentPage) => {
    const perc= (currentPage / flashcard?.length);
    return perc;
    };

  return (
    <View>
      <Image
        source={require('./../../assets/images/wave.png')}
        style={{ height: 800 }}
       />  
       <View style={{ position: 'absolute', width: '100%' }}>
        <View
          style={{
            marginTop: 30,
            padding: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Pressable onPress={()=>router.back()} >
            <Ionicons name="arrow-back" size={30} color="white" />
          </Pressable>

          <Text
            style={{
              fontFamily: 'outfit-bold',
              fontSize: 25,
              color: Colors.WHITE,
            }}
          >
            {currentPage + 1} of {flashcard?.length}
          </Text>
        </View>

        <View style={{ alignItems: 'center', marginTop: 20 }}>
                  <Progress.Bar
                    progress={GetProgress(currentPage)}
                    width={Dimensions.get('window').width * 0.85}
                    color={Colors.WHITE}
                    height={10}
                  />
        </View>
        

        <FlatList
        data={flashcard}
        horizontal={true}
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        renderItem={({item,index})=>(
            <View
                key={index}
                style={{
                    height:500,
                    marginTop:60,
                    //width:width*0.9,
                    //backgroundColor:Colors.WHITE,
                    //borderRadius:15,
                    marginHorizontal: width*0.05
                }}
            >
                <FlipCard style={styles.flipCard}>
                    {/* Face Side */}
                    <View style={styles.frontCard}>
                        <Text style={{
                            fontFamily:'outfit-bold',
                            fontSize:28
                        }}>{item.front}</Text>
                    </View>
                    {/* Back Side */}
                    <View style={styles.backCard}>
                        <Text style={{
                            width:Dimensions.get('screen').width*0.78,
                            fontFamily:'outfit',
                            fontSize:28,
                            padding:20,
                            textAlign:'center',
                            color:Colors.WHITE
                        }}>{item.back}</Text>
                    </View>
                </FlipCard>
            </View>
        )}
     />
   
     </View>

    </View>
  )
}

const styles = StyleSheet.create({
    flipCard:{
        width: Dimensions.get('screen').width*0.78,
        height:400,
        backgroundColor:Colors.WHITE,
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:20,
        marginHorizontal: Dimensions.get('screen').width*0.05
    },
    frontCard:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        height:'100%',
        borderRadius:20
    },
    backCard:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        height:'100%',
        backgroundColor:Colors.PRIMARY,
        borderRadius:20
    }

})