import { useRouter } from 'expo-router';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Colors from '../../constant/Colors';
import { PraticeOption } from '../../constant/Option';

export default function PraticeSection() {
  const router=useRouter();
  return (
    <View style={{
        marginTop: 10
    }}>
      <Text style={{
        fontFamily:'outfit-bold',
        fontSize:25
      }}>Pratice</Text>

      <View>
        <FlatList 
            data={PraticeOption}
            numColumns={3}
            renderItem={({item,index})=>(
                <TouchableOpacity onPress={()=>router.push('/practice/'+item.name)} key={index} 
                style={{
                    flex:1,
                    margin:5,
                    aspectRatio: 1
                }}
                >
                    <Image source={item.image}style={{
                        width:"100%",
                        height:"100%",
                        maxHeight: 160,
                        borderRadius: 15
                    }}/>
                    <Text style={{
                        position:'absolute',
                        padding: 15,
                        fontFamily: 'outfit',
                        fontSize:15,
                        color: Colors.WHITE
                    }}>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
      </View>
    </View>
  )
}   